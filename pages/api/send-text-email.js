import { getRandomAccount, createTransporter, getAccountByUser, getSenderIdentity } from '../../src/config/emailAccounts';
import { logEmail } from '../../src/utils/logger';

function parseRecipientList(recipients) {
  if (!recipients) return [];
  return recipients
    .split(/[,\n;]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recipients, customerEmail: legacyCustomerEmail, cc, subject, body, senderEmail } = req.body;
    const normalizedRecipients = recipients || [legacyCustomerEmail, cc].filter(Boolean).join(', ');

    if (!normalizedRecipients || !subject || !body) {
      return res.status(400).json({
        error: 'Missing required fields: recipients, subject, and body are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipientList = parseRecipientList(normalizedRecipients);
    if (!recipientList.length) {
      return res.status(400).json({ error: 'At least one recipient email is required' });
    }
    const invalidRecipient = recipientList.find((email) => !emailRegex.test(email));
    if (invalidRecipient) {
      return res.status(400).json({ error: `Invalid recipient email format: ${invalidRecipient}` });
    }

    const customerEmail = recipientList[0];
    const ccList = recipientList.slice(1);

    let account = senderEmail ? getAccountByUser(senderEmail) : null;
    if (!account) account = getRandomAccount();

    const transporter = createTransporter(account);
    const senderIdentity = getSenderIdentity(account, 'DeelDepot');
    const info = await transporter.sendMail({
      from: `"${senderIdentity.fromName}" <${senderIdentity.fromEmail}>`,
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
        recipients: recipientList,
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
