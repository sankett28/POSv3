-- Auto-assign all businesses to the first user (by creation date)
-- WARNING: Only use this if all businesses belong to the same user!
--
-- This script assigns all businesses without user_id to the oldest user
-- in the system (first user by created_at timestamp).
--
-- If businesses belong to different users, use 016_manual_assignment_helper.sql instead.

BEGIN;

-- Get the first user ID (oldest by creation date)
DO $$
DECLARE
    first_user_id UUID;
    business_count INTEGER;
BEGIN
    -- Get the first user
    SELECT id INTO first_user_id
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Count businesses to assign
    SELECT COUNT(*) INTO business_count
    FROM businesses
    WHERE user_id IS NULL;
    
    -- Assign all businesses to first user
    UPDATE businesses
    SET user_id = first_user_id
    WHERE user_id IS NULL;
    
    RAISE NOTICE 'Assigned % businesses to user %', business_count, first_user_id;
END $$;

-- Verify the assignment
SELECT 
    b.id as business_id,
    b.name as business_name,
    b.user_id,
    u.email as owner_email
FROM businesses b
LEFT JOIN auth.users u ON b.user_id = u.id
ORDER BY b.created_at;

COMMIT;

-- After running this, you can run migration 016
