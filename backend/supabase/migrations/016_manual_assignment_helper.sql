-- Helper script to manually assign businesses to users
-- Run this BEFORE migration 016
--
-- This script helps you assign user_id to existing businesses
-- when you have multiple users in the system.

-- ============================================================================
-- STEP 1: View all users and businesses
-- ============================================================================

-- List all users
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users
ORDER BY created_at;

-- List all businesses without user_id
SELECT 
    id as business_id,
    name,
    created_at,
    user_id  -- Should be NULL
FROM businesses
WHERE user_id IS NULL
ORDER BY created_at;

-- ============================================================================
-- STEP 2: Assign businesses to users
-- ============================================================================
-- Uncomment and modify the UPDATE statements below to assign each business
-- to its correct owner.
--
-- Replace:
-- - 'business-uuid-here' with the actual business ID
-- - 'user-uuid-here' with the actual user ID (from auth.users)

-- Example assignments (UNCOMMENT AND MODIFY):

-- UPDATE businesses 
-- SET user_id = 'user-uuid-here'
-- WHERE id = 'business-uuid-here';

-- UPDATE businesses 
-- SET user_id = 'user-uuid-here'
-- WHERE id = 'business-uuid-here';

-- Add more UPDATE statements as needed for each business...

-- ============================================================================
-- STEP 3: Verify assignments
-- ============================================================================
-- After running the UPDATE statements, verify all businesses have user_id:

SELECT 
    b.id as business_id,
    b.name as business_name,
    b.user_id,
    u.email as owner_email
FROM businesses b
LEFT JOIN auth.users u ON b.user_id = u.id
ORDER BY b.created_at;

-- Check if any businesses still have NULL user_id:
SELECT COUNT(*) as businesses_without_owner
FROM businesses
WHERE user_id IS NULL;

-- If the count is 0, you're ready to run migration 016!
