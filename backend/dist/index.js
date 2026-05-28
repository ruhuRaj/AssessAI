"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/loadEnv");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const queue_1 = require("./config/queue");
const workers_1 = require("./jobs/workers");
const handler_1 = require("./websocket/handler");
const errorHandler_1 = require("./middleware/errorHandler");
const assignments_1 = __importDefault(require("./routes/assignments"));
const auth_1 = __importDefault(require("./routes/auth"));
const emailService_1 = require("./services/emailService");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
const isAllowedOrigin = (origin) => {
    if (!origin)
        return true;
    if (configuredOrigins.includes(origin))
        return true;
    if (process.env.NODE_ENV !== 'production' &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return true;
    }
    return false;
};
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, origin ?? configuredOrigins[0]);
        }
        else {
            callback(new Error(`CORS blocked origin: ${origin}`));
        }
    },
    credentials: true,
}));
// Body parser
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Static uploads
app.use('/uploads', (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && isAllowedOrigin(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api', assignments_1.default);
// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'AssessAI Backend is running successfully 🚀',
    });
});
// Health route
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});
// 404 route
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
    });
});
// Error handler
app.use(errorHandler_1.errorHandler);
// HTTP server
const server = http_1.default.createServer(app);
// Start server
const startServer = async () => {
    try {
        // Database connections
        await (0, database_1.connectDB)();
        await (0, redis_1.connectRedis)();
        // SMTP
        if ((0, emailService_1.isSmtpConfigured)()) {
            try {
                await (0, emailService_1.verifySmtpConnection)();
                console.log('✓ SMTP ready for OTP emails');
            }
            catch (smtpErr) {
                console.warn('⚠ SMTP configured but connection failed — OTP will log to console:', smtpErr instanceof Error ? smtpErr.message : smtpErr);
            }
        }
        else {
            console.warn('⚠ SMTP not set — OTP codes print in backend console only');
        }
        // BullMQ
        await (0, queue_1.initializeQueues)();
        // Workers
        (0, workers_1.startQuestionGenerationWorker)();
        (0, workers_1.startPDFGenerationWorker)();
        // WebSocket
        (0, handler_1.initWebSocket)(server);
        // Start listening
        server.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Graceful shutdown
const shutdown = async () => {
    console.log('Shutting down gracefully...');
    server.close();
    await (0, database_1.disconnectDB)();
    await (0, redis_1.disconnectRedis)();
    process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
// Start app
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map