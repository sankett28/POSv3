-- Migration: Fix RLS policies for business_configurations and business_themes to use user_id
-- Updates policies to use businesses.user_id instead of businesses.owner_id
-- Part of consolidation from owner_id to user_id

BEGIN;

-- ============================================================================
-- FIX BUSINESS_CONFIGURATIONS RLS POLICIES
-- ============================================================================

-- Drop old policies that reference owner_id (if they still exist)
DROP POLICY IF EXISTS "Users can create configurations for their businesses" ON business_configurations;
DROP POLICY IF EXISTS "Users can view their business configurations" ON business_configurations;
DROP POLICY IF EXISTS "Users can update their business configurations" ON business_configurations;
DROP POLICY IF EXISTS "Service role can manage all configurations" ON business_configurations;

-- Allow authenticated users to INSERT configurations for their own businesses
CREATE POLICY "Users can create configurations for their businesses" ON business_configurations
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_configurations.business_id
            AND businesses.user_id = auth.uid()
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
            AND businesses.user_id = auth.uid()
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
            AND businesses.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_configurations.business_id
            AND businesses.user_id = auth.uid()
        )
    );

-- Keep service role policy for admin operations
CREATE POLICY "Service role can manage all configurations" ON business_configurations
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================================
-- FIX BUSINESS_THEMES RLS POLICIES
-- ============================================================================

-- Drop old policies that reference owner_id (if they still exist)
DROP POLICY IF EXISTS "Users can create themes for their businesses" ON business_themes;
DROP POLICY IF EXISTS "Users can view their business themes" ON business_themes;
DROP POLICY IF EXISTS "Users can update their business themes" ON business_themes;
DROP POLICY IF EXISTS "Service role can manage all themes" ON business_themes;

-- Allow authenticated users to INSERT themes for their own businesses
CREATE POLICY "Users can create themes for their businesses" ON business_themes
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_themes.business_id
            AND businesses.user_id = auth.uid()
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
            AND businesses.user_id = auth.uid()
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
            AND businesses.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = business_themes.business_id
            AND businesses.user_id = auth.uid()
        )
    );

-- Keep service role policy for admin operations
CREATE POLICY "Service role can manage all themes" ON business_themes
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================
-- Successfully updated RLS policies to use user_id instead of owner_id.
--
-- Updated Policies:
-- - business_configurations: All policies now check businesses.user_id
-- - business_themes: All policies now check businesses.user_id
--
-- Security:
-- - Users can only create/view/update configurations for their own businesses
-- - Users can only create/view/update themes for their own businesses
-- - Service role retains full access for admin operations
--
-- This migration completes the owner_id to user_id consolidation for RLS policies.

COMMIT;
