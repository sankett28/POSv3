-- Migration: Multi-tenant theming system
-- Enables each business to have custom UI themes with semantic color slots
-- Backend-driven, runtime CSS variable injection, LLM-assisted but backend-validated
-- 
-- Design principles:
-- - Themes are data, not code
-- - Semantic color slots only (no arbitrary names)
-- - Backend validates all colors (hex format + contrast ratios)
-- - Full audit trail for compliance
-- - RLS for multi-tenant security

BEGIN;

-- ============================================================================
-- BUSINESSES TABLE (TENANT MASTER)
-- ============================================================================
-- Core tenant/business entity. One row per business/cafe/restaurant.
-- This is the foundation for multi-tenancy.

CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE, -- URL-safe identifier
    website_url VARCHAR(500), -- Optional: for auto-theme generation
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT businesses_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT businesses_slug_not_empty CHECK (LENGTH(TRIM(slug)) > 0),
    CONSTRAINT businesses_slug_format CHECK (slug ~ '^[a-z0-9-]+$') -- lowercase, numbers, hyphens only
);

-- Index for slug lookups (primary tenant identifier)
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);

-- ============================================================================
-- BUSINESS_THEMES TABLE (SEMANTIC COLOR STORAGE)
-- ============================================================================
-- One theme per business. Stores ONLY semantic color slots.
-- All colors are 6-digit hex codes (validated at DB level).
-- No CSS syntax, no Tailwind classes - pure data.

CREATE TABLE IF NOT EXISTS business_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Core semantic slots (REQUIRED)
    primary_color VARCHAR(7) NOT NULL CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
    secondary_color VARCHAR(7) NOT NULL CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
    background_color VARCHAR(7) NOT NULL CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$'),
    foreground_color VARCHAR(7) NOT NULL CHECK (foreground_color ~ '^#[0-9A-Fa-f]{6}$'),
    
    -- Optional semantic slots
    accent_color VARCHAR(7) CHECK (accent_color IS NULL OR accent_color ~ '^#[0-9A-Fa-f]{6}$'),
    danger_color VARCHAR(7) CHECK (danger_color IS NULL OR danger_color ~ '^#[0-9A-Fa-f]{6}$'),
    success_color VARCHAR(7) CHECK (success_color IS NULL OR success_color ~ '^#[0-9A-Fa-f]{6}$'),
    warning_color VARCHAR(7) CHECK (warning_color IS NULL OR warning_color ~ '^#[0-9A-Fa-f]{6}$'),
    
    -- Metadata
    source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'auto_generated', 'brand_api')),
    source_url VARCHAR(500), -- Website URL if auto-generated
    is_validated BOOLEAN NOT NULL DEFAULT false, -- Backend validation flag
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure at least basic contrast (enforced at application level, documented here)
    CONSTRAINT business_themes_colors_distinct CHECK (
        primary_color != background_color AND
        foreground_color != background_color
    )
);

-- Index for business_id lookups (primary query pattern)
CREATE INDEX IF NOT EXISTS idx_business_themes_business_id ON business_themes(business_id);

-- ============================================================================
-- THEME_AUDIT_LOG TABLE (COMPLIANCE & CHANGE TRACKING)
-- ============================================================================
-- Immutable audit trail for all theme changes.
-- Captures who changed what, when, and from what previous state.

