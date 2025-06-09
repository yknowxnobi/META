// commands/help.js
const { Markup } = require('telegraf');

module.exports = (bot) => {
    // Help and Commands button click
    bot.action('help_commands', async (ctx) => {
        try {
            await ctx.answerCbQuery();

            const helpText = `📜 *Available Commands:*\n\n` +
                `/start → Start the bot\n` +
                `/reset → Insta password reset\n` +
                `/info → Get your Telegram details\n` +
                `/meth → Insta Meth style report\n` +
                `/insta → Get Instagram user info\n` +
                `/insta_report2 → Advanced Insta Report 2\n` +
                `/wa_reset → WhatsApp unban request (email)\n` +
                `/wa_ban → WhatsApp ban report\n` +
                `/tele_unban → Telegram unban request\n` +
                `/my_stats → Your personal bot usage stats\n` +
                `/stats → Total bot statistics\n`;

            await ctx.replyWithPhoto(
                { url: 'https://i.ibb.co/cXYcp8VX/image.png?text=Help+and+Commands' }, // Replace with your Help image link
                {
                    caption: helpText,
                    parse_mode: 'Markdown'
                }
            );
        } catch (error) {
            console.error('Error in Help button:', error.message);
            ctx.reply('❌ An error occurred while showing help.');
        }
    });
};
