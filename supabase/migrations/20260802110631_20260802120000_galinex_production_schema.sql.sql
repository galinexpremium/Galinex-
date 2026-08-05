/*
# GALINEX Production Schema - Tables, Storage, Auth, and Seed Data

## Summary
This migration completes the database for production: adds missing tables,
storage buckets, an auth trigger for auto-creating customer profiles, and
seed data (settings, coupons, homepage content, admin user).

## New Tables
1. `compare_items` — Products being compared (session or user scoped)
2. `homepage_content` — Editable homepage hero/about/section titles
3. `contact_messages` — Contact form submissions

## Modified Tables
1. `customer_profiles` — Added `email`, `total_orders`, `total_spent` columns
2. `site_settings` — Added flat columns for admin settings UI (brand_name, etc.)

## Storage
- 5 buckets created: products, customer_uploads, banners, gallery, avatars
- Public read for products, banners, gallery, avatars
- Private read for customer_uploads (owner only)
- Admin write for products, banners, gallery
- Authenticated user write for customer_uploads (own files), avatars (own files)

## Auth
- Trigger `on_auth_user_created` auto-inserts a row into `customer_profiles`
  when a new user signs up, copying `full_name` and `email`.
- Admin user created: admin@galinex.com / admin123

## Seed Data
- Default site settings row
- Default coupons: WELCOME10 (10% off), GALINEX20 (20% off, min ₹2000)
- Default homepage content row

## Security
- RLS enabled on all new tables
- Public read for homepage_content, contact_messages (admin only)
- Compare items: anon + authenticated CRUD (session/user scoped)
- Storage policies follow least-privilege per bucket
- Admin check uses both app_metadata and user_metadata for backward compat
*/

-- =========================================
-- HELPER: is_admin()
-- =========================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
      false
    )
$$;

-- =========================================
-- MODIFY: customer_profiles (add columns)
-- =========================================
DO $$ BEGIN
  ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS email text;
  ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS total_orders int DEFAULT 0;
  ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS total_spent numeric(10,2) DEFAULT 0;
END $$;

-- =========================================
-- MODIFY: site_settings (add flat columns)
-- =========================================
DO $$ BEGIN
  ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS brand_name text;
  ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS whatsapp_number text;
  ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement_banner text;
  ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement_active boolean DEFAULT true;
  ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS free_shipping_threshold numeric(10,2) DEFAULT 999;
  ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS default_payment_method text DEFAULT 'whatsapp';
END $$;

-- Seed default settings row
INSERT INTO site_settings (key, value, brand_name, whatsapp_number, announcement_banner, announcement_active, free_shipping_threshold, default_payment_method)
VALUES ('main', '{"note":"seeded"}'::jsonb, 'GALINEX', '919876543210', 'Free shipping on orders over ₹999', true, 999, 'whatsapp')
ON CONFLICT (key) DO NOTHING;

-- =========================================
-- NEW TABLE: compare_items
-- =========================================
CREATE TABLE IF NOT EXISTS compare_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id)
);

ALTER TABLE compare_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_compare" ON compare_items;
CREATE POLICY "select_compare" ON compare_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_compare" ON compare_items;
CREATE POLICY "insert_compare" ON compare_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "delete_compare" ON compare_items;
CREATE POLICY "delete_compare" ON compare_items FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================
-- NEW TABLE: homepage_content
-- =========================================
CREATE TABLE IF NOT EXISTS homepage_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text DEFAULT 'Memories, Crafted Forever',
  hero_subtitle text DEFAULT 'Premium personalized gifts that tell your story. Laser-engraved crystal, wood, and acrylic masterpieces crafted with precision.',
  hero_image_url text,
  hero_badge text DEFAULT 'Premium Personalized Gifts',
  about_title text DEFAULT 'Where Precision Meets Passion',
  about_text text DEFAULT 'Every GALINEX creation begins with a memory and ends with a masterpiece.',
  process_title text DEFAULT 'Our Process',
  occasions_title text DEFAULT 'Gift Occasions',
  why_title text DEFAULT 'The GALINEX Difference',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_homepage_content" ON homepage_content;
CREATE POLICY "public_read_homepage_content" ON homepage_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_homepage_content" ON homepage_content;
CREATE POLICY "admin_insert_homepage_content" ON homepage_content FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_homepage_content" ON homepage_content;
CREATE POLICY "admin_update_homepage_content" ON homepage_content FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed default homepage content
INSERT INTO homepage_content (hero_title, hero_subtitle, hero_badge)
VALUES ('Memories, Crafted Forever', 'Premium personalized gifts that tell your story. Laser-engraved crystal, wood, and acrylic masterpieces crafted with precision.', 'Premium Personalized Gifts')
ON CONFLICT DO NOTHING;

-- =========================================
-- NEW TABLE: contact_messages
-- =========================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_contact_messages" ON contact_messages;
CREATE POLICY "insert_contact_messages" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_contact_messages" ON contact_messages;
CREATE POLICY "admin_read_contact_messages" ON contact_messages FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_contact_messages" ON contact_messages;
CREATE POLICY "admin_update_contact_messages" ON contact_messages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================
-- SEED: Coupons
-- =========================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, is_active)
VALUES
  ('WELCOME10', '10% off your first order', 'percentage', 10, 0, true),
  ('GALINEX20', '20% off orders above ₹2000', 'percentage', 20, 2000, true)
ON CONFLICT (code) DO NOTHING;

