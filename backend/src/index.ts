import './config/loadEnv';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import path from 'path';
import { connectDB, disconnectDB } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { initializeQueues } from './config/queue';
import { startQuestionGenerationWorker, startPDFGenerationWorker } from './jobs/workers';
import { initWebSocket } from './websocket/handler';
import { errorHandler } from './middleware/errorHandler';
import assignmentRoutes from './routes/assignments';
import authRoutes from './routes/auth';
import { verifySmtpConnection, isSmtpConfigured } from './services/emailService';

const app: Express = express();
const port = process.env.PORT || 3001;

const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  if (
    process.env.NODE_ENV !== 'production' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  ) {
    return true;
  }
  return false;
};

// Middleware — allow frontend (different port) to load /uploads images in <img>
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, origin ?? configuredOrigins[0]);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  '/uploads',
  (req: Request, res: Response, next: Function) => {
    const origin = req.headers.origin;
    if (origin && isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(process.cwd(), 'uploads'))
);

// Request logging
app.use((req: Request, res: Response, next: Function) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', assignmentRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Create HTTP server for WebSocket
const server = http.createServer(app);

// Initialize services
const startServer = async () => {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();

    if (isSmtpConfigured()) {
      try {
        await verifySmtpConnection();
        console.log('✓ SMTP ready for OTP emails');
      } catch (smtpErr) {
        console.warn(
          '⚠ SMTP configured but connection failed — OTP will log to console:',
          smtpErr instanceof Error ? smtpErr.message : smtpErr
        );
      }
    } else {
      console.warn(
        '⚠ SMTP not set — OTP codes print in this terminal only (see backend console)'
      );
    }
    
    // Initialize queues
    await initializeQueues();

    // Start workers
    startQuestionGenerationWorker();
    startPDFGenerationWorker();

    // Initialize WebSocket
    initWebSocket(server);

    // Start server
    server.listen(port, () => {
      console.log(`✓ Server running on http://localhost:${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  server.close();
  await disconnectDB();
  await disconnectRedis();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();

export default app;
