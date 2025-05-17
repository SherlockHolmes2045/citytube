const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // For CLI input

const apiId = 6518986; // e.g. 123456
const apiHash = "e2c6b0dff487dc2c5fb9e0f307cb5262";
const stringSession = new StringSession(""); // Save session after first login

(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    await client.start({
        phoneNumber: async () => await input.text("Phone number: "),
        password: async () => await input.text("2FA Password (if enabled): "),
        phoneCode: async () => await input.text("Code sent via Telegram: "),
        onError: (err) => console.log(err),
    });

    console.log("You are logged in!");

    // Save the session for future use
    console.log("Session string:", client.session.save());

    // Access a public channel
    const channel = await client.getEntity("https://t.me/City_Pop");

    // Get the last 10 messages
    const messages = await client.getMessages(channel, { limit: 10 });

    for (const message of messages) {
        console.log(message.text);

    }
})();
