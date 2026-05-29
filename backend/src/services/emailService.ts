import nodemailer from "nodemailer";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

export async function verifySmtpConnection(): Promise<void> {
  try {
    await transporter.verify();
    console.log("✅ SMTP connection successful");
  } catch (error) {
    console.error("❌ SMTP verify error:", error);
    throw error;
  }
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: "signup" | "password_reset"
): Promise<void> {
  const subject =
    purpose === "signup"
      ? "Verify your AssessAI account"
      : "Reset your AssessAI password";

  const text =
    purpose === "signup"
      ? `Your AssessAI verification code is: ${otp}\n\nThis code expires in 10 minutes.`
      : `Your AssessAI password reset code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, ignore this email.`;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#FF4D00">AssessAI</h2>
      <p>
        ${
          purpose === "signup"
            ? "Use this code to verify your account:"
            : "Use this code to reset your password:"
        }
      </p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a1a1a">
        ${otp}
      </p>
      <p style="color:#666;font-size:14px">
        Expires in 10 minutes.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"AssessAI" <alexarandhir@gmail.com>', // MUST be verified in Brevo
      to,
      subject,
      text,
      html,
    });

    console.log(
      `✅ OTP email sent to ${to} (messageId: ${info.messageId})`
    );
  } catch (error) {
    console.error("❌ FULL SMTP ERROR:", error);
    throw new Error("Could not send verification email");
  }
}