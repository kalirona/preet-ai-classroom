import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter =
      process.env.SMTP_HOST && process.env.SMTP_USER
        ? nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587", 10),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          })
        : (nodemailer.createTransport({
            streamTransport: true,
            newline: "unix",
          }) as unknown as nodemailer.Transporter);
  }
  return transporter;
}

const FROM = process.env.EMAIL_FROM || "noreply@skool-saas.com";

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  userName: string
): Promise<void> {
  const t = getTransporter();
  const info = await t.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your password",
    text: `Hi ${userName},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `<p>Hi ${userName},</p><p>You requested a password reset. Click the button below to reset your password:</p><p><a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px">Reset Password</a></p><p>Or copy this link: <a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p><p>If you didn't request this, you can safely ignore this email.</p>`,
  });
  if (info.message) {
    console.log(`[EMAIL] Password reset sent to ${email}, preview: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
