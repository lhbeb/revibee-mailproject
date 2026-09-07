import { getRandomAccount, createTransporter, getAccountByUser, getSenderIdentity } from '../../src/config/emailAccounts';
import { getBrandEmailContext } from '../../src/config/brandEmailHelpers';
import { logEmail } from '../../src/utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerEmail, customerName, customerAddress, productName, trackingNumber, senderEmail, orderNumber, website } = req.body;

  // Validate required fields
  if (!customerEmail || !customerAddress || !productName || !trackingNumber) {
    return res.status(400).json({
      error: 'Missing required fields: customerEmail, customerAddress, productName, and trackingNumber are required'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate tracking number length
  if (trackingNumber.length > 22) {
    return res.status(400).json({ error: 'Tracking number cannot exceed 22 characters' });
  }

  try {
    const brandCtx = getBrandEmailContext(website);
    const brand = brandCtx.brand;

    // Determine which account to use for this brand
    let account = null;
    if (senderEmail) {
      account = getAccountByUser(senderEmail, brand.id);
    }
    if (!account) {
      account = getRandomAccount(brand.id);
    }

    console.log(`[${brand.name}] Selected email account: ${account.user}`);
    const emailTransporter = createTransporter(account);
    const senderIdentity = getSenderIdentity(account, brand.id);

    // Generate FedEx tracking URL
    const trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;

    // HTML email template - Brand Dynamic Design (Fully Responsive)
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no">
        <title>Your Order Has Shipped - ${brand.name}</title>
        <style>
          @media screen and (max-width: 600px) {
            .content-cell { padding: 20px !important; }
            .header h1 { font-size: 24px !important; }
            .product-box { display: block !important; width: 100% !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: ${brand.colors.bgLight}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: ${brand.colors.textDark}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${brand.colors.bgLight};">
          <tr>
            <td align="center" style="padding: 24px 10px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid ${brand.colors.cardBorder};">
                
                ${brandCtx.getHeaderHtml('Your order is on the way 🚀', 'Shipping update for your order', orderNumber)}
                
                <!-- Content Section -->
                <tr>
                  <td class="content-cell" style="padding: 32px 24px; background-color: #ffffff;">
                    
                    <!-- Status Indicator -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 28px;">
                      <tr>
                        <td style="padding: 16px 20px; background-color: ${brand.colors.bgLight}; border-radius: 12px; border: 1px solid ${brand.colors.cardBorder};">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 20px; vertical-align: middle;">
                                <div style="width: 10px; height: 10px; background-color: ${brand.colors.primary}; border-radius: 50%; display: inline-block;"></div>
                              </td>
                              <td style="vertical-align: middle;">
                                <div style="color: ${brand.colors.textDark}; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">SHIPPED • IN TRANSIT</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Description -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td style="color: #475569; font-size: 15px; line-height: 1.6; text-align: left;">
                          Your item has been carefully packed and handed to the carrier. You can use the tracking details below to follow your delivery progress in real time.
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Order Card -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${brand.colors.bgLight}; border-radius: 14px; border: 1px solid ${brand.colors.cardBorder}; margin: 20px 0;">
                      <tr>
                        <td style="padding: 22px;">
                          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; margin-bottom: 8px;">Product Shipped</div>
                          <div style="color: ${brand.colors.textDark}; font-size: 17px; font-weight: 700; line-height: 1.4; margin-bottom: 16px;">${productName}</div>
                          
                          <div style="border-top: 1px solid ${brand.colors.cardBorder}; padding-top: 14px; margin-top: 14px;">
                            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; margin-bottom: 4px;">Delivery Address</div>
                            <div style="color: #334155; font-size: 14px; line-height: 1.5; white-space: pre-line;">${customerAddress}</div>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Tracking Box -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 28px 0; background-color: #0F172A; border-radius: 14px; text-align: center;">
                      <tr>
                        <td style="padding: 24px;">
                          <div style="color: #94A3B8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Carrier: FedEx Express</div>
                          <div style="color: #FFFFFF; font-size: 20px; font-family: monospace; font-weight: 700; letter-spacing: 2px; margin-bottom: 16px;">${trackingNumber}</div>
                          <a href="${trackingUrl}" style="background-color: ${brand.colors.accent}; color: ${brand.colors.textDark}; display: inline-block; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none;">
                            Track Package on FedEx →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div style="color: #64748B; font-size: 13px; line-height: 1.6; text-align: center; margin-top: 24px;">
                      Questions about your delivery? Reply directly to this email or visit our support page. Thank you for choosing <strong>${brand.name}</strong>!
                    </div>

                  </td>
                </tr>
                
                ${brandCtx.getFooterHtml()}
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Plain text version
    const textTemplate = `
${brand.name.toUpperCase()} — SHIPPING CONFIRMATION

Your order is on the way!
Your item has been packed and handed to the carrier.

Order Details:
${orderNumber ? `Order Number: ${orderNumber}\n` : ''}Product: ${productName}
Recipient: ${customerName || customerEmail}
Delivery Address: ${customerAddress}

Tracking Details:
Carrier: FedEx
Tracking Number: ${trackingNumber}
Track your shipment: ${trackingUrl}

${brandCtx.getTextFooter()}
    `.trim();

    const mailOptions = {
      from: `"${senderIdentity.fromName}" <${senderIdentity.fromEmail}>`,
      replyTo: brand.supportEmail || senderIdentity.fromEmail,
      to: customerEmail,
      subject: `Shipping Update - ${orderNumber ? `${orderNumber} - ` : ''}${productName} | ${brand.name}`,
      text: textTemplate,
      html: htmlTemplate,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`[${brand.name}] Shipping email sent successfully:`, info.messageId);

    await logEmail({
      templateName: 'Shipping Confirmation',
      senderEmail: senderIdentity.fromEmail,
      recipientEmail: customerEmail,
      recipientName: customerName,
      productName: productName,
      status: 'Success',
      payload: { ...req.body, website: brand.id }
    });

    return res.status(200).json({
      success: true,
      message: 'Shipping confirmation email sent successfully!',
      messageId: info.messageId,
      website: brand.id
    });

  } catch (error) {
    console.error('Failed to send shipping email:', error);
    return res.status(500).json({
      error: 'Failed to send shipping email',
      details: error.message
    });
  }
}
