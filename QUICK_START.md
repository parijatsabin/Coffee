# Quick Start Guide - Supabase CRM Migration

## What You've Received

You now have a complete Supabase database schema designed for HAHA Coffee with full CRM and content management capabilities. Here's what was created:

### 📁 Files Created

1. **`supabase/migrations/20260702_initial_schema.sql`** (700+ lines)
   - Complete database schema with 15+ tables
   - Row-level security policies
   - Indexes and triggers
   - Initial data seeds

2. **`src/types/supabase.ts`** (300+ lines)
   - Complete TypeScript type definitions
   - Matches the database schema exactly
   - Intellisense-ready for all services

3. **`src/services/crmService.ts`** (400+ lines)
   - Ready-to-use service functions
   - CRM customer management
   - Order tracking with customer linking
   - Email campaign management
   - Analytics and event tracking
   - Content management
   - Includes usage examples

4. **`SUPABASE_MIGRATION_GUIDE.md`**
   - Comprehensive documentation
   - Architecture overview
   - Deployment instructions
   - Common queries
   - Feature explanations

5. **`IMPLEMENTATION_CHECKLIST.md`**
   - 8-phase implementation plan
   - Step-by-step instructions
   - Testing procedures
   - Troubleshooting guide

---

## 🚀 Getting Started (5 minutes)

### Step 1: Apply the Migration

Choose ONE method:

#### Method A: CLI (Recommended)
```bash
npm install --save-dev supabase
npx supabase link --project-id YOUR_PROJECT_ID
npx supabase db push
```

#### Method B: Dashboard
1. Go to **SQL Editor** in Supabase Dashboard
2. Create **New Query**
3. Copy entire content from `supabase/migrations/20260702_initial_schema.sql`
4. Click **Run**

#### Method C: Direct Link
```bash
# Get from migration file and paste into Supabase SQL Editor
```

### Step 2: Verify Installation
```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

Should show ~15 tables including:
- products, orders, order_items
- customers, customer_interactions
- content_pages, gallery_items
- email_campaigns, email_logs
- And more...

### Step 3: Create Your First Admin Account
```sql
-- In Supabase SQL Editor
INSERT INTO admin_users (user_email, first_name, last_name, role, permissions, is_active)
VALUES (
  'your-email@example.com',
  'Your',
  'Name',
  'admin',
  ARRAY['manage_products', 'manage_orders', 'manage_customers', 'manage_content', 'view_analytics'],
  TRUE
);
```

---

## 📊 Database Schema at a Glance

```
PRODUCTS & INVENTORY
├── products (menu items with stock)

CUSTOMER & ORDERS
├── customers (CRM profiles with loyalty)
├── orders (order history)
├── order_items (line items)
└── loyalty_transactions

CRM & INTERACTIONS
├── customer_interactions (calls, emails, messages)
├── contact_messages (form submissions)

CONTENT MANAGEMENT
├── content_pages (dynamic pages: home, about, etc.)
├── site_content (global config like brand info)
├── testimonials (customer reviews)
├── gallery_items (portfolio images)

ADMIN & MARKETING
├── admin_users (staff accounts)
├── email_templates (reusable templates)
├── email_campaigns (marketing campaigns)
├── email_logs (delivery tracking)

