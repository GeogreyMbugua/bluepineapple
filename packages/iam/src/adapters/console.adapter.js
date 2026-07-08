export class ConsoleNotificationAdapter {
    async send(message) {
        const tag = `[NOTIFICATION:${message.purpose}]`;
        console.log(`${tag} to=${message.to} body=${message.body}`);
    }
}
