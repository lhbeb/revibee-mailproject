import { getPublicAccounts, getAllWebsites, getWebsite } from '../../src/config/emailAccounts';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const websiteQuery = req.query.website ? String(req.query.website) : null;
    const websites = getAllWebsites();
    const accounts = getPublicAccounts(websiteQuery);
    const activeWebsite = websiteQuery ? getWebsite(websiteQuery) : null;

    res.status(200).json({
      success: true,
      accounts,
      websites,
      website: activeWebsite ? activeWebsite.id : null,
    });
  } catch (error) {
    console.error('Error fetching email accounts:', error);
    res.status(500).json({ error: 'Failed to fetch email accounts' });
  }
}
