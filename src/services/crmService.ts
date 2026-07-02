/**
 * Enhanced Service Examples for New Supabase Schema
 * These examples demonstrate how to use the migration schema
 * for CRM and content management
 */

import { supabase } from '../lib/supabase';
import type {
  Customer,
  Order,
  Product,
  CustomerInteraction,
  EmailCampaign,
  ContentPage,
  AdminUser,
} from '../types/supabase';

// ============================================================================
// CUSTOMER SERVICE (CRM)
// ============================================================================

export const crmService = {
  /**
   * Get customer profile with complete history
   */
  async getCustomerProfile(customerId: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to fetch customer profile:', err);
      return null;
    }
  },

  /**
   * Create or update customer from order
   */
  async upsertCustomer(
    email: string,
    customerData: Partial<Customer>
  ): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .upsert(
          {
            email,
            ...customerData,
          },
          {
            onConflict: 'email',
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to upsert customer:', err);
      return null;
    }
  },

  /**
   * Get top customers by spending
   */
  async getTopCustomers(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('total_spent', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch top customers:', err);
      return [];
    }
  },

  /**
   * Get customers by segment
   */
  async getCustomersBySegment(
    segment: 'VIP' | 'Regular' | 'Active' | 'Inactive' | 'New'
  ) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_segment', segment)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch customers by segment:', err);
      return [];
    }
  },

  /**
   * Update customer loyalty points
   */
  async updateLoyaltyPoints(customerId: string, pointsToAdd: number) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          loyalty_points: supabase.rpc('increment_loyalty', {
            x: pointsToAdd,
            row_id: customerId,
          }),
        })
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to update loyalty points:', err);
      return null;
    }
  },
};

// ============================================================================
// CUSTOMER INTERACTION SERVICE
// ============================================================================

