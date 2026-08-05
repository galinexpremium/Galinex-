-- Fix: admin needs SELECT on all products (not just active ones)
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (is_active = true);
CREATE POLICY "admin_read_products" ON products FOR SELECT
  TO authenticated USING (is_admin());

-- Fix: admin needs SELECT on all coupons (not just active ones)
DROP POLICY IF EXISTS "public_read_coupons" ON coupons;
CREATE POLICY "public_read_coupons" ON coupons FOR SELECT
  TO anon, authenticated USING (is_active = true);
CREATE POLICY "admin_read_coupons" ON coupons FOR SELECT
  TO authenticated USING (is_admin());

-- Fix: admin needs SELECT on all reviews (not just approved ones)
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (is_approved = true);
CREATE POLICY "admin_read_reviews" ON reviews FOR SELECT
  TO authenticated USING (is_admin());

-- Fix: admin needs DELETE on reviews
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (is_admin());

-- Fix: admin needs SELECT on all orders (currently only own orders via auth.uid())
-- Already has select_own_orders with is_admin() OR auth.uid() = user_id, that's fine.

-- Fix: admin needs SELECT on newsletter (already has admin_read_newsletter) and contact_messages (already has admin_read_contact_messages)
-- Fix: admin needs DELETE on newsletter (already has admin_delete_newsletter)
-- Fix: admin needs DELETE on contact_messages
CREATE POLICY "admin_delete_contact_messages" ON contact_messages FOR DELETE
  TO authenticated USING (is_admin());

-- Fix: admin needs DELETE on orders (already has admin_delete_orders)
-- Fix: admin needs DELETE on categories (already has admin_delete_categories)
-- Fix: admin needs DELETE on coupons (already has admin_delete_coupons)
