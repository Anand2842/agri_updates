const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const path = require('path');

// Load environment variables from the root .env.local file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

// CONFIGURATION
const WEBSITE_WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/whatsapp';
// Secret generated and verified in local env, prioritize WHATSAPP_WEBHOOK_SECRET
const API_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || 'df8d723a56a18d6165f74b0e16edb943717601e8a8c110ec1fcef708a0c5f931';
const TARGET_GROUP_NAME = process.env.GROUP_NAME || 'news';

console.log('Starting WhatsApp Client...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    }
});

client.on('qr', (qr) => {
    console.log('SCAN THIS QR CODE WITH WHATSAPP:');
    qrcode.generate(qr, { small: true });
    console.log('\n=== IF THE QR CODE ABOVE IS BROKEN, COPY THE TEXT BELOW ===');
    console.log(qr);
    console.log('=== AND PASTE IT INTO: https://www.the-qrcode-generator.com/ ===\n');
});

client.on('ready', () => {
    console.log('Client is ready!');
    console.log(`Listening for messages in group containing: "${TARGET_GROUP_NAME}"`);

    // Debugging: Log failed resource loads to identify 404/400 errors
    if (client.pupPage) {
        client.pupPage.on('response', response => {
            const status = response.status();
            if (status >= 400) {
                // Ignore common benign errors if needed, but for now log everything to identify the source
                console.log(`[DEBUG] Resource Load Failed: ${status} ${response.url()}`);
            }
        });
    }
});

client.on('message_create', async msg => {
    try {
        const chat = await msg.getChat();

        // Log all group names to help debug
        if (chat.isGroup) {
            console.log('Detected Group Message from:', chat.name);
        }

        if (chat.isGroup && chat.name.toLowerCase().includes(TARGET_GROUP_NAME.toLowerCase())) {
            console.log('Target Group Match:', chat.name);
            console.log('Received message from group:', chat.name);
            console.log('Content:', msg.body.substring(0, 50) + '...');

            if (msg.body.length < 2) return;

            console.log('Forwarding to Website...');
            const response = await axios.post(WEBSITE_WEBHOOK_URL, {
                rawText: msg.body,
                sender: msg.from
            }, {
                headers: {
                    'Authorization': `Bearer ${API_SECRET}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Website Response:', response.data.message);
        }
    } catch (error) {
        console.error('Error processing message:', error.message);
        if (error.response) console.error('API Error:', error.response.data);
    }
});

client.initialize().catch(err => console.error('Initialization Error:', err));

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
