import { supabase } from '../lib/supabase.js';

/**
 * Log a sent email to Supabase.
 * Falls back gracefully if Supabase is not configured.
 */
export const logEmail = async (emailData) => {
  if (!supabase) {
    console.warn('Supabase not configured — skipping email log.');
    return;
  }
  try {
    console.log('[logger] Attempting to log email:', emailData.type, emailData.recipientEmail);
    const { error } = await supabase.from('sent_emails').insert([{
      type: emailData.type,
      sender_email: emailData.senderEmail,
      recipient_email: emailData.recipientEmail,
      recipient_name: emailData.recipientName,
      product_name: emailData.productName,
      status: emailData.status || 'Success',
    }]);
    if (error) {
      console.error('[logger] Supabase insert error:', error.message);
    } else {
      console.log('[logger] Successfully inserted log into Supabase!');
    }
  } catch (err) {
    console.error('[logger] Failed to log email to Supabase:', err);
  }
};

/**
 * Retrieve sent email logs from Supabase.
 * Optionally filter by sender email.
 */
export const getLogs = async (senderEmail = null) => {
  if (!supabase) return [];
  try {
    let query = supabase
      .from('sent_emails')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (senderEmail) {
      query = query.eq('sender_email', senderEmail);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase fetch error:', error.message);
      return [];
    }
    // Normalize column names to match what the frontend expects
    return (data || []).map(row => ({
      id: row.id,
      type: row.type,
      senderEmail: row.sender_email,
      recipientEmail: row.recipient_email,
      recipientName: row.recipient_name,
      productName: row.product_name,
      status: row.status,
      timestamp: row.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch logs from Supabase:', err);
    return [];
  }
};
