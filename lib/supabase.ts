import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export function createSupabaseServerClient() {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: { persistSession: false },
    }
  );
}

export function createSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(
    supabaseUrl,
    serviceKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
