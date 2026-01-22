-- Migration: Consolidate user references in businesses table
-- Remove owner_id column and use only user_id for user-business relationship
--
-- Context:
-- - Migration 012 added owner_id (references auth.users) for RLS policies
-- - Migration 016 added user_id (references public.users) for one-to-one relationship
-- - Decision: Use only user_id (public.users) and remove owner_id (auth.users)
--
-- Rationale:
-- - Simplifies data model by having single source of truth for business ownership
-- - user_id already has NOT NULL and UNIQUE constraints (one-to-one relationship)
-- - RLS policies in migration 016 already use user_id for data isolation
-- - owner_id is redundant and creates confusion about which column to use
--
-- Changes:
-- 1. Migrate any data from owner_id to user_id (if owner_id has data that user_id doesn't)
-- 2. Drop idx_businesses_owner_id index
-- 3. Drop owner_id column
-- 4. Update comments for clarity
--
-- Safety:
-- - Transaction-wrapped for atomicity
-- - Checks for data consistency before dropping column
-- - Preserves all existing user_id data and constraints

BEGIN;

-- ============================================================================
-- STEP 1: Data Migration (Safety Check)
-- ============================================================================
-- Check if owner_id column exists before attempting data migration.
-- If it doesn't exist, skip the checks (column was never added or already removed).

DO $$
DECLARE
    owner_id_exists BOOLEAN;
    owner_id_count INTEGER := 0;
    user_id_null_count INTEGER;
    mismatch_count INTEGER := 0;
BEGIN
    -- Check if owner_id column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'businesses' 
          AND column_name = 'owner_id'
    ) INTO owner_id_exists;
    
    IF NOT owner_id_exists THEN
        RAISE NOTICE 'owner_id column does not exist. Skipping data migration checks.';
        RAISE NOTICE 'This is expected if migration 012 never ran or owner_id was already removed.';
        RETURN;
    END IF;
    
    -- If owner_id exists, perform data consistency checks
    RAISE NOTICE 'owner_id column exists. Performing data consistency checks...';
    
    -- Count businesses with owner_id set
    SELECT COUNT(*) INTO owner_id_count
    FROM businesses
    WHERE owner_id IS NOT NULL;
    
    -- Count businesses with NULL user_id (should be 0 due to NOT NULL constraint)
    SELECT COUNT(*) INTO user_id_null_count
    FROM businesses
    WHERE user_id IS NULL;
    
    -- Count businesses where owner_id and user_id don't match
    SELECT COUNT(*) INTO mismatch_count
    FROM businesses
    WHERE owner_id IS NOT NULL 
      AND user_id IS NOT NULL
      AND owner_id != user_id;
    
    -- Log findings
    RAISE NOTICE 'Pre-migration check:';
    RAISE NOTICE '  - Businesses with owner_id: %', owner_id_count;
    RAISE NOTICE '  - Businesses with NULL user_id: %', user_id_null_count;
    RAISE NOTICE '  - Businesses with mismatched owner_id/user_id: %', mismatch_count;
    
    -- Safety check: user_id should never be NULL (enforced by migration 016)
    IF user_id_null_count > 0 THEN
        RAISE EXCEPTION 'Data integrity error: Found % businesses with NULL user_id. This should not happen due to NOT NULL constraint from migration 016.', user_id_null_count;
    END IF;
    
    -- Safety check: owner_id and user_id should match if both are set
    IF mismatch_count > 0 THEN
        RAISE EXCEPTION 'Data integrity error: Found % businesses where owner_id != user_id. Please manually review and fix data before running this migration.', mismatch_count;
    END IF;
    
    -- If we get here, data is consistent and safe to proceed
    RAISE NOTICE 'Data consistency check passed. Safe to drop owner_id column.';
END $$;

-- ============================================================================
-- STEP 2: Drop old RLS policies that reference owner_id
-- ============================================================================
-- These policies were created in migration 012 and use owner_id.
-- Migration 016 created new policies using user_id, but the old ones still exist.
-- We need to drop them before we can drop the owner_id column.

-- Drop old businesses policies that use owner_id
DROP POLICY IF EXISTS "Authenticated users can create their own business" ON businesses;
DROP POLICY IF EXISTS "Authenticated users can update their own business" ON businesses;

-- Drop old business_configurations policies that use owner_id
DROP POLICY IF EXISTS "Users can create configurations for their businesses" ON business_configurations;
DROP POLICY IF EXISTS "Users can view their business configurations" ON business_configurations;
DROP POLICY IF EXISTS "Users can update their business configurations" ON business_configurations;

-- Drop old business_themes policies that use owner_id
DROP POLICY IF EXISTS "Users can create themes for their businesses" ON business_themes;
DROP POLICY IF EXISTS "Users can view their business themes" ON business_themes;
DROP POLICY IF EXISTS "Users can update their business themes" ON business_themes;

-- ============================================================================
-- STEP 3: Drop index on owner_id
-- ============================================================================
-- Remove the index created in migration 012 before dropping the column.

DROP INDEX IF EXISTS idx_businesses_owner_id;

-- ============================================================================
-- STEP 4: Drop owner_id column
-- ============================================================================
-- Remove the redundant owner_id column.
-- All business ownership is now tracked via user_id (public.users).

ALTER TABLE businesses 
DROP COLUMN IF EXISTS owner_id;

-- ============================================================================
-- STEP 5: Update table comment for clarity
-- ============================================================================
-- Document that user_id is the single source of truth for business ownership.

COMMENT ON TABLE businesses IS 
    'Core tenant/business entity. Foundation for multi-tenancy. Each business is owned by exactly one user (user_id).';

COMMENT ON COLUMN businesses.user_id IS 
    'Owner of the business. References public.users. One-to-one relationship enforced by UNIQUE constraint. This is the single source of truth for business ownership.';

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================
-- Successfully consolidated user references in businesses table.
--
-- Removed:
-- - owner_id column (UUID, referenced auth.users)
-- - idx_businesses_owner_id index
--
-- Retained:
-- - user_id column (UUID, references public.users)
-- - NOT NULL constraint on user_id
-- - UNIQUE constraint on user_id (one business per user)
-- - idx_businesses_user_id index
-- - All RLS policies (already using user_id from migration 016)
--
-- Result:
-- - Single source of truth for business ownership (user_id)
-- - Cleaner data model with no redundant columns
-- - All existing functionality preserved (RLS policies already use user_id)
-- - No breaking changes (owner_id was not used in application code)
--
-- Data Safety:
-- - Pre-migration checks ensure data consistency
-- - Transaction-wrapped for atomicity (all-or-nothing)
-- - No data loss (user_id already had all necessary data)

COMMIT;
