import nodemailer from 'nodemailer';
import { WEBSITES, DEFAULT_WEBSITE_ID, getWebsite, getAllWebsites } from './websites.js';

export { getWebsite, getAllWebsites };

/**
 * Returns all email accounts flattened across all websites, or for a specific website.
 */
export function getEmailAccounts(websiteId = null) {
  if (websiteId) {
    const site = getWebsite(websiteId);
    return site.emailAccounts || [];
  }
  return Object.values(WEBSITES).flatMap(site => site.emailAccounts || []);
}

/**
 * Selects an email account from the configured list for a website.
 * @param {string} [websiteId]
 * @returns {Object} Account object.
 */
export function getRandomAccount(websiteId = null) {
  const accounts = getEmailAccounts(websiteId);
  const validAccounts = accounts.filter(account =>
    account.active !== false &&
    account.user && account.pass &&
    !account.user.includes('example.com') &&
    !account.user.includes('another.email')
  );

  if (validAccounts.length === 0) {
    // If filtering by website had no active accounts, fallback to any valid account
    const fallbackAll = getEmailAccounts(null).filter(a => a.active !== false && a.user && a.pass);
    if (fallbackAll.length > 0) return fallbackAll[0];
    return accounts[0] || null;
  }

  const randomIndex = Math.floor(Math.random() * validAccounts.length);
  return validAccounts[randomIndex];
}

/**
 * Creates a Nodemailer transporter for a specific account.
 * @param {Object} account - The account object with user and pass.
 * @returns {Object} Nodemailer transporter.
 */
export function createTransporter(account) {
  if (!account) {
    throw new Error('Cannot create transporter: No account provided');
  }

  if (account.provider === 'gmail' || (!account.host && account.user.includes('@gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: account.user,
        pass: account.pass,
      },
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return nodemailer.createTransport({
    host: account.host || 'smtp.gmail.com',
    port: account.port || 465,
    secure: typeof account.secure === 'boolean' ? account.secure : true,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
}

/**
 * Returns public accounts (without passwords), optionally filtered by website.
 * @param {string} [websiteId]
 * @returns {Array} Array of account objects with public properties.
 */
export function getPublicAccounts(websiteId = null) {
  const accounts = getEmailAccounts(websiteId);
  return accounts
    .filter(account => account.active !== false && account.user && account.pass)
    .map(account => ({
      user: account.user,
      provider: account.provider || 'smtp',
      label: account.label || account.user,
      fromEmail: account.fromEmail || account.user,
      fromName: account.fromName || account.website || 'Support',
      website: account.website || websiteId || 'casoodo',
    }));
}

/**
 * Retrieves a specific account by user email and optional website.
 * @param {string} email - The email address to look for.
 * @param {string} [websiteId] - Optional website constraint.
 * @returns {Object|null}
 */
export function getAccountByUser(email, websiteId = null) {
  if (!email) return null;
  const accounts = getEmailAccounts(websiteId);
  const found = accounts.find(account => account.user.toLowerCase() === email.toLowerCase() && account.active !== false);
  if (found) return found;

  // Fallback check across all accounts
  return getEmailAccounts(null).find(account => account.user.toLowerCase() === email.toLowerCase() && account.active !== false) || null;
}

/**
 * Get sender identity with brand-awareness.
 */
export function getSenderIdentity(account, websiteId = null, fallbackName = null) {
  const brand = getWebsite(websiteId || account?.website);
  const defaultName = fallbackName || brand.name || 'Support';

  return {
    fromEmail: account?.fromEmail || account?.user || brand.supportEmail,
    fromName: account?.fromName || defaultName,
    website: brand.id,
    brand,
  };
}
