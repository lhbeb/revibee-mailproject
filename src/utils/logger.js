import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'data', 'sent-emails.json');

export const logEmail = (emailData) => {
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      const fileContent = fs.readFileSync(LOG_FILE, 'utf8');
      if (fileContent) {
        logs = JSON.parse(fileContent);
      }
    }

    logs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      ...emailData,
      timestamp: new Date().toISOString()
    });

    // Keep only the last 1000 emails to prevent infinite growth
    if (logs.length > 1000) {
      logs = logs.slice(0, 1000);
    }

    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Failed to log email:', err);
  }
};

export const getLogs = () => {
  try {
    if (!fs.existsSync(LOG_FILE)) return [];
    const fileContent = fs.readFileSync(LOG_FILE, 'utf8');
    if (!fileContent) return [];
    return JSON.parse(fileContent);
  } catch (err) {
    console.error('Failed to read logs:', err);
    return [];
  }
};
