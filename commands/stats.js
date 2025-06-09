// commands/stats.js
const fs = require('fs');

module.exports = (bot) => {
    // /stats → total bot stats
    bot.command('stats', async (ctx) => {
        try {
            const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
            const broadcastStats = JSON.parse(fs.readFileSync('./data/broadcast_stats.json', 'utf-8'));

            const todayBroadcast = broadcastStats.today || 0;
            const monthlyBroadcast = broadcastStats.monthly || 0;

            const botUsername = ctx.me; // bot username from context

            const msg = `📊 *Bot Live Statistics And Info*\n\n` +
                `┏•❅────✧❅✦❅✧────❅•┓\n` +
                `★ Total Users Count: *${users.length}*\n` +
                `★ 📅 Today's Broadcast: *${todayBroadcast}*\n` +
                `★ 📆 Monthly Broadcast: *${monthlyBroadcast}*\n` +
                `★ 🆔 Current Version: *v5.0*\n` +
                `★ ⚡ Update On: *2025-20-2025*\n` +
                `★ 📍 Info Of: *@${botUsername}*\n` +
                `┗•❅────✧❅✦❅✧────❅•┛`;

            ctx.reply(msg, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Error in /stats:', error.message);
            ctx.reply('❌ An error occurred while fetching stats.');
        }
    });

    // /my_stats → personal user stats
    bot.command('my_stats', async (ctx) => {
        try {
            const usageStats = JSON.parse(fs.readFileSync('./data/usage_stats.json', 'utf-8'));
            const userId = ctx.from.id;

            const userStats = usageStats[userId] || {
                commands_used: 0,
                buttons_clicked: 0,
                time_spent_min: 0,
                daily_usage_count: 0
            };

            const msg = `📊 *Your Personal Bot Stats*\n\n` +
                `• Commands Used: *${userStats.commands_used}*\n` +
                `• Buttons Clicked: *${userStats.buttons_clicked}*\n` +
                `• Time Spent: *${userStats.time_spent_min}* minutes\n` +
                `• Daily Usage Count: *${userStats.daily_usage_count}*`;

            ctx.reply(msg, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Error in /my_stats:', error.message);
            ctx.reply('❌ An error occurred while fetching your stats.');
        }
    });
};
