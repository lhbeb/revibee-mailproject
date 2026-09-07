import { getRandomAccount, createTransporter, getAccountByUser, getSenderIdentity } from '../../src/config/emailAccounts';
import { getBrandEmailContext } from '../../src/config/brandEmailHelpers';
import { logEmail } from '../../src/utils/logger';
import * as cheerio from 'cheerio';

async function scrapeProduct(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrandBot/1.0;)' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    let image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      null;

    if (!image) {
      const firstSrc = $('img').first().attr('src');
      if (firstSrc) {
        image = firstSrc.startsWith('http')
          ? firstSrc
          : (() => {
              try {
                const u = new URL(url);
                return `${u.protocol}//${u.host}${firstSrc.startsWith('/') ? '' : '/'}${firstSrc}`;
              } catch { return null; }
            })();
      }
    }

    let title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('h1').first().text().trim() ||
      $('title').text().trim() ||
      null;

    if (title) {
      title = title.replace(/\s*[-–|].*$/, '').trim();
    }

    return { image, title, url };
  } catch (err) {
    console.warn(`[scrapeProduct] Failed for ${url}:`, err.message);
    return { image: null, title: null, url };
  }
}

function renderProductGrid(products, brand) {
  const rows = [];
  for (let i = 0; i < products.length; i += 2) {
    rows.push(products.slice(i, i + 2));
  }

  return rows.map((pair, rowIdx) => {
    const isSingleInRow = pair.length === 1;

    const renderCard = (p) => `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
             style="background:#ffffff;border-radius:14px;border:1px solid ${brand.colors.cardBorder};overflow:hidden;">
        <tr>
          <td style="padding:16px;text-align:center;background:#ffffff;">
            ${p.image
              ? `<a href="${p.url}" style="text-decoration:none;">
                   <img src="${p.image}" alt="${p.title || 'Product'}"
                        width="180" height="140"
                        style="display:block;margin:0 auto;width:100%;max-width:180px;height:140px;object-fit:contain;border-radius:8px;" />
                 </a>`
              : `<div style="height:140px;background:${brand.colors.bgLight};border-radius:8px;display:flex;align-items:center;justify-content:center;">
                   <span style="font-size:32px;">📦</span>
                 </div>`
            }
          </td>
        </tr>
        <tr>
          <td style="padding:0 16px 16px 16px;">
            <p style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:${brand.colors.textDark};line-height:1.4;height:40px;overflow:hidden;">
              <a href="${p.url}" style="color:${brand.colors.textDark};text-decoration:none;">
                ${p.title || 'Featured Product'}
              </a>
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td>
                  <a href="${p.url}"
                     style="display:block;text-align:center;padding:10px 16px;background-color:${brand.colors.primary};
                            color:#F8FAFC;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;">
                    View Product →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
             style="margin-bottom:${rowIdx < rows.length - 1 ? '16px' : '0'};">
        <tr class="prod-row">
          <td class="prod-col" width="${isSingleInRow ? '100%' : '48%'}" valign="top">
            ${renderCard(pair[0])}
          </td>
          ${!isSingleInRow ? `
            <td class="prod-spacer" width="4%" style="font-size:0;line-height:0;">&nbsp;</td>
            <td class="prod-col" width="48%" valign="top">
              ${renderCard(pair[1])}
            </td>
          ` : ''}
        </tr>
      </table>
    `;
  }).join('');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerName, customerEmail, sourceProductName, productLinks = [], senderEmail, website } = req.body;

    if (!customerEmail) {
      return res.status(400).json({ error: 'Missing required field: customerEmail' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const cleanLinks = (Array.isArray(productLinks) ? productLinks : [productLinks])
      .map(l => (typeof l === 'string' ? l.trim() : ''))
      .filter(l => l.startsWith('http'));

    if (cleanLinks.length === 0) {
      return res.status(400).json({ error: 'At least one valid product URL is required' });
    }

    const brandCtx = getBrandEmailContext(website);
    const brand = brandCtx.brand;

    const scraped = await Promise.all(cleanLinks.slice(0, 6).map(scrapeProduct));

    let account = senderEmail ? getAccountByUser(senderEmail, brand.id) : getRandomAccount(brand.id);
    if (!account) account = getRandomAccount(brand.id);

    const emailTransporter = createTransporter(account);
    const senderIdentity = getSenderIdentity(account, brand.id);
    const firstName = customerName ? customerName.trim().split(' ')[0] : '';

    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Products you might love — ${brand.name}</title>
  <style>
    body { margin:0; padding:0; background-color:${brand.colors.bgLight}; font-family:'Inter',sans-serif; }
    @media screen and (max-width:600px){
      .content-cell { padding:16px !important; }
      .prod-row { display:block !important; width:100% !important; }
      .prod-col { display:block !important; width:100% !important; padding:4px 0 16px 0 !important; }
      .prod-spacer { display:none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${brand.colors.bgLight};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
               style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${brand.colors.cardBorder};">

          ${brandCtx.getHeaderHtml(
            `${firstName ? `${firstName}, you might love these ✨` : 'Handpicked products you might love ✨'}`,
            `Curated selection from ${brand.name}`
          )}

          <tr>
            <td class="content-cell" style="padding:28px 24px;">
              <p style="margin:0 0 20px 0;font-size:15px;color:#475569;line-height:1.6;">
                ${customerName ? `Hi ${customerName},` : 'Hello,'}<br><br>
                ${sourceProductName
                  ? `Based on your interest in <strong>${sourceProductName}</strong>, here are recommended items from our catalog.`
                  : 'Here are handpicked items from our catalog selected for you.'}
              </p>

              ${renderProductGrid(scraped, brand)}

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:28px;text-align:center;">
                <tr>
                  <td>
                    <a href="${brand.domain}" style="display:inline-block;padding:12px 28px;background-color:${brand.colors.primary};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;border-radius:8px;">
                      Browse Full Catalog at ${brand.name} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${brandCtx.getFooterHtml()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const textTemplate = [
      customerName ? `Hi ${customerName},` : 'Hello,',
      '',
      `Here are recommended products from ${brand.name}:`,
      '',
      ...scraped.map((p, i) => `${i + 1}. ${p.title || 'Product'}\n   ${p.url}`),
      '',
      brandCtx.getTextFooter(),
    ].join('\n');

    const subject = firstName
      ? `${firstName}, we found items you might like at ${brand.name} ✨`
      : `Recommended items for you | ${brand.name}`;

    const mailOptions = {
      from: `"${senderIdentity.fromName}" <${senderIdentity.fromEmail}>`,
      replyTo: brand.supportEmail || senderIdentity.fromEmail,
      to: customerEmail,
      subject,
      html: htmlTemplate,
      text: textTemplate,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    await logEmail({
      templateName: 'Product Recommendations',
      senderEmail: senderIdentity.fromEmail,
      recipientEmail: customerEmail,
      recipientName: customerName,
      productName: sourceProductName || cleanLinks[0],
      status: 'Success',
      payload: { ...req.body, website: brand.id },
    });

    return res.status(200).json({
      success: true,
      message: 'Product recommendations email sent successfully',
      messageId: info.messageId,
      website: brand.id,
    });

  } catch (error) {
    console.error('Error in send-product-recommendations:', error);
    return res.status(500).json({
      error: 'Failed to send product recommendations email',
      details: error.message,
    });
  }
}
