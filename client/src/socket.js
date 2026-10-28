import { io } from 'socket.io-client';

// In dev, socket connects to same origin (proxied by Vite).
// In production, connect explicitly to the backend URL.
const SERVER = import.meta.env.VITE_API_URL || undefined;

// One shared connection; pages connect when they need live seat updates.
export const socket = io(SERVER, { autoConnect: false });
