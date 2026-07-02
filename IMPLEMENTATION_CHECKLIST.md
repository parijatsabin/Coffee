# Supabase Migration Implementation Checklist

## Overview
This checklist guides you through implementing the HAHA Coffee Supabase migration for CRM and content management capabilities.

---

## Phase 1: Migration Setup (1-2 hours)

### Step 1.1: Create Migration File Structure
- [ ] Create `supabase/migrations` directory if it doesn't exist
- [ ] Place migration file: `supabase/migrations/20260702_initial_schema.sql`
- [ ] Verify file permissions are readable

### Step 1.2: Apply Migration to Supabase

#### Option A: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install --save-dev supabase

# Link to your project
npx supabase link --project-id <YOUR_PROJECT_ID>

# Apply migration
npx supabase db push

# Verify
npx supabase db pull
```
- [ ] CLI installed and authenticated
- [ ] Migration applied successfully
- [ ] No SQL errors in console

#### Option B: Using Supabase Dashboard
```
1. Go to SQL Editor in Supabase Dashboard
2. Click "New Query"
3. Paste entire migration content
4. Run query
5. Check for success message
```
- [ ] Logged into Supabase Dashboard
- [ ] Migration copied correctly
- [ ] Query executed without errors

#### Option C: Using Node.js Script
```bash
# Create supabase/apply-migration.js
npm install @supabase/supabase-js

# Run script
node supabase/apply-migration.js
```
- [ ] Script created and tested
- [ ] Environment variables configured

### Step 1.3: Verify Schema Installation
```sql
-- Run these queries in Supabase SQL Editor to verify

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check row counts (should all be 0 initially)
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```
- [ ] All 15+ tables created successfully
- [ ] RLS policies enabled
- [ ] Indexes created

---

## Phase 2: TypeScript Integration (30 minutes)

### Step 2.1: Add Type Definitions
- [ ] Create `src/types/supabase.ts` (already done)
- [ ] Review all interfaces match your needs
- [ ] Update `tsconfig.json` if needed:
  ```json
  {
    "compilerOptions": {
      "typeRoots": ["./node_modules/@types", "./src/types"]
    }
  }
  ```

### Step 2.2: Update Service Files
- [ ] Add `src/services/crmService.ts` (already done)
- [ ] Update `src/services/productService.ts` to use new types
- [ ] Update `src/services/orderService.ts` to use new types
- [ ] Add new service methods as needed

### Step 2.3: Verify Type Compilation
```bash
npm run lint
```
- [ ] No TypeScript errors
- [ ] All imports resolve correctly

---

## Phase 3: Environment Configuration (15 minutes)

### Step 3.1: Verify Environment Variables
Check `.env.local` or `.env`:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAi...
```
- [ ] Variables set correctly
- [ ] Project URL matches Supabase dashboard
- [ ] Anon key is valid (not the service key)

### Step 3.2: Test Connection
```typescript
// src/lib/supabase.ts should work as-is
// Test in console:
import { supabase } from './lib/supabase';
const { data } = await supabase.from('products').select('count');
console.log(data);
```
- [ ] Can successfully connect to Supabase
- [ ] Queries return data without errors

---

## Phase 4: Data Migration from Existing Schema (Varies)

### Step 4.1: Migrate Products
If you already have products, migrate them:
```typescript
// Example migration script
async function migrateProducts() {
  const oldProducts = await supabase
    .from('old_products')
    .select('*');
  
  const newProducts = oldProducts.data.map(p => ({
    ...p,
    // Add any required new fields
    stock_quantity: 100,
    is_featured: false
  }));
  
  const { error } = await supabase
    .from('products')
    .insert(newProducts);
  
  console.log(error ? 'Migration failed' : 'Success');
}
```
- [ ] Identify old product table/data source
- [ ] Create and test migration script
- [ ] Verify all products migrated correctly
- [ ] No duplicates or missing data

