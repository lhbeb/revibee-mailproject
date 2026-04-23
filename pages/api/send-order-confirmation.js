import { getRandomAccount, createTransporter, getAccountByUser } from '../../src/config/emailAccounts';
import { logEmail } from '../../src/utils/logger';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerName, customerEmail, customerAddress, productName, senderEmail, orderNumber } = req.body;

    // Validate required fields
    if (!customerEmail || !customerName || !productName) {
      return res.status(400).json({
        error: 'Missing required fields: customerEmail, customerName, and productName are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('=== SENDING ORDER CONFIRMATION EMAIL ===');
    console.log('Customer:', customerName);
    console.log('Email:', customerEmail);
    console.log('Product:', productName);

    // Get the email account - fall back to random if senderEmail is invalid/not found
    let account = senderEmail ? await getAccountByUser(senderEmail) : null;
    if (!account) account = getRandomAccount();
    const emailTransporter = createTransporter(account);

    // HTML email template - Refined for Email Client Compatibility
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - DeelDepot.com</title>
        <style>
          /* Reset */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            margin: 0; 
            padding: 0; 
            background-color: #f9fafb; 
          }
          
          /* Container */
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          /* Header */
          .header-top { 
            background-color: #F5970C; 
            padding: 40px 32px 24px; 
            text-align: center; 
          }
          .header-bottom { 
            background-color: #090A28; 
            padding: 24px 32px 40px; 
            text-align: center; 
          }

          .header-title { 
            font-size: 32px; 
            font-weight: 800; 
            margin: 0;
            color: #090A28 !important;
          }
          .header-subtitle { 
            font-size: 18px; 
            color: #ffffff !important;
            font-weight: 600;
            margin: 0;
          }
          .header-order {
            color: #ffffff !important; 
            font-size: 18px; 
            font-weight: 700; 
            margin-top: 16px; 
            letter-spacing: 0.5px;
          }
          
          /* Content */
          .content { 
            padding: 48px 32px; 
          }
          
          /* Confirmation Card */
          .confirmation-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            text-align: center;
          }
          
          /* Icon - Fixed centering and shape using block/line-height instead of flex */
          .confirmation-icon {
            width: 64px;
            height: 64px;
            line-height: 64px; /* Vertically center text */
            background-color: #090A28; /* Solid color fallback */
            border-radius: 50%;
            display: inline-block; /* Better structure */
            text-align: center; /* Horizontally center text */
            margin: 0 auto 24px auto;
            color: white;
            font-size: 28px;
            /* Ensure it doesn't get squashed */
            min-width: 64px;
            min-height: 64px;
          }
          
          /* Order Info */
          .order-info {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
          }
          .order-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .order-detail {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          /* Next Steps */
          .next-steps {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
          }
          .next-steps h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
          }
          
          /* Step Item - Table-like layout for better alignment */
          .step-item {
            margin-bottom: 12px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 3px solid #090A28;
          }
          .step-table {
            width: 100%;
            border-collapse: collapse;
          }
          .step-number-cell {
            width: 40px;
            vertical-align: top;
          }
          
          /* Step Number - Fixed centering */
          .step-number {
            background: #090A28;
            color: white;
            width: 24px;
            height: 24px;
            line-height: 24px; /* Vertically center */
            border-radius: 50%;
            display: inline-block;
            text-align: center; /* Horizontally center */
            font-size: 12px;
            font-weight: 600;
          }
          
          .step-content-cell {
            vertical-align: top;
            color: #374151;
            font-size: 14px;
            line-height: 1.5;
          }
          
          /* Delivery Info */
          .delivery-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
          }
          .delivery-info h3 {
            color: #090A28;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .delivery-info p {
            color: #090A28;
            font-size: 14px;
            margin: 0;
          }
          
          /* Footer */
          .footer { 
            background: #f8fafc; 
            padding: 32px; 
            text-align: center; 
            border-top: 1px solid #e5e7eb;
          }
          .footer-content h3 { 
            color: #1f2937; 
            font-size: 18px; 
            font-weight: 600; 
            margin-bottom: 8px; 
          }
          .footer-content p { 
            color: #6b7280; 
            font-size: 14px; 
            margin-bottom: 16px; 
          }
          
          /* Contact Info - Stacked layout */
          .contact-info { 
            margin-bottom: 24px; 
          }
          .contact-link-wrapper {
            margin-bottom: 8px;
          }
          .contact-link { 
            color: #090A28; 
            text-decoration: none;  
            font-weight: 500; 
            font-size: 14px;
          }
          .contact-link:hover { 
            color: #00363a; 
          }
          .copyright { 
            color: #9ca3af; 
            font-size: 12px; 
            line-height: 1.5; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-top">
            <h1 class="header-title">Order Received</h1>
          </div>
          <div class="header-bottom">
            <div class="header-subtitle">We have received your order details</div>
            ${orderNumber ? `<div class="header-order">Order ${orderNumber}</div>` : ''}
          </div>
          
          <div class="content">
            <div class="confirmation-card">
              <!-- Using a span for the icon with explicit block display and dimensions -->
              <span class="confirmation-icon">📦</span>
              <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">We are preparing your order</h2>
              <p style="color: #6b7280; font-size: 16px;">This email confirms that your order information has been received successfully.</p>
            </div>

            <div class="order-info">
              <div class="order-title">${productName}</div>
              <div class="order-detail">Shipping to: ${customerAddress}</div>
              <div class="order-detail">Order confirmation sent to: ${customerEmail}</div>
            </div>

            <div class="next-steps">
              <h3>📋 What happens next?</h3>
              
              <!-- Using tables for steps to ensure alignment in all clients -->
              <div class="step-item">
                <table class="step-table" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="step-number-cell">
                      <span class="step-number">1</span>
                    </td>
                    <td class="step-content-cell">
                      Our team will carefully inspect and prepare your item for shipping
                    </td>
                  </tr>
                </table>
              </div>
              
              <div class="step-item">
                <table class="step-table" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="step-number-cell">
                      <span class="step-number">2</span>
                    </td>
                    <td class="step-content-cell">
                      You'll receive a shipping notification with tracking details within 2-3 business days
                    </td>
                  </tr>
                </table>
              </div>
              
              <div class="step-item">
                <table class="step-table" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="step-number-cell">
                      <span class="step-number">3</span>
                    </td>
                    <td class="step-content-cell">
                      Your package will be delivered within 3-5 business days after shipping
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="delivery-info">
              <h3>📅 Delivery Information</h3>
              <p>We'll send you tracking information as soon as your order ships. All items receive extra care during our inspection process.</p>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <h3>Need Help?</h3>
              <p>If you have any questions about your order, our customer service team is here to help.</p>
              
              <div class="contact-info">
                <div class="contact-link-wrapper">
                  <a href="mailto:contactdeeldepot@gmail.com" class="contact-link">📧 Email Support</a>
                </div>
                <div class="contact-link-wrapper">
                  <a href="tel:+17176484487" class="contact-link">📞 +17176484487</a>
                </div>
              </div>
              
              <div class="copyright">
                © 2026 DeelDepot.com. All rights reserved.<br>
                Thank you for ordering with DeelDepot.
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textTemplate = `
      Order received
      
      Hello ${customerName},
      
      We have received your order for "${productName}".
      ${orderNumber ? `\n      Order Number: ${orderNumber}` : ''}
      
      Shipping To: ${customerAddress || 'Address not provided'}
      
      Questions? Email contactdeeldepot@gmail.com
      
      © 2026 DeelDepot.com. All rights reserved.
    `;

    // Email options
    const mailOptions = {
      from: `"DeelDepot" <${account.user}>`,
      to: customerEmail,
      subject: `Order Received - ${orderNumber ? `${orderNumber} - ` : ''}${productName}`,
      html: htmlTemplate,
      text: textTemplate,
    };

    // Send email
    const startTime = Date.now();
    const info = await emailTransporter.sendMail(mailOptions);
    const endTime = Date.now();

    // Log the sent email
    await logEmail({
      templateName: 'Order Confirmation',
      senderEmail: account.user,
      recipientEmail: customerEmail,
      recipientName: customerName,
      productName: productName,
      status: 'Success',
      payload: req.body
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log(`Email sent in ${endTime - startTime}ms`);

    res.status(200).json({
      success: true,
      message: 'Order confirmation email sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
}
