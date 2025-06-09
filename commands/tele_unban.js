// commands/tele_unban.js
const axios = require('axios');
const fs = require('fs');

module.exports = (bot) => {
    const teleUnbanRequests = {};

    // /tele_unban command
    bot.command('tele_unban', async (ctx) => {
        const userId = ctx.from.id;
        teleUnbanRequests[userId] = { step: 'ask_email' };

        await ctx.reply('📧 Please enter your email address (will be used to send the request).');
    });

    // Listen for text after /tele_unban
    bot.on('text', async (ctx) => {
        const userId = ctx.from.id;

        // Check if user is banned
        const banned = JSON.parse(fs.readFileSync('./data/banned.json', 'utf-8'));
        if (banned.includes(userId)) {
            return ctx.reply('🚫 You are banned from using this bot.');
        }

        if (teleUnbanRequests[userId]) {
            const req = teleUnbanRequests[userId];

            // Step 1: Email
            if (req.step === 'ask_email') {
                teleUnbanRequests[userId].email = ctx.message.text.trim();
                teleUnbanRequests[userId].step = 'ask_phone';
                return ctx.reply('📞 Please enter your phone number with country code (example: +91XXXXXXXXXX).');
            }

            // Step 2: Phone
            if (req.step === 'ask_phone') {
                teleUnbanRequests[userId].phone = ctx.message.text.trim();
                teleUnbanRequests[userId].step = 'ask_username';
                return ctx.reply('📝 Please enter your Telegram username (without @).');
            }

            // Step 3: Username → send mail via API
            if (req.step === 'ask_username') {
                const email = teleUnbanRequests[userId].email;
                const phone = teleUnbanRequests[userId].phone;
                const username = ctx.message.text.trim();

                await ctx.reply('🔄 Sending Telegram Unban request via email...');

                try {
                    const message = `
Hello Telegram Support Team,

My account/phone number has been banned without any prior warning.
I have not violated any Telegram rules or policies.
Please review my case and lift the ban.

Phone: ${phone}
Username: @${username}

Thank you for your support.

Best regards,
${ctx.from.first_name} (@${ctx.from.username || 'N/A'})
`;

                    // Send email via API (send twice if needed)
                    const apiUrl = `https://sendmail.ashlynn.workers.dev/send-email?to=recover@telegram.org&from=${encodeURIComponent(email)}&subject=${encodeURIComponent('Please solve my problem')}&message=${encodeURIComponent(message)}`;

                    await axios.get(apiUrl);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // delay for safety
                    await axios.get(apiUrl);

                    await ctx.reply(`✅ Telegram Unban request has been sent successfully!\n\nEmail: ${email}\nPhone: ${phone}\nUsername: @${username}`);

                } catch (error) {
                    console.error('Error in Tele Unban:', error.message);
                    await ctx.reply('🚨 An error occurred while sending your Telegram Unban request.');
                }

                delete teleUnbanRequests[userId]; // Clean request
            }
        }
    });
};
