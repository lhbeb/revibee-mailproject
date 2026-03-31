/**
 * Next.js Instrumentation Hook
 * Runs ONCE on server startup (not on every request).
 * Used here for a Supabase DB health check so you can confirm
 * connectivity immediately in the server logs.
 */
export async function register() {
  // Only run in the Node.js runtime (not in the Edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const url = 'https://fgkvrbdpmwyfjvpubzxn.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI1MTE2NiwiZXhwIjoyMDgwODI3MTY2fQ.HO_h1CPfqO9SngFyuGTQIns6ZcrJ6ULpKCbOEdSxezs';

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🔍  DB HEALTH CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!url || !key) {
      console.error('  ❌  SUPABASE_URL or SUPABASE_SERVICE_KEY is missing from .env');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    console.log(`  📡  URL   : ${url}`);
    console.log(`  🔑  Key   : ${key.slice(0, 20)}...`);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(url, key, { auth: { persistSession: false } });

      // Ping the sent_emails table — if it exists and is reachable, count returns
      const { count, error } = await supabase
        .from('sent_emails')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`  ❌  DB ERROR : ${error.message}`);
        if (error.message.includes('does not exist')) {
          console.warn('  ⚠️   Table "sent_emails" not found — run the CREATE TABLE SQL in Supabase.');
        }
      } else {
        console.log(`  ✅  Connected — sent_emails has ${count ?? 0} rows`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ❌  Unexpected error : ${message}`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}
