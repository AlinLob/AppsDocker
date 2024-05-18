import { Telegraf } from 'telegraf';
import { translateAndReply, translateWithProxy, status } from './translate.js';
import iso6391 from 'iso-639-1';


const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);


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
    const isoList = iso6391.getAllCodes().map(code => {
        const name = iso6391.getName(code);
        return ` • ${name}: ${code}`;
    });
  
    isoList.sort();

    const halfLength = Math.ceil(isoList.length / 2);
    const firstHalf = isoList.slice(0, halfLength);
    const secondHalf = isoList.slice(halfLength);

    let formattedList = 'List of languages (ISO 639-1):\n\n';
    formattedList += '```\n';
    formattedList += firstHalf.join('\n');
    formattedList += '```';
    await ctx.replyWithMarkdown(formattedList);

    formattedList = '```\n';
    formattedList += secondHalf.join('\n');
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
            status.awaitingLanguage = null; 
            await translateAndReply(`Language is set to ${iso6391.getName(langCode)}`, ctx);
        } else {
            await translateAndReply('Incorrect language code. Enter the language code from ISO 639-1 (e.g. en, ru, de).', ctx);
        }
    } else if (status.awaitingLanguage === 'botLang') {
        const langCode = ctx.message.text;
        if (iso6391.validate(langCode)) {
            status.botLang = langCode;
            status.awaitingLanguage = null; 
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

export { bot };
