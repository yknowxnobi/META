// commands/insta_meth.js
const axios = require('axios');
const fs = require('fs');
const { Markup } = require('telegraf');

module.exports = (bot) => {
    const methRequests = {};

    // /meth command
    bot.command('meth', async (ctx) => {
        const userId = ctx.from.id;
        methRequests[userId] = true;

        await ctx.reply('📝 Please send your target Instagram username (without @).');
    });

    // Listen for text after /meth
    bot.on('text', async (ctx) => {
        const userId = ctx.from.id;

        // Check if user is banned
        const banned = JSON.parse(fs.readFileSync('./data/banned.json', 'utf-8'));
        if (banned.includes(userId)) {
            return ctx.reply('🚫 You are banned from using this bot.');
        }

        if (methRequests[userId]) {
            const username = ctx.message.text.trim();
            await ctx.reply(`🔄 Verifying username: \`${username}\``, { parse_mode: 'Markdown' });

            try {
                // Example API → you can replace with your own API
                const res = await axios.get(`https://ig-info-drsudo.vercel.app/api/ig?user=${encodeURIComponent(username)}`);
                const data = res.data;

                if (!data.success) {
                    await ctx.reply('❌ Invalid Instagram username or not found.');
                } else {
                    const info = `📸 *Instagram User Info*\n\n` +
                        `• Username: ${data.username}\n` +
                        `• Nickname: ${data.nickname || 'N/A'}\n` +
                        `• Followers: ${data.followers}\n` +
                        `• Following: ${data.following}\n` +
                        `• Created At: ${data.account_created}\n\n` +
                        `✅ Is this the correct user?`;

                    await ctx.reply(info, {
                        parse_mode: 'Markdown',
                        reply_markup: Markup.inlineKeyboard([
                            [
                                Markup.button.callback(`✅ Yes`, `meth_confirm_yes_${username}`),
                                Markup.button.callback(`❌ No`, `meth_confirm_no`)
                            ]
                        ])
                    });
                }
            } catch (error) {
                console.error('Error in Insta Meth:', error.message);
                await ctx.reply('🚨 An error occurred while verifying the username.');
            }

            delete methRequests[userId]; // Clean request
        }
    });

    // Handle confirm buttons
    bot.action(/meth_confirm_yes_(.+)/, async (ctx) => {
        const username = ctx.match[1];

        await ctx.answerCbQuery();
        await ctx.reply(`🛠 Starting Meth process for: @${username}`);

        const categories = [
            'Nudity', 'Spam', 'Bullying', 'Scam', 'Hate Speech', 'Terrorism'
        ];

        const count = Math.floor(Math.random() * 3) + 2;
        const picked = [];
        while (picked.length < count) {
            const cat = categories[Math.floor(Math.random() * categories.length)];
            if (!picked.includes(cat)) picked.push(cat);
        }

        const result = picked.map(cat => `➥ ${Math.floor(Math.random() * 5) + 1}x ${cat}`).join('\n');
        const finalText = `🎯 Target: @${username}\n\n*Suggested Reports for Your Target:*\n\n\`\`\`\n${result}\n\`\`\``;

        await ctx.reply(finalText, { parse_mode: 'Markdown' });
    });

    bot.action('meth_confirm_no', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.reply('❌ Please try again with the correct IG username.');
    });
};
