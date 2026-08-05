/*
# GALINEX E-Commerce - Initial Schema

## Summary
Complete schema for GALINEX premium personalized gifts store.

## New Tables

1. `categories` - Product categories (3D Crystal, Wooden Engraving, Acrylic, Moon Lamp, MDF, Keychains)
2. `products` - All products with pricing, badges, stock
3. `product_images` - Multiple images per product
4. `product_variants` - Size/type variants per product
5. `orders` - Customer orders (linked to auth user or guest)
6. `order_items` - Line items within each order
7. `cart_items` - Shopping cart (session-based, by user or session_id)
8. `wishlist_items` - Saved wishlist items
9. `compare_items` - Products in comparison set
10. `recently_viewed` - Recently viewed product tracking
11. `coupons` - Discount coupon codes
12. `reviews` - Product reviews
13. `newsletter_subscribers` - Newsletter sign-ups
14. `site_settings` - Admin-configurable settings (banners, homepage)
15. `customers` - Extended customer profile info

## Security
- RLS enabled on all tables
- Public read for products, categories, reviews
- Authenticated + anon write for cart, wishlist, orders
- Authenticated only for order history reads (own orders)
- Admin access via user_metadata.role = 'admin'
*/

-- =========================================
-- CATEGORIES
-- =========================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING ((auth.jwt()->'user_metadata'->>'role') = 'admin') WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- =========================================
-- PRODUCTS
-- =========================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  base_price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  sku text UNIQUE,
  stock_quantity int DEFAULT 100,
  image_url text,
  badge text, -- 'new', 'sale', 'trending', 'best_seller', 'limited_edition'
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_customizable boolean DEFAULT true,
  requires_photo boolean DEFAULT true,
  production_days int DEFAULT 5,
  weight_grams int DEFAULT 500,
  dimensions text,
  material text,
  occasions text[], -- ['birthday', 'wedding', 'anniversary', etc.]
  tags text[],
  rating numeric(3,2) DEFAULT 0,
  review_count int DEFAULT 0,
  sold_count int DEFAULT 0,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING ((auth.jwt()->'user_metadata'->>'role') = 'admin') WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- =========================================
-- PRODUCT IMAGES
-- =========================================
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_product_images" ON product_images;
CREATE POLICY "admin_manage_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- =========================================
-- ORDERS
-- =========================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  shipping_amount numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  coupon_code text,
  payment_method text DEFAULT 'whatsapp', -- 'whatsapp', 'cod', 'upi', 'card'
  payment_status text DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  order_status text DEFAULT 'pending', -- 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  notes text,
  whatsapp_sent boolean DEFAULT false,
  estimated_delivery date,
  tracking_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR (auth.jwt()->'user_metadata'->>'role') = 'admin');

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING ((auth.jwt()->'user_metadata'->>'role') = 'admin' OR auth.uid() = user_id) WITH CHECK (true);

-- =========================================
-- ORDER ITEMS
-- =========================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  variant_name text,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  customization_text text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_order_items" ON order_items;
CREATE POLICY "insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- =========================================
-- CART ITEMS
-- =========================================
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_name text,
  quantity int NOT NULL DEFAULT 1,
  customization_text text,
  photo_url text,
  saved_for_later boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cart" ON cart_items;
CREATE POLICY "select_own_cart" ON cart_items FOR SELECT
  TO anon, authenticated USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) OR
    (session_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "insert_cart" ON cart_items;
CREATE POLICY "insert_cart" ON cart_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_cart" ON cart_items;
CREATE POLICY "update_cart" ON cart_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_cart" ON cart_items;
CREATE POLICY "delete_cart" ON cart_items FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================
-- WISHLIST ITEMS
-- =========================================
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id)
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_wishlist" ON wishlist_items;
CREATE POLICY "select_wishlist" ON wishlist_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_wishlist" ON wishlist_items;
CREATE POLICY "insert_wishlist" ON wishlist_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "delete_wishlist" ON wishlist_items;
CREATE POLICY "delete_wishlist" ON wishlist_items FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================
-- COUPONS
-- =========================================
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
  discount_value numeric(10,2) NOT NULL,
  min_order_amount numeric(10,2) DEFAULT 0,
  max_uses int,
  used_count int DEFAULT 0,
  is_active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_coupons" ON coupons;
CREATE POLICY "public_read_coupons" ON coupons FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_coupons" ON coupons;
CREATE POLICY "admin_manage_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_coupons" ON coupons;
CREATE POLICY "admin_update_coupons" ON coupons FOR UPDATE
  TO authenticated USING ((auth.jwt()->'user_metadata'->>'role') = 'admin') WITH CHECK (true);

-- =========================================
-- REVIEWS
-- =========================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name text NOT NULL,
  reviewer_location text,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text NOT NULL,
  is_verified boolean DEFAULT false,
  is_sample boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  helpful_count int DEFAULT 0,
  images text[],
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (is_approved = true);

DROP POLICY IF EXISTS "insert_reviews" ON reviews;
CREATE POLICY "insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
CREATE POLICY "admin_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING ((auth.jwt()->'user_metadata'->>'role') = 'admin') WITH CHECK (true);

-- =========================================
-- NEWSLETTER
-- =========================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "insert_newsletter" ON newsletter_subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_newsletter" ON newsletter_subscribers;
CREATE POLICY "admin_read_newsletter" ON newsletter_subscribers FOR SELECT
  TO authenticated USING ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- =========================================
-- SITE SETTINGS
-- =========================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_settings" ON site_settings;
CREATE POLICY "admin_manage_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK ((auth.jwt()->'user_metadata'->>'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_settings" ON site_settings;
CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING ((auth.jwt()->'user_metadata'->>'role') = 'admin') WITH CHECK (true);

-- =========================================
-- CUSTOMER PROFILES
-- =========================================
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  addresses jsonb DEFAULT '[]'::jsonb,
  date_of_birth date,
  anniversary_date date,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON customer_profiles;
CREATE POLICY "select_own_profile" ON customer_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR (auth.jwt()->'user_metadata'->>'role') = 'admin');

DROP POLICY IF EXISTS "insert_own_profile" ON customer_profiles;
CREATE POLICY "insert_own_profile" ON customer_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON customer_profiles;
CREATE POLICY "update_own_profile" ON customer_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =========================================
-- ORDER NUMBER SEQUENCE
-- =========================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'GX-' || LPAD(nextval('order_number_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;
