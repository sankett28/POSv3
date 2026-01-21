-- Migration: Fix RLS policies for business_configurations and business_themes
-- Allows authenticated users to create configurations and themes for their own businesses
-- Maintains strict multi-tenant security

BEGIN;

-- ============================================================================
-- FIX BUSINESS_CONFIGURATIONS RLS POLICIES
-- ============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Service role can manage configurations" ON business_configurations;
DROP POLICY IF EXISTS "Authenticated users can view configurations" ON business_configurations;

-- Allow authenticated users to INSERT configurations for their own businesses
CREATE POLICY "Users can create configurations for their businesses" ON business_configurations
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_configurations.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

-- Allow authenticated users to SELECT configurations for their own businesses
CREATE POLICY "Users can view their business configurations" ON business_configurations
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_configurations.business_id
            AND (businesses.owner_id = auth.uid() OR businesses.owner_id IS NULL)
        )
    );

-- Allow authenticated users to UPDATE configurations for their own businesses
CREATE POLICY "Users can update their business configurations" ON business_configurations
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_configurations.business_id
            AND businesses.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_configurations.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

-- Keep service role policy for admin operations
CREATE POLICY "Service role can manage all configurations" ON business_configurations
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================================
-- FIX BUSINESS_THEMES RLS POLICIES
-- ============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Service role can manage themes" ON business_themes;
DROP POLICY IF EXISTS "Authenticated users can view themes" ON business_themes;

-- Allow authenticated users to INSERT themes for their own businesses
CREATE POLICY "Users can create themes for their businesses" ON business_themes
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_themes.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

-- Allow authenticated users to SELECT themes for their own businesses
CREATE POLICY "Users can view their business themes" ON business_themes
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_themes.business_id
            AND (businesses.owner_id = auth.uid() OR businesses.owner_id IS NULL)
        )
    );

-- Allow authenticated users to UPDATE themes for their own businesses
CREATE POLICY "Users can update their business themes" ON business_themes
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_themes.business_id
            AND businesses.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_themes.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

-- Keep service role policy for admin operations
CREATE POLICY "Service role can manage all themes" ON business_themes
    FOR ALL
    USING (auth.role() = 'service_role');

COMMIT;