ANALYTICS
├── events (user interactions)
└── analytics_summary (daily metrics)
```

---

## 💻 Using in Your Code

### Import Types
```typescript
import type {
  Customer,
  Order,
  Product,
  CustomerInteraction,
  EmailCampaign,
  ContentPage
} from '@/types/supabase';
```

### Import Services
```typescript
import {
  crmService,
  interactionService,
  enhancedOrderService,
  emailCampaignService,
  analyticsService,
  cmsService
} from '@/services/crmService';
```

### Common Tasks

#### Get Customer Profile
```typescript
const customer = await crmService.getCustomerProfile(customerId);
console.log(customer.loyalty_points); // CRM data ready
```

#### Create Order with Customer Tracking
```typescript
const order = await enhancedOrderService.createOrderWithCustomer(
  {
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    order_type: 'delivery',
    total_amount: 45.99
  },
  { first_name: 'John', last_name: 'Doe' }
);
// Order linked to customer automatically
// Interaction logged automatically
```

#### Track User Event
```typescript
await analyticsService.logEvent('product_viewed', customerId, {
  product_id: productId,
  category: 'coffee'
});
```

#### View Customer Interaction History
```typescript
const interactions = await interactionService.getCustomerInteractions(customerId);
interactions.forEach(i => {
  console.log(`${i.interaction_type}: ${i.description}`);
});
```

#### Create Email Campaign
```typescript
await emailCampaignService.createCampaign({
  name: 'Spring Promo',
  recipient_segment: 'VIP',
  subject_line: 'Exclusive Offers',
  status: 'scheduled',
  scheduled_at: futureDate
});
```

---

## 🎯 Key Features by Use Case

### For Store Operations
- **Product Management**: Categories, pricing, stock tracking, allergens
- **Order Tracking**: Status updates, delivery info, payment tracking
- **Inventory**: Stock quantities and alerts

### For Customer Service (CRM)
- **Customer Profiles**: Complete history, loyalty points, preferences
- **Interaction Tracking**: Calls, emails, messages all logged
- **Contact Management**: Leads converted to customers
- **Order History**: Full transaction history per customer

### For Marketing
- **Email Campaigns**: Template-based campaigns with scheduling
- **Segmentation**: Target VIP, Regular, Active, Inactive customers
- **Analytics**: Track opens, clicks, bounces
- **Event Tracking**: User behavior and engagement metrics

### For Content Management
- **Dynamic Pages**: Manage home, about, menu pages
- **Global Config**: Brand info, navigation, site-wide settings
- **Testimonials**: Customer reviews and social proof
- **Gallery**: Portfolio and atmosphere images

### For Analytics
- **Event Tracking**: Product views, purchases, signups
- **Revenue Metrics**: Daily/weekly/monthly summaries
- **Customer Metrics**: Acquisition, retention, lifetime value
- **Custom Reports**: Flexible JSONB storage for complex data

---

## 🔒 Security Features

✅ Row-Level Security (RLS) policies enabled
✅ Public data viewable to all (products, published content)
✅ Private data (orders, customers) protected
✅ Admin-only sensitive operations
✅ Audit fields (created_by, updated_by) on most tables

---

## 📈 Next Steps

### Immediate (This Week)
1. Apply migration to your Supabase project
2. Create admin account
3. Test database connection from your app
4. Start using types in existing services

### Short Term (Next 2 Weeks)
1. Migrate existing products to new schema
2. Link existing orders to customers
3. Create admin dashboard page
4. Display customer profiles

### Medium Term (Next Month)
1. Build CRM dashboard with customer search
2. Implement interaction tracking
3. Create email campaign manager
4. Setup analytics dashboard
5. Build content management interface

### Long Term (Next 3 Months)
1. Advanced customer segmentation
2. Automated email campaigns based on behavior
3. Loyalty program features
4. Inventory management with alerts
5. Comprehensive analytics and reporting

---

## 🤔 Common Questions

**Q: Will this break my existing code?**
A: No! The migration is purely additive. Existing products and orders table structures are maintained. Existing services continue to work.

**Q: Can I migrate existing data?**
A: Yes! See `IMPLEMENTATION_CHECKLIST.md` Phase 4 for migration scripts to port data from old schema.

**Q: How do I enable/disable RLS policies?**
A: Use Supabase Dashboard → Authentication → Policies. You can enable/disable per table as needed.

**Q: Can I add more tables later?**
A: Absolutely! Create new migrations and run them the same way.

**Q: How do I handle password resets in emails?**
A: Use email templates table. Supabase Auth handles password reset emails, but you can customize templates in their settings.

**Q: What about payment processing?**
A: Payment info is stored in `orders.payment_method` and `payment_status`. Integrate Stripe/Square into your order creation flow.

---

## 📚 Resources

- **Migration File**: `supabase/migrations/20260702_initial_schema.sql`
- **Complete Guide**: `SUPABASE_MIGRATION_GUIDE.md`
- **Implementation Plan**: `IMPLEMENTATION_CHECKLIST.md`
- **Type Definitions**: `src/types/supabase.ts`
- **Service Examples**: `src/services/crmService.ts`
- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://postgresql.org/docs/

---

## 🎓 Schema Highlights

### Smart Customer Tracking
- Automatic customer stats update when orders complete
- Link customers across multiple orders
- Track loyalty points and spending
- Customer segments for targeting

### Content as JSON
- `content_pages.content` is JSONB - store flexible page layouts
- `site_content.content` for dynamic brand info
- `email_campaigns.content` for campaign customization
- `events.event_data` for flexible event tracking

### Audit Trail
- `created_by`, `updated_by` on products, pages, campaigns
- `created_at`, `updated_at` on all tables (auto-managed)
- Complete interaction history in `customer_interactions`

### Automation
- Triggers auto-update timestamps
- Automatic customer stats calculation
- RLS policies auto-enforce permissions

---

## 🎉 You're Ready!

Everything you need is in place. Start with the migration file and check `IMPLEMENTATION_CHECKLIST.md` for the complete roadmap.

**Questions?** Check the SUPABASE_MIGRATION_GUIDE.md for detailed documentation on any feature.

**Ready to build?** Start implementing CRM features using `src/services/crmService.ts` as your guide.

Good luck! ☕
