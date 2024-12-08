const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Constants
const TELEGRAM_BOT_TOKEN = "8127749895:AAGdFWF7M3ifeIV3biD8rOwsB4r-SHleZ5w";
const BOT_NAME = "Hans GPT";
const BOT_AUTHOR = "By Hans Tech";

// Log File Path
const LOG_FILE_PATH = path.join(__dirname, 'bot_error_logs.txt');

// Initialize Bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Utility: Log Errors to File
const logError = (error, source) => {
    const timestamp = new Date().toISOString();
    const errorLog = `
[${timestamp}] [Source: ${source}]
Message: ${error.message || "No error message available"}
Stack Trace: ${error.stack || "No stack trace available"}
--------------------------------------------------------
`;
    console.error(errorLog);
    fs.appendFileSync(LOG_FILE_PATH, errorLog);
};

// Utility: Send Detailed Error Message
const sendErrorMessage = (chatId, command, errorCode, errorDetails) => {
    const errorMessage = `
❗️ *${BOT_NAME} Error Encountered* ❗️
------------------------------------
🔸 *Error Code*: \`${errorCode}\`
🔸 *Command*: \`${command}\`
🔸 *Details*: ${errorDetails}

🔧 *Possible Solutions*:
1️⃣ Ensure your input matches the expected format.
2️⃣ Retry the command after a few seconds.
3️⃣ Verify ${BOT_NAME} is active and functional.
4️⃣ Contact support if the issue persists: ${BOT_AUTHOR}

We apologize for the inconvenience. ${BOT_AUTHOR}
    `;
    bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown' });
};

// Utility: Send Help Menu
const sendHelpMenu = (chatId) => {
    const helpMessage = `
🛠️ *${BOT_NAME} Help Menu*:
------------------------------------
💡 Here’s how you can use ${BOT_NAME} effectively:
- /start - Start the bot and receive a welcome message.
- /menu - View all available commands.
- /getdata - Retrieve data from a sample API.
- /sayhello - Get a personalized greeting.
- /about - Learn more about ${BOT_NAME}.
- /help - Display this help menu.

If you encounter issues, please contact ${BOT_AUTHOR}.
`;
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
};

// Command: /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.chat.first_name || "User";

    try {
        const startMessage = `
👋 Hello, ${userName}!
Welcome to *${BOT_NAME}*, your personal assistant for all things tech and fun. Type /menu to explore my capabilities or /help if you need assistance.
${BOT_AUTHOR}
        `;
        bot.sendMessage(chatId, startMessage, { parse_mode: 'Markdown' });
    } catch (error) {
        logError(error, 'Command: /start');
        sendErrorMessage(chatId, '/start', 'ERR-START-001', `Failed to execute /start command. ${error.message}`);
    }
});

// Command: /menu
bot.onText(/\/menu/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const menuMessage = `
📋 *${BOT_NAME} Menu*:
1️⃣ /sayhello - Receive a personalized greeting.
2️⃣ /getdata - Fetch interesting data.
3️⃣ /about - Learn more about ${BOT_NAME}.
4️⃣ /help - Access the help menu.

${BOT_AUTHOR}
        `;
        bot.sendMessage(chatId, menuMessage, { parse_mode: 'Markdown' });
    } catch (error) {
        logError(error, 'Command: /menu');
        sendErrorMessage(chatId, '/menu', 'ERR-MENU-002', `Failed to display menu. ${error.message}`);
    }
});

// Command: /sayhello
bot.onText(/\/sayhello/, async (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.chat.first_name || "User";

    try {
        const greeting = `
🌟 Hello, ${userName}!
${BOT_NAME} is here to assist you with your queries and tasks.
Let’s make today productive! ${BOT_AUTHOR}
        `;
        bot.sendMessage(chatId, greeting, { parse_mode: 'Markdown' });
    } catch (error) {
        logError(error, 'Command: /sayhello');
        sendErrorMessage(chatId, '/sayhello', 'ERR-HELLO-003', `Failed to send greeting. ${error.message}`);
    }
});

// Command: /getdata (Fetch Data from API)
bot.onText(/\/getdata/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
        const dataMessage = `
📊 *${BOT_NAME} Data Fetch*:
--------------------------------
- *Title*: ${response.data.title}
- *Body*: ${response.data.body}

Fetched live from the web. ${BOT_AUTHOR}
        `;
        bot.sendMessage(chatId, dataMessage, { parse_mode: 'Markdown' });
    } catch (error) {
        logError(error, 'Command: /getdata');
        sendErrorMessage(chatId, '/getdata', 'ERR-DATA-004', `Unable to fetch data. ${error.message}`);
    }
});

// Command: /about
bot.onText(/\/about/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const aboutMessage = `
ℹ️ *About ${BOT_NAME}*:
--------------------------------
${BOT_NAME} is your reliable assistant, developed to make your life easier. I’m powered by advanced APIs and created with care ${BOT_AUTHOR}.
`;
        bot.sendMessage(chatId, aboutMessage, { parse_mode: 'Markdown' });
    } catch (error) {
        logError(error, 'Command: /about');
        sendErrorMessage(chatId, '/about', 'ERR-ABOUT-005', `Unable to display about information. ${error.message}`);
    }
});

// Command: /help
bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        sendHelpMenu(chatId);
    } catch (error) {
        logError(error, 'Command: /help');
        sendErrorMessage(chatId, '/help', 'ERR-HELP-006', `Unable to display help menu. ${error.message}`);
    }
});

// Catch Unknown Messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    const knownCommands = ['/start', '/menu', '/getdata', '/sayhello', '/about', '/help'];
    if (knownCommands.includes(userMessage)) return;

    try {
        const errorMessage = `
🤔 *Unknown Command*:
I’m sorry, but I didn’t recognize the command: \`${userMessage}\`
Use /menu to see the list of commands I understand. ${BOT_AUTHOR}
        `;
        bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown' });
    } catch (error) {
        logError(error, 'Unknown Command Handler');
        sendErrorMessage(chatId, 'Unknown Command', 'ERR-UNKNOWN-007', `Error processing unknown command. ${error.message}`);
    }
});

// Handle Polling Errors
bot.on('polling_error', (error) => {
    logError(error, 'Polling Error');
});

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log(`${BOT_NAME} is shutting down gracefully...`);
    bot.stopPolling();
    process.exit(0);
});
