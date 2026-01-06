-- FitFlow Database Migration - Add Routes and User Exercises
-- Run this after the initial schema.sql

USE fitflow;

-- Add user_id to exercises table to support user-created exercises
ALTER TABLE exercises 
ADD COLUMN user_id INT DEFAULT NULL AFTER id,
ADD COLUMN is_custom BOOLEAN DEFAULT FALSE AFTER video_url,
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create routes table for cardio route planning (running, biking, etc.)
CREATE TABLE IF NOT EXISTS routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    activity_type ENUM('running', 'biking', 'walking', 'hiking') DEFAULT 'running',
    distance_km DECIMAL(8,2),
    estimated_duration INT, -- in minutes
    elevation_gain INT, -- in meters
    waypoints JSON, -- Array of {lat, lng} coordinates
    start_location VARCHAR(255),
    end_location VARCHAR(255),
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create route_logs table for tracking completed routes
CREATE TABLE IF NOT EXISTS route_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    route_id INT,
    actual_duration INT, -- in minutes
    actual_distance_km DECIMAL(8,2),
    average_pace DECIMAL(5,2), -- min/km
    average_speed DECIMAL(5,2), -- km/h
    calories_burned INT,
    notes TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add more detailed tracking to exercise_logs
ALTER TABLE exercise_logs
ADD COLUMN weight_per_set JSON AFTER weight_used,
ADD COLUMN reps_per_set JSON AFTER weight_per_set;
