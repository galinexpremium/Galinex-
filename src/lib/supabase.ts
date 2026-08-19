import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const WHATSAPP_NUMBER = '919360482480';
export const BRAND_NAME = 'GALINEX';
export const BRAND_PHONE = '+91 93604 82480';
export const BRAND_EMAIL = 'support@galinex.com';
export const BRAND_INSTAGRAM = 'https://instagram.com/galinex_premium';
export const BRAND_ADDRESS = 'Pan India Delivery';
export const BUSINESS_HOURS = 'Monday to Saturday: 9:30 AM - 8:00 PM | Sunday: 10:00 AM - 5:00 PM';