export const interactionService = {
  /**
   * Log customer interaction
   */
async logInteraction(
  customerId: string,
  interaction: Omit<CustomerInteraction, 'id' | 'created_at' | 'updated_at' | 'customer_id'>
): Promise<CustomerInteraction | null> {
  try {
    const { data, error } = await supabase
      .from('customer_interactions')
      .insert({
        ...interaction,
        customer_id: customerId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to log interaction:', err);
    return null;
  }
},

  /**
   * Get customer interaction history
   */
  async getCustomerInteractions(
    customerId: string,
    limit: number = 50
  ): Promise<CustomerInteraction[]> {
    try {
      const { data, error } = await supabase
        .from('customer_interactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch interactions:', err);
      return [];
    }
  },

  /**
   * Get pending interactions for assignment
   */
  async getPendingInteractions() {
    try {
      const { data, error } = await supabase
        .from('customer_interactions')
        .select(
          `
          *,
          customers (
            id,
            full_name,
            email,
            phone
          )
        `
        )
        .eq('status', 'open')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch pending interactions:', err);
      return [];
    }
  },

  /**
   * Update interaction status
   */
  async updateInteractionStatus(
    interactionId: string,
    status: string,
    response?: string
  ) {
    try {
      const { data, error } = await supabase
        .from('customer_interactions')
        .update({
          status,
          response,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', interactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to update interaction:', err);
      return null;
    }
  },
};

// ============================================================================
// ENHANCED ORDER SERVICE
// ============================================================================

export const enhancedOrderService = {
  /**
   * Create order with customer profile
   */
  async createOrderWithCustomer(
    order: Omit<Order, 'id' | 'created_at' | 'updated_at'>,
    customerData?: Partial<Customer>
  ): Promise<Order | null> {
    try {
      // Create or update customer
      let customerId: string | undefined;

      if (customerData) {
        const customer = await crmService.upsertCustomer(
          order.customer_email,
          customerData
        );
        customerId = customer?.id;
      }

      // Create order
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...order,
          customer_id: customerId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Log interaction
      if (customerId) {
        await interactionService.logInteraction(customerId, {
          interaction_type: 'email',
          subject: `New order ${data.id}`,
          description: `Order placed for $${order.total_amount}`,
          channel: 'email',
          status: 'open',
          priority: 'medium',
        });
      }

      return data;
    } catch (err) {
      console.error('Failed to create order with customer:', err);
      return null;
    }
  },

  /**
   * Get order with customer and items
   */
  async getOrderDetail(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          customers (
            id,
            full_name,
            email,
            phone,
            loyalty_points
          ),
          order_items (
            id,
            product_id,
            product_name,
            product_price,
            quantity,
            customizations,
            notes
          )
        `
        )
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to fetch order detail:', err);
      return null;
    }
  },

  /**
   * Get orders by customer for CRM view
   */
  async getCustomerOrders(customerId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          id,
          created_at,
          total_amount,
          status,
          order_type,
          order_items (
            product_name,
            quantity,
            product_price
          )
        `
        )
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
      return [];
    }
  },
};

// ============================================================================
// EMAIL CAMPAIGN SERVICE
// ============================================================================

export const emailCampaignService = {
  /**
   * Create email campaign
   */
  async createCampaign(
    campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at'>
  ): Promise<EmailCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert(campaign)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to create email campaign:', err);
      return null;
    }
  },

  /**
   * Get campaign performance metrics
   */
  async getCampaignMetrics(campaignId: string) {
  try {
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select(`
        id,
        name,
        sent_at,
        opened_count,
        clicked_count,
        bounced_count
      `)
      .eq('id', campaignId)
      .single();

    if (campaignError) throw campaignError;

    const { data: emailLogsRows, error: logsError } = await supabase
      .from('email_logs')
      .select('status')
      .eq('campaign_id', campaignId);

    if (logsError) throw logsError;

    const emailLogs = Object.entries(
      (emailLogsRows ?? []).reduce<Record<string, number>>((acc, row) => {
        const status = row.status ?? 'unknown';
        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([status, count]) => ({ status, count }));

    return {
      campaign,
      emailLogs,
      openRate: campaign
        ? ((campaign.opened_count / (campaign.opened_count + campaign.bounced_count)) * 100).toFixed(2)
        : '0.00',
    };
  } catch (error) {
    console.error('Failed to get campaign metrics:', error);
    return null;
  }
},
};

// ============================================================================
// CONTENT MANAGEMENT SERVICE
// ============================================================================

export const cmsService = {
  /**
   * Get all published pages
   */
  async getPublishedPages() {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch published pages:', err);
      return [];
    }
  },

  /**
   * Get page by slug
   */
  async getPageBySlug(slug: string): Promise<ContentPage | null> {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('page_slug', slug)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to fetch page by slug:', err);
      return null;
    }
  },

  /**
   * Update page content
   */
  async updatePageContent(
    pageId: string,
    content: Record<string, any>
  ): Promise<ContentPage | null> {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to update page content:', err);
      return null;
    }
  },

  /**
   * Publish page
   */
  async publishPage(pageId: string): Promise<ContentPage | null> {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq('id', pageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to publish page:', err);
      return null;
    }
  },
};

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export const analyticsService = {
  /**
   * Log event
   */
  async logEvent(
    eventType: string,
    customerId?: string,
    eventData?: Record<string, any>
  ) {
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          event_type: eventType,
          customer_id: customerId,
          event_data: eventData,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to log event:', err);
    }
  },

  /**
   * Get daily revenue summary
   */
  async getDailyRevenue(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('analytics_summary')
        .select('*')
        .eq('metric_type', 'daily_revenue')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch daily revenue:', err);
      return [];
    }
  },

  /**
   * Get customer acquisition metrics
   */
  async getAcquisitionMetrics(monthsBack: number = 12) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);

      const { data, error } = await supabase
        .from('analytics_summary')
        .select('date, metric_value')
        .eq('metric_type', 'new_customers')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch acquisition metrics:', err);
      return [];
    }
  },
};

/**
 * USAGE EXAMPLES:
 *
 * // Create an order and track customer
 * const order = await enhancedOrderService.createOrderWithCustomer(
 *   {
 *     customer_name: 'John Doe',
 *     customer_email: 'john@example.com',
 *     customer_phone: '555-0000',
 *     order_type: 'delivery',
 *     total_amount: 45.99,
 *     items: [...]
 *   },
 *   {
 *     first_name: 'John',
 *     last_name: 'Doe'
 *   }
 * );
 *
 * // Get customer profile with CRM data
 * const customer = await crmService.getCustomerProfile(customerId);
 * const interactions = await interactionService.getCustomerInteractions(customerId);
 *
 * // Create email campaign
 * const campaign = await emailCampaignService.createCampaign({
 *   name: 'Spring Promo',
 *   recipient_segment: 'VIP',
 *   subject_line: 'Exclusive Spring Offers',
 *   status: 'scheduled',
 *   scheduled_at: new Date().toISOString()
 * });
 *
 * // Track analytics
 * await analyticsService.logEvent('product_viewed', customerId, {
 *   product_id: productId,
 *   category: 'coffee'
 * });
 */
