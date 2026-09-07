import { getRandomAccount, createTransporter, getAccountByUser, getSenderIdentity } from '../../src/config/emailAccounts';
import { getBrandEmailContext } from '../../src/config/brandEmailHelpers';
import { logEmail } from '../../src/utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, customerName, productName, refundAmount, senderEmail, website } = req.body;

    if (!customerEmail || !customerName || !productName || refundAmount === undefined || refundAmount === null) {
      return res.status(400).json({
        error: 'Missing required fields: customerEmail, customerName, productName, and refundAmount are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid refund amount. Must be a positive number.' });
    }

    const brandCtx = getBrandEmailContext(website);
    const brand = brandCtx.brand;

    let account = senderEmail ? getAccountByUser(senderEmail, brand.id) : getRandomAccount(brand.id);
    if (!account) account = getRandomAccount(brand.id);

    console.log(`[${brand.name}] Refund email sender: ${account?.user}`);
    const emailTransporter = createTransporter(account);
    const senderIdentity = getSenderIdentity(account, brand.id);

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Refund Update - ${brand.name}</title>
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-top">
            <h1 style="color: ${brand.colors.textDark}; font-size: 26px; font-weight: 800;">Refund Confirmation 💰</h1>
          </div>
          <div class="header-bottom">
            <p style="font-size: 15px; opacity: 0.95;">Financial Update for Your Order • ${brand.name}</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Dear <strong>${customerName}</strong>,</p>
            <p style="color: #4B5563; font-size: 15px; margin-bottom: 20px;">
              We have successfully processed a refund for your order.
            </p>

            <div class="card">
              <div style="font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; margin-bottom: 4px;">Refunded Product</div>
              <div style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 14px;">${productName}</div>

              <div style="border-top: 1px solid #E5E7EB; padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; font-weight: 600; color: #4B5563;">Refund Amount:</span>
                <span style="font-size: 22px; font-weight: 800; color: #059669;">$${amount.toFixed(2)}</span>
              </div>
            </div>

            <div style="background-color: #F3F4F6; border-radius: 10px; padding: 18px; margin: 24px 0;">
              <div style="font-size: 14px; font-weight: 700; color: #1F2937; margin-bottom: 8px;">What to expect next:</div>
              <ul style="font-size: 13px; color: #4B5563; padding-left: 18px; line-height: 1.6;">
                <li>The credit has been submitted to your original payment processor.</li>
                <li>Funds typically appear on your statement within <strong>3–5 business days</strong> depending on your bank.</li>
              </ul>
            </div>

            <p style="font-size: 13px; color: #6B7280; text-align: center;">
              If you have any questions or do not see the credit after 5 business days, please contact our support team.
            </p>
          </div>

          ${brandCtx.getFooterHtml()}
        </div>
      </body>
      </html>
    `;

    const textTemplate = `
${brand.name.toUpperCase()} — REFUND NOTIFICATION

Dear ${customerName},

We have processed a refund for your order.

Refund Details:
Product: ${productName}
Refund Amount: $${amount.toFixed(2)}
Status: Processed

The funds will post back to your original payment method within 3-5 business days.

${brandCtx.getTextFooter()}
    `.trim();

    const mailOptions = {
      from: `"${senderIdentity.fromName}" <${senderIdentity.fromEmail}>`,
      replyTo: brand.supportEmail || senderIdentity.fromEmail,
      to: customerEmail,
      subject: `Refund Processed - $${amount.toFixed(2)} - ${productName} | ${brand.name}`,
      html: htmlTemplate,
      text: textTemplate,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    await logEmail({
      templateName: 'Refund Email',
      senderEmail: senderIdentity.fromEmail,
      recipientEmail: customerEmail,
      recipientName: customerName,
      productName: productName,
      status: 'Success',
      payload: { ...req.body, website: brand.id }
    });

    res.status(200).json({
      success: true,
      message: 'Refund confirmation email sent successfully',
      data: {
        customerEmail,
        productName,
        refundAmount: `$${amount.toFixed(2)}`,
        messageId: info.messageId,
        website: brand.id
      }
    });

  } catch (error) {
    console.error('Error sending refund email:', error);
    res.status(500).json({
      error: 'Failed to send refund email',
      details: error.message
    });
  }
}
