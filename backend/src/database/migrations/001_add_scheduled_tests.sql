-- Migration: Add Scheduled Tests
-- Created: 2025-11-01
-- Description: Adds scheduled_tests table for test scheduling feature

-- ============================================
-- UP MIGRATION - Run this to apply changes
-- ============================================

-- Create scheduled_tests table
CREATE TABLE IF NOT EXISTS scheduled_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  test_case_id UUID REFERENCES test_cases(id) ON DELETE CASCADE,
  test_file_id UUID REFERENCES test_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Schedule configuration
  schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN ('one-time', 'daily', 'weekly', 'monthly')),
  scheduled_date DATE,
  scheduled_time TIME NOT NULL,
  timezone VARCHAR(100) DEFAULT 'UTC',
  
  -- Recurrence settings (for recurring schedules)
  recurrence_pattern JSONB, -- Store days of week, day of month, etc.
  
  -- Status and tracking
  enabled BOOLEAN DEFAULT true,
  next_run_at TIMESTAMP,
  last_run_at TIMESTAMP,
  last_run_status VARCHAR(50) CHECK (last_run_status IN ('passed', 'failed', 'skipped', NULL)),
  run_count INTEGER DEFAULT 0,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT test_reference_check CHECK (
    (test_case_id IS NOT NULL AND test_file_id IS NULL) OR
    (test_case_id IS NULL AND test_file_id IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_tests_enabled ON scheduled_tests(enabled);
CREATE INDEX IF NOT EXISTS idx_scheduled_tests_next_run ON scheduled_tests(next_run_at) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_tests_user ON scheduled_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tests_test_case ON scheduled_tests(test_case_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tests_test_file ON scheduled_tests(test_file_id);

-- Create trigger for updated_at
CREATE TRIGGER update_scheduled_tests_updated_at BEFORE UPDATE ON scheduled_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE scheduled_tests IS 'Stores scheduled test executions with one-time or recurring patterns';
COMMENT ON COLUMN scheduled_tests.schedule_type IS 'Type of schedule: one-time, daily, weekly, or monthly';
COMMENT ON COLUMN scheduled_tests.recurrence_pattern IS 'JSON object storing recurrence details (e.g., {"days": [1,3,5]} for weekly)';
COMMENT ON COLUMN scheduled_tests.next_run_at IS 'Calculated timestamp for the next scheduled execution';

-- ============================================
-- DOWN MIGRATION - Run this to rollback
-- ============================================

-- To rollback, run these commands:
-- DROP TRIGGER IF EXISTS update_scheduled_tests_updated_at ON scheduled_tests;
-- DROP INDEX IF EXISTS idx_scheduled_tests_test_file;
-- DROP INDEX IF EXISTS idx_scheduled_tests_test_case;
-- DROP INDEX IF EXISTS idx_scheduled_tests_user;
-- DROP INDEX IF EXISTS idx_scheduled_tests_next_run;
-- DROP INDEX IF EXISTS idx_scheduled_tests_enabled;
-- DROP TABLE IF EXISTS scheduled_tests;

