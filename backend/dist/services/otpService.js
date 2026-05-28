"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSendOtp = createAndSendOtp;
exports.verifyOtp = verifyOtp;
exports.clearOtpsForEmail = clearOtpsForEmail;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const Otp_1 = require("../models/Otp");
const emailService_1 = require("./emailService");
const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
function generateOtpCode() {
    const max = 10 ** OTP_LENGTH;
    const num = crypto_1.default.randomInt(0, max);
    return String(num).padStart(OTP_LENGTH, '0');
}
function normalizeEmail(email) {
    return String(email).toLowerCase().trim();
}
async function createAndSendOtp(email, purpose, metadata) {
    const normalized = normalizeEmail(email);
    const code = generateOtpCode();
    const codeHash = await bcryptjs_1.default.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    await Otp_1.Otp.deleteMany({ email: normalized, purpose });
    const record = await Otp_1.Otp.create({
        email: normalized,
        codeHash,
        purpose,
        expiresAt,
        attempts: 0,
        metadata,
    });
    try {
        await (0, emailService_1.sendOtpEmail)(normalized, code, purpose);
    }
    catch (error) {
        await Otp_1.Otp.deleteOne({ _id: record._id });
        throw error;
    }
}
async function verifyOtp(email, purpose, code) {
    const normalized = normalizeEmail(email);
    const record = await Otp_1.Otp.findOne({ email: normalized, purpose }).sort({
        createdAt: -1,
    });
    if (!record) {
        return { valid: false, error: 'No verification code found. Request a new one.' };
    }
    if (record.expiresAt < new Date()) {
        await Otp_1.Otp.deleteOne({ _id: record._id });
        return { valid: false, error: 'Code expired. Request a new one.' };
    }
    if (record.attempts >= MAX_ATTEMPTS) {
        await Otp_1.Otp.deleteOne({ _id: record._id });
        return { valid: false, error: 'Too many attempts. Request a new code.' };
    }
    const match = await bcryptjs_1.default.compare(String(code).trim(), record.codeHash);
    record.attempts += 1;
    await record.save();
    if (!match) {
        const remaining = MAX_ATTEMPTS - record.attempts;
        return {
            valid: false,
            error: remaining > 0
                ? `Invalid code. ${remaining} attempt(s) left.`
                : 'Invalid code. Request a new one.',
        };
    }
    const metadata = record.metadata;
    await Otp_1.Otp.deleteOne({ _id: record._id });
    return { valid: true, metadata };
}
async function clearOtpsForEmail(email) {
    await Otp_1.Otp.deleteMany({ email: normalizeEmail(email) });
}
//# sourceMappingURL=otpService.js.map