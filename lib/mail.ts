import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use a Gmail App Password, NOT your real password
  },
});

interface SendOTPEmailParams {
  email: string;
  otp: string;
  mode: "register" | "reset";
}

export async function sendOTPEmail({ email, otp, mode }: SendOTPEmailParams) {
  const isReset = mode === "reset";

  const subject = isReset
    ? "Reset Your Password – Verification Code"
    : "Verify Your Email Address";

  const heading = isReset ? "Password Reset Request" : "Email Verification";
  const bodyText = isReset
    ? "You requested to reset your password. Use the code below:"
    : "Thanks for signing up! Use the code below to verify your email:";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:linear-gradient(135deg,#13131f,#1a1a2e);border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">
          <!-- Header bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#4f46e5,#7c3aed);padding:6px;"></td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 36px;">
              <!-- Icon -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:26px;">
                  ${isReset ? "🔑" : "✉️"}
                </div>
              </div>
              <!-- Heading -->
              <h1 style="color:#fff;font-size:22px;font-weight:700;text-align:center;margin:0 0 8px;">${heading}</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:14px;text-align:center;margin:0 0 32px;line-height:1.6;">${bodyText}</p>
              <!-- OTP box -->
              <div style="background:rgba(79,70,229,0.12);border:1px solid rgba(79,70,229,0.35);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">Your verification code</p>
                <span style="color:#fff;font-size:38px;font-weight:800;letter-spacing:12px;">${otp}</span>
              </div>
              <!-- Expiry note -->
              <p style="color:rgba(255,255,255,0.35);font-size:12px;text-align:center;margin:0 0 8px;">
                ⏱ This code expires in <strong style="color:rgba(255,255,255,0.6);">10 minutes</strong>.
              </p>
              <p style="color:rgba(255,255,255,0.25);font-size:12px;text-align:center;margin:0;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 36px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">© ${new Date().getFullYear()} Your App. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Cogni Code" <${process.env.GMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
}
