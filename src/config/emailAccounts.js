import nodemailer from 'nodemailer';

// Email Accounts Configuration
// Add as many accounts as you need here
const emailAccounts = [
  {
    user: 'deeldepot@gmail.com',
    pass: 'aoqy eizc zjsu npxv', // App Password
    provider: 'gmail',
    label: 'Gmail - deeldepot@gmail.com',
    fromEmail: 'deeldepot@gmail.com',
    fromName: 'DeelDepot',
  },
  {
    user: 'heydeeldepot@gmail.com',
    pass: 'ckph mgay vioy jswd', // App Password
    provider: 'gmail',
    label: 'Gmail - heydeeldepot@gmail.com',
    fromEmail: 'heydeeldepot@gmail.com',
    fromName: 'DeelDepot',
  },
  {
    user: 'a9501e001@smtp-brevo.com',
    pass: 'XR4GVaCMgkK9jpY6',
    provider: 'brevo',
    label: 'SMTP orders@deeldepot.com',
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    fromEmail: 'orders@deeldepot.com',
    fromName: 'DeelDepot Marketplace',
  },
];

/**
 * Selects a random email account from the configured list.
 * @returns {Object} An object containing user and pass.
 */
export function getRandomAccount() {
  const validAccounts = emailAccounts.filter(account =>
    account.user && account.pass &&
    !account.user.includes('example.com') &&
    !account.user.includes('another.email')
  );

  if (validAccounts.length === 0) {
    // Fallback to the first one even if it looks like a placeholder, 
    // or return null to handle error upstream
    console.warn('No valid email accounts found in configuration. Using default/first account.');
    return emailAccounts[0];
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
 * Returns a list available email accounts (user only, no passwords).
 * @returns {Array} Array of account objects with user property.
 */
export function getPublicAccounts() {
  return emailAccounts
    .filter(account => account.user && account.pass) // Only valid accounts
    .map(account => ({
      user: account.user,
      provider: account.provider || 'smtp',
      label: account.label || account.user,
      fromEmail: account.fromEmail || account.user,
    }));
}

/**
 * Retrieves a specific account by user email.
 * @param {string} email - The email address to look for.
 * @returns {Object|null} The account object or null if not found.
 */
export function getAccountByUser(email) {
  if (!email) return null;
  return emailAccounts.find(account => account.user === email) || null;
}

export function getSenderIdentity(account, fallbackName = 'DeelDepot') {
  return {
    fromEmail: account.fromEmail || account.user,
    fromName: account.fromName || fallbackName,
  };
}
