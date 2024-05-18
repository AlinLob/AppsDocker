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
    const numProxies = proxies.length;

    // Переменная для отслеживания количества неудачных попыток перевода
    let failedAttempts = 0;

    while (failedAttempts < numProxies) {
        const proxy = proxies[currentProxyIndex];
        console.log(`Using proxy: ${proxy.ip}:${proxy.port}`);
        const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
        const agent = new HttpsProxyAgent(proxyUrl);

        try {
            const result = await translate(text, { to: lang, fetchOptions: { agent } });
            console.log('Translation successful!');
            return result.text;
        } catch (error) {
            console.error('Error while translating:', error);

            if (error.code === '429' || error.message.includes('Too Many Requests')) {
                // Handle TooManyRequestsError by switching to the next proxy server
                console.log('Too many requests, switching to the next proxy.');
                currentProxyIndex = (currentProxyIndex + 1) % numProxies;
                console.log(`Next proxy index: ${currentProxyIndex}`);

                // Introduce a delay before retrying with the next proxy
                await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds delay

                // Increment the failedAttempts counter
                failedAttempts++;
            } else {
                // Если возникла другая ошибка, бросаем ее дальше для обработки
                throw error;
            }
        }
    }

    // Если все прокси были попробованы безуспешно
    if (ctx && ctx.reply) {
        await ctx.reply('All proxies failed. Please try again later.');
    }
    // Возвращаем сообщение об исчерпании лимита запросов
    return 'The request limit has been reached. Please try again later.';
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
1. Set a language for yourself using the /setlang command.
2. Set the language for the bot using the /setbotlang command.

🔤 I use the ISO 639-1 standard to designate languages.

⬇️ Press /iso639 to see a list of supported languages.

ℹ️ Additional commands:
- /mylang: Check the user's current language.
- /botlang: Check current bot language.
`;
    await translateAndReply(welcomeMessage, ctx);
});


bot.command('iso639', async (ctx) => {
    // Получаем все коды языков и создаем строку для каждого языка в формате "Название: Код"
    const isoList = iso6391.getAllCodes().map(code => {
        const name = iso6391.getName(code);
        return ` • ${name}: ${code}`;
    });
    // Сортируем список по алфавиту
    isoList.sort();

    // Разделяем список на две части
    const halfLength = Math.ceil(isoList.length / 2);
    const firstHalf = isoList.slice(0, halfLength);
    const secondHalf = isoList.slice(halfLength);

    // Отправляем первую половину списка
    let formattedList = 'List of languages (ISO 639-1):\n\n';
    formattedList += '```\n';
    formattedList += firstHalf.join('\n');
    formattedList += '```';
    await ctx.replyWithMarkdown(formattedList);

    // Отправляем вторую половину списка
    formattedList = '```\n';
    formattedList += secondHalf.join('\n');
    formattedList += '```';
    await ctx.replyWithMarkdown(formattedList);

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