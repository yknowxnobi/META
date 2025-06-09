// commands/insta_reset.js
const axios = require('axios');
const fs = require('fs');

module.exports = (bot) => {
    const resetRequests = {};

    // /reset command
    bot.command('reset', async (ctx) => {
        const userId = ctx.from.id;
        resetRequests[userId] = true;

        await ctx.reply('📝 Please send your Instagram username or email to proceed with reset.');
    });

    // Listen for text after /reset
    bot.on('text', async (ctx) => {
        const userId = ctx.from.id;

        // Check if user is banned
        const banned = JSON.parse(fs.readFileSync('./data/banned.json', 'utf-8'));
        if (banned.includes(userId)) {
            return ctx.reply('🚫 You are banned from using this bot.');
        }

        if (resetRequests[userId]) {
            const emailOrUsername = ctx.message.text.trim();
            await ctx.reply(`🔄 Processing reset request for: \`${emailOrUsername}\``, { parse_mode: 'Markdown' });

            try {
                // Call your API
                const response = await axios.get(`https://instagram-pass-reset.vercel.app/?email_or_username=${encodeURIComponent(emailOrUsername)}`);

                // Expected response:
                // { email_sync: "...", reset_express: "...", duration: "..." }

                const data = response.data;

                const msg = `🎯 𝐃𝐨𝐧𝐞! 𝐘𝐨𝐮𝐫 𝐩𝐚𝐬𝐬𝐰𝐨𝐫𝐝 𝐫𝐞𝐬𝐞𝐭 𝐥𝐢𝐧𝐤 𝐢𝐬 𝐬𝐞𝐧𝐭 ✅\n\n` +
                    `˚₊· ➳❥ ємαιℓ ѕуη¢ 🔗: ${data.email_sync || 'N/A'}\n` +
                    `˚₊· ➳❥ яєѕєт єχρяєѕѕ 🛵: ${data.reset_express || 'N/A'}\n` +
                    `˚₊· ➳❥ яєqυєѕтє∂ ƒяσм 🕵🏻‍♂️: ${ctx.from.first_name || 'N/A'}\n` +
                    `˚₊· ➳❥ ρσωєяє∂ ву ⚡: @meta_server\n` +
                    `˚₊· ➳❥ ∂υяαтιση ⌛: ${data.duration || 'N/A'}`;

                await ctx.reply(msg);

            } catch (error) {
                console.error('Error in Insta Reset:', error.message);
                await ctx.reply('🚨 An error occurred while processing your reset request.');
            }

            delete resetRequests[userId]; // Clean request
        }
    });
};
