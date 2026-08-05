-- Add customization_data jsonb column to order_items for full design details
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS customization_data jsonb;

-- Create storage bucket for customer customization uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('customizations', 'customizations', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for customizations bucket
CREATE POLICY "public_read_customizations_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'customizations');

CREATE POLICY "anon_insert_customizations_bucket" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'customizations');

CREATE POLICY "admin_delete_customizations_bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'customizations' AND is_admin());
