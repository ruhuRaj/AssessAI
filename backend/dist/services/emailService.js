"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSmtpConfigured = isSmtpConfigured;
exports.verifySmtpConnection = verifySmtpConnection;
exports.sendOtpEmail = sendOtpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dns_1 = __importDefault(require("dns"));
dns_1.default.setDefaultResultOrder('ipv4first');
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp-relay.brevo.com', // ← Brevo SMTP
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER, // acd2cc001@smtp-brevo.com
        pass: process.env.SMTP_PASS, // your generated SMTP key
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});
function isSmtpConfigured() {
    return Boolean(process.env.SMTP_USER &&
        process.env.SMTP_PASS);
}
async function verifySmtpConnection() {
    await transporter.verify();
}
async function sendOtpEmail(to, otp, purpose) {
    const subject = purpose === 'signup'
        ? 'Verify your AssessAI account'
        : 'Reset your AssessAI password';
    const text = purpose === 'signup'
        ? `Your AssessAI verification code is: ${otp}\n\nThis code expires in 10 minutes.`
        : `Your AssessAI password reset code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, ignore this email.`;
    const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#FF4D00">AssessAI</h2>
      <p>
        ${purpose === 'signup'
        ? 'Use this code to verify your account:'
        : 'Use this code to reset your password:'}
      </p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a1a1a">
        ${otp}
      </p>
      <p style="color:#666;font-size:14px">Expires in 10 minutes.</p>
    </div>
  `;
    try {
        const info = await transporter.sendMail({
            from: `"AssessAI" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log(`✓ OTP email sent to ${to} (messageId: ${info.messageId})`);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown SMTP error';
        console.error('✗ Failed to send OTP email:', message);
        throw new Error(`Could not send verification email. ${message}`);
    }
}
//# sourceMappingURL=emailService.js.map