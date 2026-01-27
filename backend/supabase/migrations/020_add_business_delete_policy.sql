-- Migration: Add DELETE policy for businesses table
-- Allows users to delete their own businesses (needed for onboarding rollback)
-- Maintains multi-tenant security by ensuring user can only delete their own business

BEGIN;

-- ============================================================================
-- ADD DELETE POLICY FOR BUSINESSES
-- ============================================================================
-- Allow users to delete their own businesses
-- This is needed for rollback during onboarding if configuration or theme creation fails

DROP POLICY IF EXISTS "Users can delete own business" ON businesses;
CREATE POLICY "Users can delete own business" ON businesses
    FOR DELETE 
    USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================
-- Added DELETE policy for businesses table to allow users to delete their own businesses.
-- This is required for the onboarding rollback mechanism when using user-context clients.
--
-- Security:
-- - Users can only delete businesses where user_id matches auth.uid()
-- - Service role can still delete any business (via "Service role can manage all businesses" policy)
-- - Multi-tenant data isolation is maintained

COMMIT;
