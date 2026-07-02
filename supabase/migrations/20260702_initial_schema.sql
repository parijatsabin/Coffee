-- Supabase Migration: Coffee Shop CRM & Content Management System
-- Created: July 2, 2026
-- Purpose: Complete schema for HAHA Coffee with CRM and content management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE PRODUCT & INVENTORY MANAGEMENT
-- ============================================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  ingredients TEXT,
  allergens TEXT,
  nutritional_info JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- ============================================================================
-- ORDERS & ORDER MANAGEMENT
-- ============================================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(255),
  address JSONB,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  loyalty_points INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  customer_segment VARCHAR(50),
  preferences JSONB,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_order_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX idx_customers_segment ON customers(customer_segment);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  order_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(12, 2),
  tax DECIMAL(10, 2),
  discount DECIMAL(10, 2),
  delivery_fee DECIMAL(10, 2),
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(100),
  payment_status VARCHAR(50),
  delivery_address JSONB,
  delivery_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_type ON orders(order_type);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  customizations JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================================
-- CRM & CUSTOMER INTERACTION TRACKING
-- ============================================================================

CREATE TABLE customer_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  interaction_type VARCHAR(100) NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  channel VARCHAR(50),
  status VARCHAR(50),
  assigned_to UUID,
  priority VARCHAR(50),
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_interactions_customer_id ON customer_interactions(customer_id);
CREATE INDEX idx_interactions_type ON customer_interactions(interaction_type);
CREATE INDEX idx_interactions_status ON customer_interactions(status);
CREATE INDEX idx_interactions_created_at ON customer_interactions(created_at DESC);

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  message_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new',
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  assigned_to UUID,
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- ============================================================================
-- CONTENT MANAGEMENT SYSTEM
-- ============================================================================

CREATE TABLE content_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug VARCHAR(255) UNIQUE NOT NULL,
  page_title VARCHAR(255) NOT NULL,
  page_type VARCHAR(100),
  content JSONB NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  seo_title VARCHAR(255),
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  updated_by UUID
);

CREATE INDEX idx_content_pages_slug ON content_pages(page_slug);
CREATE INDEX idx_content_pages_published ON content_pages(is_published);
CREATE INDEX idx_content_pages_type ON content_pages(page_type);

CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(255) UNIQUE NOT NULL,
  content JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID
);

CREATE INDEX idx_site_content_section ON site_content(section_key);

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255),
  customer_image_url TEXT,
  title VARCHAR(255),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_testimonials_published ON testimonials(is_published);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);

-- ============================================================================
-- MEDIA & GALLERY MANAGEMENT
-- ============================================================================

CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(100),
  alt_text VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID
);

CREATE INDEX idx_gallery_items_category ON gallery_items(category);
CREATE INDEX idx_gallery_items_published ON gallery_items(is_published);
CREATE INDEX idx_gallery_items_sort ON gallery_items(sort_order);

-- ============================================================================
-- ADMIN & USER MANAGEMENT
-- ============================================================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(100) DEFAULT 'staff',
  permissions TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

CREATE INDEX idx_admin_users_email ON admin_users(user_email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- ============================================================================
-- MARKETING & EMAIL CAMPAIGNS
-- ============================================================================

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  template_type VARCHAR(100),
  subject_line VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  plain_text_content TEXT,
  variables TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID
);

CREATE INDEX idx_email_templates_type ON email_templates(template_type);

CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_id UUID REFERENCES email_templates(id),
  recipient_segment VARCHAR(100),
  subject_line VARCHAR(255),
  content JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID
);

CREATE INDEX idx_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_campaigns_created_at ON email_campaigns(created_at DESC);

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  email_address VARCHAR(255),
  subject_line VARCHAR(255),
  status VARCHAR(50),
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX idx_email_logs_customer ON email_logs(customer_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- ============================================================================
-- ANALYTICS & TRACKING
-- ============================================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  event_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_customer ON events(customer_id);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

CREATE TABLE analytics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  metric_value DECIMAL(12, 2),
  breakdown JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, metric_type)
);

