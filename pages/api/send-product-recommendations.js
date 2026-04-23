import { getRandomAccount, createTransporter, getAccountByUser } from '../../src/config/emailAccounts';
import { logEmail } from '../../src/utils/logger';
import * as cheerio from 'cheerio';

/**
 * Fetch the og:image and og:title (or page <title>) for a given product URL.
 * Returns { image, title } — either field can be null on failure.
 */
async function scrapeProduct(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DeelDepotBot/1.0;)' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // ── Image ──────────────────────────────────────────────────────────
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

    // ── Title ──────────────────────────────────────────────────────────
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text().trim() ||
      null;

    return { image, title };
  } catch (err) {
    console.warn(`[recommendations] Failed to scrape ${url}: ${err.message}`);
    return { image: null, title: null };
  }
}

// ── HTML helpers ────────────────────────────────────────────────────────────

/**
 * Renders a single product card cell for the email grid.
 * Table-based layout for maximum email client compatibility.
 */
function renderProductCard({ url, image, title }) {
  const displayTitle = title || 'View Product';
  // Truncate long titles
  const shortTitle = displayTitle.length > 60 ? displayTitle.slice(0, 57) + '…' : displayTitle;

  const imgBlock = image
    ? `<img src="${image}" alt="${shortTitle.replace(/"/g, '&quot;')}"
          style="width:100%; height:180px; object-fit:cover; display:block; border-radius:8px 8px 0 0;">`
    : `<div style="width:100%; height:180px; background:#f1f5f9; border-radius:8px 8px 0 0;
                   display:flex; align-items:center; justify-content:center; font-size:48px;">🛍️</div>`;

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
           style="border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;
                  background:#ffffff; box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <tr>
        <td style="padding:0;">${imgBlock}</td>
      </tr>
      <tr>
        <td style="padding:14px 16px 6px 16px;">
          <p style="margin:0; font-size:13px; font-weight:600; color:#1f2937;
                    line-height:1.4; min-height:36px;">${shortTitle}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 16px 16px 16px; text-align:center;">
          <a href="${url}"
             style="display:inline-block; padding:10px 22px; background-color:#F5970C;
                    color:#090A28; text-decoration:none; font-weight:700; font-size:13px;
                    border-radius:8px; border:1px solid #F5970C;">
            Get Deal
          </a>
        </td>
      </tr>
    </table>`;
}

/**
 * Splits products into rows of `cols` items and renders a 2-column grid.
 * Works in Gmail, Outlook 2016+, Apple Mail, and iOS Mail.
 */
function renderProductGrid(products) {
  const COLS = 2;
  const rows = [];

  for (let i = 0; i < products.length; i += COLS) {
    const chunk = products.slice(i, i + COLS);
    const cells = chunk
      .map(p => `
        <td width="48%" valign="top" style="padding:8px;">
          ${renderProductCard(p)}
        </td>`)
      .join(`<td width="4%" style="padding:0;"> </td>`);

    // If odd product on last row, add an empty cell to balance
    const emptyFill = chunk.length < COLS
      ? `<td width="48%" style="padding:8px;"> </td><td width="4%"> </td>`
      : '';

    rows.push(`
      <tr>
        ${cells}
        ${emptyFill}
      </tr>`);
  }

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${rows.join('')}
    </table>`;
}

// ── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, customerName, productLinks, senderEmail } = req.body;

    // ── Validation ──────────────────────────────────────────────────────
    if (!customerEmail) {
      return res.status(400).json({ error: 'customerEmail is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!Array.isArray(productLinks) || productLinks.length === 0) {
      return res.status(400).json({ error: 'At least one productLink is required' });
    }

    console.log(`[recommendations] Sending to ${customerEmail} with ${productLinks.length} products`);

    // ── Scrape all product pages in parallel ────────────────────────────
    const scraped = await Promise.all(
      productLinks.map(async (url) => {
        const { image, title } = await scrapeProduct(url);
        return { url, image, title };
      })
    );

    // ── Pick email account ──────────────────────────────────────────────
    let account;
    if (senderEmail) {
      account = getAccountByUser(senderEmail) || getRandomAccount();
    } else {
      account = getRandomAccount();
    }
    console.log(`[recommendations] Using sender: ${account.user}`);
    const transporter = createTransporter(account);

    // ── Build subject ───────────────────────────────────────────────────
    const firstName = customerName ? customerName.split(' ')[0] : null;
    const subject = firstName
      ? `${firstName}, you might love these picks 🛍️`
      : `Handpicked just for you — explore these deals 🛍️`;

    // ── HTML email template ─────────────────────────────────────────────
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no, date=no, email=no, address=no">
  <title>Products you might love — DeelDepot.com</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin:0; padding:0;
      background-color:#f8f9fa;
      font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
      line-height:1.5; color:#090A28;
      -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;
    }
    @media screen and (max-width:600px){
      .content-cell { padding:16px !important; }
      .header h1   { font-size:22px !important; }
      .prod-col    { display:block !important; width:100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;">

  <!-- Wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f8f9fa;">
    <tr>
      <td align="center" style="padding:20px 10px;">

        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
               style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;">

          <!-- Header -->
          <tr class="header">
            <td style="background-color:#090A28;padding:36px 32px;text-align:center;">
              <p style="margin:0 0 10px 0;font-size:13px;font-weight:600;color:#F5970C;text-transform:uppercase;letter-spacing:0.1em;">
                Handpicked for you
              </p>
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 14px 0;line-height:1.25;">
                ${firstName ? `${firstName}, you might love these` : 'Products you might love'} <span style="color:#F5970C;">✨</span>
              </h1>
              <p style="color:#ffffff99;font-size:15px;margin:0;line-height:1.5;">
                We curated ${scraped.length} item${scraped.length !== 1 ? 's' : ''} we think you&rsquo;ll be interested in.
                Click any product to explore the deal.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="content-cell" style="padding:28px 24px;">

              <!-- Greeting -->
              <p style="margin:0 0 24px 0;font-size:16px;color:#374151;line-height:1.6;">
                ${customerName ? `Hi ${customerName},` : 'Hi there,'}<br><br>
                Here are some items from our store we thought you might like.
                Every product comes with <strong>fast, tracked shipping</strong> and our
                <strong>30-day return guarantee</strong>.
              </p>

              <!-- Product Grid -->
              ${renderProductGrid(scraped)}

              <!-- CTA footer -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                     style="margin-top:28px;text-align:center;">
                <tr>
                  <td>
                    <p style="color:#6b7280;font-size:14px;margin:0 0 16px 0;">
                      Want to browse more? Visit our full store.
                    </p>
                    <a href="https://deeldepot.com"
                       style="display:inline-block;padding:14px 32px;background-color:#090A28;
                              color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;
                              border-radius:10px;">
                      Browse All Deals
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Trust strip -->
          <tr>
            <td style="background-color:#fafafa;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="padding:0 16px;font-size:12px;color:#9ca3af;border-right:1px solid #e5e7eb;">
                    ✅ Verified Products
                  </td>
                  <td style="padding:0 16px;font-size:12px;color:#9ca3af;border-right:1px solid #e5e7eb;">
                    📦 Fast Tracked Shipping
                  </td>
                  <td style="padding:0 16px;font-size:12px;color:#9ca3af;">
                    🔄 30-Day Returns
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;text-align:center;background-color:#f8fafc;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;">
                Questions? Reply to this email or&nbsp;
                <a href="https://wa.me/17176484487" style="color:#090A28;text-decoration:none;">WhatsApp +1-717-648-4487</a>.
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2026 DeelDepot.com · All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

    // ── Plain text fallback ─────────────────────────────────────────────
    const textTemplate = [
      customerName ? `Hi ${customerName},` : 'Hi there,',
      '',
      `Here are ${scraped.length} products we handpicked for you:`,
      '',
      ...scraped.map((p, i) => `${i + 1}. ${p.title || 'Product'}\n   ${p.url}`),
      '',
      'Browse all deals: https://deeldepot.com',
      '',
      'Questions? Reply here or WhatsApp +1-717-648-4487.',
      '',
      '© 2026 DeelDepot.com. All rights reserved.',
    ].join('\n');

    // ── Send ────────────────────────────────────────────────────────────
    const startTime = Date.now();
    const info = await transporter.sendMail({
      from: `"DeelDepot" <${account.user}>`,
      to: customerEmail,
      subject,
      html: htmlTemplate,
      text: textTemplate,
    });
    console.log(`[recommendations] Sent in ${Date.now() - startTime}ms — ID: ${info.messageId}`);

    // ── Log ─────────────────────────────────────────────────────────────
    await logEmail({
      templateName: 'Promotional — Recommendations',
      senderEmail: account.user,
      recipientEmail: customerEmail,
      recipientName: customerName || null,
      productName: scraped.map(p => p.title || p.url).join(', ').slice(0, 200),
      status: 'Success',
      payload: req.body,
    });

    return res.status(200).json({
      success: true,
      message: `Recommendations email sent with ${scraped.length} products.`,
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('[recommendations] Error:', error);

    if (error.code === 'ECONNREFUSED' || error.code === 'ESOCKET') {
      return res.status(503).json({
        error: 'Email Service Unavailable',
        details: 'Network connection to Gmail was refused. Check your firewall or VPN.',
      });
    }

    return res.status(500).json({
      error: 'Failed to send recommendations email',
      details: error.message,
    });
  }
}
