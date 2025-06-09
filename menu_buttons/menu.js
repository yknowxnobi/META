// menu_buttons/menu.js
const { Markup } = require('telegraf');

module.exports = Markup.inlineKeyboard([
    [Markup.button.url('➕ Add Me In Group', 'https://t.me/MetaServer_Bot?startgroup=true')],
    [Markup.button.callback('📜 Help and Commands', 'help_commands')],
    [Markup.button.url('👨‍💻 Developer', 'https://t.me/ziddi_beatz_bot'), Markup.button.url('🆘 Support', 'https://t.me/+IkoyKzPNe9M5Yzg9')]
]).reply_markup;
