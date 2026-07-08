import { EventEmitter } from "events";
class EventBusImpl {
    emitter;
    constructor() {
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(100);
    }
    on(event, handler) {
        this.emitter.on(event, handler);
        return () => this.off(event, handler);
    }
    off(event, handler) {
        this.emitter.off(event, handler);
    }
    emit(event, payload) {
        this.emitter.emit(event, payload);
    }
}
export const eventBus = new EventBusImpl();
