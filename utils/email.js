import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function createTransporter() {
  const accessToken = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    },
    logger: true,
    debug: process.env.NODE_ENV !== 'production'
  });

  return transporter;
}

export const sendVerificationEmail = async (email, code, title, message) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'no-reply'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
    to: email,
    subject: title,
    text: `${message}\n\nYour code: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f7f7f7; border-radius: 8px;">
        <div style="text-align: center;">
          <h2 style="color: #302f82;">${title}</h2>
          <p style="font-size: 16px; color: #333;">${message}</p>

          <!-- Code container -->
          <div style="margin: 20px auto; padding: 15px; display: inline-block;">
            <table cellpadding="1" cellspacing="0" border="0" align="center">
              <tr>
                ${[...code].map(
                  (digit) => `
                  <td style="width: 30px; height: 40px; border: 1px solid #302f82; border-radius: 5px; font-size: 24px; font-weight: bold; color: #302f82; text-align: center; vertical-align: middle; padding: 5px; margin-left: 10px">
                    ${digit}
                  </td>`
                ).join('')}
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #555;">This code will expire in 15 minutes.</p>
          <p style="font-size: 14px; color: #aaa;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
    priority: 'high'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', {
      messageId: info.messageId,
      to: email,
      subject: title
    });
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', {
      to: email,
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};