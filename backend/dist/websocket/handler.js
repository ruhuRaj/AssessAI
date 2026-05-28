"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocket = void 0;
const ws_1 = __importDefault(require("ws"));
const queue_1 = require("../config/queue");
const clients = new Map();
const initWebSocket = (server) => {
    const wss = new ws_1.default.Server({ server });
    wss.on('connection', (ws) => {
        const clientId = Math.random().toString(36).substring(7);
        console.log(`✓ WebSocket client connected: ${clientId}`);
        clients.set(clientId, { ws });
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'subscribe') {
                    const { jobId } = data;
                    clients.set(clientId, { ws, jobId });
                    // Send initial status
                    const job = await queue_1.questionGenerationQueue.getJob(jobId);
                    if (job) {
                        const state = await job.getState();
                        ws.send(JSON.stringify({
                            type: 'status',
                            jobId,
                            state,
                            progress: job.progress,
                        }));
                    }
                }
            }
            catch (error) {
                console.error('WebSocket message error:', error);
            }
        });
        ws.on('close', () => {
            clients.delete(clientId);
            console.log(`✓ WebSocket client disconnected: ${clientId}`);
        });
        ws.on('error', (error) => {
            console.error(`WebSocket error for ${clientId}:`, error);
        });
    });
    // Monitor job progress
    const progressInterval = setInterval(async () => {
        for (const [clientId, client] of clients.entries()) {
            if (client.jobId) {
                try {
                    const job = await queue_1.questionGenerationQueue.getJob(client.jobId);
                    if (job) {
                        const state = await job.getState();
                        let progress = 0;
                        if (state === 'completed') {
                            progress = 100;
                        }
                        else if (state === 'active') {
                            progress = 50;
                        }
                        if (client.ws.readyState === ws_1.default.OPEN) {
                            client.ws.send(JSON.stringify({
                                type: 'progress',
                                jobId: client.jobId,
                                state,
                                progress,
                                returnValue: state === 'completed'
                                    ? job.returnvalue
                                    : null,
                            }));
                        }
                        // Remove subscription when job completes
                        if (state === 'completed' ||
                            state === 'failed') {
                            clients.set(clientId, { ws: client.ws });
                        }
                    }
                }
                catch (error) {
                    console.error('Progress monitoring error:', error);
                }
            }
        }
    }, 1000);
    console.log('✓ WebSocket server initialized');
    return { wss, cleanup: () => clearInterval(progressInterval) };
};
exports.initWebSocket = initWebSocket;
//# sourceMappingURL=handler.js.map