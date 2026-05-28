"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Otp_1 = require("../models/Otp");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const uploadAvatar_1 = require("../middleware/uploadAvatar");
const otpService_1 = require("../services/otpService");
const accountService_1 = require("../services/accountService");
const cloudinaryService_1 = require("../services/cloudinaryService");
const router = (0, express_1.Router)();
const handleAvatarUpload = (req, res, next) => {
    (0, uploadAvatar_1.uploadAvatar)(req, res, (err) => {
        if (err) {
            const message = err instanceof Error ? err.message : 'Upload failed';
            return res.status(400).json({ error: message });
        }
        next();
    });
};
const normalizeEmail = (email) => String(email).toLowerCase().trim();
/** Step 1: send OTP for signup (stores pending user data) */
router.post('/signup/send-otp', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password, schoolName } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
        return res.status(400).json({
            error: 'Name, email, and password are required',
        });
    }
    if (String(password).length < 6) {
        return res.status(400).json({
            error: 'Password must be at least 6 characters',
        });
    }
    const normalized = normalizeEmail(email);
    const existing = await User_1.User.findOne({ email: normalized });
    if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcryptjs_1.default.hash(String(password), 10);
    await (0, otpService_1.createAndSendOtp)(normalized, 'signup', {
        name: String(name).trim(),
        passwordHash,
        schoolName: schoolName?.trim() || undefined,
    });
    res.json({
        success: true,
        message: 'Verification code sent to your email',
        email: normalized,
    });
}));
/** Resend signup OTP */
router.post('/signup/resend-otp', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    const normalized = normalizeEmail(email);
    const pending = await Otp_1.Otp.findOne({
        email: normalized,
        purpose: 'signup',
    }).sort({ createdAt: -1 });
    if (!pending?.metadata) {
        return res.status(400).json({
            error: 'No pending signup found. Please start signup again.',
        });
    }
    const meta = pending.metadata;
    await (0, otpService_1.createAndSendOtp)(normalized, 'signup', meta);
    res.json({
        success: true,
        message: 'Verification code resent',
        email: normalized,
    });
}));
/** Step 2: verify OTP and create account */
router.post('/signup/verify', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and verification code are required' });
    }
    const normalized = normalizeEmail(email);
    const existing = await User_1.User.findOne({ email: normalized });
    if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
    }
    const result = await (0, otpService_1.verifyOtp)(normalized, 'signup', String(otp));
    if (!result.valid || !result.metadata) {
        return res.status(400).json({ error: result.error || 'Invalid code' });
    }
    const meta = result.metadata;
    if (!meta.name || !meta.passwordHash) {
        return res.status(400).json({
            error: 'Signup session expired. Please sign up again.',
        });
    }
    const user = await User_1.User.create({
        name: meta.name,
        email: normalized,
        password: meta.passwordHash,
        schoolName: meta.schoolName,
        emailVerified: true,
    });
    const token = (0, auth_1.signToken)(String(user._id), user.email, user.name);
    res.status(201).json({
        success: true,
        token,
        user: (0, auth_1.toPublicUser)(user),
    });
}));
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User_1.User.findOne({
        email: normalizeEmail(email),
    });
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (user.emailVerified === false) {
        return res.status(403).json({
            error: 'Email not verified. Please complete signup verification.',
        });
    }
    const valid = await bcryptjs_1.default.compare(String(password), user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = (0, auth_1.signToken)(String(user._id), user.email, user.name);
    res.json({
        success: true,
        token,
        user: (0, auth_1.toPublicUser)(user),
    });
}));
/** Forgot password — send OTP */
router.post('/forgot-password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    const normalized = normalizeEmail(email);
    const user = await User_1.User.findOne({ email: normalized });
    if (user) {
        await (0, otpService_1.createAndSendOtp)(normalized, 'password_reset', {
            userId: String(user._id),
        });
    }
    res.json({
        success: true,
        message: 'If an account exists for this email, a reset code has been sent.',
        email: normalized,
    });
}));
/** Reset password with OTP */
router.post('/reset-password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({
            error: 'Email, verification code, and new password are required',
        });
    }
    if (String(newPassword).length < 6) {
        return res.status(400).json({
            error: 'Password must be at least 6 characters',
        });
    }
    const normalized = normalizeEmail(email);
    const result = await (0, otpService_1.verifyOtp)(normalized, 'password_reset', String(otp));
    if (!result.valid) {
        return res.status(400).json({ error: result.error || 'Invalid code' });
    }
    const user = await User_1.User.findOne({ email: normalized });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    user.password = await bcryptjs_1.default.hash(String(newPassword), 10);
    await user.save();
    res.json({
        success: true,
        message: 'Password updated successfully. You can sign in now.',
    });
}));
router.post('/logout', (_req, res) => {
    res.json({ success: true, message: 'Logged out' });
});
router.get('/me', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.user.id).select('-password');
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: (0, auth_1.toPublicUser)(user) });
}));
router.patch('/profile', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, schoolName } = req.body;
    const user = await User_1.User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    if (name?.trim())
        user.name = String(name).trim();
    if (schoolName !== undefined) {
        user.schoolName = schoolName?.trim() || undefined;
    }
    await user.save();
    res.json({ success: true, user: (0, auth_1.toPublicUser)(user) });
}));
router.post('/profile/avatar', auth_1.authenticate, handleAvatarUpload, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!(0, cloudinaryService_1.isCloudinaryConfigured)()) {
        return res.status(503).json({
            error: 'Image upload is not configured. Add Cloudinary credentials to backend/.env',
        });
    }
    if (!req.file?.buffer) {
        return res.status(400).json({ error: 'No image uploaded' });
    }
    const user = await User_1.User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    const previousUrl = user.profileImageUrl;
    const { url } = await (0, cloudinaryService_1.uploadProfileImage)(req.file.buffer, String(user._id));
    user.profileImageUrl = url;
    await user.save();
    if (previousUrl && previousUrl !== url) {
        await (0, cloudinaryService_1.deleteProfileImage)(previousUrl);
    }
    res.json({
        success: true,
        user: (0, auth_1.toPublicUser)(user),
    });
}));
router.delete('/account', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ error: 'Password is required to delete account' });
    }
    const user = await User_1.User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    const valid = await bcryptjs_1.default.compare(String(password), user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Incorrect password' });
    }
    await (0, accountService_1.deleteUserAccount)(String(user._id));
    res.json({
        success: true,
        message: 'Account deleted successfully',
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map