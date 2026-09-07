import { getWebsite } from './websites.js';

/**
 * Returns brand metadata and HTML snippets for consistent multi-website emails.
 */
export function getBrandEmailContext(websiteId) {
  const brand = getWebsite(websiteId);

  return {
    brand,
    siteName: brand.name,
    domain: brand.domain,
    tagline: brand.tagline,
    supportEmail: brand.supportEmail,
    supportPhone: brand.supportPhone,
    colors: brand.colors,
    links: brand.links,
    localPickup: brand.localPickup,

    // Header HTML block
    getHeaderHtml: (headline, subheadline, orderNumber = null) => `
      <!-- Header Top -->
      <tr>
        <td style="background-color: ${brand.colors.accent}; padding: 36px 32px 20px; text-align: center;">
          <h1 style="color: ${brand.colors.textDark}; font-size: 28px; font-weight: 800; margin: 0; line-height: 1.25; letter-spacing: -0.02em;">
            ${headline}
          </h1>
        </td>
      </tr>
      <!-- Header Bottom -->
      <tr>
        <td style="background-color: ${brand.colors.primary}; padding: 20px 32px 32px; text-align: center;">
          <div style="color: #F8FAFC; font-size: 16px; font-weight: 600; margin: 0;">
            ${subheadline}
          </div>
          ${orderNumber ? `<div style="color: ${brand.colors.accent}; font-size: 17px; font-weight: 700; margin-top: 12px; letter-spacing: 0.5px;">Order #${orderNumber}</div>` : ''}
        </td>
      </tr>
    `,

    // Footer HTML block
    getFooterHtml: (extraNote = '') => `
      <tr>
        <td style="background-color: ${brand.colors.primary}; padding: 32px 24px; text-align: center;">
          <div style="color: #F8FAFC; font-size: 15px; margin: 0 0 16px 0; font-weight: 500;">
            Thank you for ordering with ${brand.name}.
          </div>
          ${extraNote ? `<div style="color: #CBD5E1; font-size: 13px; margin: 0 0 20px 0; line-height: 1.5;">${extraNote}</div>` : ''}
          <div style="margin-bottom: 24px;">
            <a href="${brand.links.contact}" style="color: ${brand.colors.accent}; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Support</a>
            <span style="color: rgba(255,255,255,0.25);">•</span>
            <a href="${brand.links.track}" style="color: ${brand.colors.accent}; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Track Order</a>
            <span style="color: rgba(255,255,255,0.25);">•</span>
            <a href="${brand.links.returns}" style="color: ${brand.colors.accent}; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Returns</a>
          </div>
          <div style="color: #94A3B8; font-size: 12px; line-height: 1.6;">
            © 2026 ${brand.name}. All rights reserved.<br>
            ${brand.tagline} • <a href="${brand.domain}" style="color: #94A3B8; text-decoration: underline;">${brand.domain.replace('https://', '')}</a>
          </div>
        </td>
      </tr>
    `,

    // Plaintext footer
    getTextFooter: () => `
---
Questions about your order? Our support team is here to help.
Contact: ${brand.supportEmail} | ${brand.supportPhone}
Track: ${brand.links.track}
Visit: ${brand.domain}

© 2026 ${brand.name}. All rights reserved.
${brand.tagline}
    `.trim()
  };
}
