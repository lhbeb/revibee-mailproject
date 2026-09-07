/**
 * Multi-Website Configuration Registry
 * Defines brand identities, domains, support contacts, theme palettes,
 * local pickup information, and website-scoped email accounts.
 */

export const WEBSITES = {
  casoodo: {
    id: 'casoodo',
    name: 'Casoodo',
    shortName: 'Casoodo',
    domain: 'https://www.casoodo.com',
    tagline: 'Premium Pre-Owned Technology & Marketplace',
    supportEmail: 'contactcasoodo@gmail.com',
    supportPhone: '+1 318 657 4299',
    badge: 'Casoodo',
    colors: {
      primary: '#003099',
      accent: '#FFFBB6',
      bgLight: '#F0F6FF',
      textDark: '#070B17',
      cardBorder: '#DCE5F5',
    },
    links: {
      home: 'https://www.casoodo.com',
      contact: 'https://www.casoodo.com/contact',
      track: 'https://www.casoodo.com/track',
      returns: 'https://www.casoodo.com/return-policy',
      terms: 'https://www.casoodo.com/terms-of-service',
      privacy: 'https://www.casoodo.com/privacy-policy',
    },
    localPickup: {
      enabled: true,
      warehouseName: 'Casoodo Warehouse',
      addressLines: [
        '415 Codoni Ave',
        'Modesto, CA 95357',
        'USA'
      ],
      hoursLines: [
        'Mon - Fri: 9:00 AM - 5:00 PM EST',
        'Saturday: 10:00 AM - 3:00 PM EST',
        'Sunday: Closed'
      ],
      phone: '+1 318 657 4299',
    },
    emailAccounts: [
      {
        user: 'contactcasoodo@gmail.com',
        pass: 'bumw tyas vcea uvqg',
        provider: 'gmail',
        label: 'Gmail - contactcasoodo@gmail.com',
        fromEmail: 'contactcasoodo@gmail.com',
        fromName: 'Casoodo',
        website: 'casoodo',
        active: true,
      },
      {
        user: 'a9501e001@smtp-brevo.com',
        pass: 'XR4GVaCMgkK9jpY6',
        provider: 'brevo',
        label: 'SMTP - Orders Inbox',
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        fromEmail: 'orders@deeldepot.com',
        fromName: 'Casoodo Marketplace',
        website: 'casoodo',
        active: false,
      },
    ],
  },
  bricoc: {
    id: 'bricoc',
    name: 'Bricoc',
    shortName: 'Bricoc',
    domain: 'https://www.bricoc.com',
    tagline: 'Premium Tools, Heavy Equipment & Supplies',
    supportEmail: 'contact@bricoc.com',
    supportPhone: '+1 912 923 1747',
    badge: 'Bricoc',
    colors: {
      primary: '#233F31',
      accent: '#F59E0B',
      bgLight: '#F8FAFC',
      textDark: '#0F172A',
      cardBorder: '#E2E8F0',
    },
    links: {
      home: 'https://www.bricoc.com',
      contact: 'https://www.bricoc.com/contact',
      track: 'https://www.bricoc.com/track',
      returns: 'https://www.bricoc.com/return-policy',
      terms: 'https://www.bricoc.com/terms',
      privacy: 'https://www.bricoc.com/privacy-policy',
    },
    localPickup: {
      enabled: true,
      warehouseName: 'Bricoc Pickup Location',
      addressLines: [
        '1731 Matthews Ave APT 4A',
        'Bronx, New York 10462',
        'United States'
      ],
      hoursLines: [
        'Mon - Fri: 9:00 AM - 5:00 PM EST',
        'Pickup timing confirmed upon order preparation',
        'Appointment required'
      ],
      phone: '+1 912 923 1747',
    },
    emailAccounts: [
      {
        user: 'arvaradodotcom@gmail.com',
        pass: 'iwar xzav utnb bxyw',
        provider: 'gmail',
        label: 'Gmail - arvaradodotcom@gmail.com',
        fromEmail: 'arvaradodotcom@gmail.com',
        fromName: 'Bricoc Support',
        website: 'bricoc',
        active: true,
      },
    ],
  },
};

export const DEFAULT_WEBSITE_ID = 'casoodo';

/**
 * Get website config by ID, falling back to default.
 */
export function getWebsite(websiteId) {
  const normalized = (websiteId || '').toLowerCase().trim();
  return WEBSITES[normalized] || WEBSITES[DEFAULT_WEBSITE_ID];
}

/**
 * Get list of all available websites.
 */
export function getAllWebsites() {
  return Object.values(WEBSITES).map(site => ({
    id: site.id,
    name: site.name,
    domain: site.domain,
    tagline: site.tagline,
    supportEmail: site.supportEmail,
    colors: site.colors,
    badge: site.badge,
    accountCount: site.emailAccounts.filter(a => a.active !== false).length,
  }));
}
