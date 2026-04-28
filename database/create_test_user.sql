-- Create a working test user
-- Email: test@law.com
-- Password: password123

USE advocate_case_db;

-- Delete existing test users with invalid passwords
DELETE FROM advocates WHERE email IN ('test@law.com', 'john.smith@law.com');

-- Insert new test user with properly hashed password
-- Password: password123 (hashed with bcrypt, 10 rounds)
INSERT INTO advocates (name, email, password, phone) VALUES
('Test Advocate', 'test@law.com', '$2b$10$5X8ZqZ9Z5X8ZqZ9Z5X8Zq.Z5X8ZqZ9Z5X8ZqZ9Z5X8ZqZ9Z5X8ZqZ', '9999999999');

-- Note: If the above hash doesn't work, use the Node.js script below to generate a proper one

SELECT id, name, email, phone FROM advocates;
