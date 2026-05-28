import mongoose from 'mongoose';

export type OtpPurpose = 'signup' | 'password_reset';

export interface IOtp {
  email: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  attempts: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const otpSchema = new mongoose.Schema<IOtp>({
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
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: () => new Date() },
});

otpSchema.index({ email: 1, purpose: 1 });

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
