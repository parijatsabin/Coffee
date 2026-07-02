-- Fix missing RLS policies for orders, order_items, and admin_users

-- ============================================================================
-- ORDERS: add INSERT (anyone), UPDATE + DELETE (admins only)
-- ============================================================================

CREATE POLICY "Anyone can place orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT id::UUID FROM auth.users
    WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id::UUID FROM auth.users
    WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)
  ));

CREATE POLICY "Admins can delete orders" ON orders
  FOR DELETE
  USING (auth.uid() IN (
    SELECT id::UUID FROM auth.users
    WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)
  ));

-- ============================================================================
-- ORDER_ITEMS: full policies
-- ============================================================================

CREATE POLICY "Anyone can insert order items" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Order items viewable by owner or admin" ON order_items
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id::UUID FROM auth.users
      WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)
    )
    OR EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.customer_email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins can update order items" ON order_items
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT id::UUID FROM auth.users
    WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)
  ));

CREATE POLICY "Admins can delete order items" ON order_items
  FOR DELETE
  USING (auth.uid() IN (
    SELECT id::UUID FROM auth.users
    WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)
  ));

-- ============================================================================
-- ADMIN_USERS: allow admins to read their own record
-- ============================================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id::UUID FROM auth.users
    WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)
  ));
