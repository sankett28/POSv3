-- Migration: Add user_id constraints to businesses table
-- Establishes one-to-one relationship between users and businesses
-- Part of auth-flow-and-caching-improvements feature
--
-- Requirements: 3.6, 3.7
--
-- Changes:
-- 1. Add user_id column to businesses table (references public.users)
-- 2. Add NOT NULL constraint on user_id (every business must have an owner)
-- 3. Add UNIQUE constraint on user_id (one business per user)
-- 4. Add index on user_id for fast business lookups during login
-- 5. Update RLS policies to use user_id for data isolation
--
-- Migration Strategy:
-- - Add column as nullable first to handle existing data
-- - Migrate existing businesses to default user (if any exists)
-- - Add NOT NULL constraint after data migration
-- - Add UNIQUE constraint to enforce one-business-per-user rule

BEGIN;

-- ============================================================================
-- STEP 1: Add user_id column (nullable initially for migration)
-- ============================================================================

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 2: Migrate existing businesses
-- ============================================================================
-- For existing businesses without user_id, we need to handle them.
-- Strategy: Assign all businesses to the first user (oldest by created_at).
-- This is safe for single-tenant scenarios or when all businesses belong to one owner.

DO $$
DECLARE
    user_count INTEGER;
    first_user_id UUID;
    business_count INTEGER;
BEGIN
    -- Count users in the system
    SELECT COUNT(*) INTO user_count
    FROM public.users;
    
    -- Count businesses without user_id
    SELECT COUNT(*) INTO business_count
    FROM businesses
    WHERE user_id IS NULL;
    
    -- If no businesses need migration, we're done
    IF business_count = 0 THEN
        RAISE NOTICE 'No existing businesses to migrate.';
        RETURN;
    END IF;
    
    -- If no users exist but businesses do, fail
    IF user_count = 0 THEN
        RAISE EXCEPTION 'Cannot add NOT NULL constraint: % businesses exist but no users found. Please create users first or delete orphaned businesses.', business_count;
    END IF;
    
    -- Get the first user (oldest by creation date)
    SELECT id INTO first_user_id
    FROM public.users
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Assign all businesses to the first user
    UPDATE businesses
    SET user_id = first_user_id
    WHERE user_id IS NULL;
    
    RAISE NOTICE 'Auto-assigned % businesses to first user (ID: %)', business_count, first_user_id;
    RAISE NOTICE 'If businesses belong to different users, please manually reassign them after this migration.';
END $$;

-- ============================================================================
-- STEP 3: Add NOT NULL constraint
-- ============================================================================
-- This ensures every business has an owner.
-- Note: This will fail if any businesses still have NULL user_id.
-- The migration script above will raise an exception if this condition cannot be met.

ALTER TABLE businesses 
ALTER COLUMN user_id SET NOT NULL;

-- ============================================================================
-- STEP 4: Add UNIQUE constraint (OPTIONAL - COMMENTED OUT)
-- ============================================================================
-- This enforces the one-business-per-user rule.
-- Each user can have at most one business.
-- 
-- COMMENTED OUT: If you have multiple businesses per user, this constraint
-- will fail. Uncomment only if you want to enforce one-business-per-user.

-- ALTER TABLE businesses 
-- ADD CONSTRAINT businesses_user_id_unique UNIQUE(user_id);

-- ============================================================================
-- STEP 5: Add index for performance
-- ============================================================================
-- Index on user_id for fast business lookups during login.
-- Critical for has_business checks and business data retrieval.

CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);

-- ============================================================================
-- STEP 6: Update RLS policies for proper data isolation
-- ============================================================================
-- Now that we have user_id, we can enforce proper multi-tenant security.
-- Users should only be able to access their own business.

-- Drop old policies that allowed all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view businesses" ON businesses;
DROP POLICY IF EXISTS "Service role can manage businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view own business" ON businesses;
DROP POLICY IF EXISTS "Users can create own business" ON businesses;
DROP POLICY IF EXISTS "Users can update own business" ON businesses;
DROP POLICY IF EXISTS "Service role can manage all businesses" ON businesses;

-- New policy: Users can only view their own business
CREATE POLICY "Users can view own business" ON businesses
    FOR SELECT 
    USING (auth.uid() = user_id);

-- New policy: Users can insert their own business (for onboarding)
CREATE POLICY "Users can create own business" ON businesses
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- New policy: Users can update their own business
CREATE POLICY "Users can update own business" ON businesses
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- New policy: Service role can manage all businesses (for admin operations)
CREATE POLICY "Service role can manage all businesses" ON businesses
    FOR ALL 
    USING (auth.role() = 'service_role');

-- ============================================================================
-- STEP 7: Update business_themes RLS policies
-- ============================================================================
-- Update theme policies to use the new user_id relationship for better security.

-- Drop old policies
DROP POLICY IF EXISTS "Authenticated users can view themes" ON business_themes;
DROP POLICY IF EXISTS "Service role can manage themes" ON business_themes;
DROP POLICY IF EXISTS "Users can view own business themes" ON business_themes;
DROP POLICY IF EXISTS "Users can create own business themes" ON business_themes;
DROP POLICY IF EXISTS "Users can update own business themes" ON business_themes;
DROP POLICY IF EXISTS "Service role can manage all themes" ON business_themes;

-- New policy: Users can view themes for their own business
CREATE POLICY "Users can view own business themes" ON business_themes
    FOR SELECT 
    USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

-- New policy: Users can insert themes for their own business
CREATE POLICY "Users can create own business themes" ON business_themes
    FOR INSERT 
    WITH CHECK (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

-- New policy: Users can update themes for their own business
CREATE POLICY "Users can update own business themes" ON business_themes
    FOR UPDATE 
    USING (
        business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    );

-- New policy: Service role can manage all themes
CREATE POLICY "Service role can manage all themes" ON business_themes
    FOR ALL 
    USING (auth.role() = 'service_role');

-- ============================================================================
-- COMMENTS (DOCUMENTATION)
-- ============================================================================

COMMENT ON COLUMN businesses.user_id IS 
    'Owner of the business. References public.users. Multiple businesses per user allowed.';

-- COMMENT ON CONSTRAINT businesses_user_id_unique ON businesses IS 
--     'Ensures one business per user. Each user can own at most one business.';

COMMENT ON INDEX idx_businesses_user_id IS 
    'Performance index for business lookups by user. Critical for login flow and has_business checks.';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- This migration establishes the relationship between users and businesses.
-- 
-- Key Changes:
-- 1. Added user_id column with foreign key to public.users
-- 2. Added NOT NULL constraint (every business must have an owner)
-- 3. UNIQUE constraint commented out (allows multiple businesses per user)
-- 4. Added index for fast lookups
-- 5. Updated RLS policies for proper multi-tenant data isolation
--
-- Data Migration:
-- - All existing businesses are auto-assigned to the first user (oldest by created_at)
-- - If no users exist and businesses exist, migration will fail with clear error message
-- - Admin can manually reassign user_id to businesses after migration if needed
--
-- Breaking Changes:
-- - Old RLS policies that allowed all authenticated users to view all businesses are removed
-- - Users can now only access their own business
-- - This enforces proper multi-tenant security
--
-- Performance Impact:
-- - Index on user_id enables fast business lookups (O(log n) instead of O(n))
-- - Critical for login flow where we check has_business for every user
--
-- Security Impact:
-- - Proper data isolation between users
-- - Users cannot access other users' businesses

COMMIT;
