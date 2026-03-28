import { createClient } from '@supabase/supabase-js';

/**
 * Create a fresh Supabase client per invocation.
 * This is critical for Vercel serverless — module-level singletons can be
 * cached in a broken state if env vars weren't resolved at import time.
 */
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.warn('[logger] ⚠️  Supabase env vars missing — email log skipped.');
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false }
  });
}

/**
 * Log a sent email to Supabase.
 * Falls back gracefully if Supabase is not configured.
 */
export const logEmail = async (emailData) => {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    console.log('[logger] Logging email:', emailData.type, emailData.recipientEmail);
    const { error } = await client.from('sent_emails').insert([{
      type: emailData.type,
      sender_email: emailData.senderEmail,
      recipient_email: emailData.recipientEmail,
      recipient_name: emailData.recipientName,
      product_name: emailData.productName,
      status: emailData.status || 'Success',
      payload: emailData.payload || null,
    }]);
    if (error) {
      console.error('[logger] Supabase insert error:', error.message, JSON.stringify(error));
    } else {
      console.log('[logger] ✅ Email log inserted successfully.');
    }
  } catch (err) {
    console.error('[logger] Unexpected error inserting log:', err);
  }
};

/**
 * Retrieve sent email logs from Supabase.
 */
export const getLogs = async (senderEmail = null) => {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    let query = client
      .from('sent_emails')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (senderEmail) {
      query = query.eq('sender_email', senderEmail);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[logger] Supabase fetch error:', error.message);
      return [];
    }
    return (data || []).map(row => ({
      id: row.id,
      type: row.type,
      senderEmail: row.sender_email,
      recipientEmail: row.recipient_email,
      recipientName: row.recipient_name,
      productName: row.product_name,
      status: row.status,
      timestamp: row.created_at,
      payload: row.payload,
    }));
  } catch (err) {
    console.error('[logger] Fetch failed:', err);
    return [];
  }
};