CREATE INDEX idx_analytics_date ON analytics_summary(date DESC);
CREATE INDEX idx_analytics_metric ON analytics_summary(metric_type);

-- ============================================================================
-- LOYALTY & REWARDS PROGRAM
-- ============================================================================

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  transaction_type VARCHAR(50),
  points_change INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loyalty_customer ON loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_order ON loyalty_transactions(order_id);
CREATE INDEX idx_loyalty_created_at ON loyalty_transactions(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Products: Public read, admin write
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Only admins can insert products" ON products FOR INSERT WITH CHECK (auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)));
CREATE POLICY "Only admins can update products" ON products FOR UPDATE USING (auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE))) WITH CHECK (auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)));
CREATE POLICY "Only admins can delete products" ON products FOR DELETE USING (auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)));

-- Orders: Users can view their own orders, admins can manage all
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (customer_email = auth.jwt()->>'email' OR auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)));

-- Customers: Sensitive data - admin only for full access
CREATE POLICY "Customers can view own profile" ON customers FOR SELECT USING (email = auth.jwt()->>'email' OR auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)));
CREATE POLICY "Only admins can insert customers" ON customers FOR INSERT WITH CHECK (auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)));
CREATE POLICY "Only admins can update customers" ON customers FOR UPDATE USING (auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE))) WITH CHECK (auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)));
CREATE POLICY "Only admins can delete customers" ON customers FOR DELETE USING (auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)));

-- Content Pages: Published content viewable by all, admins manage
CREATE POLICY "Published content is viewable by everyone" ON content_pages FOR SELECT USING (is_published = TRUE OR auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)));

-- Gallery: Published items viewable by all
CREATE POLICY "Published gallery items are viewable" ON gallery_items FOR SELECT USING (is_published = TRUE OR auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)));

-- Contact Messages: Anyone can insert, admins can read/update
CREATE POLICY "Anyone can submit contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read contact messages" ON contact_messages FOR SELECT USING (auth.uid() IN (SELECT id::UUID FROM auth.users WHERE email IN (SELECT user_email FROM admin_users WHERE is_active = TRUE)));

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default admin user placeholder (admin must be created through app)
INSERT INTO admin_users (user_email, first_name, last_name, role, permissions, is_active)
VALUES (
  'admin@haha-coffee.local',
  'Admin',
  'User',
  'admin',
  ARRAY['manage_products', 'manage_orders', 'manage_customers', 'manage_content', 'view_analytics'],
  FALSE
) ON CONFLICT DO NOTHING;

-- Insert initial site content structure
INSERT INTO site_content (section_key, content, description)
VALUES (
  'brand',
  '{"name":"HAHA","suffix":"COFFEE","tagline":"Serious Coffee, Lighter Vibes.","description":"Premium beans, vibrant vibes, and the perfect workspace."}',
  'Brand information and branding guidelines'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATED TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_timestamp BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_interactions_timestamp BEFORE UPDATE ON customer_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_content_pages_timestamp BEFORE UPDATE ON content_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_site_content_timestamp BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_gallery_timestamp BEFORE UPDATE ON gallery_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update customer stats after order completion
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE customers
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + COALESCE(NEW.total_amount, 0),
      last_order_at = CURRENT_TIMESTAMP
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_stats_on_order AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE products IS 'Menu items and products available for purchase';
COMMENT ON TABLE customers IS 'Customer profiles and CRM data with loyalty tracking';
COMMENT ON TABLE orders IS 'Order records with payment and delivery information';
COMMENT ON TABLE customer_interactions IS 'CRM interaction tracking (calls, emails, messages)';
COMMENT ON TABLE content_pages IS 'Dynamic content pages managed through CMS';
COMMENT ON TABLE email_campaigns IS 'Marketing email campaigns for customer engagement';
COMMENT ON TABLE events IS 'User interaction events for analytics and tracking';
COMMENT ON TABLE loyalty_transactions IS 'Points earned and redeemed by customers';
