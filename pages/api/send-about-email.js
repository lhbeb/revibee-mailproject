import { getRandomAccount, createTransporter, getAccountByUser, getSenderIdentity } from '../../src/config/emailAccounts';
import { logEmail } from '../../src/utils/logger';

// Reuse the transporter
// let transporter = null;

// function getTransporter() {
//   if (!transporter) {
//     transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: true,
//       auth: {
//         user: 'orders@deeldepot.com',
//         pass: 'pqdc drxx ltlo xapr',
//       },
//     });
//   }
//   return transporter;
// }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, senderEmail } = req.body;

    // Validate required fields
    if (!customerEmail) {
      return res.status(400).json({
        error: 'Missing required field: customerEmail'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('=== SENDING ABOUT DEELDEPOT EMAIL ===');
    console.log('Customer Email:', customerEmail);
    // Get the email transporter
    // const emailTransporter = getTransporter();
    let account;
    if (senderEmail) {
      account = getAccountByUser(senderEmail);
      if (!account) {
        console.warn(`Requested sender email ${senderEmail} not found. Falling back to random account.`);
        account = getRandomAccount();
      } else {
        console.log(`Using manually selected email account: ${account.user}`);
      }
    } else {
      account = getRandomAccount();
      console.log(`Using randomly selected email account: ${account.user}`);
    }
    const emailTransporter = createTransporter(account);
    const senderIdentity = getSenderIdentity(account);

    // Comprehensive About Casoodo HTML Template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no">
        <title>How Casoodo sources inventory</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #F0F6FF;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #070B17;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          
          /* Mobile Responsive Styles - AGGRESSIVE OVERRIDES */
          @media only screen and (max-width: 600px) {
            /* Force larger base font size */
            body {
              font-size: 17px !important;
            }
            
            /* Override ALL paragraph and text elements */
            p, span, div, td, li, a {
              font-size: 17px !important;
              line-height: 1.7 !important;
            }
            
            /* Force larger headings */
            h1, h1 * {
              font-size: 28px !important;
              line-height: 1.3 !important;
            }
            
            h2, h2 * {
              font-size: 24px !important;
              line-height: 1.3 !important;
            }
            
            h3, h3 * {
              font-size: 20px !important;
              line-height: 1.4 !important;
            }
            
            /* Force strong/bold text to be larger */
            strong, b {
              font-size: 17px !important;
            }
            
            /* Adjust padding for mobile */
            .content-cell {
              padding: 24px 16px !important;
            }
            
            /* Make tables full width on mobile */
            .mobile-full-width {
              width: 100% !important;
              max-width: 100% !important;
            }
            
            /* Stack stat boxes vertically on mobile */
            .stat-box {
              display: block !important;
              width: 100% !important;
              margin-bottom: 12px !important;
            }
            
            /* Larger buttons on mobile */
            .cta-button, a[style*="background-color"] {
              padding: 18px 28px !important;
              font-size: 18px !important;
            }
            
            /* Icon sizes */
            .icon-text {
              font-size: 20px !important;
            }
            
            /* Force minimum font size on ALL elements */
            * {
              min-width: 0 !important;
            }
            
            /* Specific overrides for small text */
            [style*="font-size: 12px"],
            [style*="font-size: 13px"],
            [style*="font-size: 16px"],
            [style*="font-size: 17px"] {
              font-size: 17px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F0F6FF;">
        
        <!-- Wrapper Table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0F6FF;">
          <tr>
            <td align="center" style="padding: 20px 10px;">
              
              <!-- Main Container -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 650px; background: #F0F6FF; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #003099; padding: 48px 32px; text-align: center; border-bottom: 1px solid #003099;">
                    <div style="display: inline-block; max-width: 212px; margin-bottom: 16px;">
                      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                        viewBox="0 0 212 43.1" style="enable-background:new 0 0 212 43.1; width: 100%; height: auto; display: block;" xml:space="preserve">
                        <style type="text/css">
                          .st0{fill:#EEF5FF;}
                          .st1{fill:#FFFAAC;}
                        </style>
                        <g>
                          <path class="st0" d="M32.3,27.3c-1.6,0-2.5,0.7-3.7,2.2c-0.4,0.5-0.7,1.4-1.5,2.4c-1.4,1.7-3.7,2.6-6.7,2.6
                            c-6.5,0-10.2-4.6-10.2-13c0-8.3,3.9-13,9.9-13c2.9,0,5.1,0.9,6.8,2.8c0.6,0.6,1,1.6,1.7,2.4c1.1,1.1,2.2,1.6,3.5,1.6
                            c2.3,0,3.7-1.5,3.7-3.7c0-2-1.3-4.4-3.7-6.2C28.7,2.7,25,1.5,20.5,1.5C9,1.5,2.2,9.1,2.2,22.2c0,12,6.8,19.4,17.8,19.4
                            c5.1,0,8.9-1.3,12.5-4.4c2.3-2.1,3.5-4.6,3.5-6.3C36,28.9,34.4,27.3,32.3,27.3z"/>
                          <path class="st0" d="M62.7,19.4c0-5.1-4.2-7.9-12.1-7.9c-6.8,0-11.2,3.6-11.2,7c0,1.7,1.3,3.1,3,3.1c2.1,0,3-1.7,4.2-2.8
                            c1.1-0.9,2.5-1.4,4.3-1.4c3.2,0,4.6,0.8,4.6,3.2c0,1.2-0.4,1.8-1.2,2.1c-1.6,0.5-4.4,0.5-7.9,1.3c-5.8,1.2-8.3,3.5-8.3,8.9
                            c0,5.5,3.2,8.7,8.5,8.7c4.1,0,7.2-1.6,9-4.5c0.1,3.1,1.3,4.5,4.1,4.5c2.1,0,3.2-1.1,3.2-2.9c0-0.7-0.3-1.8-0.3-3.3V19.4z
                             M55.5,29.4c0,3.9-2.5,6.4-6.3,6.4c-2.5,0-3.9-1.3-3.9-3.4c0-2.2,1.2-3.1,3.5-3.7c1.5-0.4,3.9-0.6,6.7-1.9V29.4z"/>
                          <path class="st0" d="M80.6,23.3l-2.3-0.5C74.5,22,73,21.5,73,19.9c0-1.7,1.4-2.6,4.2-2.6c1.4,0,3,0.5,3.7,1.1
                            c1.6,1.2,2.6,2.2,4.1,2.2c1.8,0,3.1-1.3,3.1-3c0-3.1-4.2-6.1-10.9-6.1c-7.2,0-11.5,3.7-11.5,9.3c0,4.6,3.1,6.9,9.7,8.4l2.9,0.7
                            c3.3,0.8,4.5,1.1,4.5,2.8c0,1.7-1.6,2.8-4.6,2.8c-2.2,0-3.7-0.4-5-1.7c-1.3-1.3-2.1-2.7-4.1-2.7c-2,0-3.4,1.4-3.4,3.4
                            c0,3.5,4.4,6.9,11.6,6.9c8.6,0,13.1-3.4,13.1-9.8C90.3,26.8,87.2,24.7,80.6,23.3z"/>
                          <path class="st1" d="M125.9,11.5c-2.3,0-4.3,0.4-6.1,1.1c1.4,1.6,2.5,3.6,3.3,5.8c0.8-0.4,1.8-0.6,2.8-0.6c4.1,0,6.5,3.1,6.5,8.7
                            c0,5.6-2.4,8.7-6.5,8.7c-1.1,0-2-0.2-2.8-0.6c-2.2-1-3.5-3.5-3.8-7.1c0-0.3,0-0.7,0-1.1s0-0.7,0-1.1c-0.2-4.2-1.5-7.6-3.8-10
                            c-1.2-1.2-2.6-2.2-4.3-2.9c-1.8-0.7-3.8-1.1-6.1-1.1c-8.8,0-14.2,5.6-14.2,15c0,9.3,5.4,15,14.2,15c2.3,0,4.3-0.4,6.1-1.1
                            c-1.4-1.6-2.5-3.6-3.3-5.8c-0.8,0.4-1.7,0.6-2.8,0.6c-4.2,0-6.6-3.1-6.6-8.7c0-5.6,2.4-8.7,6.6-8.7c1,0,2,0.2,2.8,0.6
                            c2.4,1.1,3.7,3.9,3.7,8.1c0,4.7,1.4,8.5,3.8,11c1.2,1.2,2.6,2.2,4.3,2.9c1.8,0.7,3.8,1.1,6.1,1.1c8.8,0,14.2-5.6,14.2-15
                            C140.1,17.1,134.7,11.5,125.9,11.5z"/>
                          <path class="st0" d="M164.4,2.1c-2.4,0-3.6,1.4-3.6,4.2V16c-1.9-2.9-4.7-4.4-8.3-4.4c-6.5,0-11.5,5.9-11.5,15.1
                            c0,9,4.8,14.8,11.6,14.8c3.6,0,6.2-1.5,8.4-4.7v0.8c0,2.3,1.2,3.4,3.4,3.4c2.5,0,3.7-1.4,3.7-4.2V6.2
                            C168.1,3.4,166.9,2.1,164.4,2.1z M154.5,35c-3.9,0-6.1-3.1-6.1-8.7c0-5.2,2.4-8.3,6.1-8.3c4,0,6.3,3,6.3,8.3
                            C160.8,32.1,158.6,35,154.5,35z"/>
                          <path class="st0" d="M184.7,11.5c-8.8,0-14.2,5.6-14.2,15c0,9.3,5.4,15,14.2,15s14.2-5.6,14.2-15C198.9,17.1,193.5,11.5,184.7,11.5
                            z M184.7,35.2c-4.2,0-6.6-3.1-6.6-8.7c0-5.6,2.4-8.7,6.6-8.7c4.1,0,6.5,3.1,6.5,8.7C191.3,32.1,188.9,35.2,184.7,35.2z"/>
                          <path class="st0" d="M205.4,32.2c-2.4,0-4.4,2-4.4,4.4c0,2.4,2,4.4,4.4,4.4c2.4,0,4.4-2,4.4-4.4C209.8,34.1,207.8,32.2,205.4,32.2z
                            "/>
                        </g>
                      </svg>
                    </div>
                  </td>
                </tr>


              
                <!-- Headline Question -->
                <tr>
                  <td style="padding: 24px 32px; text-align: center; background-color: #003099;">
                    <h1 style="color: #F0F6FF; font-size: 24px; font-weight: 700; margin: 0;">
                      How Casoodo sources inventory
                    </h1>
                  </td>
                </tr>
                
                <!-- Welcome Section -->
                <tr>
                  <td class="content-cell" style="padding: 40px 32px;">
                    <p style="color: #374151; font-size: 18px; line-height: 1.8; margin: 0 0 20px 0;">
                      Hello,<br><br>
                      Here is a short overview of how our inventory sourcing works.
                    </p>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0F6FF; border-left: 4px solid #003099; border-radius: 8px; margin: 24px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #070B17; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">Our Mission</p>
                          <p style="color: #070B17; font-size: 18px; margin: 0; line-height: 1.6;">
                            Offer well-described products at fair prices through disciplined sourcing and inspection.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <div style="text-align: center; margin: 32px 0;">
                      <a href="https://www.casoodo.com" style="background-color: #FFFBB6; color: #070B17; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(7, 11, 23, 0.5);">
                        Visit Casoodo
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- How We Keep Prices Low -->
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <h2 style="color: #070B17; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">
                      How We Keep Prices Low
                    </h2>
                    
                    <p style="color: #374151; font-size: 17px; line-height: 1.7; margin: 0 0 24px 0; text-align: center;">
                      Our pricing comes from how we source, inspect, and list inventory:
                    </p>
                    
                    <!-- Strategy 1 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #F0F6FF; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #003099; border-radius: 50%; text-align: center; line-height: 32px; color: #F0F6FF; font-weight: 700; font-size: 18px;">1</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #070B17; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Daily wins in online auctions</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">We participate in high-volume auctions across multiple platforms. Buying in bulk before items reach regular marketplaces lets us secure lower costs and pass those savings on to you.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Strategy 2 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #F0F6FF; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #003099; border-radius: 50%; text-align: center; line-height: 32px; color: #F0F6FF; font-weight: 700; font-size: 18px;">2</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #070B17; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Direct deals across online marketplaces</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">Our team searches Facebook Marketplace, OfferUp, eBay, Kleinanzeigen, and other platforms. By negotiating directly with private sellers, we consistently find high-value deals.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Strategy 3 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #F0F6FF; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #003099; border-radius: 50%; text-align: center; line-height: 32px; color: #F0F6FF; font-weight: 700; font-size: 18px;">3</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #070B17; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Partnerships with major retailers’ return & liquidation departments</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0 0 8px 0; line-height: 1.6;">We purchase overstock, open-box items, shelf pulls, refurbished pieces, and customer returns from companies such as Amazon, Best Buy, Target, and others.</p>
                                <p style="color: #070B17; font-size: 13px; margin: 0; font-weight: 600;">Every item is inspected, tested, cleaned, or refurbished before being listed.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Strategy 4 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #F0F6FF; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #003099; border-radius: 50%; text-align: center; line-height: 32px; color: #F0F6FF; font-weight: 700; font-size: 18px;">4</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #070B17; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Local deal hunting</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">We regularly visit auctions, garage sales, estate sales, wholesalers, and liquidation centers. This helps us find items you often won’t see in traditional stores.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Strategy 5 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #F0F6FF; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #003099; border-radius: 50%; text-align: center; line-height: 32px; color: #F0F6FF; font-weight: 700; font-size: 18px;">5</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #070B17; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Fair margins, fast turnover</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">Instead of adding heavy markups, we focus on reasonable pricing and steady rotation of inventory.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Private Seller Network -->
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0F6FF; border-radius: 12px; border: 1px solid #e2e8f0;">
                      <tr>
                        <td style="padding: 32px;">
                          <h2 style="color: #070B17; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">
                            🤝 A Recent Addition: Approved Private Sellers
                          </h2>
                          <p style="color: #374151; font-size: 17px; line-height: 1.7; margin: 0 0 16px 0;">
                            We’ve expanded our sourcing model with a small network of private sellers who share our commitment to quality.
                          </p>
                          <p style="color: #374151; font-size: 17px; line-height: 1.7; margin: 0 0 16px 0;">
                            They ship their items to our warehouse, where our inspection team performs a complete check:
                          </p>
                          <ul style="color: #070B17; font-size: 16px; margin: 0 0 16px 20px; padding: 0;">
                            <li style="margin-bottom: 8px;">✓ Authentic condition</li>
                            <li style="margin-bottom: 8px;">✓ Full functionality</li>
                            <li style="margin-bottom: 8px;">✓ Pricing aligned with real market value</li>
                          </ul>
                          <p style="color: #374151; font-size: 17px; line-height: 1.7; margin: 0;">
                            <strong>Only after passing inspection does a product go live on our site.</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- What Makes Us Different -->
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <h2 style="color: #070B17; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">
                      What Makes Us Different
                    </h2>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 16px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                                <span style="font-size: 20px;">✨</span>
                              </td>
                              <td>
                                <h3 style="color: #070B17; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Curated Inventory</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">Every product goes through a full inspection before shipping.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                                <span style="font-size: 20px;">📋</span>
                              </td>
                              <td>
                                <h3 style="color: #070B17; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Clear Product Details</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">We always specify whether an item is new, open box, refurbished, or pre-owned.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                                <span style="font-size: 20px;">💎</span>
                              </td>
                              <td>
                                <h3 style="color: #070B17; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Great Value</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">We constantly compare and track market prices to make sure listings offer real savings.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                                <span style="font-size: 20px;">🎯</span>
                              </td>
                              <td>
                                <h3 style="color: #070B17; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Customer Support</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">Fast, free shipping within the U.S. and Canada, a 30-day return policy, and responsive human support.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                                <span style="font-size: 20px;">♻️</span>
                              </td>
                              <td>
                                <h3 style="color: #070B17; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Sustainable Shopping</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">By reselling returns, overstock, and refurbished goods, you help reduce waste and support a more sustainable buying cycle.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Company Stats -->
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <h2 style="color: #070B17; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">
                      Company Stats
                    </h2>
                    
                    <!-- Responsive Grid for Stats -->
                    <div style="text-align: center; font-size: 0;">
                      <!--[if mso]>
                      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                      <td valign="top" width="25%">
                      <![endif]-->
                      <div style="display: inline-block; width: 100%; max-width: 140px; vertical-align: top; margin-bottom: 16px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0F6FF; border-radius: 12px; text-align: center; padding: 16px; border: 2px solid #003099;">
                          <tr>
                            <td>
                              <div style="font-size: 28px; font-weight: 700; color: #070B17; margin-bottom: 4px;">5000+</div>
                              <div style="font-size: 13px; color: #64748b; font-weight: 500;">Happy Customers</div>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <!--[if mso]>
                      </td>
                      <td valign="top" width="25%">
                      <![endif]-->
                      <div style="display: inline-block; width: 100%; max-width: 140px; vertical-align: top; margin-bottom: 16px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0F6FF; border-radius: 12px; text-align: center; padding: 16px; border: 2px solid #003099;">
                          <tr>
                            <td>
                              <div style="font-size: 28px; font-weight: 700; color: #070B17; margin-bottom: 4px;">1000+</div>
                              <div style="font-size: 13px; color: #64748b; font-weight: 500;">Products Sold</div>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <!--[if mso]>
                      </td>
                      <td valign="top" width="25%">
                      <![endif]-->
                      <div style="display: inline-block; width: 100%; max-width: 140px; vertical-align: top; margin-bottom: 16px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0F6FF; border-radius: 12px; text-align: center; padding: 16px; border: 2px solid #003099;">
                          <tr>
                            <td>
                              <div style="font-size: 28px; font-weight: 700; color: #070B17; margin-bottom: 4px;">99%</div>
                              <div style="font-size: 13px; color: #64748b; font-weight: 500;">Satisfaction Rate</div>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <!--[if mso]>
                      </td>
                      <td valign="top" width="25%">
                      <![endif]-->
                      <div style="display: inline-block; width: 100%; max-width: 140px; vertical-align: top; margin-bottom: 16px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0F6FF; border-radius: 12px; text-align: center; padding: 16px; border: 2px solid #003099;">
                          <tr>
                            <td>
                              <div style="font-size: 28px; font-weight: 700; color: #070B17; margin-bottom: 4px;">24/7</div>
                              <div style="font-size: 13px; color: #64748b; font-weight: 500;">Support Available</div>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <!--[if mso]>
                      </td>
                      </tr>
                      </table>
                      <![endif]-->
                    </div>
                  </td>
                </tr>
                
                <!-- Contact Information -->
                <tr>
                  <td style="background-color: #F0F6FF; padding: 32px; border-top: 1px solid #e5e7eb;">
                    <h2 style="color: #070B17; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                      📞 Contact Information
                    </h2>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #070B17; font-size: 16px;">Address:</strong><br>
                          <span style="color: #64748b; font-size: 16px;">415 Codoni Ave, Modesto, CA 95357, USA</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #070B17; font-size: 16px;">Phone:</strong><br>
                          <a href="tel:+13186574299" style="color: #070B17; text-decoration: none; font-size: 16px;">+1 318 657 4299</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #070B17; font-size: 16px;">Email:</strong><br>
                          <a href="mailto:${senderIdentity.fromEmail}" style="color: #070B17; text-decoration: none; font-size: 16px;">${senderIdentity.fromEmail}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #070B17; font-size: 16px;">Business Hours:</strong><br>
                          <span style="color: #64748b; font-size: 16px;">Monday to Friday, 9:00 AM - 5:00 PM EST</span><br>
                          <span style="color: #64748b; font-size: 16px;">Saturday, 10:00 AM - 3:00 PM EST</span><br>
                          <span style="color: #64748b; font-size: 16px;">Sunday, Closed</span>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        © 2026 Casoodo. All rights reserved.<br>
                        Thank you for choosing Casoodo!<br>
                        <span style="color: #cbd5e1; font-size: 10px;">Ref ID: ${Date.now()}</span>
                      </p>
                    </div>
                  </td>
                </tr>
                
              </table>
              
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `;

    // Plain text version
    const textTemplate = `
      We win auctions early, before items hit retail
      
      Hello,
      
      Welcome to Casoodo - a place where shoppers can find quality products at fair, transparent prices. We offer a curated mix of electronics, photography gear, fashion, bicycles, tools, home equipment, and more.
      
      OUR MISSION
      Make premium products accessible to everyone without inflated retail costs.
      
      HOW WE KEEP PRICES LOW (30-50% below normal retail):
      
      1. Daily wins in online auctions
      We participate in high-volume auctions across multiple platforms. Buying in bulk before items reach regular marketplaces lets us secure lower costs and pass those savings on to you.
      
      2. Direct deals across online marketplaces
      Our team searches Facebook Marketplace, OfferUp, eBay, Kleinanzeigen, and other platforms. By negotiating directly with private sellers, we consistently find high-value deals.
      
      3. Partnerships with major retailers’ return & liquidation departments
      We purchase overstock, open-box items, shelf pulls, refurbished pieces, and customer returns from companies such as Amazon, Best Buy, Target, and others.
      Every item is inspected, tested, cleaned, or refurbished before being listed.
      
      4. Local deal hunting
      We regularly visit auctions, garage sales, estate sales, wholesalers, and liquidation centers. This helps us find items you often won’t see in traditional stores.
      
      5. Fair margins, fast turnover
      Instead of adding heavy markups, we focus on reasonable pricing and steady rotation of inventory.
      
      APPROVED PRIVATE SELLERS
      We’ve expanded our sourcing model with a small network of private sellers who share our commitment to quality.
      They ship their items to our warehouse, where our inspection team performs a complete check:
      - Authentic condition
      - Full functionality
      - Pricing aligned with real market value
      Only after passing inspection does a product go live on our site.
      
      WHAT MAKES US DIFFERENT
      ✨ Curated Inventory - Every product goes through a full inspection before shipping.
      📋 Clear Product Details - We always specify whether an item is new, open box, refurbished, or pre-owned.
      💎 Great Value - We constantly compare and track market prices to make sure listings offer real savings.
      🎯 Customer Support - Fast, free shipping within the U.S. and Canada, a 30-day return policy, and responsive human support.
      ♻️ Sustainable Shopping - By reselling returns, overstock, and refurbished goods, you help reduce waste and support a more sustainable buying cycle.
      
      COMPANY STATS
      5000+ Happy Customers
      1000+ Products Sold
      99% Satisfaction Rate
      24/7 Support Available
      
      CONTACT INFORMATION
      Address: 415 Codoni Ave, Modesto, CA 95357, USA
      Phone: +1 318 657 4299
      Email: ${senderIdentity.fromEmail}
      
      Business Hours:
      Mon-Fri: 9:00 AM - 5:00 PM EST
      Saturday: 10:00 AM - 3:00 PM EST
      Sunday: Closed
      
      © 2026 Casoodo. All rights reserved.
      Thank you for choosing Casoodo!
      
      Ref ID: ${Date.now()}
    `;

    const mailOptions = {
      from: `"${senderIdentity.fromName}" <${senderIdentity.fromEmail}>`,
      replyTo: senderIdentity.fromEmail,
      to: customerEmail,
      subject: `How Casoodo Sources Inventory`,
      html: htmlTemplate,
      text: textTemplate,
    };

    const startTime = Date.now();
    const info = await emailTransporter.sendMail(mailOptions);
    const endTime = Date.now();

    console.log('About email sent successfully!');
    console.log('Message ID:', info.messageId);

    // Log the sent email
    await logEmail({
      templateName: 'About Casoodo',
      senderEmail: senderIdentity.fromEmail,
      recipientEmail: customerEmail,
      recipientName: 'Customer',
      productName: 'About Casoodo',
      status: 'Success'
    });
    console.log(`Email sent in ${endTime - startTime}ms`);

    res.status(200).json({
      success: true,
      message: 'About Casoodo email sent successfully!',
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
