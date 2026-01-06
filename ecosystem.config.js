module.exports = {
    apps: [{
        name: "whatsapp-bot",
        script: "./scripts/whatsapp-bot/bot.js",
        watch: false,
        autorestart: true,
        max_memory_restart: "1G",
        env: {
            NODE_ENV: "production",
        },
        error_file: "./logs/bot-error.log",
        out_file: "./logs/bot-out.log",
        exec_mode: "fork"
    }]
}
