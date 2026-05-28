import { OtpPurpose } from '../models/Otp';
export declare function createAndSendOtp(email: string, purpose: OtpPurpose, metadata?: Record<string, unknown>): Promise<void>;
export declare function verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<{
    valid: boolean;
    metadata?: Record<string, unknown>;
    error?: string;
}>;
export declare function clearOtpsForEmail(email: string): Promise<void>;
//# sourceMappingURL=otpService.d.ts.map