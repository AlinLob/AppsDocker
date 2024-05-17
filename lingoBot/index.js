import express from 'express';
import { Telegraf, session } from 'telegraf'; 
import { translate } from '@vitalets/google-translate-api';
import iso6391 from 'iso-639-1';
import { HttpsProxyAgent } from 'https-proxy-agent';



const app = express();
const port = process.env.PORT || 3000;
const botToken = '6745896423:AAE_92row6kQrfh128hZ4PeFooIYMV5P_kA'; 

const bot = new Telegraf(botToken);

//bot.use(session());

const status = {
    userLang: '',
    botLang: 'en',
};


const proxies = [
    { ip: '45.89.19.100', port: '16174', username: 'viKyJD', password: 'XqpEUR8hB0' },
    { ip: '45.89.19.114', port: '18690', username: 'viKyJD', password: 'XqpEUR8hB0' },
    { ip: '45.89.19.102', port: '9734', username: 'viKyJD', password: 'XqpEUR8hB0' }
];


let currentProxyIndex = 0;

async function translateWithProxy(text, lang) {
    const proxy = proxies[currentProxyIndex];
    console.log(`Using proxy: ${proxy.ip}:${proxy.port}`);
    const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
    const agent = new HttpsProxyAgent(proxyUrl);
    try {
        const response = await translate(text, { to: lang, agent: agent });
        return response.text;
    } catch (error) {
        console.error('Error while translating:', error);
        if (error.statusCode === 429) {
            // Handle TooManyRequestsError by switching to the next proxy server
            console.log('Too many requests, switching to the next proxy.');
            currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
            console.log(`Next proxy index: ${currentProxyIndex}`);
            // Introduce a delay before retrying with the next proxy
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds delay
            // Retry translation with the next proxy server
            try {
                const translation = await translateWithProxy(text, lang);
                return translation; // Return the translation obtained with the next proxy
            } catch (error) {
                console.error('Error while translating with another proxy:', error);
                throw error; // Throw error if translation fails with all proxies
            }
        } else {
            // Throw other translation errors
            throw error;
        }
    }
}


async function translateAndReply(text, ctx) {
    let lang;
    if (status.userLang) {
        lang = status.userLang;
    } else {
        lang = ctx.from.language_code || 'auto';
    }
    
    try {
        const translation = await translateWithProxy(text, lang, status.botLang);
        await ctx.reply(translation);
    } catch (error) {
        console.error('Error while translating:', error);
        await ctx.reply('Ошибка при переводе текста.');
    }
}

bot.start(async (ctx) => {
    const welcomeMessage = `
👋 Привет! Я здесь, чтобы помочь вам с переводом текста.

🌍 Мои функции:
- Перевод текста на различные языки.

🛠 Как начать:
1. Установите себе язык с помощью команды /setlang.
2. Установите язык для бота с помощью команды /setbotlang.

🔤 Я использую стандарт ISO 639-1 для обозначения языков.

⬇️ Нажмите /iso639, чтобы увидеть список поддерживаемых языков.
`;
    await ctx.replyWithHTML(welcomeMessage);
});
    
bot.command('iso639', async (ctx) => {
    const isoList = iso6391.getAllCodes().map(code => `  - ${iso6391.getName(code)}: ${code}`);
    let formattedList = 'Список языков (ISO 639-1):\n\n';
    formattedList += isoList.join('\n');
    await ctx.reply(formattedList);
});

bot.command('setlang', async (ctx) => {
    status.awaitingLanguage = 'userLang';
    await translateAndReply('Введите ваш язык:', ctx);
});

bot.command('setbotlang', async (ctx) => {
    status.awaitingLanguage = 'botLang';
    await translateAndReply('Введите язык для бота:', ctx);
});

bot.command('mylang', async (ctx) => {
    const langName = iso6391.getName(status.userLang || ctx.from.language_code);
    await translateAndReply(`Ваш текущий язык: ${langName}`, ctx);
});

bot.command('botlang', async (ctx) => {
    const langName = iso6391.getName(status.botLang);
    await translateAndReply(`Текущий язык бота: ${langName}`, ctx);
});

bot.on('text', async (ctx) => {
    if (status.awaitingLanguage === 'userLang') {
        const langCode = ctx.message.text;
        if (iso6391.validate(langCode)) {
            status.userLang = langCode;
            await translateAndReply(`Язык установлен на ${iso6391.getName(langCode)}`, ctx);
        } else {
            await translateAndReply('Некорректный код языка. Введите код языка из ISO 639-1 (например, en, ru, de).', ctx);
        }
    } else if (status.awaitingLanguage === 'botLang') {
        const langCode = ctx.message.text;
        if (iso6391.validate(langCode)) {
            status.botLang = langCode;
            await translateAndReply(`Язык бота установлен на ${iso6391.getName(langCode)}`, ctx);
        } else {
            await translateAndReply('Некорректный код языка. ведите код языка из ISO 639-1 (например, en, ru, de).', ctx);
        }
    } else {
        if (status.userLang && status.botLang) {
            try {
                const translation = await translateWithProxy(ctx.message.text, status.botLang );
                await ctx.reply(translation);
            } catch (error) {
                console.error('Error while translating:', error);
                await translateAndReply('Ошибка при переводе текста.', ctx);
            }
        } else {
            await translateAndReply('Для перевода текста необходимо установить язык пользователя и язык бота.', ctx);
        }
    }
});

bot.launch().then(() => console.log('Bot started'));

app.listen(port, () => {
    console.log(`Express server is listening on port ${port}`);
});