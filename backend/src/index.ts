import './config/loadEnv';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import path from 'path';
import { connectDB, disconnectDB } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { initializeQueues } from './config/queue';
import {
  startQuestionGenerationWorker,
  startPDFGenerationWorker,
} from './jobs/workers';
import { initWebSocket } from './websocket/handler';
import { errorHandler } from './middleware/errorHandler';
import assignmentRoutes from './routes/assignments';
import authRoutes from './routes/auth';
import {
  verifySmtpConnection,
  isSmtpConfigured,
} from './services/emailService';

const app: Express = express();

const PORT = process.env.PORT || 3001;

const configuredOrigins = (
  process.env.FRONTEND_URL || 'http://localhost:3000'
)
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

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
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

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static uploads
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

// Request logger
app.use((req: Request, res: Response, next: Function) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', assignmentRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AssessAI Backend is running successfully 🚀',
  });
});

// Health route
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 404 route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use(errorHandler);

// HTTP server
const server = http.createServer(app);

// Start server
const startServer = async () => {
  try {
    // Database connections
    await connectDB();
    await connectRedis();

    // SMTP
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
        '⚠ SMTP not set — OTP codes print in backend console only'
      );
    }

    // BullMQ
    await initializeQueues();

    // Workers
    startQuestionGenerationWorker();
    startPDFGenerationWorker();

    // WebSocket
    initWebSocket(server);

    // Start listening
    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(
        `✓ Environment: ${process.env.NODE_ENV || 'development'}`
      );
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
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

// Start app
startServer();

export default app;