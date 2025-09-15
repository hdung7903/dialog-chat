import nodemailer from 'nodemailer';
import 'dotenv/config';
import { saveOTP } from '../config/redis.js';

// Email configuration
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
const EMAIL_FROM = process.env.EMAIL_FROM || '';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

/**
 * Generate a random OTP
 */
export const generateOTP = (length: number = 6): string => {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP verification email
 */
export const sendOTPEmail = async (email: string): Promise<{ success: boolean; otp?: string; message?: string }> => {
  try {
    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to Redis with 5 minutes expiry
    await saveOTP(email, otp, 300);
    
    // Email content
    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: 'Your Verification Code for Chat App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Thank you for registering with our Chat App. Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    return { success: true, otp };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, message: 'Failed to send verification email' };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // Email content
    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: 'Password Reset for Chat App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="margin: 20px 0; text-align: center;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.</p>
          <p>This link will expire in 15 minutes.</p>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, message: 'Failed to send password reset email' };
  }
};