CREATE TABLE IF NOT EXISTS theme_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    changed_by_user_id UUID, -- NULL if system-generated
    changed_by_email VARCHAR(255), -- Capture email for audit trail
    
    -- Snapshot of old and new theme (JSONB for flexibility)
    old_theme JSONB, -- NULL for first theme creation
    new_theme JSONB NOT NULL,
    
    -- Change metadata
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted', 'auto_generated')),
    change_reason TEXT, -- Optional: admin can provide reason
    ip_address INET, -- Capture IP for security audit
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_theme_audit_log_business_id ON theme_audit_log(business_id);
CREATE INDEX IF NOT EXISTS idx_theme_audit_log_created_at ON theme_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_theme_audit_log_changed_by ON theme_audit_log(changed_by_user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Businesses table RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- For now: authenticated users can read all businesses (single-tenant transitioning to multi-tenant)
-- TODO: Restrict to business members only when user-business relationship is implemented
CREATE POLICY "Authenticated users can view businesses" ON businesses
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can create/update businesses (admin operation)
CREATE POLICY "Service role can manage businesses" ON businesses
    FOR ALL USING (auth.role() = 'service_role');

-- Business themes RLS
ALTER TABLE business_themes ENABLE ROW LEVEL SECURITY;

-- Read: All authenticated users can read themes (for UI rendering)
-- TODO: Restrict to business members only when user-business relationship is implemented
CREATE POLICY "Authenticated users can view themes" ON business_themes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Write: Only service role can manage themes (backend API only)
-- This prevents direct DB manipulation and enforces backend validation
CREATE POLICY "Service role can manage themes" ON business_themes
    FOR ALL USING (auth.role() = 'service_role');

-- Audit log RLS
ALTER TABLE theme_audit_log ENABLE ROW LEVEL SECURITY;

-- Read: Authenticated users can view audit logs for their business
-- TODO: Restrict to business admins only when roles are implemented
CREATE POLICY "Authenticated users can view audit logs" ON theme_audit_log
    FOR SELECT USING (auth.role() = 'authenticated');

-- Write: Only service role can write audit logs (backend only)
CREATE POLICY "Service role can write audit logs" ON theme_audit_log
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for businesses table
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for business_themes table
CREATE TRIGGER update_business_themes_updated_at
    BEFORE UPDATE ON business_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (DEFAULT BUSINESS FOR MIGRATION)
-- ============================================================================
-- Create a default business for existing single-tenant data
-- This allows smooth migration from single-tenant to multi-tenant

INSERT INTO businesses (id, name, slug, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Default Business',
    'default',
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert default theme (using existing brand colors from globals.css)
INSERT INTO business_themes (
    business_id,
    primary_color,
    secondary_color,
    background_color,
    foreground_color,
    accent_color,
    danger_color,
    success_color,
    warning_color,
    source,
    is_validated
) VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    '#912b48', -- coffee-brown (primary)
    '#ffffff', -- white (secondary)
    '#fff0f3', -- warm-cream (background)
    '#610027', -- brand-deep-burgundy (foreground/text)
    '#b45a69', -- caramel (accent)
    '#ef4444', -- error red
    '#22c55e', -- success green
    '#f59e0b', -- warning orange
    'manual',
    true
) ON CONFLICT (business_id) DO NOTHING;

-- Log the initial theme creation
INSERT INTO theme_audit_log (
    business_id,
    changed_by_email,
    new_theme,
    change_type,
    change_reason
) VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'system@migration',
    jsonb_build_object(
        'primary_color', '#912b48',
        'secondary_color', '#ffffff',
        'background_color', '#fff0f3',
        'foreground_color', '#610027',
        'accent_color', '#b45a69',
        'danger_color', '#ef4444',
        'success_color', '#22c55e',
        'warning_color', '#f59e0b'
    ),
    'created',
    'Initial migration from single-tenant to multi-tenant theming system'
);

-- ============================================================================
-- COMMENTS (DOCUMENTATION)
-- ============================================================================

COMMENT ON TABLE businesses IS 
    'Core tenant/business entity. Foundation for multi-tenancy.';

COMMENT ON TABLE business_themes IS 
    'Semantic color themes per business. Stores only hex codes, no CSS syntax. Backend-validated.';

COMMENT ON TABLE theme_audit_log IS 
    'Immutable audit trail for theme changes. Compliance and security tracking.';

COMMENT ON COLUMN business_themes.primary_color IS 
    'Primary brand color. Used for CTAs, primary buttons, key UI elements.';

COMMENT ON COLUMN business_themes.secondary_color IS 
    'Secondary color. Used for secondary buttons, less prominent UI elements.';

COMMENT ON COLUMN business_themes.background_color IS 
    'Main background color. Used for app background, card backgrounds.';

COMMENT ON COLUMN business_themes.foreground_color IS 
    'Primary text/foreground color. Must have sufficient contrast with background_color.';

COMMENT ON COLUMN business_themes.source IS 
    'Origin of theme: manual (admin edited), auto_generated (LLM), brand_api (brand.dev).';

COMMENT ON COLUMN business_themes.is_validated IS 
    'Backend validation flag. True if contrast ratios and color safety checks passed.';

COMMIT;
