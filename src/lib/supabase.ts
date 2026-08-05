import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const WHATSAPP_NUMBER = '919876543210';
export const BRAND_NAME = 'GALINEX';
export const BRAND_PHONE = '+91 98765 43210';
export const BRAND_EMAIL = 'hello@galinex.com';
export const BRAND_INSTAGRAM = 'https://instagram.com/galinex';
export const BRAND_ADDRESS = '123 Craft Street, Mumbai, Maharashtra 400001, India';
export const BUSINESS_HOURS = 'Monday to Saturday: 10 AM - 7 PM | Sunday: Closed';
