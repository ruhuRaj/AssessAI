"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
require("../config/loadEnv");
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        const options = {};
        // authSource admin is for local Docker Mongo only, not Atlas
        if (uri && !uri.startsWith('mongodb+srv://')) {
            options.authSource = 'admin';
        }
        await mongoose_1.default.connect(uri, options);
        console.log('✓ MongoDB connected successfully');
    }
    catch (error) {
        console.error('✗ MongoDB connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    await mongoose_1.default.disconnect();
    console.log('✓ MongoDB disconnected');
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=database.js.map