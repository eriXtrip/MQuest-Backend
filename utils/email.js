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

function createEmailRaw({ to, subject, html, text }) {
  const emailParts = [
    `From: "${process.env.EMAIL_FROM_NAME || 'no-reply'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    html || text
  ];

  const emailString = emailParts.join('\n');
  return Buffer.from(emailString)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const sendVerificationEmail = async (email, code, title, message) => {
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f7f7f7; border-radius: 8px;">
      <div style="text-align: center;">
        <h2 style="color: #302f82;">${title}</h2>
        <p style="font-size: 16px; color: #333;">${message}</p>

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
  `;

  const rawMessage = createEmailRaw({ to: email, subject: title, html: htmlContent, text: `${message}\n\nYour code: ${code}` });

  try {
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage
      }
    });

    console.log('📧 Email sent:', {
      messageId: result.data.id,
      to: email,
      subject: title
    });
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', {
      to: email,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
