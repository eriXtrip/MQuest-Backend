import { sendVerificationEmail } from './utils/email.js'; // path to your email util

async function testEmail() {
  try {
    await sendVerificationEmail(
      'ericdeblois3@gmail.com', // recipient email
      '123456',                    // test code
      'Test Email',
      'This is a test email from local Gmail OAuth2 setup'
    );
    console.log('✅ Test email sent successfully!');
  } catch (err) {
    console.error('❌ Failed to send test email:', err);
  }
}

testEmail();
