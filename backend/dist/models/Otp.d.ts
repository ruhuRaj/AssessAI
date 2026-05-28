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
export declare const Otp: mongoose.Model<IOtp, {}, {}, {}, mongoose.Document<unknown, {}, IOtp> & IOtp & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Otp.d.ts.map