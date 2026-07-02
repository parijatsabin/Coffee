-- Migration: Create admin auth user and seed full site content
-- Credentials: admin@admin.com / admin

-- ============================================================================
-- 1. DELETE ALL EXISTING AUTH USERS (clean slate)
-- ============================================================================

DELETE FROM auth.users;

-- ============================================================================
-- 2. CREATE ADMIN AUTH USER: admin@admin.com / admin
-- ============================================================================

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  aud,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  is_sso_user,
  deleted_at
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@admin.com',
  crypt('admin', gen_salt('bf')),
  NOW(),
  'authenticated',
  'authenticated',
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin"}',
  FALSE,
  FALSE,
  NULL
);

-- Also insert the identity record required for email auth
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  u.email,
  'email',
  json_build_object('sub', u.id::text, 'email', u.email),
  NOW(),
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'admin@admin.com';

-- ============================================================================
-- 3. REGISTER admin@admin.com IN admin_users TABLE
-- ============================================================================

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
  'admin@admin.com',
  'Admin',
  'User',
  'admin',
  ARRAY['manage_products', 'manage_orders', 'manage_customers', 'manage_content', 'view_analytics'],
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (user_email) DO UPDATE SET
  is_active = TRUE,
  role = 'admin',
  updated_at = NOW();

-- ============================================================================
-- 4. SEED FULL SITE CONTENT INTO site_content TABLE
-- ============================================================================

INSERT INTO site_content (section_key, content, description, is_active)
VALUES (
  'main_site_content',
  '{
    "brand": {
      "name": "HAHA",
      "suffix": "COFFEE",
      "tagline": "Serious Coffee, Lighter Vibes.",
      "description": "Premium beans, vibrant vibes, and the perfect workspace. Join the laughter, one cup at a time."
    },
    "navigation": [
      { "name": "Home", "path": "/" },
      { "name": "Menu", "path": "/menu" },
      { "name": "About", "path": "/about" },
      { "name": "Gallery", "path": "/gallery" },
      { "name": "Contact", "path": "/contact" }
    ],
    "home": {
      "hero": {
        "headline": "Serious Coffee, <br /> <span class=\"text-accent italic\">Lighter Vibes.</span>",
        "subheadline": "Premium artisanal brews served with a side of joy. Your neighborhood workspace and social sanctuary.",
        "primaryCTA": "Order Online",
        "secondaryCTA": "View Menu",
        "backgroundImage": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1920"
      },
      "socialProof": [
        { "label": "4.9 Google Rating", "type": "star" },
        { "label": "10k+ Cups Served", "type": "coffee" },
        { "label": "Best Workspace 2025", "type": "wifi" }
      ],
      "experience": {
        "headline": "More than just a <br /> <span class=\"text-accent italic\">caffeine fix.</span>",
        "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
        "badge": "\"Best Vibe in Town\"",
        "badgeAuthor": "— Local Guide 2025",
        "features": [
          {
            "title": "High-Speed Workspace",
            "description": "Dedicated quiet zones with gigabit fiber and ergonomic seating for your deep work sessions.",
            "icon": "wifi"
          },
          {
            "title": "Power Everywhere",
            "description": "Never hunt for a socket again. Every table is equipped with universal power outlets and USB-C ports.",
            "icon": "battery"
          },
          {
            "title": "Artisanal Sourcing",
            "description": "Ethically sourced beans from small-batch roasters, ensuring every sip supports sustainable farming.",
            "icon": "coffee"
          }
        ]
      },
      "finalCTA": {
        "headline": "Ready for a laugh and a latte?",
        "subheadline": "Join our community today. Order ahead and skip the queue.",
        "primaryButton": "Order Now",
        "secondaryButton": "Find a Location"
      }
    },
    "about": {
      "hero": {
        "label": "Our Story",
        "headline": "Brewing laughter, <br /> <span class=\"text-accent italic\">one bean at a time.</span>",
        "description": "Founded in 2023, HAHA-Coffee started with a simple observation: most \"premium\" coffee shops were a bit too serious. We wanted to create a space where world-class specialty coffee meets a lighthearted, vibrant atmosphere.",
        "image": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=1200",
        "stats": [
          { "value": "100%", "label": "Ethically Sourced" },
          { "value": "24/7", "label": "Community Support" }
        ]
      },
      "values": {
        "headline": "Our Philosophy",
        "subheadline": "The pillars that keep us brewing.",
        "items": [
          {
            "title": "Quality First",
            "description": "We never compromise on our beans. Every cup is a result of meticulous sourcing and roasting.",
            "icon": "heart"
          },
          {
            "title": "Community Driven",
            "description": "HAHA is a space for everyone. From students to CEOs, we build connections over caffeine.",
            "icon": "users"
          },
          {
            "title": "Sustainable Future",
            "description": "Zero-waste packaging and direct-trade partnerships are at the heart of our operations.",
            "icon": "globe"
          }
        ]
      },
      "team": {
        "headline": "Join the Laughter",
        "image": "https://images.unsplash.com/photo-1559925393-8be0ec41b50d?auto=format&fit=crop&q=80&w=1920",
        "description": "We are more than a cafe; we are a movement to make the world a little more caffeinated and a lot more joyful."
      }
    },
    "menu": {
      "headline": "The HAHA Menu",
      "description": "From ethically sourced beans to artisanal snacks, every item is crafted to make your day a little brighter.",
      "searchPlaceholder": "Search menu...",
      "categories": ["All", "Coffee", "Snacks", "Desserts", "Specials"]
    },
    "gallery": {
      "headline": "The HAHA Vibe",
      "description": "A glimpse into our daily brew and community.",
      "instagramCTA": "Follow us @hahacoffee",
      "instagramButton": "Follow on Instagram"
    },
    "contact": {
      "headline": "Visit Us",
      "description": "We are located in the heart of the creative district.",
      "address": "123 Coffee Lane, Brew City, BC 56789",
      "phone": "+1 (555) 123-HAHA",
      "email": "hello@haha-coffee.com",
      "hours": "Mon - Fri: 7am - 9pm\nSat - Sun: 8am - 10pm",
      "mapUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.8354345093747!2d-122.4194155!3d37.7749295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2sTwitter%20HQ!5e0!3m2!1sen!2sus!4v1625123456789!5m2!1sen!2sus"
    },
    "footer": {
      "social": {
        "instagram": "#",
        "facebook": "#",
        "twitter": "#"
      },
      "newsletter": {
        "headline": "Stay Caffeinated",
        "description": "Get exclusive offers and event invites.",
        "placeholder": "Your email",
        "button": "Join"
      }
    }
  }',
  'Full site content - all sections',
  TRUE
)
ON CONFLICT (section_key) DO UPDATE SET
  content = EXCLUDED.content,
  description = EXCLUDED.description,
  is_active = TRUE,
  updated_at = NOW();

