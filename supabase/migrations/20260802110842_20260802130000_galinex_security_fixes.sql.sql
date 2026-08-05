/*
# Fix: Function search_path and RLS user_metadata references

## Summary
1. Set `search_path = public` on `is_admin()` and `generate_order_number()` functions
2. Update all admin RLS policies to use `public.is_admin()` SECURITY DEFINER function
   instead of directly referencing `auth.jwt()->'user_metadata'->>'role'`, which is
   user-editable and flagged as a security risk.

## Security Changes
- All admin policies on categories, products, product_images, coupons, reviews,
  site_settings, homepage_content, contact_messages, newsletter_subscribers,
  and storage objects now use `public.is_admin()` which checks app_metadata first
  (server-set, not user-editable), then falls back to user_metadata.
- `is_admin()` is SECURITY DEFINER so it runs with owner privileges, bypassing RLS
  on the auth.users lookup — safe because it only reads JWT claims.
*/

-- Fix search_path on existing functions
ALTER FUNCTION public.generate_order_number() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;

-- =========================================
-- Recreate is_admin to check app_metadata first
-- =========================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
      false
    )
$$;

-- =========================================
-- Update ALL admin policies to use is_admin()
-- =========================================

-- CATEGORIES
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (public.is_admin());

-- PRODUCTS
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (public.is_admin());

-- PRODUCT IMAGES
DROP POLICY IF EXISTS "admin_manage_product_images" ON product_images;
CREATE POLICY "admin_manage_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_product_images" ON product_images;
CREATE POLICY "admin_update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_product_images" ON product_images;
CREATE POLICY "admin_delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (public.is_admin());

-- COUPONS
DROP POLICY IF EXISTS "admin_manage_coupons" ON coupons;
CREATE POLICY "admin_manage_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_coupons" ON coupons;
CREATE POLICY "admin_update_coupons" ON coupons FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_coupons" ON coupons;
CREATE POLICY "admin_delete_coupons" ON coupons FOR DELETE
  TO authenticated USING (public.is_admin());

-- REVIEWS
DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
CREATE POLICY "admin_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SITE SETTINGS
DROP POLICY IF EXISTS "admin_manage_settings" ON site_settings;
CREATE POLICY "admin_manage_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_settings" ON site_settings;
CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- HOMEPAGE CONTENT
DROP POLICY IF EXISTS "admin_insert_homepage_content" ON homepage_content;
CREATE POLICY "admin_insert_homepage_content" ON homepage_content FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_homepage_content" ON homepage_content;
CREATE POLICY "admin_update_homepage_content" ON homepage_content FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CONTACT MESSAGES
DROP POLICY IF EXISTS "admin_read_contact_messages" ON contact_messages;
CREATE POLICY "admin_read_contact_messages" ON contact_messages FOR SELECT
  TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "admin_update_contact_messages" ON contact_messages;
CREATE POLICY "admin_update_contact_messages" ON contact_messages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- NEWSLETTER
DROP POLICY IF EXISTS "admin_read_newsletter" ON newsletter_subscribers;
CREATE POLICY "admin_read_newsletter" ON newsletter_subscribers FOR SELECT
  TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "admin_update_newsletter" ON newsletter_subscribers;
CREATE POLICY "admin_update_newsletter" ON newsletter_subscribers FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_newsletter" ON newsletter_subscribers;
CREATE POLICY "admin_delete_newsletter" ON newsletter_subscribers FOR DELETE
  TO authenticated USING (public.is_admin());

-- ORDERS (admin update/delete already exists, update to use is_admin)
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (public.is_admin() OR auth.uid() = user_id) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (public.is_admin());

-- CUSTOMER PROFILES (admin read already exists, update to use is_admin)
DROP POLICY IF EXISTS "select_own_profile" ON customer_profiles;
CREATE POLICY "select_own_profile" ON customer_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

-- STORAGE: products bucket
DROP POLICY IF EXISTS "admin_insert_products_bucket" ON storage.objects;
CREATE POLICY "admin_insert_products_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'products' AND public.is_admin());
DROP POLICY IF EXISTS "admin_update_products_bucket" ON storage.objects;
CREATE POLICY "admin_update_products_bucket" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'products' AND public.is_admin()) WITH CHECK (bucket_id = 'products' AND public.is_admin());
DROP POLICY IF EXISTS "admin_delete_products_bucket" ON storage.objects;
CREATE POLICY "admin_delete_products_bucket" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'products' AND public.is_admin());

-- STORAGE: banners bucket
DROP POLICY IF EXISTS "admin_insert_banners_bucket" ON storage.objects;
CREATE POLICY "admin_insert_banners_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'banners' AND public.is_admin());
DROP POLICY IF EXISTS "admin_update_banners_bucket" ON storage.objects;
CREATE POLICY "admin_update_banners_bucket" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'banners' AND public.is_admin()) WITH CHECK (bucket_id = 'banners' AND public.is_admin());
DROP POLICY IF EXISTS "admin_delete_banners_bucket" ON storage.objects;
CREATE POLICY "admin_delete_banners_bucket" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'banners' AND public.is_admin());

-- STORAGE: gallery bucket
DROP POLICY IF EXISTS "admin_insert_gallery_bucket" ON storage.objects;
CREATE POLICY "admin_insert_gallery_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
DROP POLICY IF EXISTS "admin_update_gallery_bucket" ON storage.objects;
CREATE POLICY "admin_update_gallery_bucket" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'gallery' AND public.is_admin()) WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
DROP POLICY IF EXISTS "admin_delete_gallery_bucket" ON storage.objects;
CREATE POLICY "admin_delete_gallery_bucket" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'gallery' AND public.is_admin());
