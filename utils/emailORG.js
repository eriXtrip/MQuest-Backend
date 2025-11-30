import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// async function createTransporter() {
//   const accessToken = await oAuth2Client.getAccessToken();

//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       type: 'OAuth2',
//       user: process.env.EMAIL_USER,
//       clientId: process.env.EMAIL_CLIENT_ID,
//       clientSecret: process.env.EMAIL_SECRET,
//       refreshToken: process.env.EMAIL_REFRESH_TOKEN,
//       accessToken: process.env.EMAIL_ACCESS_TOKEN || accessToken.token,
//     },
//     tls: {
//       rejectUnauthorized: process.env.NODE_ENV === 'production'
//     },
//     logger: true,
//     debug: process.env.NODE_ENV !== 'production'
//   });

//   return transporter;
// }

export const sendVerificationEmail = async (email, code, title, message) => {
  // const transporter = await createTransporter();

    const htmlContent = `
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
    `;

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'no-reply@yourdomain.com',
      to: email,
      subject: title,
      html: htmlContent,
    });

    console.log('📧 Email sent:', {
      id: result.id,
      to: email,
      subject: title,
    });
    return true;
  } catch (err) {
    console.error('❌ Failed to send email:', err);
    throw new Error(`Failed to send email: ${err.message}`);
  }
};