-- ============================================================================
-- 5. SEED PRODUCTS TABLE (menu items from site-content.json)
-- ============================================================================

INSERT INTO products (name, description, price, category, image_url, is_available, is_featured)
VALUES
  ('Signature HAHA Latte', 'Our secret blend with a hint of caramel and sea salt.', 5.50, 'Coffee', 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=800', TRUE, TRUE),
  ('Avocado Sourdough Toast', 'Fresh avocado, chili flakes, and a poached egg on artisanal sourdough.', 12.00, 'Snacks', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800', TRUE, TRUE),
  ('Cold Brew Nitro', 'Smooth, creamy, and naturally sweet nitro-infused cold brew.', 6.00, 'Coffee', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800', TRUE, FALSE),
  ('Matcha Cheesecake', 'Ceremonial grade matcha cheesecake with a black sesame crust.', 8.50, 'Desserts', 'https://images.unsplash.com/photo-1536599424071-0b215a388ba7?auto=format&fit=crop&q=80&w=800', TRUE, TRUE),
  ('Truffle Mushroom Melt', 'Wild mushrooms, truffle oil, and melted gruyere on ciabatta.', 14.50, 'Snacks', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800', TRUE, FALSE),
  ('Espresso Tonic', 'Double shot espresso, premium tonic water, and a slice of grapefruit.', 6.50, 'Specials', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800', TRUE, FALSE),
  ('Classic Croissant', 'Buttery, flaky, and baked fresh every morning.', 4.50, 'Desserts', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800', TRUE, FALSE),
  ('Acai Power Bowl', 'Organic acai topped with house-made granola and seasonal fruits.', 11.00, 'Snacks', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=800', TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. SEED GALLERY ITEMS TABLE
-- ============================================================================

INSERT INTO gallery_items (image_url, title, description, category, is_published, is_featured, sort_order)
VALUES
  ('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800', 'Coffee Bar', 'Our signature coffee bar', 'Interior', TRUE, TRUE, 1),
  ('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800', 'Morning Brew', 'Starting the day right', 'Coffee', TRUE, FALSE, 2),
  ('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800', 'Cozy Corner', 'Perfect workspace vibes', 'Interior', TRUE, FALSE, 3),
  ('https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=800', 'Roasting Room', 'Where the magic happens', 'Behind the Scenes', TRUE, FALSE, 4),
  ('https://images.unsplash.com/photo-1559925393-8be0ec41b50d?auto=format&fit=crop&q=80&w=800', 'Barista at Work', 'Crafting your perfect cup', 'Team', TRUE, FALSE, 5),
  ('https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800', 'Espresso Tonic', 'Our signature special', 'Coffee', TRUE, FALSE, 6),
  ('https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800', 'Avocado Toast', 'Fresh from the kitchen', 'Food', TRUE, FALSE, 7),
  ('https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=800', 'Latte Art', 'Every cup is a canvas', 'Coffee', TRUE, FALSE, 8),
  ('https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800', 'Mushroom Melt', 'Comfort food perfected', 'Food', TRUE, FALSE, 9)
ON CONFLICT DO NOTHING;
