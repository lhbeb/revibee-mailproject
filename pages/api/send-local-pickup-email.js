import { getRandomAccount, createTransporter, getAccountByUser, getSenderIdentity } from '../../src/config/emailAccounts';
import { getBrandEmailContext } from '../../src/config/brandEmailHelpers';
import { logEmail } from '../../src/utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, customerName, productName, productLink, senderEmail, website } = req.body;

    if (!customerEmail || !productName) {
      return res.status(400).json({
        error: 'Missing required fields: customerEmail and productName are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const brandCtx = getBrandEmailContext(website);
    const brand = brandCtx.brand;
    const pickup = brand.localPickup;

    let account = senderEmail ? getAccountByUser(senderEmail, brand.id) : getRandomAccount(brand.id);
    if (!account) account = getRandomAccount(brand.id);

    console.log(`[${brand.name}] Local pickup email sender: ${account?.user}`);
    const emailTransporter = createTransporter(account);
    const senderIdentity = getSenderIdentity(account, brand.id);

    const addressHtml = (pickup?.addressLines || ['Location on file']).join('<br>');
    const hoursHtml = (pickup?.hoursLines || ['Mon - Fri: 9:00 AM - 5:00 PM EST']).join('<br>');

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Local Pickup Details - ${brand.name}</title>
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
          .pickup-box {
            background-color: ${brand.colors.bgLight};
            border: 1px solid ${brand.colors.cardBorder};
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-top">
            <h1 style="color: ${brand.colors.textDark}; font-size: 26px; font-weight: 800;">Your order is ready for pickup! 🏪</h1>
          </div>
          <div class="header-bottom">
            <p style="font-size: 15px; opacity: 0.95;">Warehouse Collection Instructions • ${brand.name}</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">Hello${customerName ? ` <strong>${customerName}</strong>` : ''},</p>
            <p style="color: #4B5563; font-size: 15px; margin-bottom: 20px;">
              Your item <strong>${productName}</strong> has been prepared, inspected, and is ready for collection at our facility.
            </p>

            <div class="pickup-box">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 14px;">
                    <div style="font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; margin-bottom: 6px;">🏢 Facility Location</div>
                    <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 4px;">${pickup.warehouseName}</div>
                    <div style="font-size: 13px; color: #4B5563; line-height: 1.5;">${addressHtml}</div>
                  </td>
                  <td width="50%" valign="top" style="padding-left: 14px; border-left: 1px solid #E5E7EB;">
                    <div style="font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; margin-bottom: 6px;">⏰ Operating Hours</div>
                    <div style="font-size: 13px; color: #4B5563; line-height: 1.5;">${hoursHtml}</div>
                  </td>
                </tr>
              </table>

              <div style="border-top: 1px solid #E5E7EB; margin-top: 18px; padding-top: 14px;">
                <div style="font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; margin-bottom: 4px;">📞 Collection Contact</div>
                <div style="font-size: 13px; color: #374151;">
                  Phone: <strong>${pickup.phone || brand.supportPhone}</strong><br>
                  Email: <strong>${brand.supportEmail}</strong>
                </div>
              </div>
            </div>

            <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
              <div style="font-weight: 700; color: #92400E; font-size: 13px; margin-bottom: 4px;">What to bring:</div>
              <div style="font-size: 13px; color: #B45309; line-height: 1.5;">
                • Valid government-issued photo ID matching your name<br>
                • This email notification or your order number
              </div>
            </div>

          </div>

          ${brandCtx.getFooterHtml()}
        </div>
      </body>
      </html>
    `;

    const textTemplate = `
${brand.name.toUpperCase()} — LOCAL PICKUP CONFIRMATION

Hello${customerName ? ` ${customerName}` : ''},

Your order for "${productName}" is ready for pickup!

Location:
${pickup.warehouseName}
${(pickup.addressLines || []).join('\n')}

Hours:
${(pickup.hoursLines || []).join('\n')}

Contact:
Phone: ${pickup.phone || brand.supportPhone}
Email: ${brand.supportEmail}

Please bring a photo ID and order details when you arrive.

${brandCtx.getTextFooter()}
    `.trim();

    const mailOptions = {
      from: `"${senderIdentity.fromName}" <${senderIdentity.fromEmail}>`,
      replyTo: brand.supportEmail || senderIdentity.fromEmail,
      to: customerEmail,
      subject: `Local Pickup Ready - ${productName} | ${brand.name}`,
      html: htmlTemplate,
      text: textTemplate,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    await logEmail({
      templateName: 'Local Pickup',
      senderEmail: senderIdentity.fromEmail,
      recipientEmail: customerEmail,
      recipientName: customerName,
      productName: productName,
      status: 'Success',
      payload: { ...req.body, website: brand.id }
    });

    res.status(200).json({
      success: true,
      message: 'Local pickup email sent successfully!',
      messageId: info.messageId,
      website: brand.id
    });

  } catch (error) {
    console.error('Error sending local pickup email:', error);
    res.status(500).json({
      error: 'Failed to send local pickup email',
      details: error.message
    });
  }
}
