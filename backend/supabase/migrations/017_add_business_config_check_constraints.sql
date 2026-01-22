-- Migration: Add CHECK constraints on business_configurations
-- Adds tax_rate and currency columns with validation constraints
-- Ensures data integrity for business configuration values
--
-- Design principles:
-- - tax_rate must be between 0 and 100 (percentage)
-- - currency must be exactly 3 characters (ISO 4217 currency codes)
-- - Both fields are nullable to support gradual data population

BEGIN;

-- ============================================================================
-- ADD COLUMNS TO BUSINESS_CONFIGURATIONS
-- ============================================================================

-- Add tax_rate column (default tax rate for the business)
-- Nullable to support existing records and gradual data population
ALTER TABLE business_configurations
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2)
    CHECK (tax_rate IS NULL OR (tax_rate >= 0 AND tax_rate <= 100));

-- Add currency column (ISO 4217 currency code, e.g., USD, INR, EUR)
-- Nullable to support existing records and gradual data population
ALTER TABLE business_configurations
ADD COLUMN IF NOT EXISTS currency VARCHAR(3)
    CHECK (currency IS NULL OR LENGTH(currency) = 3);

-- ============================================================================
-- COMMENTS (DOCUMENTATION)
-- ============================================================================

COMMENT ON COLUMN business_configurations.tax_rate IS 
    'Default tax rate percentage for the business (0-100). Used as fallback when specific tax groups are not configured.';

COMMENT ON COLUMN business_configurations.currency IS 
    'ISO 4217 currency code (3 characters). Examples: USD, INR, EUR, GBP. Determines currency display throughout the system.';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- This migration adds tax_rate and currency columns to business_configurations.
-- Both columns are nullable to support:
-- 1. Existing business_configurations records without these fields
-- 2. Gradual data population during onboarding updates
-- 3. Backward compatibility with existing onboarding flows
--
-- CHECK constraints ensure:
-- - tax_rate is between 0 and 100 (percentage)
-- - currency is exactly 3 characters (ISO 4217 standard)
--
-- Future considerations:
-- - May want to add a constraint to validate currency against a list of supported currencies
-- - May want to make these fields NOT NULL after data migration is complete

COMMIT;
