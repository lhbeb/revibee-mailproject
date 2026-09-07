import { getRandomAccount, createTransporter, getAccountByUser, getSenderIdentity } from '../../src/config/emailAccounts';
import { getBrandEmailContext } from '../../src/config/brandEmailHelpers';
import { logEmail } from '../../src/utils/logger';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerName, customerEmail, customerAddress, productName, productLink, checkoutUrl, senderEmail, website } = req.body;
    const normalizedProductLink = productLink?.trim() || '';
    const normalizedCheckoutUrl = checkoutUrl?.trim() || normalizedProductLink;

    if (!customerEmail || !normalizedCheckoutUrl) {
      return res.status(400).json({
        error: 'Missing required fields: customerEmail and either checkoutUrl or productLink are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const brandCtx = getBrandEmailContext(website);
    const brand = brandCtx.brand;

    let productImage = null;
    if (normalizedProductLink) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(normalizedProductLink, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);
          productImage = $('meta[property="og:image"]').attr('content') ||
            $('.product-image img, .woocommerce-product-gallery__image img').first().attr('src') || null;
        }
      } catch (e) {
        console.warn('Image scrape failed:', e.message);
      }
    }

    let account = senderEmail ? getAccountByUser(senderEmail, brand.id) : getRandomAccount(brand.id);
    if (!account) account = getRandomAccount(brand.id);

    const emailTransporter = createTransporter(account);
    const senderIdentity = getSenderIdentity(account, brand.id);

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Saved Cart - ${brand.name}</title>
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
          .btn {
            display: inline-block;
            background-color: ${brand.colors.primary};
            color: #ffffff !important;
            font-weight: 700;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-top">
            <h1 style="color: ${brand.colors.textDark}; font-size: 24px; font-weight: 800;">Still interested in your order? 💚</h1>
          </div>
          <div class="header-bottom">
            <p style="font-size: 15px; opacity: 0.95;">A friendly reminder from ${brand.name}</p>
          </div>

          <div class="content">
            <p style="font-size: 16px; margin-bottom: 16px;">${customerName ? `Hi <strong>${customerName}</strong>,` : 'Hello,'}</p>
            <p style="color: #4B5563; font-size: 15px; margin-bottom: 20px;">
              We noticed you were checking out <strong>${productName || 'our catalog'}</strong>. If you had any questions or needed assistance, our support team is always on standby to help.
            </p>

            <div style="background-color: ${brand.colors.bgLight}; border: 1px solid ${brand.colors.cardBorder}; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
              ${productImage ? `<img src="${productImage}" alt="${productName}" style="max-width: 180px; max-height: 180px; border-radius: 8px; margin-bottom: 12px; object-fit: contain;">` : ''}
              <div style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 16px;">${productName || 'Saved Item'}</div>
              <a href="${normalizedCheckoutUrl}" class="btn">Resume Checkout →</a>
            </div>

            <div style="background-color: #F8FAFC; border-radius: 8px; padding: 16px; margin-top: 20px;">
              <p style="font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 6px;">Why order from ${brand.name}?</p>
              <ul style="font-size: 13px; color: #475569; padding-left: 18px; line-height: 1.6;">
                <li>Inspected quality on all products</li>
                <li>Fast, insured nationwide delivery with FedEx</li>
                <li>Dedicated support team ready to assist</li>
              </ul>
            </div>
          </div>

          ${brandCtx.getFooterHtml()}
        </div>
      </body>
      </html>
    `;

    const textTemplate = `
${brand.name.toUpperCase()} — A FRIENDLY REMINDER

${customerName ? `Hi ${customerName},` : 'Hello,'}

We saved your ${productName || 'item'} in your cart.

Return to your checkout here:
${normalizedCheckoutUrl}

Need any assistance? Contact our team at ${brand.supportEmail} or call ${brand.supportPhone}.

${brandCtx.getTextFooter()}
    `.trim();

    const mailOptions = {
      from: `"${senderIdentity.fromName}" <${senderIdentity.fromEmail}>`,
      replyTo: brand.supportEmail || senderIdentity.fromEmail,
      to: customerEmail,
      subject: `Still thinking it over? Your ${productName || 'saved cart'} is waiting | ${brand.name}`,
      html: htmlTemplate,
      text: textTemplate,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    await logEmail({
      templateName: 'Recovery — Friendly',
      senderEmail: senderIdentity.fromEmail,
      recipientEmail: customerEmail,
      recipientName: customerName,
      productName: productName,
      status: 'Success',
      payload: { ...req.body, website: brand.id }
    });

    res.status(200).json({
      success: true,
      message: 'Recovery email 2 sent successfully!',
      messageId: info.messageId,
      website: brand.id
    });

  } catch (error) {
    console.error('Error sending recovery email 2:', error);
    res.status(500).json({
      error: 'Failed to send recovery email',
      details: error.message
    });
  }
}
