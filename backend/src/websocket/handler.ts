import WebSocket from 'ws';
import { Server } from 'http';
import { questionGenerationQueue } from '../config/queue';

interface ClientConnection {
  ws: WebSocket;
  jobId?: string;
}

const clients: Map<string, ClientConnection> = new Map();

export const initWebSocket = (server: Server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws: WebSocket) => {
    const clientId = Math.random().toString(36).substring(7);
    console.log(`✓ WebSocket client connected: ${clientId}`);

    clients.set(clientId, { ws });

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'subscribe') {
          const { jobId } = data;
          clients.set(clientId, { ws, jobId });

          // Send initial status
          const job = await questionGenerationQueue.getJob(jobId);
          if (job) {
            const state = await job.getState();
            ws.send(
              JSON.stringify({
                type: 'status',
                jobId,
                state,
                progress: job.progress,
              })
            );
          }
        }
      } catch (error) {
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
          const job = await questionGenerationQueue.getJob(client.jobId);
          if (job) {
  const state = await job.getState();

  let progress = 0;

  if (state === 'completed') {
    progress = 100;
  } else if (state === 'active') {
    progress = 50;
  }

  if (client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(
      JSON.stringify({
        type: 'progress',
        jobId: client.jobId,
        state,
        progress,
        returnValue:
          state === 'completed'
            ? job.returnvalue
            : null,
      })
    );
  }

  // Remove subscription when job completes
  if (
    state === 'completed' ||
    state === 'failed'
  ) {
    clients.set(clientId, { ws: client.ws });
  }
}
        } catch (error) {
          console.error('Progress monitoring error:', error);
        }
      }
    }
  }, 1000);

  console.log('✓ WebSocket server initialized');

  return { wss, cleanup: () => clearInterval(progressInterval) };
};
