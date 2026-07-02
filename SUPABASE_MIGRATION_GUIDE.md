# Supabase Migration Guide - HAHA Coffee

## Overview

This migration file creates a complete database schema for HAHA Coffee with CRM and content management capabilities. It's designed to support both current operations and future CRM/content management features.

## Schema Architecture

### 1. **Product & Inventory Management**
- **products**: Menu items with pricing, availability, and nutritional information
  - Supports categories, featured items, stock tracking
  - Includes allergen and ingredients information
  - Audit fields (created_by, updated_by)

### 2. **Order Management**
- **customers**: Customer profiles with loyalty tracking
  - CRM-ready with customer segments, preferences, and interaction history
  - Tracks total orders and lifetime value
  - Extensible address storage (JSONB)

- **orders**: Order records with complete order lifecycle
  - Links to customers for CRM tracking
  - Payment and delivery information
  - Status tracking (pending → preparing → ready → completed)

- **order_items**: Line items for each order
  - Customizations and special requests
  - Preserves product info at time of order (denormalized for history)

### 3. **CRM & Customer Interactions**
- **customer_interactions**: Tracks all customer touchpoints
  - Supports: calls, emails, messages, feedback, support tickets
  - Priority and assignment management
  - Tags for organization and filtering
  - Extensible metadata (JSONB)

- **contact_messages**: Form submissions from contact page
  - Converts leads into customer records
  - Response tracking and status management

### 4. **Content Management System**
- **content_pages**: Dynamic pages (home, about, menu descriptions, etc.)
  - SEO fields (meta_description, meta_keywords, seo_title)
  - JSONB content for flexible structure
  - Featured/Published status

- **site_content**: Global site configuration (brand info, navigation, etc.)
  - Centralized content management
  - Section-based organization

- **testimonials**: Customer reviews and testimonials
  - Links to customers for social proof
  - Featured and published flags

### 5. **Media & Gallery**
- **gallery_items**: Portfolio images and gallery management
  - Categories, thumbnails, and alt text
  - SEO-friendly image metadata

### 6. **Admin & User Management**
- **admin_users**: Staff and admin accounts
  - Role-based access control (admin, manager, staff)
  - Granular permissions tracking
  - Activity logging (last_login)

### 7. **Email Marketing**
- **email_templates**: Reusable email templates
  - Order confirmations, newsletters, password resets, etc.
  - Variable placeholders for dynamic content

- **email_campaigns**: Campaign management and scheduling
  - Tracks opens, clicks, bounces
  - Segment-based targeting

- **email_logs**: Detailed email delivery tracking
  - Per-message tracking
  - Error handling and status monitoring

### 8. **Analytics & Events**
- **events**: User interaction tracking
  - Page views, clicks, purchases, etc.
  - IP and user agent tracking

- **analytics_summary**: Daily metrics aggregation
  - Revenue, orders, customer acquisition
  - Custom breakdown by category, segment, etc.

### 9. **Loyalty Program**
- **loyalty_transactions**: Points tracking
  - Links orders to loyalty points
  - Extensible for different transaction types

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Public**: Products, published content, published gallery
- **Authenticated Users**: View own orders and customer profiles
- **Admin Only**: Product management, customer data, campaigns, analytics

## Deployment Instructions

### Step 1: Create Migration File Structure
```bash
mkdir -p supabase/migrations
```

### Step 2: Apply Migration to Supabase
Option A: Using Supabase CLI
```bash
npm install @supabase/cli --save-dev
npx supabase db push
```

Option B: Using Supabase Dashboard
1. Go to SQL Editor in your Supabase dashboard
2. Create a new query
3. Copy and paste the entire migration content
4. Run the query

Option C: Using supabase-js in your app
```typescript
import { supabase } from './lib/supabase';

export async function applyMigration(sqlContent: string) {
  const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
  if (error) console.error('Migration failed:', error);
}
```

### Step 3: Update TypeScript Services

The migration works seamlessly with your existing services. Update them as needed:

```typescript
// src/services/productService.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  stock_quantity?: number;
  ingredients?: string;
  allergens?: string;
  nutritional_info?: Record<string, any>;
  created_at?: string;
}
```

## Key Features for CRM

### 1. **Customer Profiles**
```typescript
// Store comprehensive customer data
interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  customer_segment: string; // VIP, Regular, New, Inactive
  loyalty_points: number;
  total_spent: number;
  preferences: Record<string, any>;
  notes: string; // Internal notes for staff
}
```

### 2. **Interaction History**
```typescript
// Track all customer touchpoints
const interactions = await supabase
  .from('customer_interactions')
  .select('*')
  .eq('customer_id', customerId)
  .order('created_at', { ascending: false });
```

### 3. **Email Campaigns**
```typescript
// Create and track email campaigns
const campaign = await supabase
  .from('email_campaigns')
  .insert({
    name: 'Spring Promo',
    template_id: templateId,
    recipient_segment: 'VIP',
    status: 'scheduled',
    scheduled_at: new Date().toISOString()
  });
```

### 4. **Analytics**
```typescript
// Track events
const { error } = await supabase
  .from('events')
  .insert({
    event_type: 'product_viewed',
    customer_id: customerId,
    event_data: { product_id: productId }
  });

// Query analytics summary
const summary = await supabase
  .from('analytics_summary')
  .select('*')
  .eq('metric_type', 'daily_revenue')
  .gte('date', startDate);
```

## Future Enhancements

1. **Loyalty Dashboard**: Real-time points tracking and redemption
2. **Email Marketing**: Automated campaigns based on purchase history
3. **Customer Segmentation**: Behavioral targeting and personalization
4. **Inventory Management**: Stock alerts and supplier integration
5. **Advanced Analytics**: Revenue forecasting, customer lifetime value
6. **Reviews & Ratings**: Product ratings with moderation
7. **Promotions Engine**: Discount codes and promotional rules
8. **Staff Scheduling**: Employee shifts and availability

## Common Queries

### Get Top Customers by Spending
```sql
SELECT 
  id, 
  full_name, 
  total_spent, 
  total_orders,
  ROUND(total_spent / NULLIF(total_orders, 0), 2) as avg_order_value
FROM customers
WHERE is_active = TRUE
ORDER BY total_spent DESC
LIMIT 10;
```

### Revenue by Date
```sql
SELECT 
  DATE(o.created_at) as order_date,
  COUNT(*) as order_count,
  SUM(o.total_amount) as daily_revenue
FROM orders o
WHERE o.status = 'completed'
GROUP BY DATE(o.created_at)
ORDER BY order_date DESC;
```

### Customer Segmentation
```sql
SELECT 
  CASE 
    WHEN total_spent > 1000 THEN 'VIP'
    WHEN total_spent > 500 THEN 'Regular'
    WHEN total_orders > 0 THEN 'Active'
    ELSE 'Inactive'
  END as segment,
  COUNT(*) as customer_count
FROM customers
GROUP BY segment;
```

## Maintenance

### Regular Backups
```bash
npx supabase db pull  # Pull current state
```

### Monitoring
- Check table sizes and indexes
- Monitor RLS policy performance
- Track row growth for scalability planning

## Support & Documentation

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Check the inline SQL comments in the migration for table-specific details
