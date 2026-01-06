-- =====================================================
-- FitFlow Migration v6: Add Admin Support
-- 
-- Instructions:
-- 1. Open phpMyAdmin
-- 2. Select 'fitflow' database
-- 3. Run this SQL script
-- =====================================================

USE fitflow;

-- Add is_admin column to users table
ALTER TABLE users 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE AFTER last_name;

-- Create admin test account
-- Email: admin@fitflow.com
-- Password: admin123
INSERT INTO users (email, password, first_name, last_name, is_admin) VALUES
('admin@fitflow.com', '$2a$10$WFh/4NDxbZy8.2IxIOjc/uaqtbYThDJ6twMjRRHkhNPNQ1gkdMBgu', 'Admin', 'User', TRUE)
ON DUPLICATE KEY UPDATE is_admin = TRUE, password = '$2a$10$WFh/4NDxbZy8.2IxIOjc/uaqtbYThDJ6twMjRRHkhNPNQ1gkdMBgu';

-- Verify the admin was created
SELECT id, email, first_name, last_name, is_admin FROM users WHERE email = 'admin@fitflow.com';
