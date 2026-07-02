-- Fix infinite recursion in admin_users RLS policy.
-- Root cause: policies on products/orders/etc. call a subquery on admin_users,
-- but admin_users itself also has an RLS policy that queries admin_users → loop.
--
-- Fix: create a SECURITY DEFINER function that bypasses RLS when checking
-- whether the current user is an admin. All table policies use this function.

-- ============================================================================
-- 1. Create a stable, security-definer helper function
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE user_email = auth.jwt() ->> 'email'
      AND is_active = TRUE
  );
$$;

-- ============================================================================
-- 2. Drop ALL existing policies that used the recursive subquery
-- ============================================================================

-- products
DROP POLICY IF EXISTS "Only admins can insert products"   ON products;
DROP POLICY IF EXISTS "Only admins can update products"   ON products;
DROP POLICY IF EXISTS "Only admins can delete products"   ON products;

-- orders
DROP POLICY IF EXISTS "Users can view their own orders"   ON orders;
DROP POLICY IF EXISTS "Admins can update orders"          ON orders;
DROP POLICY IF EXISTS "Admins can delete orders"          ON orders;

-- order_items
DROP POLICY IF EXISTS "Order items viewable by owner or admin" ON order_items;
DROP POLICY IF EXISTS "Admins can update order items"     ON order_items;
DROP POLICY IF EXISTS "Admins can delete order items"     ON order_items;

-- customers
DROP POLICY IF EXISTS "Only admins can insert customers"  ON customers;
DROP POLICY IF EXISTS "Only admins can update customers"  ON customers;
DROP POLICY IF EXISTS "Only admins can delete customers"  ON customers;
DROP POLICY IF EXISTS "Customers can view own profile"    ON customers;

-- content_pages
DROP POLICY IF EXISTS "Published content is viewable by everyone" ON content_pages;

-- site_content
DROP POLICY IF EXISTS "Admins can insert site content"    ON site_content;
DROP POLICY IF EXISTS "Admins can update site content"    ON site_content;
DROP POLICY IF EXISTS "Admins can delete site content"    ON site_content;

-- gallery_items
DROP POLICY IF EXISTS "Published gallery items are viewable" ON gallery_items;
DROP POLICY IF EXISTS "Admins can insert gallery items"   ON gallery_items;
DROP POLICY IF EXISTS "Admins can update gallery items"   ON gallery_items;
DROP POLICY IF EXISTS "Admins can delete gallery items"   ON gallery_items;

-- contact_messages
DROP POLICY IF EXISTS "Admins can read contact messages"  ON contact_messages;

-- admin_users
DROP POLICY IF EXISTS "Admins can view admin users"       ON admin_users;

-- ============================================================================
-- 3. Re-create all policies using is_admin()
-- ============================================================================

-- products
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE USING (is_admin());

-- orders
CREATE POLICY "Users or admins can view orders"
  ON orders FOR SELECT
  USING (customer_email = auth.jwt() ->> 'email' OR is_admin());

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE USING (is_admin());

-- order_items
CREATE POLICY "Order items viewable by owner or admin"
  ON order_items FOR SELECT
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.customer_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can update order items"
  ON order_items FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete order items"
  ON order_items FOR DELETE USING (is_admin());

-- customers
CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  USING (email = auth.jwt() ->> 'email' OR is_admin());

CREATE POLICY "Admins can insert customers"
  ON customers FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete customers"
  ON customers FOR DELETE USING (is_admin());

-- content_pages
CREATE POLICY "Published content is viewable by everyone"
  ON content_pages FOR SELECT
  USING (is_published = TRUE OR is_admin());

-- site_content
CREATE POLICY "Admins can insert site content"
  ON site_content FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update site content"
  ON site_content FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete site content"
  ON site_content FOR DELETE USING (is_admin());

-- gallery_items
CREATE POLICY "Published gallery items are viewable"
  ON gallery_items FOR SELECT
  USING (is_published = TRUE OR is_admin());

CREATE POLICY "Admins can insert gallery items"
  ON gallery_items FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update gallery items"
  ON gallery_items FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete gallery items"
  ON gallery_items FOR DELETE USING (is_admin());

-- contact_messages
CREATE POLICY "Admins can read contact messages"
  ON contact_messages FOR SELECT USING (is_admin());

-- admin_users (no self-reference — uses JWT email directly)
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (user_email = auth.jwt() ->> 'email' AND is_active = TRUE);
