-- Migration: Add RLS insert policy for businesses table
-- Allows authenticated users to create their own business during onboarding
-- Maintains multi-tenant security by ensuring owner_id = auth.uid()

BEGIN;

-- ============================================================================
-- ADD OWNER_ID COLUMN TO BUSINESSES TABLE
-- ============================================================================
-- Track which user owns each business for RLS policies

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for owner_id lookups
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);

-- Update existing default business to have no owner (system-owned)
UPDATE businesses 
SET owner_id = NULL 
WHERE id = '00000000-0000-0000-0000-000000000001'::UUID;

-- ============================================================================
-- ADD INSERT POLICY FOR AUTHENTICATED USERS
-- ============================================================================
-- Allow authenticated users to create their own business during onboarding
-- Security: owner_id must match auth.uid() to prevent creating businesses for other users

DROP POLICY IF EXISTS "Authenticated users can create their own business" ON businesses;
CREATE POLICY "Authenticated users can create their own business" ON businesses
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' AND 
        owner_id = auth.uid()
    );

-- ============================================================================
-- UPDATE SELECT POLICY
-- ============================================================================
-- Allow users to view their own businesses and the default business

DROP POLICY IF EXISTS "Authenticated users can view businesses" ON businesses;
CREATE POLICY "Authenticated users can view businesses" ON businesses
    FOR SELECT 
    USING (
        auth.role() = 'authenticated' AND 
        (owner_id = auth.uid() OR owner_id IS NULL)
    );

-- ============================================================================
-- UPDATE POLICY FOR UPDATES
-- ============================================================================
-- Allow users to update only their own businesses

DROP POLICY IF EXISTS "Authenticated users can update their own business" ON businesses;
CREATE POLICY "Authenticated users can update their own business" ON businesses
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated' AND 
        owner_id = auth.uid()
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND 
        owner_id = auth.uid()
    );

-- ============================================================================
-- KEEP SERVICE ROLE POLICY FOR ADMIN OPERATIONS
-- ============================================================================
-- Service role can still manage all businesses (for admin operations)
-- This policy already exists from migration 010, no changes needed

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN businesses.owner_id IS 
    'User who owns this business. NULL for system-owned businesses (like default business). Used for RLS policies.';

COMMIT;
