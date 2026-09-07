import { getRandomAccount, createTransporter, getAccountByUser, getSenderIdentity } from '../../src/config/emailAccounts';
import { getBrandEmailContext } from '../../src/config/brandEmailHelpers';
import { logEmail } from '../../src/utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, senderEmail, website } = req.body;

    if (!customerEmail) {
      return res.status(400).json({ error: 'Missing required field: customerEmail' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const brandCtx = getBrandEmailContext(website);
    const brand = brandCtx.brand;

    let account = senderEmail ? getAccountByUser(senderEmail, brand.id) : getRandomAccount(brand.id);
    if (!account) account = getRandomAccount(brand.id);

    console.log(`[${brand.name}] About email sender: ${account?.user}`);
    const emailTransporter = createTransporter(account);
    const senderIdentity = getSenderIdentity(account, brand.id);

    const isBricoc = brand.id === 'bricoc';

    const headline = isBricoc
      ? 'How Bricoc sources top-grade tools & equipment'
      : 'How Casoodo sources inventory';

    const missionText = isBricoc
      ? 'Offer commercial-grade equipment, utility trailers, and power tools at fair prices through disciplined sourcing, factory direct agreements, and rigorous quality inspection.'
      : 'Offer carefully inspected, premium pre-owned technology and consumer items at competitive prices through disciplined testing and verification.';

    const pillars = isBricoc
      ? [
          { title: 'Direct Factory Relationships', desc: 'We source directly from specialized manufacturers and surplus distributors, cutting out intermediate distributor markups.' },
          { title: 'Rigorous Functional Checks', desc: 'Every tool, trailer component, and machine undergoes operational inspection before shipment.' },
          { title: 'Full Transparency & Support', desc: 'Detailed specifications, transparent warranty policies, and direct customer support for every purchase.' }
        ]
      : [
          { title: 'Certified Inspection', desc: 'Every device undergoes comprehensive multi-point diagnostic testing before being listed.' },
          { title: 'Fair Pricing Model', desc: 'Passing liquidation and trade-in efficiencies directly to customers with 30-day coverage.' },
          { title: 'Dedicated Customer Care', desc: 'Live order tracking and dedicated support for every step of your purchase journey.' }
        ];

    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline} — ${brand.name}</title>
  <style>
    body { margin:0; padding:0; background-color:${brand.colors.bgLight}; font-family:'Inter',sans-serif; color:${brand.colors.textDark}; }
    @media screen and (max-width:600px){
      .content-cell { padding:20px !important; }
      .header h1 { font-size:22px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${brand.colors.bgLight};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding:24px 10px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
               style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${brand.colors.cardBorder};">

          ${brandCtx.getHeaderHtml(headline, `The philosophy behind ${brand.name}`)}

          <tr>
            <td class="content-cell" style="padding:36px 28px;">
              <p style="font-size:16px;line-height:1.7;color:#334155;margin:0 0 24px 0;">
                Hello,<br><br>
                Transparency is at the heart of what we do. Here is a brief look at how we curate and deliver products to our customers.
              </p>

              <!-- Mission Banner -->
              <div style="background-color:${brand.colors.bgLight};border-left:4px solid ${brand.colors.primary};padding:18px 20px;border-radius:8px;margin-bottom:28px;">
                <div style="font-size:13px;font-weight:700;color:${brand.colors.primary};text-transform:uppercase;margin-bottom:4px;">Our Mission</div>
                <div style="font-size:15px;color:#1E293B;line-height:1.6;">${missionText}</div>
              </div>

              <!-- Pillars -->
              <div style="font-size:17px;font-weight:700;color:${brand.colors.textDark};margin-bottom:16px;">How We Guarantee Value:</div>
              <div style="space-y:14px;">
                ${pillars.map(p => `
                  <div style="padding:14px 18px;background:#F8FAFC;border:1px solid ${brand.colors.cardBorder};border-radius:10px;margin-bottom:12px;">
                    <div style="font-size:15px;font-weight:700;color:#0F172A;margin-bottom:4px;">✔ ${p.title}</div>
                    <div style="font-size:13px;color:#64748B;line-height:1.5;">${p.desc}</div>
                  </div>
                `).join('')}
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin:32px 0 12px 0;">
                <a href="${brand.domain}" style="display:inline-block;padding:14px 32px;background-color:${brand.colors.primary};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:8px;">
                  Explore ${brand.name} Store →
                </a>
              </div>
            </td>
          </tr>

          ${brandCtx.getFooterHtml()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const textTemplate = `
${brand.name.toUpperCase()} — OUR STORY & SOURCING

${headline}

${missionText}

Visit our store:
${brand.domain}

${brandCtx.getTextFooter()}
    `.trim();

    const mailOptions = {
      from: `"${senderIdentity.fromName}" <${senderIdentity.fromEmail}>`,
      replyTo: brand.supportEmail || senderIdentity.fromEmail,
      to: customerEmail,
      subject: `${headline} | ${brand.name}`,
      html: htmlTemplate,
      text: textTemplate,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    await logEmail({
      templateName: `About ${brand.name}`,
      senderEmail: senderIdentity.fromEmail,
      recipientEmail: customerEmail,
      recipientName: null,
      productName: headline,
      status: 'Success',
      payload: { ...req.body, website: brand.id },
    });

    return res.status(200).json({
      success: true,
      message: `About ${brand.name} email sent successfully`,
      messageId: info.messageId,
      website: brand.id,
    });

  } catch (error) {
    console.error('Error sending about email:', error);
    return res.status(500).json({
      error: 'Failed to send about email',
      details: error.message,
    });
  }
}