### Step 4.2: Migrate Orders
```typescript
// Similar pattern for orders - map old order structure to new
```
- [ ] Orders table populated (if applicable)
- [ ] Order items linked correctly
- [ ] Totals and calculations preserved

### Step 4.3: Create Initial Customers from Orders
```typescript
// Create customer records from existing order data
async function createCustomersFromOrders() {
  const orders = await supabase
    .from('orders')
    .select('customer_email, customer_name, customer_phone')
    .neq('customer_email', null);
  
  const uniqueCustomers = [...new Set(
    orders.data.map(o => o.customer_email)
  )].map(email => {
    const order = orders.data.find(o => o.customer_email === email);
    return {
      email,
      full_name: order.customer_name,
      phone: order.customer_phone,
      loyalty_points: 0,
      is_active: true
    };
  });
  
  await supabase.from('customers').insert(uniqueCustomers);
}
```
- [ ] Customer records created from order history
- [ ] Email addresses unique (no duplicates)
- [ ] Migration can be run multiple times safely

---

## Phase 5: Admin Account Setup (15 minutes)

### Step 5.1: Create Admin User
```typescript
// Create an admin user (email must exist in auth.users)
async function createAdmin() {
  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      user_email: 'your-admin-email@example.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      permissions: [
        'manage_products',
        'manage_orders',
        'manage_customers',
        'manage_content',
        'view_analytics'
      ],
      is_active: true
    })
    .select()
    .single();
  
  return data;
}
```
- [ ] Admin email configured
- [ ] User invited to Supabase project
- [ ] Admin record created in admin_users table
- [ ] Permissions assigned appropriately

### Step 5.2: Set Up Authentication
- [ ] Enable Email Auth in Supabase (if not already)
- [ ] Configure email templates in Supabase
- [ ] Test login flow

---

## Phase 6: Feature Implementation (2-4 hours)

### Step 6.1: Implement CRM Dashboard
```typescript
// Start building CRM features:
import { crmService, interactionService } from './services/crmService';

// Get customer profile
const customer = await crmService.getCustomerProfile(customerId);

// View interaction history
const interactions = await interactionService.getCustomerInteractions(customerId);

// Track new interaction
await interactionService.logInteraction(customerId, {
  interaction_type: 'email',
  subject: 'Follow-up',
  description: 'Customer inquiry about loyalty program',
  channel: 'email',
  status: 'open',
  priority: 'medium'
});
```
- [ ] Create admin/CRM page layout
- [ ] Implement customer search
- [ ] Display customer profile with stats
- [ ] Show interaction history timeline
- [ ] Add ability to log new interactions

### Step 6.2: Implement Content Management
```typescript
// CMS Features:
import { cmsService } from './services/crmService';

// Get published pages
const pages = await cmsService.getPublishedPages();

// Update page content
await cmsService.updatePageContent(pageId, {
  hero: { headline: 'Updated!' },
  features: [...]
});

// Publish page
await cmsService.publishPage(pageId);
```
- [ ] Create CMS page editor UI
- [ ] Implement WYSIWYG editor or JSON editor
- [ ] Add publish/draft status controls
- [ ] Test page rendering with dynamic content

### Step 6.3: Implement Email Campaigns
```typescript
// Email Campaign Features:
import { emailCampaignService } from './services/crmService';

// Create campaign
const campaign = await emailCampaignService.createCampaign({
  name: 'Spring Promo',
  recipient_segment: 'VIP',
  subject_line: 'Exclusive Offers Inside',
  status: 'draft'
});

// View metrics
const metrics = await emailCampaignService.getCampaignMetrics(campaignId);
```
- [ ] Campaign creation form
- [ ] Template selection and customization
- [ ] Recipient segment filtering
- [ ] Schedule/send functionality
- [ ] Campaign performance dashboard

