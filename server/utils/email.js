const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async (to, subject, html, text = '') => {
  try {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('Email configuration not found. Skipping email send.');
      return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"DLT TalentHub" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to DLT TalentHub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to DLT TalentHub!</h2>
        <p>Hello ${userName},</p>
        <p>Welcome to DLT TalentHub! We're excited to have you join our community of talented professionals and opportunities in the DLT Africa ecosystem.</p>
        <p>Get started by:</p>
        <ul>
          <li>Completing your profile</li>
          <li>Adding your skills and experience</li>
          <li>Exploring job opportunities</li>
        </ul>
        <p>Best regards,<br>The DLT TalentHub Team</p>
      </div>
    `
  }),

  jobApplication: (jobTitle, companyName) => ({
    subject: `Application Received - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Received</h2>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received successfully.</p>
        <p>We'll review your application and get back to you soon.</p>
        <p>Best regards,<br>The DLT TalentHub Team</p>
      </div>
    `
  }),

  shortlisted: (jobTitle, companyName) => ({
    subject: `Congratulations! You've been shortlisted for ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Congratulations!</h2>
        <p>Great news! You've been shortlisted for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        <p>The company will contact you soon with next steps.</p>
        <p>Best regards,<br>The DLT TalentHub Team</p>
      </div>
    `
  }),

  passwordReset: (resetLink) => ({
    subject: 'Password Reset Request - DLT TalentHub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>You requested a password reset for your DLT TalentHub account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The DLT TalentHub Team</p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
}; 