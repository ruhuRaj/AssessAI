import WebSocket from 'ws';
import { Server } from 'http';
export declare const initWebSocket: (server: Server) => {
    wss: WebSocket.Server<typeof WebSocket, typeof import("http").IncomingMessage>;
    cleanup: () => void;
};
//# sourceMappingURL=handler.d.ts.map