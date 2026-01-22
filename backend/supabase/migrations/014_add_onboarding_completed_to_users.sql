-- Migration: Add onboarding_completed tracking to users
-- Creates a public.users table to extend auth.users with application-specific fields
-- Enables persistent onboarding status tracking across devices
--
-- Design principles:
-- - One-to-one relationship with auth.users (user_id is primary key)
-- - onboarding_completed defaults to FALSE for new signups
-- - Indexed for query optimization
-- - RLS policies ensure users can only access their own data

BEGIN;

-- ============================================================================
-- PUBLIC USERS TABLE
-- ============================================================================
-- Extends auth.users with application-specific fields.
-- user_id is both primary key and foreign key to auth.users.

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index on onboarding_completed for query optimization
-- Enables fast filtering of users by onboarding status
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed 
    ON public.users(onboarding_completed);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT 
    USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id);

-- Policy: Service role can manage all users (for backend operations)
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL 
    USING (auth.role() = 'service_role');

-- ============================================================================
-- AUTOMATIC TIMESTAMP MANAGEMENT
-- ============================================================================

-- Trigger for automatic updated_at timestamp
-- Uses existing update_updated_at_column() function from previous migrations
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION TO AUTO-CREATE USER RECORD ON SIGNUP
-- ============================================================================

-- Function to automatically create a public.users record when auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, onboarding_completed, created_at, updated_at)
    VALUES (NEW.id, FALSE, NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to auto-create public.users record
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- MIGRATE EXISTING USERS
-- ============================================================================

-- Create public.users records for any existing auth.users
-- Set onboarding_completed to FALSE by default
INSERT INTO public.users (id, onboarding_completed, created_at, updated_at)
SELECT 
    id,
    FALSE as onboarding_completed,
    created_at,
    NOW() as updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMMENTS (DOCUMENTATION)
-- ============================================================================

COMMENT ON TABLE public.users IS 
    'Application-specific user data extending auth.users. Tracks onboarding status and other user preferences.';

COMMENT ON COLUMN public.users.id IS 
    'Primary key and foreign key to auth.users. One-to-one relationship.';

COMMENT ON COLUMN public.users.onboarding_completed IS 
    'Tracks whether user has completed the onboarding process. Defaults to FALSE on signup.';

COMMENT ON COLUMN public.users.created_at IS 
    'Timestamp when the user record was created. Matches auth.users.created_at.';

COMMENT ON COLUMN public.users.updated_at IS 
    'Timestamp when the user record was last updated. Auto-updated by trigger.';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- This migration creates a public.users table to extend auth.users with application-specific fields.
-- The trigger ensures that every new signup automatically creates a public.users record.
-- Existing users are migrated with onboarding_completed set to FALSE.
-- The backend should update onboarding_completed to TRUE when users complete the onboarding flow.

COMMIT;
