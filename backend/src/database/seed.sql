-- Seed data for AutomationHub Test Management Platform
-- This file provides sample data to get started with the application

-- Sample Users (password for all users: "password123")
-- The password hash is for "password123" using bcrypt (10 rounds)
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'admin'),
('dev@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dev Team', 'dev'),
('tester@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'QA Tester', 'tester')
ON CONFLICT (email) DO NOTHING;

-- Sample Test Files
INSERT INTO test_files (name, path, type, suite, status) VALUES
('auth.api.spec.ts', 'tests/api/auth.api.spec.ts', 'API', 'Api (API)', 'pending'),
('employee.api.spec.ts', 'tests/api/employee.api.spec.ts', 'API', 'Api (API)', 'pending'),
('simple.passing.spec.ts', 'tests/api/simple.passing.spec.ts', 'API', 'Api (API)', 'pending'),
('login.e2e.spec.ts', 'tests/e2e/login.e2e.spec.ts', 'E2E', 'E2E Tests', 'pending'),
('dashboard.ui.spec.ts', 'tests/ui/dashboard.ui.spec.ts', 'UI', 'UI Tests', 'pending'),
('auth.load.test.js', 'tests/load/auth.load.test.js', 'LOAD', 'Load Tests', 'pending');

-- Get the test file IDs for reference
DO $$
DECLARE
    auth_file_id UUID;
    employee_file_id UUID;
    simple_file_id UUID;
    login_file_id UUID;
    dashboard_file_id UUID;
    load_file_id UUID;
BEGIN
    SELECT id INTO auth_file_id FROM test_files WHERE name = 'auth.api.spec.ts';
    SELECT id INTO employee_file_id FROM test_files WHERE name = 'employee.api.spec.ts';
    SELECT id INTO simple_file_id FROM test_files WHERE name = 'simple.passing.spec.ts';
    SELECT id INTO login_file_id FROM test_files WHERE name = 'login.e2e.spec.ts';
    SELECT id INTO dashboard_file_id FROM test_files WHERE name = 'dashboard.ui.spec.ts';
    SELECT id INTO load_file_id FROM test_files WHERE name = 'auth.load.test.js';

    -- Sample Test Cases for Auth API
    INSERT INTO test_cases (test_file_id, name, description, type, file_path, suite, status, active) VALUES
    (auth_file_id, 'Login API - should successfully authenticate with valid credentials', 'Test case: should successfully authenticate with valid credentials', 'API', 'tests/api/auth.api.spec.ts', 'Api (API)', 'pending', true),
    (auth_file_id, 'Login API - should fail authentication with invalid credentials', 'Test case: should fail authentication with invalid credentials', 'API', 'tests/api/auth.api.spec.ts', 'Api (API)', 'pending', true),
    (auth_file_id, 'Login API - should fail authentication with empty credentials', 'Test case: should fail authentication with empty credentials', 'API', 'tests/api/auth.api.spec.ts', 'Api (API)', 'pending', true),
    (auth_file_id, 'Login API - should fail authentication with missing password', 'Test case: should fail authentication with missing password', 'API', 'tests/api/auth.api.spec.ts', 'Api (API)', 'pending', true),
    (auth_file_id, 'Token Validation - should validate valid token', 'Test case: should validate valid token', 'API', 'tests/api/auth.api.spec.ts', 'Api (API)', 'pending', true),
    (auth_file_id, 'Token Validation - should reject invalid token', 'Test case: should reject invalid token', 'API', 'tests/api/auth.api.spec.ts', 'Api (API)', 'pending', true),
    (auth_file_id, 'Logout API - should successfully logout with valid token', 'Test case: should successfully logout with valid token', 'API', 'tests/api/auth.api.spec.ts', 'Api (API)', 'pending', true);

    -- Sample Test Cases for Employee API
    INSERT INTO test_cases (test_file_id, name, description, type, file_path, suite, status, active) VALUES
    (employee_file_id, 'Employee API - should get all employees', 'Test case: should get all employees', 'API', 'tests/api/employee.api.spec.ts', 'Api (API)', 'pending', true),
    (employee_file_id, 'Employee API - should create new employee', 'Test case: should create new employee', 'API', 'tests/api/employee.api.spec.ts', 'Api (API)', 'pending', true),
    (employee_file_id, 'Employee API - should update employee details', 'Test case: should update employee details', 'API', 'tests/api/employee.api.spec.ts', 'Api (API)', 'pending', true),
    (employee_file_id, 'Employee API - should delete employee', 'Test case: should delete employee', 'API', 'tests/api/employee.api.spec.ts', 'Api (API)', 'pending', true);

    -- Sample Test Case for Simple Passing
    INSERT INTO test_cases (test_file_id, name, description, type, file_path, suite, status, active) VALUES
    (simple_file_id, 'Simple Passing Test', 'A simple test that always passes', 'API', 'tests/api/simple.passing.spec.ts', 'Api (API)', 'pending', true);

    -- Sample Test Cases for Login E2E
    INSERT INTO test_cases (test_file_id, name, description, type, file_path, suite, status, active) VALUES
    (login_file_id, 'Login E2E - User can login with valid credentials', 'End-to-end test for user login flow', 'E2E', 'tests/e2e/login.e2e.spec.ts', 'E2E Tests', 'pending', true),
    (login_file_id, 'Login E2E - User sees error with invalid credentials', 'End-to-end test for invalid login', 'E2E', 'tests/e2e/login.e2e.spec.ts', 'E2E Tests', 'pending', true);

    -- Sample Test Cases for Dashboard UI
    INSERT INTO test_cases (test_file_id, name, description, type, file_path, suite, status, active) VALUES
    (dashboard_file_id, 'Dashboard UI - should display all metrics', 'UI test for dashboard metrics display', 'UI', 'tests/ui/dashboard.ui.spec.ts', 'UI Tests', 'pending', true),
    (dashboard_file_id, 'Dashboard UI - should navigate to test runner', 'UI test for navigation', 'UI', 'tests/ui/dashboard.ui.spec.ts', 'UI Tests', 'pending', true);

    -- Sample Test Case for Load Test
    INSERT INTO test_cases (test_file_id, name, description, type, file_path, suite, status, active) VALUES
    (load_file_id, 'Auth Load Test - 100 concurrent users', 'Load test with 100 concurrent users', 'LOAD', 'tests/load/auth.load.test.js', 'Load Tests', 'pending', true);
END $$;

-- Note: This file is automatically loaded when using Docker Compose
-- The seed data will be available after starting the database with: docker-compose up -d
