// commands/admin_panel.js
const fs = require('fs');

module.exports = (bot) => {
    bot.on('callback_query', async (ctx) => {
        try {
            const data = ctx.callbackQuery.data;
            const userId = data.split('_')[1];

            if (data.startsWith('ban_')) {
                let banned = JSON.parse(fs.readFileSync('./data/banned.json', 'utf-8'));
                if (!banned.includes(Number(userId))) {
                    banned.push(Number(userId));
                    fs.writeFileSync('./data/banned.json', JSON.stringify(banned, null, 2));
                    await ctx.answerCbQuery('✅ User Banned!');
                } else {
                    await ctx.answerCbQuery('⚠️ User already banned.');
                }
            }

            else if (data.startsWith('unban_')) {
                let banned = JSON.parse(fs.readFileSync('./data/banned.json', 'utf-8'));
                if (banned.includes(Number(userId))) {
                    banned = banned.filter(id => id !== Number(userId));
                    fs.writeFileSync('./data/banned.json', JSON.stringify(banned, null, 2));
                    await ctx.answerCbQuery('✅ User Unbanned!');
                } else {
                    await ctx.answerCbQuery('⚠️ User is not banned.');
                }
            }

            else if (data.startsWith('mute_')) {
                let muted = JSON.parse(fs.readFileSync('./data/muted.json', 'utf-8'));
                if (!muted.includes(Number(userId))) {
                    muted.push(Number(userId));
                    fs.writeFileSync('./data/muted.json', JSON.stringify(muted, null, 2));
                    await ctx.answerCbQuery('🔇 User Muted!');
                } else {
                    await ctx.answerCbQuery('⚠️ User already muted.');
                }
            }

            else if (data.startsWith('unmute_')) {
                let muted = JSON.parse(fs.readFileSync('./data/muted.json', 'utf-8'));
                if (muted.includes(Number(userId))) {
                    muted = muted.filter(id => id !== Number(userId));
                    fs.writeFileSync('./data/muted.json', JSON.stringify(muted, null, 2));
                    await ctx.answerCbQuery('🔊 User Unmuted!');
                } else {
                    await ctx.answerCbQuery('⚠️ User is not muted.');
                }
            }

            else if (data.startsWith('details_')) {
                const usageStats = JSON.parse(fs.readFileSync('./data/usage_stats.json', 'utf-8'));
                const userStats = usageStats[userId] || {
                    commands_used: 0,
                    buttons_clicked: 0,
                    time_spent_min: 0,
                    daily_usage_count: 0
                };

                const msg = `📊 *User Stats*\n\n` +
                    `User ID: ${userId}\n` +
                    `Commands Used: *${userStats.commands_used}*\n` +
                    `Buttons Clicked: *${userStats.buttons_clicked}*\n` +
                    `Time Spent: *${userStats.time_spent_min}* minutes\n` +
                    `Daily Usage Count: *${userStats.daily_usage_count}*`;

                await ctx.reply(msg, { parse_mode: 'Markdown' });
                await ctx.answerCbQuery();
            }
        } catch (error) {
            console.error('Error in Admin Panel:', error.message);
            await ctx.answerCbQuery('❌ Error processing action.', { show_alert: true });
        }
    });
};
