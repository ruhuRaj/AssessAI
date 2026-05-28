import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function verifySmtpConnection(): Promise<void> {
  return;
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
        ${
          purpose === 'signup'
            ? 'Use this code to verify your account:'
            : 'Use this code to reset your password:'
        }
      </p>

      <p
        style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:8px;
          color:#1a1a1a;
        "
      >
        ${otp}
      </p>

      <p style="color:#666;font-size:14px">
        Expires in 10 minutes.
      </p>
    </div>
  `;

  if (!process.env.RESEND_API_KEY) {
    console.log(
      '\n========== AssessAI OTP (dev — no email provider configured) =========='
    );

    console.log(`To: ${to}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`OTP: ${otp}`);

    console.log(
      '============================================================\n'
    );

    return;
  }

  try {
    await resend.emails.send({
      from: 'AssessAI <onboarding@resend.dev>',
      to,
      subject,
      text,
      html,
    });

    console.log(`✓ OTP email sent to ${to}`);
  } catch (error) {
    console.error('✗ Failed to send OTP email:', error);

    throw new Error(
      'Could not send verification email'
    );
  }
}