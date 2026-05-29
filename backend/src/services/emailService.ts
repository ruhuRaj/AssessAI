import axios from "axios";

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

export async function verifySmtpConnection(): Promise<void> {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  console.log("✅ Brevo API configured successfully");
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

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:20px">
      <h2 style="color:#FF4D00;">AssessAI</h2>

      <p>
        ${
          purpose === "signup"
            ? "Use the OTP below to verify your account:"
            : "Use the OTP below to reset your password:"
        }
      </p>

      <div
        style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:8px;
          text-align:center;
          padding:20px;
          background:#f5f5f5;
          border-radius:8px;
        "
      >
        ${otp}
      </div>

      <p style="margin-top:20px;color:#666;">
        This OTP expires in 10 minutes.
      </p>

      <p style="color:#666;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "AssessAI",
          email: "alexarandhir@gmail.com", // verified sender in Brevo
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log(
      `✅ OTP email sent to ${to}`,
      response.data?.messageId || ""
    );
  } catch (error: any) {
    console.error(
      "❌ Brevo API Error:",
      error?.response?.data || error?.message || error
    );

    throw new Error("Failed to send OTP email");
  }
}