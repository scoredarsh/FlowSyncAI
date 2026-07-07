/**
 * FlowSync AI — Supabase Client
 * Initializes and exports the Supabase client instance.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[FlowSync] Missing Supabase env vars. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
