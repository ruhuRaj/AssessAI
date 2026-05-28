"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const otpSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    codeHash: { type: String, required: true },
    purpose: {
        type: String,
        enum: ['signup', 'password_reset'],
        required: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    metadata: { type: mongoose_1.default.Schema.Types.Mixed },
    createdAt: { type: Date, default: () => new Date() },
});
otpSchema.index({ email: 1, purpose: 1 });
exports.Otp = mongoose_1.default.model('Otp', otpSchema);
//# sourceMappingURL=Otp.js.map