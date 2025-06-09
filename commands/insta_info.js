// commands/insta_info.js
const axios = require('axios');
const fs = require('fs');

module.exports = (bot) => {
    const instaRequests = {};

    // /insta command
    bot.command('insta', async (ctx) => {
        const userId = ctx.from.id;
        instaRequests[userId] = true;

        await ctx.reply('📝 Please send the Instagram username (without @).');
    });

    // Listen for text after /insta
    bot.on('text', async (ctx) => {
        const userId = ctx.from.id;

        // Check if user is banned
        const banned = JSON.parse(fs.readFileSync('./data/banned.json', 'utf-8'));
        if (banned.includes(userId)) {
            return ctx.reply('🚫 You are banned from using this bot.');
        }

        if (instaRequests[userId]) {
            const username = ctx.message.text.trim();
            await ctx.reply(`🔄 Fetching info for: \`${username}\``, { parse_mode: 'Markdown' });

            try {
                // Example API → you can replace with your own API
                const response = await axios.get(`https://nextcounts.com/api/?username=${encodeURIComponent(username)}`);

                const data = response.data;

                const msg = `📸 *Instagram User Info*\n\n` +
                    `• Name: ${data.fullname || 'N/A'}\n` +
                    `• Username: @${data.username || 'N/A'}\n` +
                    `• Bio: ${data.bio || 'N/A'}\n` +
                    `• Followers: ${data.followers || 'N/A'}\n` +
                    `• Following: ${data.following || 'N/A'}\n` +
                    `• Posts: ${data.posts || 'N/A'}\n` +
                    `• User ID: ${data.userid || 'N/A'}\n\n` +
                    `🔗 [View Profile](https://www.instagram.com/${username})`;

                await ctx.replyWithPhoto(
                    { url: data.profile || 'https://via.placeholder.com/200x200.png?text=No+Profile+Pic' },
                    {
                        caption: msg,
                        parse_mode: 'Markdown'
                    }
                );

            } catch (error) {
                console.error('Error in Insta Info:', error.message);
                await ctx.reply('🚨 An error occurred while fetching Instagram info.');
            }

            delete instaRequests[userId]; // Clean request
        }
    });
};
