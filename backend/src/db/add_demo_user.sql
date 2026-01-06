-- =====================================================
-- Add Demo User to FitFlow
-- Run this if demo credentials don't work
-- Password: demo123
-- =====================================================

USE fitflow;

-- Delete existing demo user if present (to reset password)
DELETE FROM users WHERE email = 'demo@fitflow.com';

-- Insert fresh demo user with correct password hash
INSERT INTO users (email, password, first_name, last_name) VALUES
('demo@fitflow.com', '$2a$10$mEHV.6Aqfbzrv/mG4NoJJOe5XUYUjXPoCdvCRBe5ruLqKUtQYg4RK', 'Demo', 'User');

SELECT 'Demo user created successfully!' AS result;
SELECT 'Email: demo@fitflow.com' AS credentials;
SELECT 'Password: demo123' AS password;
