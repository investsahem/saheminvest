// Test script to send a test email via Resend
require('dotenv').config();
const { Resend } = require('resend');

async function sendTestEmail() {
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('Sending test email to mounir.bennassar@gmail.com...');
    console.log('Using API key:', process.env.RESEND_API_KEY ? 'Found' : 'NOT FOUND');

    try {
        const { data, error } = await resend.emails.send({
            from: 'Sahem Invest <noreply@notifications.saheminvest.com>',
            to: ['mounir.bennassar@gmail.com'],
            subject: '✅ Test Email from Sahem Invest',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0;">Sahem Invest</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Email System Test</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">🎉 Email system is working!</h2>
            <p style="color: #666; line-height: 1.6;">
              This is a test email sent from the Sahem Invest platform using the Resend email service.
            </p>
            <p style="color: #666; line-height: 1.6;">
              <strong>From:</strong> noreply@notifications.saheminvest.com<br>
              <strong>Time:</strong> ${new Date().toISOString()}<br>
              <strong>Provider:</strong> Resend.com
            </p>
            
            <div style="margin-top: 30px; padding: 20px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4caf50;">
              <p style="color: #2e7d32; margin: 0;">
                ✅ If you received this email, the Resend integration is working correctly!
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
              This is an automated test email from <a href="https://www.saheminvest.com" style="color: #667eea;">saheminvest.com</a>
            </p>
          </div>
        </div>
      `
        });

        if (error) {
            console.error('❌ Error sending email:', error);
            process.exit(1);
        }

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', data?.id);
    } catch (err) {
        console.error('❌ Exception:', err);
        process.exit(1);
    }
}

sendTestEmail();
