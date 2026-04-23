import { getRandomAccount, createTransporter, getAccountByUser } from '../../src/config/emailAccounts';
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
//         user: 'contactdeeldepot@gmail.com',
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

    // Comprehensive About DeelDepot HTML Template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no">
        <title>How DeelDepot sources inventory</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #090A28;
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
      <body style="margin: 0; padding: 0; background-color: #f8f9fa;">
        
        <!-- Wrapper Table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
          <tr>
            <td align="center" style="padding: 20px 10px;">
              
              <!-- Main Container -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 650px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #090A28; padding: 48px 32px; text-align: center; border-bottom: 1px solid #090A28;">
                    <div style="display: inline-block; max-width: 200px; margin-bottom: 16px;">
                      <?xml version="1.0" encoding="utf-8"?>
                      <!-- Generator: Adobe Illustrator 27.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
                      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                           viewBox="0 0 566.9 138.7" style="enable-background:new 0 0 566.9 138.7; width: 100%; height: auto; display: block;" xml:space="preserve">
                      <style type="text/css">
                          .st0{fill:#FFFFFF;}
                          .st1{fill:#F5970C;}
                      </style>
                      <g>
                          <g>
                              <g>
                                  <path class="st0" d="M9.6,94.1c-2-0.2-3.6-1.1-4.9-2.6c-1.3-1.5-1.9-3.2-1.9-5.2V14.3c0-2,0.6-3.7,1.9-5.2s2.9-2.3,4.9-2.6
                                      c5.1-0.6,10.7-0.8,17-0.8c14.1,0,24.9,3.7,32.4,11.1S70.3,35,70.3,49.2c0,15.2-3.7,26.7-11.2,34.3c-7.5,7.7-18.3,11.5-32.4,11.5
                                      C20.3,94.9,14.7,94.7,9.6,94.1z M19.4,20.7V80c0,0.6,0.3,0.9,1,1.1c2.5,0.4,4.9,0.6,7.1,0.6c9.3,0,16.1-2.5,20.5-7.6
                                      c4.4-5,6.5-13.3,6.5-24.9c0-10.4-2.2-18-6.7-22.8c-4.4-4.8-11.2-7.3-20.3-7.3c-2.2,0-4.6,0.2-7.1,0.6
                                      C19.7,19.8,19.4,20.2,19.4,20.7z"/>
                                  <path class="st0" d="M108,94.9c-10.4,0-18.4-2.7-24-8.1c-5.6-5.4-8.4-13.4-8.4-24c0-10.5,2.5-18.4,7.5-23.9
                                      c5-5.5,12.2-8.2,21.6-8.2c17.6,0,26.6,10,27.1,30c0.1,1.9-0.6,3.5-2,4.8c-1.4,1.3-3.1,1.9-5,1.9H92.4c-0.7,0-1,0.4-0.8,1.1
                                      c0.6,5.3,2.3,9.2,5.3,11.6c3,2.4,7.3,3.6,13,3.6c3.6,0,7.5-0.6,11.9-1.8c1.4-0.4,2.8-0.2,4,0.7c1.2,0.9,1.8,2.1,1.8,3.6
                                      c0,1.8-0.5,3.4-1.6,4.8c-1.1,1.4-2.5,2.2-4.2,2.6C117.3,94.5,112.7,94.9,108,94.9z M105,41.8c-4,0-7.2,1.1-9.3,3.4
                                      c-2.2,2.3-3.5,5.9-4.1,10.9c0,0.6,0.3,1,1,1h23.3c0.6,0,1-0.3,1-1C116.4,46.5,112.5,41.8,105,41.8z"/>
                                  <path class="st0" d="M171.3,94.9c-10.4,0-18.4-2.7-24-8.1c-5.6-5.4-8.4-13.4-8.4-24c0-10.5,2.5-18.4,7.5-23.9
                                      c5-5.5,12.2-8.2,21.6-8.2c17.6,0,26.6,10,27.1,30c0.1,1.9-0.6,3.5-2,4.8c-1.4,1.3-3.1,1.9-5,1.9h-32.5c-0.7,0-1,0.4-0.8,1.1
                                      c0.6,5.3,2.3,9.2,5.3,11.6c3,2.4,7.3,3.6,13,3.6c3.6,0,7.5-0.6,11.9-1.8c1.4-0.4,2.8-0.2,4,0.7c1.2,0.9,1.8,2.1,1.8,3.6
                                      c0,1.8-0.5,3.4-1.6,4.8c-1.1,1.4-2.5,2.2-4.2,2.6C180.7,94.5,176.1,94.9,171.3,94.9z M168.4,41.8c-4,0-7.2,1.1-9.3,3.4
                                      c-2.2,2.3-3.5,5.9-4.1,10.9c0,0.6,0.3,1,1,1h23.3c0.6,0,1-0.3,1-1C179.8,46.5,175.9,41.8,168.4,41.8z"/>
                                  <path class="st0" d="M215.7,93.8c-1.8,0-3.4-0.7-4.8-2c-1.3-1.3-2-2.9-2-4.8V11.3c0-1.8,0.7-3.4,2-4.8c1.3-1.3,2.9-2,4.8-2h3.1
                                      c1.8,0,3.4,0.7,4.8,2c1.3,1.3,2,2.9,2,4.8V87c0,1.8-0.7,3.4-2,4.8c-1.4,1.3-2.9,2-4.8,2H215.7z"/>
                                  <path class="st0" d="M250.8,94.1c-2-0.2-3.6-1.1-4.9-2.6c-1.3-1.5-1.9-3.2-1.9-5.2V14.3c0-2,0.6-3.7,1.9-5.2
                                      c1.3-1.5,2.9-2.3,4.9-2.6c5.1-0.6,10.7-0.8,17-0.8c14.1,0,24.9,3.7,32.4,11.1c7.5,7.4,11.2,18.2,11.2,32.3
                                      c0,15.2-3.7,26.7-11.2,34.3c-7.5,7.7-18.3,11.5-32.4,11.5C261.5,94.9,255.8,94.7,250.8,94.1z M260.5,20.7V80c0,0.6,0.3,0.9,1,1.1
                                      c2.5,0.4,4.9,0.6,7.1,0.6c9.3,0,16.1-2.5,20.5-7.6c4.4-5,6.5-13.3,6.5-24.9c0-10.4-2.2-18-6.7-22.8c-4.4-4.8-11.2-7.3-20.3-7.3
                                      c-2.2,0-4.6,0.2-7.1,0.6C260.8,19.8,260.5,20.2,260.5,20.7z"/>
                                  <path class="st0" d="M349.1,94.9c-10.4,0-18.4-2.7-24-8.1c-5.6-5.4-8.4-13.4-8.4-24c0-10.5,2.5-18.4,7.5-23.9
                                      c5-5.5,12.2-8.2,21.6-8.2c17.6,0,26.6,10,27.1,30c0.1,1.9-0.6,3.5-2,4.8c-1.4,1.3-3.1,1.9-5,1.9h-32.5c-0.7,0-1,0.4-0.8,1.1
                                      c0.6,5.3,2.3,9.2,5.3,11.6c3,2.4,7.3,3.6,13,3.6c3.6,0,7.5-0.6,11.9-1.8c1.4-0.4,2.8-0.2,4,0.7c1.2,0.9,1.8,2.1,1.8,3.6
                                      c0,1.8-0.5,3.4-1.6,4.8c-1.1,1.4-2.5,2.2-4.2,2.6C358.5,94.5,353.9,94.9,349.1,94.9z M346.1,41.8c-4,0-7.2,1.1-9.3,3.4
                                      c-2.2,2.3-3.5,5.9-4.1,10.9c0,0.6,0.3,1,1,1H357c0.6,0,1-0.3,1-1C357.6,46.5,353.7,41.8,346.1,41.8z"/>
                                  <path class="st0" d="M389.9,119.9c-1.8,0-3.4-0.7-4.8-2c-1.3-1.3-2-2.9-2-4.8V38.7c0-1.8,0.7-3.4,2-4.8c1.3-1.3,2.9-2,4.8-2h1.4
                                      c1.9,0,3.5,0.7,4.9,2c1.3,1.3,2.1,2.9,2.1,4.8v0.8c0,0.1,0,0.1,0.1,0.1c0.1,0,0.2,0,0.2-0.1c2.9-3.2,5.7-5.4,8.6-6.8
                                      c2.9-1.3,6.2-2,10-2c7.5,0,13.4,2.8,17.8,8.4c4.4,5.6,6.7,13.5,6.7,23.7c0,9.9-2.3,17.7-7,23.5c-4.6,5.7-10.5,8.6-17.5,8.6
                                      c-6.9,0-12.9-2.5-18-7.5c-0.1-0.1-0.2-0.1-0.2-0.1c-0.1,0-0.1,0-0.1,0.1v25.7c0,1.8-0.7,3.4-2,4.8c-1.3,1.3-2.9,2-4.7,2H389.9z
                                      M398.8,54.8v16.2c0,3.2,1.4,6,4.1,8.4s5.9,3.7,9.6,3.7c4.2,0,7.5-1.7,10-5.1c2.5-3.4,3.7-8.4,3.7-15.1
                                      c0-13.5-4.6-20.2-13.7-20.2c-3.6,0-6.8,1.2-9.6,3.7S398.8,51.6,398.8,54.8z"/>
                                  <path class="st0" d="M501.2,86.6c-5.3,5.6-12.7,8.4-22.2,8.4c-9.5,0-16.9-2.8-22.2-8.4c-5.3-5.6-7.9-13.5-7.9-23.7
                                      c0-10.2,2.6-18.1,7.9-23.7c5.3-5.6,12.7-8.4,22.2-8.4c9.5,0,16.9,2.8,22.2,8.4c5.3,5.6,7.9,13.5,7.9,23.7
                                      C509.1,73.1,506.4,81,501.2,86.6z M489.5,47.2c-2.3-3.3-5.8-4.9-10.5-4.9c-4.7,0-8.2,1.6-10.5,4.9c-2.3,3.3-3.5,8.5-3.5,15.6
                                      c0,7.1,1.2,12.4,3.5,15.6c2.3,3.3,5.8,4.9,10.5,4.9c4.7,0,8.2-1.6,10.5-4.9c2.3-3.3,3.5-8.5,3.5-15.6
                                      C493,55.7,491.8,50.5,489.5,47.2z"/>
                                  <path class="st0" d="M520.1,45.8c-1.6,0-2.9-0.6-4-1.7c-1.1-1.1-1.7-2.5-1.7-4.1c0-1.6,0.6-2.9,1.7-4c1.1-1.1,2.5-1.7,4-1.7h5.7
                                      c0.7,0,1.1-0.4,1.1-1.1V18.5c0-1.8,0.7-3.4,2-4.8c1.3-1.3,2.9-2,4.7-2h2.4c1.8,0,3.4,0.7,4.8,2c1.3,1.3,2,2.9,2,4.8v14.7
                                      c0,0.7,0.4,1.1,1.1,1.1h13.6c1.6,0,3,0.6,4.1,1.7c1.1,1.1,1.7,2.5,1.7,4c0,1.6-0.6,3-1.7,4.1c-1.1,1.1-2.5,1.7-4.1,1.7h-13.6
                                      c-0.7,0-1.1,0.3-1.1,1v24c0,5.2,0.6,8.5,1.7,10c1.1,1.5,3.4,2.3,6.9,2.3c1.9,0,3.3-0.1,4.3-0.2c1.6-0.2,3,0.2,4.2,1.1
                                      c1.2,0.9,1.8,2.1,1.8,3.6c0,1.7-0.6,3.3-1.7,4.7c-1.1,1.4-2.6,2.2-4.2,2.3c-3.5,0.3-6.1,0.5-7.8,0.5c-7.7,0-13.1-1.6-16.2-4.9
                                      c-3.1-3.3-4.6-9.2-4.6-17.7V46.8c0-0.6-0.4-1-1.1-1H520.1z"/>
                              </g>
                          </g>
                          <g>
                              <g>
                                  <path class="st1" d="M136.4,135.9c-12.8,0-24.6-5.8-32.5-15.5c-2.8-3.4-1.6-8.6,2.3-10.6l0,0c2.9-1.5,6.6-0.8,8.6,1.8
                                      c5.2,6.4,13,10.3,21.5,10.3c8.5,0,16.3-3.8,21.5-10.3c2.1-2.6,5.7-3.3,8.6-1.8l0,0c3.9,2,5.1,7.2,2.3,10.6
                                      C161,130.1,149.2,135.9,136.4,135.9z"/>
                              </g>
                          </g>
                      </g>
                      </svg>
                    </div>
                  </td>
                </tr>


              
                <!-- Headline Question -->
                <tr>
                  <td style="padding: 24px 32px; text-align: center; background-color: #090A28;">
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">
                      How DeelDepot sources inventory
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
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-left: 4px solid #090A28; border-radius: 8px; margin: 24px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #090A28; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">Our Mission</p>
                          <p style="color: #090A28; font-size: 18px; margin: 0; line-height: 1.6;">
                            Offer well-described products at fair prices through disciplined sourcing and inspection.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <div style="text-align: center; margin: 32px 0;">
                      <a href="https://www.deeldepot.com" style="background-color: #F5970C; color: #090A28; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 18px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(9, 10, 40, 0.5);">
                        Visit DeelDepot
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- How We Keep Prices Low -->
                <tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <h2 style="color: #090A28; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">
                      How We Keep Prices Low
                    </h2>
                    
                    <p style="color: #374151; font-size: 17px; line-height: 1.7; margin: 0 0 24px 0; text-align: center;">
                      Our pricing comes from how we source, inspect, and list inventory:
                    </p>
                    
                    <!-- Strategy 1 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #090A28; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-weight: 700; font-size: 18px;">1</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #090A28; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Daily wins in online auctions</h3>
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
                        <td style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #090A28; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-weight: 700; font-size: 18px;">2</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #090A28; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Direct deals across online marketplaces</h3>
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
                        <td style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #090A28; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-weight: 700; font-size: 18px;">3</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #090A28; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Partnerships with major retailers’ return & liquidation departments</h3>
                                <p style="color: #64748b; font-size: 16px; margin: 0 0 8px 0; line-height: 1.6;">We purchase overstock, open-box items, shelf pulls, refurbished pieces, and customer returns from companies such as Amazon, Best Buy, Target, and others.</p>
                                <p style="color: #090A28; font-size: 13px; margin: 0; font-weight: 600;">Every item is inspected, tested, cleaned, or refurbished before being listed.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Strategy 4 -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #090A28; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-weight: 700; font-size: 18px;">4</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #090A28; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Local deal hunting</h3>
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
                        <td style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 40px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background-color: #090A28; border-radius: 50%; text-align: center; line-height: 32px; color: #ffffff; font-weight: 700; font-size: 18px;">5</div>
                              </td>
                              <td style="vertical-align: top;">
                                <h3 style="color: #090A28; font-size: 17px; font-weight: 600; margin: 0 0 8px 0;">Fair margins, fast turnover</h3>
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
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                      <tr>
                        <td style="padding: 32px;">
                          <h2 style="color: #090A28; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">
                            🤝 A Recent Addition: Approved Private Sellers
                          </h2>
                          <p style="color: #374151; font-size: 17px; line-height: 1.7; margin: 0 0 16px 0;">
                            We’ve expanded our sourcing model with a small network of private sellers who share our commitment to quality.
                          </p>
                          <p style="color: #374151; font-size: 17px; line-height: 1.7; margin: 0 0 16px 0;">
                            They ship their items to our warehouse, where our inspection team performs a complete check:
                          </p>
                          <ul style="color: #090A28; font-size: 16px; margin: 0 0 16px 20px; padding: 0;">
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
                    <h2 style="color: #090A28; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">
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
                                <h3 style="color: #090A28; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Curated Inventory</h3>
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
                                <h3 style="color: #090A28; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Clear Product Details</h3>
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
                                <h3 style="color: #090A28; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Great Value</h3>
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
                                <h3 style="color: #090A28; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Customer Support</h3>
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
                                <h3 style="color: #090A28; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">Sustainable Shopping</h3>
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
                    <h2 style="color: #090A28; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">
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
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; text-align: center; padding: 16px; border: 2px solid #090A28;">
                          <tr>
                            <td>
                              <div style="font-size: 28px; font-weight: 700; color: #090A28; margin-bottom: 4px;">5000+</div>
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
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; text-align: center; padding: 16px; border: 2px solid #090A28;">
                          <tr>
                            <td>
                              <div style="font-size: 28px; font-weight: 700; color: #090A28; margin-bottom: 4px;">1000+</div>
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
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; text-align: center; padding: 16px; border: 2px solid #090A28;">
                          <tr>
                            <td>
                              <div style="font-size: 28px; font-weight: 700; color: #090A28; margin-bottom: 4px;">99%</div>
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
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; text-align: center; padding: 16px; border: 2px solid #090A28;">
                          <tr>
                            <td>
                              <div style="font-size: 28px; font-weight: 700; color: #090A28; margin-bottom: 4px;">24/7</div>
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
                  <td style="background-color: #f8fafc; padding: 32px; border-top: 1px solid #e5e7eb;">
                    <h2 style="color: #090A28; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                      📞 Contact Information
                    </h2>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #090A28; font-size: 16px;">Address:</strong><br>
                          <span style="color: #64748b; font-size: 16px;">1420 N McKinley Ave, Los Angeles, CA 90059, United States</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #090A28; font-size: 16px;">Phone:</strong><br>
                          <a href="tel:+17176484487" style="color: #090A28; text-decoration: none; font-size: 16px;">+1 717 648 4487</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #090A28; font-size: 16px;">Email:</strong><br>
                          <a href="mailto:contactdeeldepot@gmail.com" style="color: #090A28; text-decoration: none; font-size: 16px;">contactdeeldepot@gmail.com</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #090A28; font-size: 16px;">Business Hours:</strong><br>
                          <span style="color: #64748b; font-size: 16px;">Monday to Friday, 9:00 AM - 5:00 PM EST</span><br>
                          <span style="color: #64748b; font-size: 16px;">Saturday, 10:00 AM - 3:00 PM EST</span><br>
                          <span style="color: #64748b; font-size: 16px;">Sunday, Closed</span>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        © 2026 DeelDepot. All rights reserved.<br>
                        Thank you for choosing DeelDepot!<br>
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
      
      Welcome to DeelDepot - a place where shoppers can find quality products at fair, transparent prices. We offer a curated mix of electronics, photography gear, fashion, bicycles, tools, home equipment, and more.
      
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
      Address: 1420 N McKinley Ave, Los Angeles, CA 90059, United States
      Phone: +1 717 648 4487
      Email: contactdeeldepot@gmail.com
      
      Business Hours:
      Mon-Fri: 9:00 AM - 5:00 PM EST
      Saturday: 10:00 AM - 3:00 PM EST
      Sunday: Closed
      
      © 2026 DeelDepot. All rights reserved.
      Thank you for choosing DeelDepot!
      
      Ref ID: ${Date.now()}
    `;

    const mailOptions = {
      from: `"DeelDepot" <contactdeeldepot@gmail.com>`,
      to: customerEmail,
      subject: `How DeelDepot Sources Inventory`,
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
      templateName: 'About DeelDepot',
      senderEmail: account.user,
      recipientEmail: customerEmail,
      recipientName: 'Customer',
      productName: 'About DeelDepot',
      status: 'Success'
    });
    console.log(`Email sent in ${endTime - startTime}ms`);

    res.status(200).json({
      success: true,
      message: 'About DeelDepot email sent successfully!',
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