### Step 6.4: Implement Analytics
```typescript
// Analytics Features:
import { analyticsService } from './services/crmService';

// Log events
await analyticsService.logEvent('product_viewed', customerId, {
  product_id: productId
});

// View metrics
const revenue = await analyticsService.getDailyRevenue(startDate, endDate);
const acquisitions = await analyticsService.getAcquisitionMetrics();
```
- [ ] Event tracking implemented
- [ ] Analytics dashboard with charts
- [ ] Revenue trends visualization
- [ ] Customer acquisition metrics

---

## Phase 7: Testing & QA (1-2 hours)

### Step 7.1: Data Validation
```typescript
// Test queries
async function validateMigration() {
  // Count tables
  const products = await supabase.from('products').select('count');
  const orders = await supabase.from('orders').select('count');
  const customers = await supabase.from('customers').select('count');
  
  console.log('Products:', products.data?.count);
  console.log('Orders:', orders.data?.count);
  console.log('Customers:', customers.data?.count);
}
```
- [ ] All data migrated correctly
- [ ] Foreign key relationships valid
- [ ] No orphaned records

### Step 7.2: RLS Policy Testing
```typescript
// Test that policies work
// - Anonymous users can view published products/content
// - Authenticated users see their own orders
// - Admins can modify all data
```
- [ ] Public data accessible to all
- [ ] Private data protected
- [ ] Admin overrides working

### Step 7.3: Performance Testing
```sql
-- Check slow queries
-- Verify indexes are being used
SELECT * FROM pg_stat_user_indexes;
```
- [ ] Queries return quickly (<100ms)
- [ ] Indexes properly utilized
- [ ] No N+1 query problems

### Step 7.4: Error Handling
- [ ] Test network failures
- [ ] Test invalid data inputs
- [ ] Test permission denials
- [ ] Verify error messages helpful

---

## Phase 8: Deployment & Monitoring (30 minutes)

### Step 8.1: Environment Parity
- [ ] Dev environment tested ✓
- [ ] Staging environment setup
- [ ] Production credentials configured
- [ ] Database backups scheduled

### Step 8.2: Monitoring Setup
```bash
# Set up Supabase monitoring
# - Enable database logging
# - Set up alerts for errors
# - Monitor query performance
```
- [ ] Database logs enabled
- [ ] Performance alerts configured
- [ ] Error tracking integrated

### Step 8.3: Rollback Plan
- [ ] Database backup created
- [ ] Rollback script prepared
- [ ] Team notified of deployment
- [ ] Monitoring during deployment

### Step 8.4: Post-Deployment
- [ ] Verify all features working
- [ ] Check error logs for issues
- [ ] Monitor performance metrics
- [ ] Gather user feedback

---

## Quick Reference Commands

```bash
# Test connection
npm run lint

# View migration status
npx supabase status

# Pull latest schema
npx supabase db pull

# Create new migration
npx supabase migration new add_new_feature

# Reset local database (DEV ONLY)
npx supabase db reset
```

---

## Common Issues & Solutions

### Issue: "permission denied for schema public"
**Solution**: Ensure your role has correct permissions. Ask Supabase support if needed.

### Issue: "foreign key constraint failed"
**Solution**: Check that referenced records exist. Update insert order to respect dependencies.

### Issue: "RLS policy preventing all queries"
**Solution**: Review policies in Supabase Dashboard. Temporarily disable for testing.

### Issue: "Type errors in services"
**Solution**: Regenerate types: `npx supabase gen types typescript > src/types/database.ts`

---

## Next Steps

1. [ ] Run migration (Phase 1)
2. [ ] Configure types (Phase 2)
3. [ ] Set up admin account (Phase 5)
4. [ ] Build CRM dashboard (Phase 6.1)
5. [ ] Implement content management (Phase 6.2)
6. [ ] Set up email campaigns (Phase 6.3)
7. [ ] Deploy to production
8. [ ] Monitor and iterate

---

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Your Project Dashboard](https://app.supabase.com/)
- Migration file: `supabase/migrations/20260702_initial_schema.sql`
- Types file: `src/types/supabase.ts`
- Services file: `src/services/crmService.ts`
- Guide: `SUPABASE_MIGRATION_GUIDE.md`
