-- =====================================================
-- FitFlow Complete Database Schema
-- Version: 1.0 (Fresh Install)
-- 
-- Instructions:
-- 1. Open phpMyAdmin
-- 2. Run: DROP DATABASE IF EXISTS fitflow;
-- 3. Import this file
-- =====================================================

CREATE DATABASE IF NOT EXISTS fitflow;
USE fitflow;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- EQUIPMENT TABLE
-- =====================================================
CREATE TABLE equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('free_weights', 'machines', 'cardio', 'bodyweight', 'bands_cables', 'accessories', 'other') DEFAULT 'other',
    image_url VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- EXERCISES TABLE
-- =====================================================
CREATE TABLE exercises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('strength', 'cardio', 'flexibility', 'bodyweight', 'machine') NOT NULL,
    exercise_type ENUM('strength', 'cardio', 'flexibility', 'timed') DEFAULT 'strength',
    muscle_group VARCHAR(100),
    equipment VARCHAR(100),
    equipment_id INT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced'),
    instructions TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    is_custom BOOLEAN DEFAULT FALSE,
    default_duration INT DEFAULT NULL,
    default_distance DECIMAL(8,2) DEFAULT NULL,
    calories_per_minute DECIMAL(5,2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_muscle_group (muscle_group),
    INDEX idx_name (name),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- EXERCISE IMAGES TABLE (multiple images per exercise)
-- =====================================================
CREATE TABLE exercise_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exercise_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    INDEX idx_exercise_id (exercise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ROUTES TABLE (for cardio route planning)
-- =====================================================
CREATE TABLE routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    activity_type ENUM('running', 'biking', 'walking', 'hiking') DEFAULT 'running',
    distance_km DECIMAL(8,2),
    estimated_duration INT,
    elevation_gain INT,
    waypoints JSON,
    start_location VARCHAR(255),
    end_location VARCHAR(255),
    is_favorite BOOLEAN DEFAULT FALSE,
    workout_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- WORKOUTS TABLE
-- =====================================================
CREATE TABLE workouts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    workout_type ENUM('strength', 'cardio', 'mixed', 'flexibility') DEFAULT 'strength',
    route_id INT DEFAULT NULL,
    is_predefined BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key from routes to workouts (after workouts table exists)
ALTER TABLE routes ADD FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL;

-- =====================================================
-- WORKOUT EXERCISES JUNCTION TABLE
-- =====================================================
CREATE TABLE workout_exercises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workout_id INT NOT NULL,
    exercise_id INT NOT NULL,
    order_index INT DEFAULT 0,
    sets INT DEFAULT 3,
    reps INT DEFAULT 10,
    weight DECIMAL(6,2),
    duration INT,
    distance DECIMAL(8,2) DEFAULT NULL,
    target_pace DECIMAL(5,2) DEFAULT NULL,
    calories INT DEFAULT NULL,
    intensity ENUM('low', 'moderate', 'high', 'interval') DEFAULT NULL,
    rest_time INT DEFAULT 60,
    notes TEXT,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    INDEX idx_workout_id (workout_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PROGRAMS TABLE
-- =====================================================
CREATE TABLE programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('strength', 'cardio', 'flexibility', 'weight_loss', 'muscle_gain', 'general_fitness', 'sport_specific') DEFAULT 'general_fitness',
    duration_weeks INT DEFAULT 4,
    days_per_week INT DEFAULT 3,
    difficulty ENUM('beginner', 'intermediate', 'advanced'),
    is_predefined BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_predefined (is_predefined),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PROGRAM WORKOUTS JUNCTION TABLE
-- =====================================================
CREATE TABLE program_workouts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    workout_id INT NOT NULL,
    week_number INT DEFAULT 1,
    day_of_week INT DEFAULT 0,
    order_index INT DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    INDEX idx_program_id (program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- WORKOUT LOGS TABLE
-- =====================================================
CREATE TABLE workout_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    workout_id INT,
    program_id INT,
    duration_minutes INT,
    calories_burned INT,
    notes TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- EXERCISE LOGS TABLE
-- =====================================================
CREATE TABLE exercise_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workout_log_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets_completed INT,
    reps_completed VARCHAR(100),
    weight_used DECIMAL(6,2),
    weight_per_set JSON,
    reps_per_set JSON,
    duration_seconds INT DEFAULT NULL,
    distance_km DECIMAL(8,2) DEFAULT NULL,
    avg_pace DECIMAL(5,2) DEFAULT NULL,
    avg_heart_rate INT DEFAULT NULL,
    calories_burned INT DEFAULT NULL,
    notes TEXT,
    FOREIGN KEY (workout_log_id) REFERENCES workout_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    INDEX idx_workout_log_id (workout_log_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ROUTE LOGS TABLE
-- =====================================================
CREATE TABLE route_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    route_id INT,
    actual_duration INT,
    actual_distance_km DECIMAL(8,2),
    average_pace DECIMAL(5,2),
    average_speed DECIMAL(5,2),
    calories_burned INT,
    notes TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- USER PROGRAM PROGRESS TABLE
-- =====================================================
CREATE TABLE user_program_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    program_id INT NOT NULL,
    current_week INT DEFAULT 1,
    current_day INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_active_program (user_id, program_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Schema complete! Now run seed_complete.sql
-- =====================================================
