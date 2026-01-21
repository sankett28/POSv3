-- Migration: Business Configurations Table
-- Stores onboarding configuration data for each business
-- Supports cafe, restaurant, and cloud-kitchen business types
-- Includes GST validation, business type-specific fields, and branding choices
--
-- Design principles:  
-- - One configuration per business (unique constraint on business_id)
-- - Cascade delete when business is deleted
-- - Business type-specific fields are nullable (only required for relevant types)
-- - GST number format validation at database level
-- - Automatic timestamp management

BEGIN;

-- ============================================================================
-- BUSINESS_CONFIGURATIONS TABLE
-- ============================================================================
-- Stores comprehensive onboarding configuration for each business.
-- One-to-one relationship with businesses table.

CREATE TABLE IF NOT EXISTS business_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Business info (Step 2)
    business_type VARCHAR(20) NOT NULL CHECK (business_type IN ('cafe', 'restaurant', 'cloud-kitchen')),
    revenue_range VARCHAR(20) NOT NULL CHECK (revenue_range IN ('less-10l', '10l-50l', '50l-2cr', '2cr-plus', 'not-sure')),
    has_gst BOOLEAN NOT NULL,
    gst_number VARCHAR(15),
    
    -- Cafe configuration (Step 3 - Cafe specific)
    service_charge_enabled BOOLEAN,
    billing_type VARCHAR(10) CHECK (billing_type IN ('counter', 'table')),
    price_type VARCHAR(10) CHECK (price_type IN ('inclusive', 'exclusive')),
    
    -- Restaurant configuration (Step 3 - Restaurant specific)
    table_service_enabled BOOLEAN,
    kitchen_tickets_enabled BOOLEAN,
    number_of_tables INTEGER CHECK (number_of_tables > 0 AND number_of_tables <= 1000),
    
    -- Branding (Step 4) - All optional to allow skipping
    website_url TEXT,
    brand_prompt TEXT,
    branding_choice VARCHAR(10) CHECK (branding_choice IN ('url', 'prompt', 'manual')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- ========================================================================
    -- CONSTRAINTS
    -- ========================================================================
    
    -- GST number format validation: 2 digits + 10 alphanumeric + 1 letter + 1 digit + 1 letter + 1 digit
    CONSTRAINT gst_number_format CHECK (
        gst_number IS NULL OR 
        gst_number ~ '^[0-9]{2}[A-Z0-9]{10}[A-Z][0-9][A-Z][0-9]$'
    ),
    
    -- GST number required when has_gst is true
    CONSTRAINT gst_required_when_enabled CHECK (
        (has_gst = false) OR 
        (has_gst = true AND gst_number IS NOT NULL AND LENGTH(TRIM(gst_number)) > 0)
    )
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary lookup by business_id (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_business_configurations_business_id 
    ON business_configurations(business_id);

-- Filter by business type (for analytics and reporting)
CREATE INDEX IF NOT EXISTS idx_business_configurations_business_type 
    ON business_configurations(business_type);

-- Filter by GST status (for tax reporting)
CREATE INDEX IF NOT EXISTS idx_business_configurations_has_gst 
    ON business_configurations(has_gst);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE business_configurations ENABLE ROW LEVEL SECURITY;

-- Read: All authenticated users can read configurations
-- TODO: Restrict to business members only when user-business relationship is implemented
DROP POLICY IF EXISTS "Authenticated users can view configurations" ON business_configurations;
CREATE POLICY "Authenticated users can view configurations" ON business_configurations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Write: Only service role can manage configurations (backend API only)
-- This prevents direct DB manipulation and enforces backend validation
DROP POLICY IF EXISTS "Service role can manage configurations" ON business_configurations;
CREATE POLICY "Service role can manage configurations" ON business_configurations
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- AUTOMATIC TIMESTAMP MANAGEMENT
-- ============================================================================

-- Trigger for automatic updated_at timestamp
-- Uses existing update_updated_at_column() function from previous migrations
DROP TRIGGER IF EXISTS update_business_configurations_updated_at ON business_configurations;
CREATE TRIGGER update_business_configurations_updated_at
    BEFORE UPDATE ON business_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (DOCUMENTATION)
-- ============================================================================

COMMENT ON TABLE business_configurations IS 
    'Stores onboarding configuration data for each business. One-to-one relationship with businesses table.';

COMMENT ON COLUMN business_configurations.business_id IS 
    'Foreign key to businesses table. Unique constraint ensures one configuration per business. CASCADE delete removes configuration when business is deleted.';

COMMENT ON COLUMN business_configurations.business_type IS 
    'Type of business: cafe, restaurant, or cloud-kitchen. Determines which configuration fields are applicable.';

COMMENT ON COLUMN business_configurations.revenue_range IS 
    'Estimated annual revenue range. Used for analytics and feature recommendations.';

COMMENT ON COLUMN business_configurations.has_gst IS 
    'Whether the business is GST registered. Determines tax configuration.';

COMMENT ON COLUMN business_configurations.gst_number IS 
    'GST registration number. Required when has_gst is true. Format: 2 digits + 10 alphanumeric + 1 letter + 1 digit + 1 letter + 1 digit.';

COMMENT ON COLUMN business_configurations.service_charge_enabled IS 
    'Cafe only: Whether service charge is enabled. Null for non-cafe businesses.';

COMMENT ON COLUMN business_configurations.billing_type IS 
    'Cafe only: Billing type (counter or table). Null for non-cafe businesses.';

COMMENT ON COLUMN business_configurations.price_type IS 
    'Cafe only: Price type (inclusive or exclusive of tax). Null for non-cafe businesses.';

COMMENT ON COLUMN business_configurations.table_service_enabled IS 
    'Restaurant only: Whether table service is enabled. Null for non-restaurant businesses.';

COMMENT ON COLUMN business_configurations.kitchen_tickets_enabled IS 
    'Restaurant only: Whether kitchen tickets are enabled. Null for non-restaurant businesses.';

COMMENT ON COLUMN business_configurations.number_of_tables IS 
    'Restaurant only: Number of tables in the restaurant (1-1000). Null for non-restaurant businesses.';

COMMENT ON COLUMN business_configurations.website_url IS 
    'Business website URL. Used for auto-theme generation when branding_choice is "url".';

COMMENT ON COLUMN business_configurations.brand_prompt IS 
    'Brand description prompt. Used for AI-based theme generation when branding_choice is "prompt".';

COMMENT ON COLUMN business_configurations.branding_choice IS 
    'How the business theme was chosen: url (from website), prompt (AI-generated), or manual (user-selected).';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- This migration adds the business_configurations table without modifying existing tables.
-- Existing businesses will not have configuration records until they complete onboarding.
-- The backend API should handle cases where business_configurations records may not exist.
-- All columns except business_id, business_type, revenue_range, has_gst, and branding_choice are nullable
-- to support business type-specific fields and gradual data population.

COMMIT;