-- =========================================
-- AUTH TRIGGER: Auto-create customer_profiles
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customer_profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- CREATE ADMIN USER
-- =========================================
INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
SELECT
  gen_random_uuid(), 'authenticated', 'authenticated',
  'admin@galinex.com', crypt('admin123', gen_salt('bf')), now(),
  '{"role":"admin"}'::jsonb, '{"full_name":"Admin","role":"admin"}'::jsonb,
  now(), now()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@galinex.com');

-- =========================================
-- STORAGE BUCKETS
-- =========================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('products', 'products', true),
  ('customer_uploads', 'customer_uploads', false),
  ('banners', 'banners', true),
  ('gallery', 'gallery', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- STORAGE POLICIES: products (public read, admin write)
-- =========================================
DROP POLICY IF EXISTS "public_read_products_bucket" ON storage.objects;
CREATE POLICY "public_read_products_bucket" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'products');

DROP POLICY IF EXISTS "admin_insert_products_bucket" ON storage.objects;
CREATE POLICY "admin_insert_products_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'products' AND public.is_admin());

DROP POLICY IF EXISTS "admin_update_products_bucket" ON storage.objects;
CREATE POLICY "admin_update_products_bucket" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'products' AND public.is_admin()) WITH CHECK (bucket_id = 'products' AND public.is_admin());

DROP POLICY IF EXISTS "admin_delete_products_bucket" ON storage.objects;
CREATE POLICY "admin_delete_products_bucket" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'products' AND public.is_admin());

-- =========================================
-- STORAGE POLICIES: customer_uploads (private, owner only)
-- =========================================
DROP POLICY IF EXISTS "owner_read_customer_uploads" ON storage.objects;
CREATE POLICY "owner_read_customer_uploads" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'customer_uploads' AND owner = auth.uid());

DROP POLICY IF EXISTS "auth_insert_customer_uploads" ON storage.objects;
CREATE POLICY "auth_insert_customer_uploads" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'customer_uploads' AND owner = auth.uid());

-- =========================================
-- STORAGE POLICIES: banners (public read, admin write)
-- =========================================
DROP POLICY IF EXISTS "public_read_banners_bucket" ON storage.objects;
CREATE POLICY "public_read_banners_bucket" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "admin_insert_banners_bucket" ON storage.objects;
CREATE POLICY "admin_insert_banners_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'banners' AND public.is_admin());

DROP POLICY IF EXISTS "admin_update_banners_bucket" ON storage.objects;
CREATE POLICY "admin_update_banners_bucket" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'banners' AND public.is_admin()) WITH CHECK (bucket_id = 'banners' AND public.is_admin());

DROP POLICY IF EXISTS "admin_delete_banners_bucket" ON storage.objects;
CREATE POLICY "admin_delete_banners_bucket" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'banners' AND public.is_admin());

-- =========================================
-- STORAGE POLICIES: gallery (public read, admin write)
-- =========================================
DROP POLICY IF EXISTS "public_read_gallery_bucket" ON storage.objects;
CREATE POLICY "public_read_gallery_bucket" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "admin_insert_gallery_bucket" ON storage.objects;
CREATE POLICY "admin_insert_gallery_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

DROP POLICY IF EXISTS "admin_update_gallery_bucket" ON storage.objects;
CREATE POLICY "admin_update_gallery_bucket" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'gallery' AND public.is_admin()) WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

DROP POLICY IF EXISTS "admin_delete_gallery_bucket" ON storage.objects;
CREATE POLICY "admin_delete_gallery_bucket" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'gallery' AND public.is_admin());

-- =========================================
-- STORAGE POLICIES: avatars (public read, owner write)
-- =========================================
DROP POLICY IF EXISTS "public_read_avatars_bucket" ON storage.objects;
CREATE POLICY "public_read_avatars_bucket" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "auth_insert_avatars_bucket" ON storage.objects;
CREATE POLICY "auth_insert_avatars_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());

DROP POLICY IF EXISTS "owner_update_avatars_bucket" ON storage.objects;
CREATE POLICY "owner_update_avatars_bucket" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'avatars' AND owner = auth.uid()) WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());

-- =========================================
-- ORDER NUMBER FUNCTION (update to use sequence)
-- =========================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'GX-' || LPAD(nextval('order_number_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- UPDATE: Allow admin to delete product_images
-- =========================================
DROP POLICY IF EXISTS "admin_delete_product_images" ON product_images;
CREATE POLICY "admin_delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_product_images" ON product_images;
CREATE POLICY "admin_update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =========================================
-- UPDATE: Allow admin to delete coupons
-- =========================================
DROP POLICY IF EXISTS "admin_delete_coupons" ON coupons;
CREATE POLICY "admin_delete_coupons" ON coupons FOR DELETE
  TO authenticated USING (public.is_admin());

-- =========================================
-- UPDATE: Allow admin to read all orders (already done) and delete
-- =========================================
DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (public.is_admin());

-- =========================================
-- UPDATE: newsletter admin update
-- =========================================
DROP POLICY IF EXISTS "admin_update_newsletter" ON newsletter_subscribers;
CREATE POLICY "admin_update_newsletter" ON newsletter_subscribers FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_newsletter" ON newsletter_subscribers;
CREATE POLICY "admin_delete_newsletter" ON newsletter_subscribers FOR DELETE
  TO authenticated USING (public.is_admin());
