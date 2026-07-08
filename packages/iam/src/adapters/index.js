import { ConsoleNotificationAdapter } from "./console.adapter";
export { ConsoleNotificationAdapter };
let adapter = new ConsoleNotificationAdapter();
export const notificationService = {
    setAdapter(a) {
        adapter = a;
    },
    async send(message) {
        return adapter.send(message);
    },
};
