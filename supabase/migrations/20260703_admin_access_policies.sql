-- Admin access and CMS policy fixes for local Supabase
-- Ensures the newly created admin auth user can manage content and gallery items

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM admin_users WHERE user_email = 'admin@haha-coffee.com') THEN
    UPDATE admin_users
    SET
      first_name = COALESCE(first_name, 'Admin'),
      last_name = COALESCE(last_name, 'User'),
      role = 'admin',
      permissions = ARRAY['manage_products', 'manage_orders', 'manage_customers', 'manage_content', 'view_analytics'],
      is_active = TRUE,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_email = 'admin@haha-coffee.com';
  ELSE
    INSERT INTO admin_users (
      user_email,
      first_name,
      last_name,
      role,
      permissions,
      is_active,
      created_at,
      updated_at
    )
    VALUES (
      'admin@haha-coffee.com',
      'Admin',
      'User',
      'admin',
      ARRAY['manage_products', 'manage_orders', 'manage_customers', 'manage_content', 'view_analytics'],
      TRUE,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
  END IF;
END $$;

CREATE POLICY "Site content is viewable by everyone" ON site_content
  FOR SELECT
  USING (is_active = TRUE OR auth.uid() IN (
    SELECT id::UUID FROM auth.users WHERE email IN (
      SELECT user_email FROM admin_users WHERE is_active = TRUE
    )
  ));

CREATE POLICY "Admins can insert site content" ON site_content
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id::UUID FROM auth.users WHERE email IN (
      SELECT user_email FROM admin_users WHERE is_active = TRUE
    )
  ));

CREATE POLICY "Admins can update site content" ON site_content
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT id::UUID FROM auth.users WHERE email IN (
      SELECT user_email FROM admin_users WHERE is_active = TRUE
    )
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id::UUID FROM auth.users WHERE email IN (
      SELECT user_email FROM admin_users WHERE is_active = TRUE
    )
  ));

CREATE POLICY "Admins can delete site content" ON site_content
  FOR DELETE
  USING (auth.uid() IN (
    SELECT id::UUID FROM auth.users WHERE email IN (
      SELECT user_email FROM admin_users WHERE is_active = TRUE
    )
  ));

DROP POLICY IF EXISTS "Published gallery items are viewable" ON gallery_items;

CREATE POLICY "Published gallery items are viewable" ON gallery_items
  FOR SELECT
  USING (is_published = TRUE OR auth.uid() IN (
    SELECT id::UUID FROM auth.users WHERE email IN (
      SELECT user_email FROM admin_users WHERE is_active = TRUE
    )
  ));

CREATE POLICY "Admins can insert gallery items" ON gallery_items
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id::UUID FROM auth.users WHERE email IN (
      SELECT user_email FROM admin_users WHERE is_active = TRUE
    )
  ));

CREATE POLICY "Admins can update gallery items" ON gallery_items
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT id::UUID FROM auth.users WHERE email IN (
      SELECT user_email FROM admin_users WHERE is_active = TRUE
    )
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id::UUID FROM auth.users WHERE email IN (
      SELECT user_email FROM admin_users WHERE is_active = TRUE
    )
  ));

CREATE POLICY "Admins can delete gallery items" ON gallery_items
  FOR DELETE
  USING (auth.uid() IN (
    SELECT id::UUID FROM auth.users WHERE email IN (
      SELECT user_email FROM admin_users WHERE is_active = TRUE
    )
  ));
