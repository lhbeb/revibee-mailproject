import { getRandomAccount, createTransporter, getAccountByUser } from '../../src/config/emailAccounts';
import { logEmail } from '../../src/utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, customerName, productName, productLink, senderEmail } = req.body;

    // Validate required fields
    if (!customerEmail || !productName) {
      return res.status(400).json({
        error: 'Missing required fields: customerEmail and productName are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('=== SENDING LOCAL PICKUP EMAIL ===');
    console.log('Email:', customerEmail);
    console.log('Product:', productName);

    // Get the email account - fall back to random if senderEmail is invalid/not found
    let account = senderEmail ? await getAccountByUser(senderEmail) : null;
    if (!account) account = getRandomAccount();
    const emailTransporter = createTransporter(account);

    // HTML email template - DeelDepot Branded Design
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Local Pickup Details - DeelDepot.com</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            margin: 0; 
            padding: 0; 
            background-color: #f9fafb; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          .step-item {
            margin-bottom: 12px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #090A28;
          }
          .step-number {
            background: #090A28;
            color: white;
            width: 28px;
            height: 28px;
            line-height: 28px;
            border-radius: 50%;
            display: inline-block;
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            margin-right: 12px;
          }
          a.btn-orange {
            display: inline-block;
            background-color: #F5970C;
            color: #090A28;
            text-decoration: none;
            padding: 14px 28px;
            font-weight: 600;
            border-radius: 8px;
            margin-top: 16px;
          }
        </style>
      </head>
      <body>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0">
                
                <!-- Header Top -->
                <tr>
                  <td style="background-color: #F5970C; padding: 40px 32px 24px; text-align: center;">
                    <h1 style="color: #090A28; font-size: 32px; font-weight: 800; margin: 0; line-height: 1.2;">
                      Local Pickup Details
                    </h1>
                  </td>
                </tr>
                
                <!-- Header Bottom -->
                <tr>
                  <td style="background-color: #090A28; padding: 24px 32px 40px; text-align: center;">
                    <div style="color: #ffffff; font-size: 16px; font-weight: 500; margin: 0;">Pickup instructions for this item are included below.</div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 32px;">
                    <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
                      Hello${customerName ? ` ${customerName}` : ''},<br><br>
                      Your selected item <strong>${productName}</strong> can be picked up from our warehouse. The details below explain the pickup process.
                    </p>

                    <!-- How it Works -->
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                      <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">How Local Pickup Works</h3>
                      
                      <div class="step-item">
                        <table role="presentation" width="100%"><tr>
                          <td width="40" valign="top"><div class="step-number">1</div></td>
                          <td>
                            <strong>Visit Our Warehouse</strong><br>
                            Come to our warehouse at 1420 N McKinley Ave, Los Angeles during business hours.
                          </td>
                        </tr></table>
                      </div>

                      <div class="step-item">
                        <table role="presentation" width="100%"><tr>
                          <td width="40" valign="top"><div class="step-number">2</div></td>
                          <td>
                            <strong>Meet Our Sales Representative</strong><br>
                            Show the product photo or listing to one of our friendly sales representatives at the office.
                          </td>
                        </tr></table>
                      </div>

                      <div class="step-item">
                        <table role="presentation" width="100%"><tr>
                          <td width="40" valign="top"><div class="step-number">3</div></td>
                          <td>
                            <strong>Check Availability</strong><br>
                            Our team will verify that the item is in stock and available for immediate pickup.
                          </td>
                        </tr></table>
                      </div>

                      <div class="step-item">
                        <table role="presentation" width="100%"><tr>
                          <td width="40" valign="top"><div class="step-number">4</div></td>
                          <td>
                            <strong>Inspect the Product</strong><br>
                            Take your time to inspect the item yourself. We want you to be completely satisfied!
                          </td>
                        </tr></table>
                      </div>

                      <div class="step-item">
                        <table role="presentation" width="100%"><tr>
                          <td width="40" valign="top"><div class="step-number">5</div></td>
                          <td>
                            <strong>Make Your Payment</strong><br>
                            Pay conveniently with cash or card via our POS system. We accept all major credit cards and cash.
                          </td>
                        </tr></table>
                      </div>
                    </div>

                    <!-- Alternate option -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
                      <h3 style="font-size: 18px; font-weight: 600; color: #090A28; margin-bottom: 8px;">Need Shipping Instead?</h3>
                      <p style="color: #475569; font-size: 15px; margin-bottom: 16px;">
                        If pickup is not convenient, you can place the order online and choose shipping instead.
                      </p>
                      ${productLink ? `<a href="${productLink}" class="btn-orange">Shop This Online</a>` : ''}
                    </div>

                    <!-- Information Grid -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                      <tr>
                        <td width="50%" valign="top" style="padding-right: 12px;">
                          <h4 style="font-size: 16px; color: #090A28; margin-bottom: 12px;">🏢 Warehouse Location</h4>
                          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                            DeelDepot Warehouse<br>
                            1420 N McKinley Ave<br>
                            Los Angeles, CA 90059<br>
                            United States
                          </p>
                        </td>
                        <td width="50%" valign="top" style="padding-left: 12px; border-left: 1px solid #e2e8f0;">
                          <h4 style="font-size: 16px; color: #090A28; margin-bottom: 12px;">⏰ Business Hours</h4>
                          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                            <strong>Mon - Fri:</strong> 9:00 AM - 5:00 PM EST<br>
                            <strong>Saturday:</strong> 10:00 AM - 3:00 PM EST<br>
                            <strong>Sunday:</strong> Closed
                          </p>
                        </td>
                      </tr>
                    </table>

                    <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 24px;">
                      <h4 style="font-size: 16px; color: #090A28; margin-bottom: 8px;">📞 Contact Information</h4>
                      <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                        Phone: +1 717 648 4487<br>
                        Email: support@deeldepot.com
                      </p>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #090A28; padding: 32px 24px; text-align: center;">
                    <div style="color: #e0e7ff; font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
                      © 2026 DeelDepot. All rights reserved.<br>
                      Thank you for choosing DeelDepot!<br>
                      Ref ID: ${Date.now()}
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const textTemplate = `
      Local Pickup Details
      
      Hello${customerName ? ` ${customerName}` : ''},
      
      Your selected item "${productName}" can be picked up from our warehouse.
      
      🏢 Our Warehouse Location
      1420 N McKinley Ave, Los Angeles, CA 90059, United States
      
      How Local Pickup Works:
      1. Visit Our Warehouse during business hours.
      2. Meet Our Sales Representative and show the product listing.
      3. Check Availability to verify it is in stock.
      4. Inspect the Product to ensure you are satisfied.
      5. Make Your Payment with cash or card via our POS system.
      
      Need Shipping Instead?
      You can also place your order online and choose shipping instead.
      ${productLink ? `Shop Online Here: ${productLink}` : ''}
      
      ⏰ Business Hours
      Monday - Friday: 9:00 AM - 5:00 PM EST
      Saturday: 10:00 AM - 3:00 PM EST
      Sunday: Closed
      
      📞 Contact Information
      Phone: +1 717 648 4487
      Email: support@deeldepot.com
      
      © 2026 DeelDepot. All rights reserved.
    `;

    const mailOptions = {
      from: `"DeelDepot Local" <${account.user}>`,
      to: customerEmail,
      subject: `Local Pickup Details - ${productName}`,
      text: textTemplate,
      html: htmlTemplate,
    };

    const startTime = Date.now();
    const info = await emailTransporter.sendMail(mailOptions);
    const endTime = Date.now();

    console.log('Email sent successfully:', info.messageId);

    // Log the sent email to Supabase
    await logEmail({
      templateName: 'Local Pickup',
      senderEmail: account.user,
      recipientEmail: customerEmail,
      recipientName: customerName,
      productName: productName,
      status: 'Success',
      payload: req.body
    });

    return res.status(200).json({
      success: true,
      message: 'Local Pickup email sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      error: 'Failed to send email. Please try again later.',
      details: error.message
    });
  }
}
