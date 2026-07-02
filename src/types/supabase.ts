/**
 * TypeScript Type Definitions for HAHA Coffee Database
 * Generated from Supabase Migration Schema
 * Use these types across your services and components
 */

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  stock_quantity?: number;
  sku?: string;
  ingredients?: string;
  allergens?: string;
  nutritional_info?: Record<string, any>;
  is_featured?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export interface Address {
  street?: string;
  street2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface CustomerPreferences {
  favorite_drinks?: string[];
  dietary_restrictions?: string[];
  marketing_opt_in?: boolean;
  preferred_contact_method?: 'email' | 'phone' | 'sms';
}

export interface Customer {
  id: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  address?: Address;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  customer_segment?: 'VIP' | 'Regular' | 'Active' | 'Inactive' | 'New';
  preferences?: CustomerPreferences;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_order_at?: string;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_price: number;
  quantity: number;
  customizations?: Record<string, any>;
  notes?: string;
  created_at?: string;
}

export interface DeliveryInfo {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  delivery_notes?: string;
}

export interface Order {
  id: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  order_type: 'pickup' | 'delivery';
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  subtotal?: number;
  tax?: number;
  discount?: number;
  delivery_fee?: number;
  total_amount: number;
  payment_method?: string;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  delivery_address?: DeliveryInfo;
  delivery_time?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  created_by?: string;
  items?: OrderItem[];
}

// ============================================================================
// CRM INTERACTION TYPES
// ============================================================================

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  interaction_type: 'call' | 'email' | 'message' | 'feedback' | 'support' | 'complaint';
  subject?: string;
  description?: string;
  channel?: 'phone' | 'email' | 'in-person' | 'chat' | 'social';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assigned_to?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  message_type?: 'inquiry' | 'feedback' | 'complaint' | 'partnership';
  status: 'new' | 'read' | 'responded' | 'archived';
  customer_id?: string;
  assigned_to?: string;
  response?: string;
  responded_at?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// CONTENT MANAGEMENT TYPES
// ============================================================================

export interface HeroSection {
  headline: string;
  subheadline?: string;
  description?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  backgroundImage?: string;
  image?: string;
}

export interface Feature {
  title: string;
  description: string;
  icon?: string;
}

export interface ContentPage {
  id: string;
  page_slug: string;
  page_title: string;
  page_type?: 'home' | 'about' | 'menu' | 'contact' | 'custom';
  content: Record<string, any>;
  meta_description?: string;
  meta_keywords?: string;
  seo_title?: string;
  featured_image_url?: string;
  is_published: boolean;
  is_featured?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface SiteContent {
  id: string;
  section_key: string;
  content: Record<string, any>;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface Testimonial {
  id: string;
  customer_id?: string;
  customer_name?: string;
  customer_image_url?: string;
  title?: string;
  content: string;
  rating?: number;
  is_featured: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// GALLERY TYPES
// ============================================================================

export interface GalleryItem {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category?: string;
  alt_text?: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// ============================================================================
// ADMIN & USER TYPES
// ============================================================================

export type AdminRole = 'admin' | 'manager' | 'staff';

export type AdminPermission = 
  | 'manage_products'
  | 'manage_orders'
  | 'manage_customers'
  | 'manage_content'
  | 'manage_staff'
  | 'view_analytics'
  | 'manage_campaigns'
  | 'manage_promotions';

export interface AdminUser {
  id: string;
  user_email: string;
  first_name?: string;
  last_name?: string;
  role: AdminRole;
  permissions: AdminPermission[];
  is_active: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// ============================================================================
// EMAIL MARKETING TYPES
// ============================================================================

export interface EmailTemplate {
  id: string;
  name: string;
  template_type?: 'transactional' | 'promotional' | 'notification';
  subject_line: string;
  html_content: string;
  plain_text_content?: string;
  variables?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  template_id?: string;
  recipient_segment?: 'VIP' | 'Regular' | 'All' | 'Inactive';
  subject_line: string;
  content?: Record<string, any>;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  scheduled_at?: string;
  sent_at?: string;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface EmailLog {
  id: string;
  campaign_id?: string;
  customer_id?: string;
  email_address: string;
  subject_line?: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  error_message?: string;
  created_at?: string;
}

// ============================================================================
// ANALYTICS & EVENT TYPES
// ============================================================================

export interface EventData {
  event_type: 
    | 'product_viewed'
    | 'product_added_to_cart'
    | 'order_created'
    | 'order_completed'
    | 'page_visited'
    | 'search_performed'
    | 'review_submitted';
  customer_id?: string;
  order_id?: string;
  event_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface AnalyticsSummary {
  id: string;
  date: string;
  metric_type: 
    | 'daily_revenue'
    | 'order_count'
    | 'new_customers'
    | 'avg_order_value'
    | 'product_sales';
  metric_value: number;
  breakdown?: Record<string, any>;
  created_at?: string;
}

// ============================================================================
// LOYALTY PROGRAM TYPES
// ============================================================================

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  order_id?: string;
  transaction_type: 'earned' | 'redeemed' | 'bonus' | 'adjustment';
  points_change: number;
  description?: string;
  created_at?: string;
}

// ============================================================================
// COMPOSITE TYPES (for API responses)
// ============================================================================

export interface OrderWithItems extends Order {
  items: OrderItem[];
  customer?: Customer;
}

export interface CustomerWithStats extends Customer {
  recent_orders?: Order[];
  interactions?: CustomerInteraction[];
}

export interface PageWithContent extends ContentPage {
  related_items?: GalleryItem[];
}
