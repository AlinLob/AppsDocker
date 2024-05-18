import { HttpsProxyAgent } from 'https-proxy-agent';
import { translate } from '@vitalets/google-translate-api';
import dotenv from 'dotenv';

dotenv.config();

const proxies = JSON.parse(process.env.PROXIES);

const status = {
    userLang: '',
    botLang: '',
    awaitingLanguage: null,
};

let currentProxyIndex = 0;

async function translateWithProxy(text, lang, ctx) {
    const numProxies = proxies.length;
    let failedAttempts = 0;

    while (failedAttempts < numProxies) {
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
                console.log('Too many requests, switching to the next proxy.');
                currentProxyIndex = (currentProxyIndex + 1) % numProxies;
                console.log(`Next proxy index: ${currentProxyIndex}`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                failedAttempts++;
            } else {
                throw error;
            }
        }
    }

    if (ctx && ctx.reply) {
        console.log('All proxies failed. Please try again later.');
    }
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
        const translation = await translateWithProxy(text, lang, ctx);
        await ctx.reply(translation);
    } catch (error) {
        console.error('Translation error:', error);
        await ctx.reply('Error while translating text.');
    }
}

export { translateWithProxy, translateAndReply, status };