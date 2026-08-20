-- EdgeSpark — Initial Schema Migration
-- Run via: drizzle-kit push or manual D1 execution

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'investor' CHECK (role IN ('admin', 'investor')),
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'available', 'under_offer', 'sold', 'archived')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  latitude REAL,
  longitude REAL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  plot_size_sqm INTEGER,
  building_size_sqm INTEGER,
  property_type TEXT CHECK (property_type IN ('bungalow', 'duplex', 'apartment', 'land', 'commercial', 'other')),
  price_ngn INTEGER NOT NULL,
  price_note TEXT,
  hero_image TEXT,
  gallery_images TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'under_review', 'funded', 'completed', 'cancelled')),
  purchase_price_ngn INTEGER NOT NULL,
  renovation_costs_ngn INTEGER NOT NULL,
  legal_fees_ngn INTEGER NOT NULL DEFAULT 0,
  total_investment_ngn INTEGER NOT NULL,
  projected_resale_ngn INTEGER NOT NULL,
  gross_profit_ngn INTEGER NOT NULL,
  return_percentage REAL,
  investor_share_min INTEGER,
  investor_share_max INTEGER,
  deal_cycle_months INTEGER,
  description TEXT,
  highlights TEXT,
  risk_notes TEXT,
  target_close_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS investor_interests (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  deal_id TEXT NOT NULL REFERENCES deals(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'declined', 'withdrawn')),
  message TEXT,
  amount_indicative TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest_range TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'archived')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  section TEXT,
  updated_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_slug ON deals(slug);
CREATE INDEX IF NOT EXISTS idx_deals_property ON deals(property_id);
CREATE INDEX IF NOT EXISTS idx_investor_interests_deal ON investor_interests(deal_id);
CREATE INDEX IF NOT EXISTS idx_investor_interests_user ON investor_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
