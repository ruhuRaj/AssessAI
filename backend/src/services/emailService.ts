import axios from "axios";

export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: "signup" | "password_reset"
): Promise<void> {
  const subject =
    purpose === "signup"
      ? "Verify your AssessAI account"
      : "Reset your AssessAI password";

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "AssessAI",
          email: "alexarandhir@gmail.com",
        },
        to: [{ email: to }],
        subject,
        htmlContent: `
          <h2>AssessAI</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>Expires in 10 minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ OTP sent to ${to}`);
  } catch (error: any) {
    console.error(
      "❌ Brevo API Error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send OTP email");
  }
}