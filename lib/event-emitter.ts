import { EventEmitter } from 'events';

// In development, the Next.js server might clear memory across hot-reloads.
// We store the emitter on the global object so standard Next.js dev reloads don't kill our real-time connections.
const globalEmitter = (global as any).notificationEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  (global as any).notificationEmitter = globalEmitter;
}

// Increase max listeners since many connections might be open at once
globalEmitter.setMaxListeners(100);

export default globalEmitter as EventEmitter;
