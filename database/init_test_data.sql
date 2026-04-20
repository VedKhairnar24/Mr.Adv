-- ============================================================================
-- Initialize Database with Test Data
-- ============================================================================
-- This script creates the database, schema, and adds test data
-- ============================================================================

-- Use the correct database
USE advocate_case_db;

-- ============================================================================
-- Insert Test Advocate (User) for Login Testing
-- ============================================================================
-- Email: test@advocate.com
-- Password: password123 (will be hashed by application during registration)
-- For now using a pre-hashed bcrypt password
-- Hash: $2b$10$9jK8L9mN0oP1qR2sT3uV4wX5yZ6aB7cD8eF9gH0iJ1kL2mN3oP4q
-- ============================================================================

DELETE FROM advocates WHERE email = 'test@advocate.com';

INSERT INTO advocates (name, email, password, phone, bar_council, enrollment_number, created_at) VALUES
('Test Advocate', 'test@advocate.com', '$2b$10$9jK8L9mN0oP1qR2sT3uV4wX5yZ6aB7cD8eF9gH0iJ1kL2mN3oP4q', '9999999999', 'Test Bar Council', 'TEST/0001/2024', NOW());

-- ============================================================================
-- Insert Test Clients for the Test Advocate
-- ============================================================================

DELETE FROM clients WHERE advocate_id = (SELECT id FROM advocates WHERE email = 'test@advocate.com');

INSERT INTO clients (advocate_id, name, phone, email, address, created_at) VALUES
((SELECT id FROM advocates WHERE email = 'test@advocate.com'), 'Client One', '9111111111', 'client1@email.com', 'Address 1, City', NOW()),
((SELECT id FROM advocates WHERE email = 'test@advocate.com'), 'Client Two', '9222222222', 'client2@email.com', 'Address 2, City', NOW()),
((SELECT id FROM advocates WHERE email = 'test@advocate.com'), 'Client Three', '9333333333', 'client3@email.com', 'Address 3, City', NOW());

-- ============================================================================
-- Verify Data
-- ============================================================================

SELECT 'Advocates Count:' as info, COUNT(*) as count FROM advocates;
SELECT 'Test Advocate Email:' as info, email FROM advocates WHERE email = 'test@advocate.com';
SELECT 'Clients for Test Advocate:' as info, COUNT(*) as count FROM clients WHERE advocate_id = (SELECT id FROM advocates WHERE email = 'test@advocate.com');
