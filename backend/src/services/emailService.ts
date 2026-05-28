import nodemailer from 'nodemailer';
import dns from 'dns';

// Force IPv4 — Render free tier cannot reach SMTP over IPv6
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,          // ← was 465; 587 (STARTTLS) works on Render
  secure: false,      // ← was true; must be false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10_000,
  greetingTimeout:   10_000,
  socketTimeout:     15_000,
  tls: {
    rejectUnauthorized: false,  // avoids TLS errors on restricted networks
  },
});

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

export async function verifySmtpConnection(): Promise<void> {
  await transporter.verify();
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: 'signup' | 'password_reset'
): Promise<void> {
  const subject =
    purpose === 'signup'
      ? 'Verify your AssessAI account'
      : 'Reset your AssessAI password';

  const text =
    purpose === 'signup'
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
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    console.log(`✓ OTP email sent to ${to} (messageId: ${info.messageId})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SMTP error';
    console.error('✗ Failed to send OTP email:', message);
    throw new Error(`Could not send verification email. ${message}`);
  }
}