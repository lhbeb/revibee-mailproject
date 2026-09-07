import { getRandomAccount, createTransporter, getAccountByUser, getSenderIdentity } from '../../src/config/emailAccounts';
import { getBrandEmailContext } from '../../src/config/brandEmailHelpers';
import { logEmail } from '../../src/utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerName, customerEmail, customerAddress, productName, senderEmail, orderNumber, website } = req.body;

    if (!customerEmail || !customerName || !productName) {
      return res.status(400).json({
        error: 'Missing required fields: customerEmail, customerName, and productName are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const brandCtx = getBrandEmailContext(website);
    const brand = brandCtx.brand;

    let account = senderEmail ? getAccountByUser(senderEmail, brand.id) : getRandomAccount(brand.id);
    if (!account) account = getRandomAccount(brand.id);

    console.log(`[${brand.name}] Order confirmation sender: ${account?.user}`);
    const emailTransporter = createTransporter(account);
    const senderIdentity = getSenderIdentity(account, brand.id);

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ${brand.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            background-color: ${brand.colors.bgLight}; 
            padding: 20px 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid ${brand.colors.cardBorder};
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          .header-top {
            background-color: ${brand.colors.accent};
            padding: 36px 24px 20px;
            text-align: center;
          }
          .header-bottom {
            background-color: ${brand.colors.primary};
            padding: 20px 24px 28px;
            text-align: center;
            color: #ffffff;
          }
          .content { padding: 32px 24px; }
          .card {
            background-color: ${brand.colors.bgLight};
            border: 1px solid ${brand.colors.cardBorder};
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
          }
          .btn {
            display: inline-block;
            background-color: ${brand.colors.primary};
            color: #ffffff !important;
            font-weight: 700;
            padding: 12px 28px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-top">
            <h1 style="color: ${brand.colors.textDark}; font-size: 26px; font-weight: 800;">We received your order! 🎉</h1>
          </div>
          <div class="header-bottom">
            <p style="font-size: 15px; opacity: 0.95;">Thank you for shopping with ${brand.name}</p>
            ${orderNumber ? `<div style="font-size: 18px; font-weight: 800; margin-top: 8px; color: ${brand.colors.accent};">Order #${orderNumber}</div>` : ''}
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hello <strong>${customerName}</strong>,</p>
            <p style="color: #4B5563; font-size: 15px; margin-bottom: 20px;">
              Great news! We've received your order and our fulfillment team is preparing it for dispatch.
            </p>

            <div class="card">
              <div style="font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; margin-bottom: 6px;">Purchased Item</div>
              <div style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 14px;">${productName}</div>

              <div style="border-top: 1px solid #E5E7EB; padding-top: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; margin-bottom: 4px;">Shipping Address</div>
                <div style="font-size: 14px; color: #374151; white-space: pre-line;">${customerAddress || 'Standard Shipping'}</div>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0 20px;">
              <a href="${brand.links.track}" class="btn">Check Order Status →</a>
            </div>

            <p style="font-size: 13px; color: #6B7280; text-align: center;">
              You will receive another email with active tracking details as soon as your package ships.
            </p>
          </div>

          ${brandCtx.getFooterHtml()}
        </div>
      </body>
      </html>
    `;

    const textTemplate = `
${brand.name.toUpperCase()} — ORDER CONFIRMATION

Hello ${customerName},

We have received your order for:
"${productName}"
${orderNumber ? `Order Number: ${orderNumber}\n` : ''}
Shipping To:
${customerAddress || 'Address on file'}

We are preparing your order and will email your tracking link as soon as it ships.

${brandCtx.getTextFooter()}
    `.trim();

    const mailOptions = {
      from: `"${senderIdentity.fromName}" <${senderIdentity.fromEmail}>`,
      replyTo: brand.supportEmail || senderIdentity.fromEmail,
      to: customerEmail,
      subject: `Order Received - ${orderNumber ? `${orderNumber} - ` : ''}${productName} | ${brand.name}`,
      html: htmlTemplate,
      text: textTemplate,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    await logEmail({
      templateName: 'Order Confirmation',
      senderEmail: senderIdentity.fromEmail,
      recipientEmail: customerEmail,
      recipientName: customerName,
      productName: productName,
      status: 'Success',
      payload: { ...req.body, website: brand.id }
    });

    res.status(200).json({
      success: true,
      message: 'Order confirmation email sent successfully!',
      messageId: info.messageId,
      website: brand.id
    });

  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    res.status(500).json({
      error: 'Failed to send order confirmation email',
      details: error.message
    });
  }
}
