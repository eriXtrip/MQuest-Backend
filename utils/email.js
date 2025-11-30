import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const {
  EMAIL_CLIENT_ID,
  EMAIL_SECRET,
  EMAIL_REDIRECT_URI,
  EMAIL_REFRESH_TOKEN,
  EMAIL_FROM_ADDRESS
} = process.env;

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  EMAIL_CLIENT_ID,
  EMAIL_SECRET,
  EMAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: EMAIL_REFRESH_TOKEN });

export async function sendVerificationEmail(to, code, title, messageText) {
  try {
    // Get access token
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token;
    if (!accessToken) throw new Error("Failed to obtain access token");

    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Build HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f7f7f7; border-radius: 8px;">
        <div style="text-align: center;">
          <h2 style="color: #302f82;">${title}</h2>
          <p style="font-size: 16px; color: #333;">${messageText}</p>
          <div style="margin: 20px auto; padding: 15px; display: inline-block;">
            <table cellpadding="1" cellspacing="0" border="0" align="center">
              <tr>
                ${[...code].map(
                  digit => `
                  <td style="width: 30px; height: 40px; border: 1px solid #302f82; border-radius: 5px; font-size: 24px; font-weight: bold; color: #302f82; text-align: center; vertical-align: middle; padding: 5px;">
                    ${digit}
                  </td>`).join('')}
              </tr>
            </table>
          </div>
          <p style="font-size: 14px; color: #555;">This code will expire in 15 minutes.</p>
          <p style="font-size: 14px; color: #aaa;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `;

    // Build RFC 822 email format
    const messageParts = [
      `From: ${EMAIL_FROM_ADDRESS}`,
      `To: ${to}`,
      `Subject: ${title}`,
      "Content-Type: text/html; charset=UTF-8",
      "",
      htmlContent
    ];

    // Base64 URL-safe encoding
    const encodedMessage = Buffer.from(messageParts.join("\r\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send email via Gmail API
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage }
    });

    console.log("📧 Gmail API: Email sent!", res.data.id);
    return true;

  } catch (err) {
    console.error("❌ Failed to send email:", err);
    return false;
  }
}
