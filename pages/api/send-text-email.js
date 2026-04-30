import { getRandomAccount, createTransporter, getAccountByUser } from '../../src/config/emailAccounts';
import { logEmail } from '../../src/utils/logger';

function parseCcList(cc) {
  if (!cc) return [];
  return cc
    .split(/[,\n;]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, cc, subject, body, senderEmail } = req.body;

    if (!customerEmail || !subject || !body) {
      return res.status(400).json({
        error: 'Missing required fields: customerEmail, subject, and body are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Invalid recipient email format' });
    }

    const ccList = parseCcList(cc);
    const invalidCc = ccList.find((email) => !emailRegex.test(email));
    if (invalidCc) {
      return res.status(400).json({ error: `Invalid CC email format: ${invalidCc}` });
    }

    let account = senderEmail ? getAccountByUser(senderEmail) : null;
    if (!account) account = getRandomAccount();

    const transporter = createTransporter(account);
    const info = await transporter.sendMail({
      from: `"DeelDepot" <${account.user}>`,
      to: customerEmail,
      cc: ccList.length ? ccList.join(', ') : undefined,
      subject,
      text: body,
    });

    await logEmail({
      templateName: 'Text Email',
      senderEmail: account.user,
      recipientEmail: customerEmail,
      recipientName: null,
      productName: subject,
      status: 'Success',
      payload: {
        customerEmail,
        cc: ccList,
        subject,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Text email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('[text-email] Error:', error);
    return res.status(500).json({
      error: 'Failed to send text email',
      details: error.message,
    });
  }
}
