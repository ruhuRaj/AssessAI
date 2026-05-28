import express, { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Otp } from '../models/Otp';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, signToken, toPublicUser } from '../middleware/auth';
import { uploadAvatar } from '../middleware/uploadAvatar';
import { createAndSendOtp, verifyOtp } from '../services/otpService';
import { deleteUserAccount } from '../services/accountService';
import {
  uploadProfileImage,
  deleteProfileImage,
  isCloudinaryConfigured,
} from '../services/cloudinaryService';

const router = Router();

const handleAvatarUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadAvatar(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      return res.status(400).json({ error: message });
    }
    next();
  });
};

const normalizeEmail = (email: string) => String(email).toLowerCase().trim();

/** Step 1: send OTP for signup (stores pending user data) */
router.post(
  '/signup/send-otp',
  asyncHandler(async (req: Request, res: Response) => {
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
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    await createAndSendOtp(normalized, 'signup', {
      name: String(name).trim(),
      passwordHash,
      schoolName: schoolName?.trim() || undefined,
    });

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      email: normalized,
    });
  })
);

/** Resend signup OTP */
router.post(
  '/signup/resend-otp',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalized = normalizeEmail(email);
    const pending = await Otp.findOne({
      email: normalized,
      purpose: 'signup',
    }).sort({ createdAt: -1 });

    if (!pending?.metadata) {
      return res.status(400).json({
        error: 'No pending signup found. Please start signup again.',
      });
    }

    const meta = pending.metadata as {
      name: string;
      passwordHash: string;
      schoolName?: string;
    };

    await createAndSendOtp(normalized, 'signup', meta);

    res.json({
      success: true,
      message: 'Verification code resent',
      email: normalized,
    });
  })
);

/** Step 2: verify OTP and create account */
router.post(
  '/signup/verify',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const normalized = normalizeEmail(email);
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const result = await verifyOtp(normalized, 'signup', String(otp));
    if (!result.valid || !result.metadata) {
      return res.status(400).json({ error: result.error || 'Invalid code' });
    }

    const meta = result.metadata as {
      name: string;
      passwordHash: string;
      schoolName?: string;
    };

    if (!meta.name || !meta.passwordHash) {
      return res.status(400).json({
        error: 'Signup session expired. Please sign up again.',
      });
    }

    const user = await User.create({
      name: meta.name,
      email: normalized,
      password: meta.passwordHash,
      schoolName: meta.schoolName,
      emailVerified: true,
    });

    const token = signToken(String(user._id), user.email, user.name);

    res.status(201).json({
      success: true,
      token,
      user: toPublicUser(user),
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({
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

    const valid = await bcrypt.compare(String(password), user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(String(user._id), user.email, user.name);

    res.json({
      success: true,
      token,
      user: toPublicUser(user),
    });
  })
);

/** Forgot password — send OTP */
router.post(
  '/forgot-password',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalized = normalizeEmail(email);
    const user = await User.findOne({ email: normalized });

    if (user) {
      await createAndSendOtp(normalized, 'password_reset', {
        userId: String(user._id),
      });
    }

    res.json({
      success: true,
      message:
        'If an account exists for this email, a reset code has been sent.',
      email: normalized,
    });
  })
);

/** Reset password with OTP */
router.post(
  '/reset-password',
  asyncHandler(async (req: Request, res: Response) => {
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
    const result = await verifyOtp(normalized, 'password_reset', String(otp));

    if (!result.valid) {
      return res.status(400).json({ error: result.error || 'Invalid code' });
    }

    const user = await User.findOne({ email: normalized });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = await bcrypt.hash(String(newPassword), 10);
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully. You can sign in now.',
    });
  })
);

router.post('/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: toPublicUser(user) });
  })
);

router.patch(
  '/profile',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, schoolName } = req.body;
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name?.trim()) user.name = String(name).trim();
    if (schoolName !== undefined) {
      user.schoolName = schoolName?.trim() || undefined;
    }

    await user.save();

    res.json({ success: true, user: toPublicUser(user) });
  })
);

router.post(
  '/profile/avatar',
  authenticate,
  handleAvatarUpload,
  asyncHandler(async (req: Request, res: Response) => {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        error:
          'Image upload is not configured. Add Cloudinary credentials to backend/.env',
      });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const previousUrl = user.profileImageUrl;

    const { url } = await uploadProfileImage(
      req.file.buffer,
      String(user._id)
    );

    user.profileImageUrl = url;
    await user.save();

    if (previousUrl && previousUrl !== url) {
      await deleteProfileImage(previousUrl);
    }

    res.json({
      success: true,
      user: toPublicUser(user),
    });
  })
);

router.delete(
  '/account',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(String(password), user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    await deleteUserAccount(String(user._id));

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  })
);

export default router;
