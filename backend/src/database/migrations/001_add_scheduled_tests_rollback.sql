-- ROLLBACK Migration: Add Scheduled Tests
-- Created: 2025-11-01
-- Description: Safely removes scheduled_tests table and all related objects

-- ============================================
-- ROLLBACK SCRIPT - Run this to undo migration 001
-- ============================================

-- Remove trigger first
DROP TRIGGER IF EXISTS update_scheduled_tests_updated_at ON scheduled_tests;

-- Remove indexes
DROP INDEX IF EXISTS idx_scheduled_tests_test_file;
DROP INDEX IF EXISTS idx_scheduled_tests_test_case;
DROP INDEX IF EXISTS idx_scheduled_tests_user;
DROP INDEX IF EXISTS idx_scheduled_tests_next_run;
DROP INDEX IF EXISTS idx_scheduled_tests_enabled;

-- Remove table (CASCADE will handle any dependencies)
DROP TABLE IF EXISTS scheduled_tests CASCADE;

-- Verification query (run after rollback to confirm)
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'scheduled_tests';
-- (Should return 0 rows if rollback successful)

