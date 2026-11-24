import { createClient } from '@supabase/supabase-js';

// Read public environment variables for client-side usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase URL or Anon Key is missing in environment variables. Please check your .env.local file.'
  );
}

// Client for browser and standard API interactions
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
