// commands/info.js
const fs = require('fs');
const { Markup } = require('telegraf');

module.exports = (bot) => {
    bot.command('info', async (ctx) => {
        try {
            if (ctx.chat.type === 'private') {
                const userId = ctx.from.id;
                const username = ctx.from.username ? `@${ctx.from.username}` : 'N/A';
                const name = ctx.from.first_name || 'N/A';
                const isPremium = ctx.from.is_premium ? 'Yes' : 'No';

                const profilePhotos = await ctx.telegram.getUserProfilePhotos(userId);
                const profilePic = profilePhotos.total_count > 0
                    ? profilePhotos.photos[0][0].file_id
                    : null;

                if (profilePic) {
                    await ctx.replyWithPhoto(profilePic, {
                        caption: `👤 *User Info*\n\nUsername: ${username}\nName: ${name}\nUser ID: ${userId}\nPremium: ${isPremium}`,
                        parse_mode: 'Markdown'
                    });
                } else {
                    await ctx.reply(`👤 *User Info*\n\nUsername: ${username}\nName: ${name}\nUser ID: ${userId}\nPremium: ${isPremium}`, {
                        parse_mode: 'Markdown'
                    });
                }
            } else {
                // Group Info
                const chat = ctx.chat;
                const chatId = chat.id;
                const chatTitle = chat.title;
                const admins = await ctx.telegram.getChatAdministrators(chatId);
                const adminCount = admins.length;

                const member = admins.find(a => a.user.id === ctx.from.id);
                let status = 'Member';
                let title = '';

                if (member) {
                    if (member.status === 'creator') {
                        status = 'Owner';
                        title = 'Owner';
                    } else if (member.status === 'administrator') {
                        status = 'Admin';
                        title = member.custom_title || 'Admin';
                    }
                }

                const profilePhotos = await ctx.telegram.getUserProfilePhotos(ctx.from.id);
                const profilePic = profilePhotos.total_count > 0
                    ? profilePhotos.photos[0][0].file_id
                    : null;

                const username = ctx.from.username ? `@${ctx.from.username}` : 'N/A';
                const name = ctx.from.first_name || 'N/A';
                const userId = ctx.from.id;

                if (profilePic) {
                    await ctx.replyWithPhoto(profilePic, {
                        caption: `👥 *Group Info*\n\nGroup ID: ${chatId}\nGroup Name: ${chatTitle}\nTotal Admins: ${adminCount}\n\n👤 *Your Info*\nID: ${userId}\nName: ${name}\nUsername: ${username}\nStatus in Group: ${status}\nTitle: ${title}`,
                        parse_mode: 'Markdown'
                    });
                } else {
                    await ctx.reply(`👥 *Group Info*\n\nGroup ID: ${chatId}\nGroup Name: ${chatTitle}\nTotal Admins: ${adminCount}\n\n👤 *Your Info*\nID: ${userId}\nName: ${name}\nUsername: ${username}\nStatus in Group: ${status}\nTitle: ${title}`, {
                        parse_mode: 'Markdown'
                    });
                }
            }
        } catch (error) {
            console.error('Error in /info:', error.message);
            ctx.reply('❌ An error occurred while fetching info.');
        }
    });
};
