/**
 * Email Utility - Nodemailer
 */
const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send OTP email for password reset
 */
const sendOtpEmail = async (email, otp, name) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;background:#0f172a;border-radius:16px;overflow:hidden;color:#e2e8f0;">
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;">🔐 TeamPulse AI</h1>
        <p style="color:#c7d2fe;margin-top:8px;">Password Reset Request</p>
      </div>
      <div style="padding:32px;">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Use the code below to reset your password. It expires in 10 minutes.</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="font-size:36px;letter-spacing:8px;font-weight:bold;color:#a78bfa;background:#1e293b;padding:16px 32px;border-radius:12px;display:inline-block;">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:13px;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: `"TeamPulse AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP - TeamPulse AI',
    html,
  });

  logger.info(`OTP email sent to ${email}`);
};

/**
 * Send team invite email
 */
const sendTeamInviteEmail = async (email, teamName, inviteCode, inviterName) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;background:#0f172a;border-radius:16px;overflow:hidden;color:#e2e8f0;">
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;">👥 Team Invitation</h1>
      </div>
      <div style="padding:32px;">
        <p><strong>${inviterName}</strong> invited you to join <strong>${teamName}</strong> on TeamPulse AI!</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="font-size:28px;letter-spacing:4px;font-weight:bold;color:#a78bfa;background:#1e293b;padding:16px 32px;border-radius:12px;display:inline-block;">${inviteCode}</span>
        </div>
        <p style="color:#94a3b8;">Use this invite code to join the team.</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: `"TeamPulse AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `You're invited to ${teamName} - TeamPulse AI`,
    html,
  });
};

module.exports = { sendOtpEmail, sendTeamInviteEmail };
