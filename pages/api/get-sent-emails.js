import { getLogs } from '../../src/utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { senderEmail } = req.query;
    let logs = getLogs();

    // Filter by sender email if provided
    if (senderEmail) {
      logs = logs.filter(log => log.senderEmail === senderEmail);
    }

    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
}
