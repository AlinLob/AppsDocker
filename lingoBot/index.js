import express from 'express';
import { Telegraf } from 'telegraf'; 
import { translate } from '@vitalets/google-translate-api';
import iso6391 from 'iso-639-1';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const port = process.env.PORT || 3000;
const botToken = process.env.BOT_TOKEN; 

const bot = new Telegraf(botToken);


const status = {
    userLang: '',
    botLang: '',
    awaitingLanguage: null,
};

let currentProxyIndex = 0;

const proxies = JSON.parse(process.env.PROXIES);

async function translateWithProxy(text, lang, ctx) {
    const proxy = proxies[currentProxyIndex];
    console.log(`Using proxy: ${proxy.ip}:${proxy.port}`);
    const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
    const agent = new HttpsProxyAgent(proxyUrl);

    try {
        const result = await translate(text, { to: lang, fetchOptions: { agent } });
        return result.text;
    } catch (error) {
        console.error('Error while translating:', error);

        if (error.code === '429' || error.message.includes('Too Many Requests')) {
            // Handle TooManyRequestsError by switching to the next proxy server
            console.log('Too many requests, switching to the next proxy.');
            currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
            console.log(`Next proxy index: ${currentProxyIndex}`);

            // Introduce a delay before retrying with the next proxy
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds delay

            // Retry translation with the next proxy server
            return translateWithProxy(text, lang);
        } else {
            if (ctx && ctx.reply) {
                await ctx.reply('The request limit has been reached. Please try again later.');
            }
            throw new Error('The request limit has been reached. Please try again later.');
    }   }
  
}

async function translateAndReply(text, ctx) {
    let lang;
    if (status.userLang !== '') {
        lang = status.userLang;
    } else {
        lang = ctx.from.language_code || 'auto';
    }
    
    try {
        const translation = await translateWithProxy(text, lang);
        await ctx.reply(translation);
    } catch (error) {
        console.error('Translation error:', error);
        await ctx.reply('Error while translating text.');
    }
}


bot.start(async (ctx) => {
    const welcomeMessage = `
👋 Hi, I'm here to help you with text translation.

🌍 My functions:
- Translating text into different languages.

🛠 How to get started:
1. Set yourself a language using the /setlang command.
2. Set the language for the bot using the /setbotlang command.

🔤 I use the ISO 639-1 standard to designate languages.

⬇️ Press /iso639 to see a list of supported languages.
`;
    await translateAndReply(welcomeMessage, ctx);
});
    

bot.command('iso639', async (ctx) => {
    const isoList = iso6391.getAllCodes().map(code => ` - ${iso6391.getName(code)}: ${code}`);
    let formattedList = 'List of languages (ISO 639-1):\n\n\n';
    formattedList += isoList.join('\n');
    await ctx.reply(formattedList);
});

bot.command('setlang', async (ctx) => {
    status.awaitingLanguage = 'userLang';
    await translateAndReply('Enter your language:', ctx);
});

bot.command('setbotlang', async (ctx) => {
    status.awaitingLanguage = 'botLang';
    await translateAndReply('Enter language for bot:', ctx);
});

bot.command('mylang', async (ctx) => {
    const langName = iso6391.getName(status.userLang);
    await translateAndReply(`Your current language: ${langName}`, ctx);
});

bot.command('botlang', async (ctx) => {
    const langName = iso6391.getName(status.botLang);
    await translateAndReply(`Current bot language: ${langName}`, ctx);
});


bot.on('text', async (ctx) => {
    if (status.awaitingLanguage === 'userLang') {
        const langCode = ctx.message.text;
        if (iso6391.validate(langCode)) {
            status.userLang = langCode;
            status.awaitingLanguage = null; // Reset language awaiting status
            await translateAndReply(`Language is set to ${iso6391.getName(langCode)}`, ctx);
        } else {
            await translateAndReply('Incorrect language code. Enter the language code from ISO 639-1 (e.g. en, ru, de).', ctx);
        }
    } else if (status.awaitingLanguage === 'botLang') {
        const langCode = ctx.message.text;
        if (iso6391.validate(langCode)) {
            status.botLang = langCode;
            status.awaitingLanguage = null; // Reset language awaiting status
            await translateAndReply(`The bot language is set to ${iso6391.getName(langCode)}`, ctx);
        } else {
            await translateAndReply('Incorrect language code. Enter the language code from ISO 639-1 (e.g. en, ru, de).', ctx);
        }
    } else {
        if (status.userLang && status.botLang) {
            try {
                const translation = await translateWithProxy(ctx.message.text, status.botLang);
                await ctx.reply(translation);
            } catch (error) {
                console.error('Error while translating:', error);
                await translateAndReply('Error while translating text.', ctx);
            }
        } else {
            await translateAndReply('To translate text, you need to set the language for the user and the bot. Use the /setbotlang and /setlang commands.', ctx);
        }
    }
});


bot.launch().then(() => console.log('Bot started'));

app.listen(port, () => {
    console.log(`Express server is listening on port ${port}`);
});