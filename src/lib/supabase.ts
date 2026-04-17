import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || (typeof supabaseUrl === 'string' && supabaseUrl.includes('placeholder'))) {
  console.warn('Supabase URL or Anon Key is missing or using placeholder. Auth will not work.');
}

// Ensure URL is a string for createClient to avoid crash
const safeUrl = (typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http')) 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co';
const safeKey = (typeof supabaseAnonKey === 'string') 
  ? supabaseAnonKey 
  : 'placeholder';

export const supabase = createClient(safeUrl, safeKey);
