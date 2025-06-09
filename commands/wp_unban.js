// commands/wp_unban.js
const axios = require('axios');
const fs = require('fs');

module.exports = (bot) => {
    const wpUnbanRequests = {};

    // /wa_reset command
    bot.command('wa_reset', async (ctx) => {
        const userId = ctx.from.id;
        wpUnbanRequests[userId] = { step: 'ask_email' };

        await ctx.reply('📧 Please enter your email address (will be used to send the request).');
    });

    // Listen for text after /wa_reset
    bot.on('text', async (ctx) => {
        const userId = ctx.from.id;

        // Check if user is banned
        const banned = JSON.parse(fs.readFileSync('./data/banned.json', 'utf-8'));
        if (banned.includes(userId)) {
            return ctx.reply('🚫 You are banned from using this bot.');
        }

        if (wpUnbanRequests[userId]) {
            const req = wpUnbanRequests[userId];

            // Step 1: Email
            if (req.step === 'ask_email') {
                wpUnbanRequests[userId].email = ctx.message.text.trim();
                wpUnbanRequests[userId].step = 'ask_phone';
                return ctx.reply('📞 Please enter your WhatsApp phone number with country code (example: +91XXXXXXXXXX).');
            }

            // Step 2: Phone
            if (req.step === 'ask_phone') {
                wpUnbanRequests[userId].phone = ctx.message.text.trim();
                wpUnbanRequests[userId].step = 'ask_model';
                return ctx.reply('📱 Please enter your mobile model (example: Samsung S23 Ultra).');
            }

            // Step 3: Mobile model → send mail via API
            if (req.step === 'ask_model') {
                const email = wpUnbanRequests[userId].email;
                const phone = wpUnbanRequests[userId].phone;
                const model = ctx.message.text.trim();

                await ctx.reply('🔄 Sending WhatsApp Unban request via email...');

                try {
                    const message = `
Hello,
My WhatsApp account has been deactivated by mistake.
Could you please activate my phone number: "${phone}"
My mobile model: "${model}"

Thanks in advance.
`;

                    // Send email via API (send twice if needed)
                    const apiUrl = `https://sendmail.ashlynn.workers.dev/send-email?to=${encodeURIComponent(email)}&from=${encodeURIComponent(email)}&subject=${encodeURIComponent('My WhatsApp account has been deactivated by mistake')}&message=${encodeURIComponent(message)}`;

                    await axios.get(apiUrl);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // delay for safety
                    await axios.get(apiUrl);

                    await ctx.reply(`✅ WhatsApp Unban request has been sent successfully!\n\nEmail: ${email}\nPhone: ${phone}\nMobile Model: ${model}`);

                } catch (error) {
                    console.error('Error in WP Unban:', error.message);
                    await ctx.reply('🚨 An error occurred while sending your WhatsApp Unban request.');
                }

                delete wpUnbanRequests[userId]; // Clean request
            }
        }
    });
};
