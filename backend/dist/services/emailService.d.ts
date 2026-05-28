export declare function isSmtpConfigured(): boolean;
export declare function verifySmtpConnection(): Promise<void>;
export declare function sendOtpEmail(to: string, otp: string, purpose: 'signup' | 'password_reset'): Promise<void>;
//# sourceMappingURL=emailService.d.ts.map