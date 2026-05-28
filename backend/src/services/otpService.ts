import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Otp, OtpPurpose } from '../models/Otp';
import { sendOtpEmail } from './emailService';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateOtpCode(): string {
  const max = 10 ** OTP_LENGTH;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(OTP_LENGTH, '0');
}

function normalizeEmail(email: string): string {
  return String(email).toLowerCase().trim();
}

export async function createAndSendOtp(
  email: string,
  purpose: OtpPurpose,
  metadata?: Record<string, unknown>
): Promise<void> {
  const normalized = normalizeEmail(email);
  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await Otp.deleteMany({ email: normalized, purpose });

  const record = await Otp.create({
    email: normalized,
    codeHash,
    purpose,
    expiresAt,
    attempts: 0,
    metadata,
  });

  try {
    await sendOtpEmail(normalized, code, purpose);
  } catch (error) {
    await Otp.deleteOne({ _id: record._id });
    throw error;
  }
}

export async function verifyOtp(
  email: string,
  purpose: OtpPurpose,
  code: string
): Promise<{ valid: boolean; metadata?: Record<string, unknown>; error?: string }> {
  const normalized = normalizeEmail(email);
  const record = await Otp.findOne({ email: normalized, purpose }).sort({
    createdAt: -1,
  });

  if (!record) {
    return { valid: false, error: 'No verification code found. Request a new one.' };
  }

  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id });
    return { valid: false, error: 'Code expired. Request a new one.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: record._id });
    return { valid: false, error: 'Too many attempts. Request a new code.' };
  }

  const match = await bcrypt.compare(String(code).trim(), record.codeHash);
  record.attempts += 1;
  await record.save();

  if (!match) {
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      error:
        remaining > 0
          ? `Invalid code. ${remaining} attempt(s) left.`
          : 'Invalid code. Request a new one.',
    };
  }

  const metadata = record.metadata as Record<string, unknown> | undefined;
  await Otp.deleteOne({ _id: record._id });

  return { valid: true, metadata };
}

export async function clearOtpsForEmail(email: string): Promise<void> {
  await Otp.deleteMany({ email: normalizeEmail(email) });
}
