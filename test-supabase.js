import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shhntfipwgmfxygxxfjj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoaG50Zmlwd2dtZnh5Z3h4ZmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY1NzgxMywiZXhwIjoyMDg4MjMzODEzfQ.txuLLS_v9qw_KcLCbzR1uDMue96Y1HVvO4t68Xs4u5Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing Supabase Insert...');
  const { error: insertError } = await supabase.from('sent_emails').insert([{
    type: 'Test',
    sender_email: 'test@deeldepot.com',
    recipient_email: 'customer@test.com',
    recipient_name: 'Test User',
    product_name: 'Test Product',
    status: 'Success'
  }]);

  if (insertError) {
    console.error('Insert Error:', insertError);
  } else {
    console.log('Insert Success!');
  }

  console.log('\nTesting Supabase Fetch...');
  const { data, error: fetchError } = await supabase.from('sent_emails').select('*').limit(5);
  
  if (fetchError) {
    console.error('Fetch Error:', fetchError);
  } else {
    console.log(`Fetch Success! Found ${data.length} records.`);
    console.log(data);
  }
}

testSupabase();
