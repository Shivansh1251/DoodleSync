import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'doodlesync@gmail.com',
      pass: process.env.EMAIL_PASSWORD // Gmail App Password
    }
  });
};

// Generate random OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'DoodleSync',
        address: process.env.EMAIL_USER || 'doodlesync@gmail.com'
      },
      to: email,
      subject: '🎉 Welcome to DoodleSync!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎨 Welcome to DoodleSync!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for joining DoodleSync - your collaborative whiteboard platform!</p>
              
              <p>With DoodleSync, you can:</p>
              <ul>
                <li>✨ Create unlimited whiteboards</li>
                <li>🤝 Collaborate in real-time with your team</li>
                <li>💬 Chat while you draw</li>
                <li>🎯 Share rooms easily</li>
                <li>🎨 Express your creativity</li>
              </ul>
              
              <p>Ready to get started?</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/room-entry" class="button">Start Drawing Now</a>
              
              <p>If you have any questions or need help, feel free to reach out to us.</p>
              
              <p>Happy collaborating! 🚀</p>
              <p><strong>The DoodleSync Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DoodleSync. All rights reserved.</p>
              <p>You're receiving this email because you signed up for DoodleSync.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send OTP for login
export const sendLoginOTP = async (email, name, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'DoodleSync',
        address: process.env.EMAIL_USER || 'doodlesync@gmail.com'
      },
      to: email,
      subject: '🔐 Your DoodleSync Login OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Login Verification</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}!</h2>
              <p>You requested to log in to your DoodleSync account. Use the OTP below to complete your login:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your One-Time Password</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p style="margin: 5px 0 0 0;">Never share this OTP with anyone. DoodleSync will never ask for your OTP.</p>
              </div>
              
              <p>If you didn't request this OTP, please ignore this email or contact us immediately.</p>
              
              <p><strong>The DoodleSync Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DoodleSync. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Login OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending login OTP:', error);
    return false;
  }
};

// Send OTP for password reset
export const sendPasswordResetOTP = async (email, name, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'DoodleSync',
        address: process.env.EMAIL_USER || 'doodlesync@gmail.com'
      },
      to: email,
      subject: '🔑 Password Reset OTP - DoodleSync',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #f5576c; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: #f5576c; letter-spacing: 8px; }
            .warning { background: #ffe6e6; border-left: 4px solid #f5576c; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}!</h2>
              <p>We received a request to reset your DoodleSync account password. Use the OTP below to proceed:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your Password Reset OTP</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <p style="margin: 5px 0 0 0;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              </div>
              
              <p>After entering this OTP, you'll be able to set a new password for your account.</p>
              
              <p><strong>The DoodleSync Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DoodleSync. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    return false;
  }
};

export default {
  sendWelcomeEmail,
  sendLoginOTP,
  sendPasswordResetOTP,
  generateOTP
};
