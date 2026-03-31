import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgkvrbdpmwyfjvpubzxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna3ZyYmRwbXd5Zmp2cHVienhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI1MTE2NiwiZXhwIjoyMDgwODI3MTY2fQ.HO_h1CPfqO9SngFyuGTQIns6ZcrJ6ULpKCbOEdSxezs';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase env vars missing. Email logging will be disabled.');
}

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;
