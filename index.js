// index.js
const { Telegraf, Scenes, session, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');

// Config — Replace these
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; // put your bot token here
const ADMIN_ID = 123456789; // your admin ID
const FORCE_JOIN_CHANNELS = ['@channel1', '@channel2', '@channel3', '@channel4']; // your 4 channels

// Init bot
const bot = new Telegraf(BOT_TOKEN);

// Scenes
const InstaReport2Scene = require('./scenes/insta_report2');
const stage = new Scenes.Stage([InstaReport2Scene]);

bot.use(session());
bot.use(stage.middleware());

// Load Menu Buttons
const menuKeyboard = require('./menu_buttons/menu');

// Utils → Check force join
async function checkForceJoin(ctx) {
    try {
        for (const ch of FORCE_JOIN_CHANNELS) {
            const member = await ctx.telegram.getChatMember(ch, ctx.from.id);
            if (['left', 'kicked'].includes(member.status)) {
                return false;
            }
        }
        return true;
    } catch (e) {
        console.error('Force join check error:', e.message);
        return false;
    }
}

// START Command
bot.command('start', async (ctx) => {
    const isJoined = await checkForceJoin(ctx);
    if (!isJoined) {
        return ctx.reply(
            '🚫 Please join all required channels first!',
            Markup.inlineKeyboard(
                FORCE_JOIN_CHANNELS.map(ch => [Markup.button.url(`Join ${ch}`, `https://t.me/${ch.replace('@', '')}`)])
                    .concat([[Markup.button.callback('✅ I Joined', 'check_fsub')]])
            )
        );
    }

    // New User Handling
    let users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
    if (!users.some(u => u.user_id === ctx.from.id)) {
        users.push({
            user_id: ctx.from.id,
            username: ctx.from.username || 'NoUsername',
            name: ctx.from.first_name || 'NoName',
            joined_at: new Date().toISOString()
        });
        fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));

        // Notify Admin
        bot.telegram.sendMessage(ADMIN_ID,
            `🆕 New User!\nName: ${ctx.from.first_name}\nUsername: @${ctx.from.username || 'N/A'}\nUserID: ${ctx.from.id}\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
            Markup.inlineKeyboard([
                [Markup.button.callback('🚫 Ban', `ban_${ctx.from.id}`), Markup.button.callback('✅ Unban', `unban_${ctx.from.id}`)],
                [Markup.button.callback('🔇 Mute', `mute_${ctx.from.id}`), Markup.button.callback('🔊 Unmute', `unmute_${ctx.from.id}`)],
                [Markup.button.callback('📊 Details', `details_${ctx.from.id}`)]
            ])
        );
    }

    // Show Main Menu
    ctx.replyWithPhoto(
        { url: 'https://via.placeholder.com/300x100.png?text=Welcome+to+Bot' },
        {
            caption: `👋 Welcome, ${ctx.from.first_name}!\nChoose an option:`,
            reply_markup: menuKeyboard
        }
    );
});

// Force Join Callback Check
bot.action('check_fsub', async (ctx) => {
    const isJoined = await checkForceJoin(ctx);
    if (!isJoined) {
        return ctx.answerCbQuery('❌ You still need to join all required channels.', { show_alert: true });
    }

    ctx.answerCbQuery('✅ Thank you! You can now use the bot.');
    ctx.deleteMessage();
    ctx.replyWithPhoto(
        { url: 'https://via.placeholder.com/300x100.png?text=Welcome+to+Bot' },
        {
            caption: `👋 Welcome back, ${ctx.from.first_name}!\nChoose an option:`,
            reply_markup: menuKeyboard
        }
    );
});

// Load Other Commands
require('./commands/info')(bot);
require('./commands/stats')(bot);
require('./commands/admin_panel')(bot);
require('./commands/help')(bot);
require('./commands/insta_reset')(bot);
require('./commands/insta_info')(bot);
require('./commands/insta_meth')(bot);
require('./commands/tele_unban')(bot);
require('./commands/wp_ban')(bot);
require('./commands/wp_unban')(bot);

// Insta Report2 Scene command
bot.command('insta_report2', (ctx) => ctx.scene.enter('insta_report2'));

// Group Protection Middleware
bot.use(async (ctx, next) => {
    if (ctx.chat?.type.includes('group')) {
        let verified = JSON.parse(fs.readFileSync('./data/verified.json', 'utf-8'));
        if (!verified.includes(ctx.from.id)) {
            return ctx.reply('🚫 Please start the bot in private and join required channels first!');
        }
    }
    return next();
});

// Launch Bot
bot.launch();
console.log('✅ Bot is running...');
