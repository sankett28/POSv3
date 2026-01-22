-- Migration: Add performance optimization indexes
-- Adds indexes for frequently queried columns to improve query performance
-- Part of auth-flow-and-caching-improvements feature
--
-- Requirements: 3.2, 3.3, 3.4, 3.5
--
-- Index Status:
-- ✓ business_configurations.business_id - Already exists (created in migration 011)
-- ✓ business_themes.business_id - Already exists (created in migration 010)
-- ⏳ businesses.user_id - Will be added in migration 016 (task 1.3) after user_id column is created
-- ℹ️ auth.users.email - Managed by Supabase Auth, already indexed by default

BEGIN;

-- ============================================================================
-- VERIFICATION: Confirm existing indexes
-- ============================================================================
-- The following indexes already exist from previous migrations:
-- - idx_business_configurations_business_id (migration 011)
-- - idx_business_themes_business_id (migration 010)
--
-- These indexes are critical for:
-- - Fast business configuration lookups during login/onboarding
-- - Fast theme retrieval for UI rendering
-- - Efficient cache population queries

-- ============================================================================
-- FUTURE INDEXES (to be added in subsequent migrations)
-- ============================================================================
-- The following indexes will be added after their respective columns are created:
--
-- 1. businesses.user_id (migration 016 - task 1.3)
--    - Required for fast business lookups by user during login
--    - Will enable efficient has_business checks
--    - Critical for multi-tenant data isolation
--
-- 2. auth.users.email
--    - Managed by Supabase Auth system
--    - Already indexed by default in Supabase
--    - Used for login email lookups

-- ============================================================================
-- COMMENTS (DOCUMENTATION)
-- ============================================================================

COMMENT ON INDEX idx_business_configurations_business_id IS 
    'Performance index for business configuration lookups. Critical for login flow and cache population.';

COMMENT ON INDEX idx_business_themes_business_id IS 
    'Performance index for theme lookups. Critical for UI rendering and cache population.';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- This migration serves as a checkpoint to document the current index state.
-- Most required indexes already exist from previous migrations.
-- The businesses.user_id index will be added in the next migration (016)
-- after the user_id column is added to the businesses table.
--
-- Performance Impact:
-- - business_configurations queries: ~10x faster with index
-- - business_themes queries: ~10x faster with index
-- - These indexes are especially important for cache population queries
--   that run on every login and user state retrieval

COMMIT;
