-- =====================================================
-- FitFlow Complete Database Setup
-- Version: 2.0 (Railway/MySQL)
-- 
-- This single file creates the entire database schema
-- and seeds all data for FitFlow application.
--
-- Usage (Railway):
-- 1. Deploy this file to railway-import/
-- 2. Run: node import.js
--
-- Test Accounts:
-- Demo: demo@fitflow.com / demo123
-- Admin: admin@fitflow.com / admin123
-- =====================================================

-- =====================================================
-- CLEAN UP: DROP EXISTING TABLES (for fresh install)
-- =====================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS user_program_progress;
DROP TABLE IF EXISTS route_logs;
DROP TABLE IF EXISTS exercise_logs;
DROP TABLE IF EXISTS workout_logs;
DROP TABLE IF EXISTS program_workouts;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS workout_exercises;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS exercise_images;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- SCHEMA: TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_image VARCHAR(500),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
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

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
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

-- Exercise images table
CREATE TABLE IF NOT EXISTS exercise_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exercise_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    INDEX idx_exercise_id (exercise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Routes table (for cardio route planning)
CREATE TABLE IF NOT EXISTS routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    activity_type ENUM('running', 'biking', 'walking', 'hiking') DEFAULT 'running',
    distance_km DECIMAL(8,2),
    estimated_duration INT,
    elevation_gain INT,
    waypoints JSON,
    routed_path JSON,
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

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
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

-- Workout exercises junction table
CREATE TABLE IF NOT EXISTS workout_exercises (
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

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
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

-- Program workouts junction table
CREATE TABLE IF NOT EXISTS program_workouts (
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

-- Workout logs table
CREATE TABLE IF NOT EXISTS workout_logs (
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

-- Exercise logs table
CREATE TABLE IF NOT EXISTS exercise_logs (
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

-- Route logs table
CREATE TABLE IF NOT EXISTS route_logs (
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
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User program progress table
CREATE TABLE IF NOT EXISTS user_program_progress (
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
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ratings table (for workouts and programs)
CREATE TABLE IF NOT EXISTS ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    workout_id INT DEFAULT NULL,
    program_id INT DEFAULT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_workout (user_id, workout_id),
    UNIQUE KEY unique_user_program (user_id, program_id),
    INDEX idx_workout_id (workout_id),
    INDEX idx_program_id (program_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SEED DATA: USERS
-- =====================================================

INSERT INTO users (email, password, first_name, last_name, is_admin) VALUES
('demo@fitflow.com', '$2a$10$kuAUne/YpLTKrpeIVs6rqeZH333rMm9oEwEdZSyr8Eonp11tovOCa', 'Demo', 'User', FALSE),
('admin@fitflow.com', '$2a$10$ylX0rsdHRyetUA/8ZhNBJe3/sv3PajogzId7ls7oFQZg81qtV62/q', 'Admin', 'User', TRUE),
('system@fitflow.app', '$2a$10$ylX0rsdHRyetUA/8ZhNBJe3/sv3PajogzId7ls7oFQZg81qtV62/q', 'FitFlow', 'System', FALSE);

-- =====================================================
-- SEED DATA: EQUIPMENT (with images)
-- =====================================================

INSERT INTO equipment (name, description, category, image_url, is_public) VALUES
('Barbell', 'Standard Olympic barbell, typically 20kg/45lbs', 'free_weights', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', TRUE),
('Dumbbells', 'Pair of adjustable or fixed weight dumbbells', 'free_weights', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400&h=300&fit=crop', TRUE),
('Kettlebell', 'Cast iron weight with handle for swings and lifts', 'free_weights', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop', TRUE),
('EZ Curl Bar', 'Curved barbell for bicep and tricep exercises', 'free_weights', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop', TRUE),
('Weight Plates', 'Olympic or standard weight plates in various sizes', 'free_weights', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop', TRUE),
('Cable Machine', 'Adjustable pulley system for various exercises', 'machines', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop', TRUE),
('Lat Pulldown Machine', 'Machine for lat pulldown and back exercises', 'machines', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', TRUE),
('Leg Press Machine', 'Machine for leg press and lower body training', 'machines', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', TRUE),
('Chest Press Machine', 'Machine for chest press movements', 'machines', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop', TRUE),
('Leg Extension Machine', 'Isolation machine for quadriceps', 'machines', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', TRUE),
('Leg Curl Machine', 'Isolation machine for hamstrings', 'machines', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', TRUE),
('Shoulder Press Machine', 'Machine for overhead pressing', 'machines', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop', TRUE),
('Pec Deck Machine', 'Chest fly isolation machine', 'machines', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop', TRUE),
('Smith Machine', 'Guided barbell machine for various exercises', 'machines', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', TRUE),
('Hack Squat Machine', 'Machine for quad-focused squatting', 'machines', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', TRUE),
('Treadmill', 'Motorized running/walking belt machine', 'cardio', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop', TRUE),
('Stationary Bike', 'Indoor cycling machine for cardio', 'cardio', 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=400&h=300&fit=crop', TRUE),
('Elliptical', 'Low-impact cardio machine', 'cardio', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop', TRUE),
('Rowing Machine', 'Cardio machine simulating rowing', 'cardio', 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=400&h=300&fit=crop', TRUE),
('Jump Rope', 'Speed rope for cardio and conditioning', 'cardio', 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop', TRUE),
('Assault Bike', 'Air resistance fan bike for HIIT', 'cardio', 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=400&h=300&fit=crop', TRUE),
('Pull-up Bar', 'Bar for pull-ups and hanging exercises', 'bodyweight', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop', TRUE),
('Dip Station', 'Parallel bars for dips and leg raises', 'bodyweight', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop', TRUE),
('Plyo Box', 'Sturdy box for box jumps and step-ups', 'bodyweight', 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop', TRUE),
('Gymnastic Rings', 'Suspended rings for bodyweight exercises', 'bodyweight', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop', TRUE),
('Resistance Bands', 'Elastic bands of various resistances', 'bands_cables', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop', TRUE),
('Battle Ropes', 'Heavy ropes for conditioning', 'bands_cables', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop', TRUE),
('TRX Suspension Trainer', 'Suspension straps for bodyweight training', 'bands_cables', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop', TRUE),
('Bench (Flat)', 'Flat weight bench for pressing', 'accessories', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', TRUE),
('Bench (Adjustable)', 'Adjustable incline/decline bench', 'accessories', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', TRUE),
('Ab Wheel', 'Wheel with handles for ab rollouts', 'accessories', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop', TRUE),
('Foam Roller', 'For self-massage and mobility', 'accessories', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', TRUE),
('Yoga Mat', 'Cushioned mat for floor exercises', 'accessories', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop', TRUE),
('Medicine Ball', 'Weighted ball for functional training', 'accessories', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop', TRUE),
('Slam Ball', 'Heavy ball designed for throwing', 'accessories', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop', TRUE),
('Squat Rack', 'Power rack or squat stand for barbell exercises', 'accessories', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', TRUE),
('Dip Belt', 'Belt for adding weight to bodyweight exercises', 'accessories', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop', TRUE);

-- =====================================================
-- SEED DATA: EXERCISES (with images)
-- =====================================================

-- CHEST
INSERT INTO exercises (name, description, category, exercise_type, muscle_group, equipment, difficulty, instructions, image_url) VALUES
('Bench Press', 'Classic barbell chest exercise', 'strength', 'strength', 'Chest', 'Barbell', 'intermediate', 'Lie on bench, grip bar wider than shoulders. Lower to chest, press up.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop'),
('Incline Bench Press', 'Upper chest focused pressing', 'strength', 'strength', 'Chest', 'Barbell', 'intermediate', 'Set bench to 30-45 degrees. Press bar from upper chest.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop'),
('Dumbbell Bench Press', 'Chest press with dumbbells', 'strength', 'strength', 'Chest', 'Dumbbells', 'beginner', 'Lie on bench with dumbbells at chest. Press up and slightly inward.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Dumbbell Flyes', 'Isolation for chest stretch', 'strength', 'strength', 'Chest', 'Dumbbells', 'intermediate', 'Lie on bench, extend arms with slight bend. Lower in arc motion.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Push-ups', 'Classic bodyweight chest exercise', 'bodyweight', 'strength', 'Chest', 'None', 'beginner', 'Start in plank. Lower chest to ground, push back up.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop'),
('Diamond Push-ups', 'Tricep and inner chest push-up', 'bodyweight', 'strength', 'Chest', 'None', 'intermediate', 'Form diamond with hands. Perform push-up with elbows close.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop'),
('Cable Crossover', 'Cable exercise for chest', 'machine', 'strength', 'Chest', 'Cable Machine', 'intermediate', 'Pull cable handles down and together. Squeeze chest.', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop'),
('Machine Chest Press', 'Guided chest press', 'machine', 'strength', 'Chest', 'Chest Press Machine', 'beginner', 'Sit with back against pad. Press handles forward.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop'),
('Pec Deck Fly', 'Machine fly for chest', 'machine', 'strength', 'Chest', 'Pec Deck Machine', 'beginner', 'Sit with arms against pads. Bring arms together.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop'),
('Decline Bench Press', 'Lower chest focused pressing', 'strength', 'strength', 'Chest', 'Barbell', 'intermediate', 'Set bench to decline. Press bar from lower chest.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop'),

-- BACK
('Deadlift', 'Compound posterior chain exercise', 'strength', 'strength', 'Back', 'Barbell', 'advanced', 'Stand with feet hip-width. Drive through heels, extend hips and knees.', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop'),
('Barbell Row', 'Horizontal pulling for back', 'strength', 'strength', 'Back', 'Barbell', 'intermediate', 'Hinge forward, grip bar. Pull to lower chest.', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop'),
('Dumbbell Row', 'Single arm rowing', 'strength', 'strength', 'Back', 'Dumbbells', 'beginner', 'One hand and knee on bench. Pull dumbbell to hip.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Pull-ups', 'Bodyweight vertical pulling', 'bodyweight', 'strength', 'Back', 'Pull-up Bar', 'intermediate', 'Hang from bar. Pull chest to bar, squeezing lats.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop'),
('Chin-ups', 'Underhand pull-up', 'bodyweight', 'strength', 'Back', 'Pull-up Bar', 'intermediate', 'Hang with underhand grip. Pull chest to bar.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop'),
('Lat Pulldown', 'Machine pull-up motion', 'machine', 'strength', 'Back', 'Lat Pulldown Machine', 'beginner', 'Sit with thighs under pads. Pull bar to upper chest.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'),
('Seated Cable Row', 'Horizontal cable rowing', 'machine', 'strength', 'Back', 'Cable Machine', 'beginner', 'Sit upright, feet on platform. Pull handle to stomach.', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop'),
('Face Pulls', 'Rear delt and upper back', 'machine', 'strength', 'Back', 'Cable Machine', 'beginner', 'Set cable high, use rope. Pull to face.', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop'),
('Inverted Rows', 'Bodyweight horizontal rowing', 'bodyweight', 'strength', 'Back', 'Pull-up Bar', 'beginner', 'Hang under bar. Pull chest to bar.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop'),
('T-Bar Row', 'Compound rowing with T-bar', 'strength', 'strength', 'Back', 'Barbell', 'intermediate', 'Straddle T-bar. Pull weight toward chest.', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop'),
('Pendlay Row', 'Explosive barbell row from floor', 'strength', 'strength', 'Back', 'Barbell', 'advanced', 'Row from dead stop on floor. Explosively pull to chest.', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop'),

-- SHOULDERS
('Overhead Press', 'Standing barbell press', 'strength', 'strength', 'Shoulders', 'Barbell', 'intermediate', 'Stand with bar at shoulders. Press overhead.', 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&h=300&fit=crop'),
('Dumbbell Shoulder Press', 'Seated or standing press', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Dumbbells at shoulders. Press overhead.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Lateral Raises', 'Side deltoid isolation', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Stand with dumbbells. Raise arms to sides.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Front Raises', 'Front deltoid isolation', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Stand with dumbbells. Raise arms forward.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Rear Delt Flyes', 'Rear deltoid isolation', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Bend forward. Raise arms to sides.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Arnold Press', 'Rotating dumbbell press', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'intermediate', 'Start palms facing you. Rotate and press overhead.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Machine Shoulder Press', 'Guided shoulder press', 'machine', 'strength', 'Shoulders', 'Shoulder Press Machine', 'beginner', 'Sit with back against pad. Press handles overhead.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop'),
('Pike Push-ups', 'Bodyweight shoulder press', 'bodyweight', 'strength', 'Shoulders', 'None', 'intermediate', 'Pike position with hips high. Lower head toward ground.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop'),
('Upright Row', 'Shoulder and trap exercise', 'strength', 'strength', 'Shoulders', 'Barbell', 'intermediate', 'Pull barbell up to chin level, elbows high.', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop'),
('Shrugs', 'Trapezius isolation', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Hold weights at sides. Shrug shoulders to ears.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),

-- ARMS
('Barbell Curl', 'Classic bicep exercise', 'strength', 'strength', 'Biceps', 'Barbell', 'beginner', 'Stand with barbell. Curl weight to shoulders.', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop'),
('Dumbbell Curl', 'Bicep curl with dumbbells', 'strength', 'strength', 'Biceps', 'Dumbbells', 'beginner', 'Stand with dumbbells. Curl to shoulders.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Hammer Curl', 'Bicep curl neutral grip', 'strength', 'strength', 'Biceps', 'Dumbbells', 'beginner', 'Stand with dumbbells, palms in. Curl keeping neutral grip.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Preacher Curl', 'Isolated bicep curl', 'strength', 'strength', 'Biceps', 'EZ Curl Bar', 'intermediate', 'Rest arms on preacher bench. Curl weight up.', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop'),
('Cable Curl', 'Constant tension bicep curl', 'machine', 'strength', 'Biceps', 'Cable Machine', 'beginner', 'Stand facing cable. Curl handle to shoulders.', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop'),
('Concentration Curl', 'Isolated single-arm curl', 'strength', 'strength', 'Biceps', 'Dumbbells', 'beginner', 'Sit with elbow on inner thigh. Curl dumbbell up.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Tricep Pushdown', 'Cable tricep exercise', 'machine', 'strength', 'Triceps', 'Cable Machine', 'beginner', 'Stand at cable machine. Push down until arms straight.', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop'),
('Skull Crushers', 'Lying tricep extension', 'strength', 'strength', 'Triceps', 'EZ Curl Bar', 'intermediate', 'Lie on bench, bar above chest. Lower to forehead, extend.', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop'),
('Overhead Tricep Extension', 'Tricep extension overhead', 'strength', 'strength', 'Triceps', 'Dumbbells', 'beginner', 'Hold dumbbell overhead. Lower behind head, extend.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Tricep Dips', 'Bodyweight tricep exercise', 'bodyweight', 'strength', 'Triceps', 'Dip Station', 'intermediate', 'Support on parallel bars. Lower body, push up.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop'),
('Close-grip Bench Press', 'Compound tricep pressing', 'strength', 'strength', 'Triceps', 'Barbell', 'intermediate', 'Grip bar shoulder-width. Press focusing on triceps.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop'),
('Tricep Kickbacks', 'Isolated tricep extension', 'strength', 'strength', 'Triceps', 'Dumbbells', 'beginner', 'Bend over, upper arm parallel. Extend forearm back.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),

-- LEGS
('Barbell Squat', 'King of leg exercises', 'strength', 'strength', 'Legs', 'Barbell', 'intermediate', 'Bar on upper back. Squat down, drive through heels.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'),
('Front Squat', 'Quad-dominant squat', 'strength', 'strength', 'Legs', 'Barbell', 'advanced', 'Bar on front delts. Squat keeping torso upright.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'),
('Goblet Squat', 'Beginner-friendly squat', 'strength', 'strength', 'Legs', 'Dumbbells', 'beginner', 'Hold dumbbell at chest. Squat down between legs.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop'),
('Leg Press', 'Machine compound leg', 'machine', 'strength', 'Legs', 'Leg Press Machine', 'beginner', 'Sit in machine. Press platform away.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'),
('Leg Extension', 'Quadricep isolation', 'machine', 'strength', 'Legs', 'Leg Extension Machine', 'beginner', 'Sit in machine. Extend legs until straight.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'),
('Leg Curl', 'Hamstring isolation', 'machine', 'strength', 'Legs', 'Leg Curl Machine', 'beginner', 'Lie or sit in machine. Curl legs toward glutes.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'),
('Romanian Deadlift', 'Hamstring and glute focus', 'strength', 'strength', 'Legs', 'Barbell', 'intermediate', 'Stand with bar. Hinge at hips, lower bar along legs.', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop'),
('Lunges', 'Unilateral leg exercise', 'strength', 'strength', 'Legs', 'Dumbbells', 'beginner', 'Step forward into lunge. Push back to start.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'),
('Bulgarian Split Squat', 'Single leg squat', 'strength', 'strength', 'Legs', 'Dumbbells', 'intermediate', 'Rear foot on bench. Squat on front leg.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'),
('Calf Raises', 'Calf development', 'strength', 'strength', 'Calves', 'Dumbbells', 'beginner', 'Stand on edge of step. Rise on toes.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'),
('Bodyweight Squats', 'Basic squat', 'bodyweight', 'strength', 'Legs', 'None', 'beginner', 'Stand feet shoulder-width. Squat down.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'),
('Jump Squats', 'Explosive squat', 'bodyweight', 'strength', 'Legs', 'None', 'intermediate', 'Squat down, explosively jump up.', 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop'),
('Wall Sit', 'Isometric leg endurance', 'bodyweight', 'timed', 'Legs', 'None', 'beginner', 'Lean against wall, thighs parallel. Hold.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'),
('Step-ups', 'Unilateral leg using box', 'bodyweight', 'strength', 'Legs', 'Plyo Box', 'beginner', 'Step up onto box. Step down.', 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop'),
('Hip Thrusts', 'Glute focused', 'strength', 'strength', 'Glutes', 'Barbell', 'intermediate', 'Back against bench, bar across hips. Drive hips up.', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop'),
('Sumo Deadlift', 'Wide-stance deadlift', 'strength', 'strength', 'Legs', 'Barbell', 'advanced', 'Wide stance, grip inside knees. Drive through hips.', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop'),
('Hack Squat', 'Machine squat variation', 'machine', 'strength', 'Legs', 'Hack Squat Machine', 'beginner', 'Position under pads. Squat down and drive up.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'),

-- CORE
('Plank', 'Isometric core stability', 'bodyweight', 'timed', 'Core', 'None', 'beginner', 'Hold push-up position on forearms. Keep body straight.', 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'),
('Crunches', 'Basic abdominal exercise', 'bodyweight', 'strength', 'Core', 'None', 'beginner', 'Lie on back, knees bent. Curl shoulders off ground.', 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'),
('Russian Twists', 'Rotational core', 'bodyweight', 'strength', 'Core', 'None', 'intermediate', 'Sit with knees bent, lean back. Rotate side to side.', 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'),
('Leg Raises', 'Lower ab focused', 'bodyweight', 'strength', 'Core', 'None', 'intermediate', 'Lie on back. Raise legs to vertical.', 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'),
('Mountain Climbers', 'Dynamic core and cardio', 'bodyweight', 'cardio', 'Core', 'None', 'beginner', 'Start in push-up. Drive knees toward chest alternately.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop'),
('Dead Bug', 'Core stability', 'bodyweight', 'strength', 'Core', 'None', 'beginner', 'Lie on back. Lower opposite arm and leg, alternate.', 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'),
('Bird Dog', 'Core and balance', 'bodyweight', 'strength', 'Core', 'None', 'beginner', 'On hands and knees. Extend opposite arm and leg.', 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'),
('Ab Wheel Rollout', 'Advanced core', 'strength', 'strength', 'Core', 'Ab Wheel', 'advanced', 'Kneel holding ab wheel. Roll forward, roll back.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop'),
('Cable Woodchop', 'Rotational core with cable', 'machine', 'strength', 'Core', 'Cable Machine', 'intermediate', 'Stand sideways to cable. Pull handle diagonally.', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop'),
('Hanging Leg Raises', 'Advanced core', 'bodyweight', 'strength', 'Core', 'Pull-up Bar', 'advanced', 'Hang from bar. Raise legs to horizontal.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop'),
('Side Plank', 'Oblique stability', 'bodyweight', 'timed', 'Core', 'None', 'intermediate', 'Support on one forearm, body in line. Hold.', 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'),
('Bicycle Crunches', 'Dynamic ab exercise', 'bodyweight', 'strength', 'Core', 'None', 'beginner', 'Lie on back. Alternate elbow to opposite knee.', 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=300&fit=crop'),

-- CARDIO
('Treadmill Running', 'Indoor running on treadmill', 'cardio', 'cardio', 'Full Body', 'Treadmill', 'beginner', 'Maintain good posture, start with warm-up walk.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop'),
('Running', 'Outdoor or treadmill', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Maintain good posture, start with warm-up walk.', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop'),
('Cycling', 'Indoor or outdoor', 'cardio', 'cardio', 'Legs', 'Stationary Bike', 'beginner', 'Adjust seat height. Maintain steady cadence.', 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=400&h=300&fit=crop'),
('Rowing Machine', 'Full body cardio on rower', 'cardio', 'cardio', 'Full Body', 'Rowing Machine', 'intermediate', 'Drive with legs first, lean back, pull to chest.', 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=400&h=300&fit=crop'),
('Jump Rope', 'High-intensity cardio', 'cardio', 'cardio', 'Full Body', 'Jump Rope', 'beginner', 'Keep elbows close. Land softly on balls of feet.', 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop'),
('Elliptical', 'Low-impact cardio', 'cardio', 'cardio', 'Full Body', 'Elliptical', 'beginner', 'Stand tall, grip handles lightly.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop'),
('Walking', 'Brisk walking', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Maintain brisk pace, swing arms naturally.', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop'),
('Burpees', 'Full body cardio', 'cardio', 'cardio', 'Full Body', 'None', 'intermediate', 'Drop to push-up, perform push-up, jump up.', 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop'),
('Jumping Jacks', 'Classic cardio warm-up', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Jump feet out while raising arms.', 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop'),
('High Knees', 'Running in place', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Run in place, driving knees high.', 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop'),
('Box Jumps', 'Explosive plyometric', 'cardio', 'cardio', 'Legs', 'Plyo Box', 'intermediate', 'Jump onto box, land softly. Step down.', 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop'),
('Battle Rope Waves', 'High intensity conditioning', 'cardio', 'cardio', 'Full Body', 'Battle Ropes', 'intermediate', 'Create alternating waves with arms.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop'),
('Kettlebell Swings', 'Hip hinge cardio', 'cardio', 'cardio', 'Full Body', 'Kettlebell', 'intermediate', 'Hinge at hips, swing kettlebell up.', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop'),
('Stair Climber', 'Stair machine cardio', 'cardio', 'cardio', 'Legs', 'None', 'beginner', 'Step steadily, maintain upright posture.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop'),
('Sprint Intervals', 'High-intensity sprint training', 'cardio', 'cardio', 'Full Body', 'None', 'advanced', 'Sprint 20-30 seconds, rest 60-90 seconds.', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop'),

-- FLEXIBILITY
('Standing Hamstring Stretch', 'Basic hamstring flexibility', 'flexibility', 'flexibility', 'Legs', 'None', 'beginner', 'Stand and reach toward toes. Hold 30 seconds.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('Quad Stretch', 'Standing quadricep stretch', 'flexibility', 'flexibility', 'Legs', 'None', 'beginner', 'Stand on one leg, pull foot to glute.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('Hip Flexor Stretch', 'Kneeling hip flexor', 'flexibility', 'flexibility', 'Hips', 'None', 'beginner', 'Kneel on one knee. Push hips forward.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('Pigeon Pose', 'Deep hip opener', 'flexibility', 'flexibility', 'Hips', 'None', 'intermediate', 'Bring one knee forward, extend other leg back.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('Cat-Cow Stretch', 'Spinal mobility', 'flexibility', 'flexibility', 'Back', 'None', 'beginner', 'On hands and knees, alternate arching and rounding.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('Childs Pose', 'Restful back stretch', 'flexibility', 'flexibility', 'Back', 'None', 'beginner', 'Kneel and sit back. Extend arms forward.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('Shoulder Stretch', 'Cross-body shoulder', 'flexibility', 'flexibility', 'Shoulders', 'None', 'beginner', 'Bring arm across chest. Hold 30 seconds.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('Tricep Stretch', 'Overhead tricep stretch', 'flexibility', 'flexibility', 'Arms', 'None', 'beginner', 'Raise arm overhead, bend elbow. Push elbow back.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('Chest Stretch', 'Doorway chest stretch', 'flexibility', 'flexibility', 'Chest', 'None', 'beginner', 'Place forearm on wall. Turn body away.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('Downward Dog', 'Full body yoga pose', 'flexibility', 'flexibility', 'Full Body', 'None', 'beginner', 'Form inverted V. Press heels toward ground.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('World''s Greatest Stretch', 'Full body dynamic stretch', 'flexibility', 'flexibility', 'Full Body', 'None', 'intermediate', 'Lunge, rotate, reach. Targets multiple muscle groups.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'),
('90/90 Hip Stretch', 'Hip mobility drill', 'flexibility', 'flexibility', 'Hips', 'None', 'intermediate', 'Sit with legs at 90-degree angles. Rotate torso.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop');

-- =====================================================
-- SEED DATA: PREDEFINED WORKOUTS
-- =====================================================

SET @system_user_id = (SELECT id FROM users WHERE email = 'system@fitflow.app');

-- Beginner Full Body A
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Beginner Full Body A', 'Foundational full body workout focusing on compound movements', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 3, 12, 60 FROM exercises WHERE name = 'Goblet Squat' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 3, 10, 60 FROM exercises WHERE name = 'Dumbbell Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 10, 60 FROM exercises WHERE name = 'Dumbbell Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 10, 60 FROM exercises WHERE name = 'Dumbbell Shoulder Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 1, 45 FROM exercises WHERE name = 'Plank' LIMIT 1;

-- Beginner Full Body B
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Beginner Full Body B', 'Foundational full body workout - variation B', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 3, 10, 60 FROM exercises WHERE name = 'Lunges' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 3, 10, 60 FROM exercises WHERE name = 'Push-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 10, 60 FROM exercises WHERE name = 'Lat Pulldown' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 12, 45 FROM exercises WHERE name = 'Lateral Raises' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 15, 45 FROM exercises WHERE name = 'Crunches' LIMIT 1;

-- Intermediate Push Day
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Intermediate Push Day', 'Chest, shoulders, and triceps focused workout', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 4, 8, 90 FROM exercises WHERE name = 'Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 3, 10, 90 FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 4, 8, 90 FROM exercises WHERE name = 'Overhead Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 12, 60 FROM exercises WHERE name = 'Dumbbell Flyes' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 15, 45 FROM exercises WHERE name = 'Lateral Raises' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 6, 3, 12, 45 FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1;

-- Intermediate Pull Day
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Intermediate Pull Day', 'Back and biceps focused workout', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 4, 8, 90 FROM exercises WHERE name = 'Barbell Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 4, 8, 90 FROM exercises WHERE name = 'Pull-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 10, 60 FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 15, 45 FROM exercises WHERE name = 'Face Pulls' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 10, 60 FROM exercises WHERE name = 'Barbell Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 6, 3, 12, 45 FROM exercises WHERE name = 'Hammer Curl' LIMIT 1;

-- Intermediate Leg Day
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Intermediate Leg Day', 'Complete lower body workout', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 4, 8, 120 FROM exercises WHERE name = 'Barbell Squat' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 4, 10, 90 FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 12, 90 FROM exercises WHERE name = 'Leg Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 15, 60 FROM exercises WHERE name = 'Leg Extension' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 12, 60 FROM exercises WHERE name = 'Leg Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 6, 4, 15, 45 FROM exercises WHERE name = 'Calf Raises' LIMIT 1;

-- HIIT Session
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'HIIT Cardio Session', 'High-intensity interval training for fat burning', 'cardio', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 3, 20, 30 FROM exercises WHERE name = 'Jumping Jacks' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 4, 10, 30 FROM exercises WHERE name = 'Burpees' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 4, 20, 30 FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 4, 30, 30 FROM exercises WHERE name = 'High Knees' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 4, 15, 30 FROM exercises WHERE name = 'Jump Squats' LIMIT 1;

-- Home Workout
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'No Equipment Home Workout', 'Full body workout with no equipment needed', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 4, 15, 45 FROM exercises WHERE name = 'Bodyweight Squats' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 4, 12, 45 FROM exercises WHERE name = 'Push-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 12, 45 FROM exercises WHERE name = 'Lunges' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 10, 45 FROM exercises WHERE name = 'Pike Push-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 1, 30 FROM exercises WHERE name = 'Plank' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 6, 3, 20, 45 FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1;

-- Flexibility Routine
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Full Body Stretch', 'Complete flexibility routine for recovery', 'flexibility', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 1, 1, 1, 45 FROM exercises WHERE name = 'Standing Hamstring Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 2, 1, 1, 30 FROM exercises WHERE name = 'Quad Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 3, 1, 1, 30 FROM exercises WHERE name = 'Hip Flexor Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 4, 1, 1, 30 FROM exercises WHERE name = 'Chest Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 5, 1, 1, 30 FROM exercises WHERE name = 'Shoulder Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 6, 1, 1, 60 FROM exercises WHERE name = 'Childs Pose' LIMIT 1;

-- =====================================================
-- ADDITIONAL PREDEFINED WORKOUTS
-- =====================================================

-- Upper Body Strength
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Upper Body Strength', 'Complete upper body workout targeting chest, back, shoulders, and arms', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 4, 8, 90 FROM exercises WHERE name = 'Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 4, 8, 90 FROM exercises WHERE name = 'Barbell Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 10, 60 FROM exercises WHERE name = 'Dumbbell Shoulder Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 12, 45 FROM exercises WHERE name = 'Dumbbell Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 12, 45 FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1;

-- Lower Body Power
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Lower Body Power', 'Powerful leg workout focusing on strength and explosiveness', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 5, 5, 120 FROM exercises WHERE name = 'Barbell Squat' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 4, 6, 120 FROM exercises WHERE name = 'Deadlift' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 10, 90 FROM exercises WHERE name = 'Bulgarian Split Squat' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 4, 10, 60 FROM exercises WHERE name = 'Box Jumps' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 4, 20, 45 FROM exercises WHERE name = 'Calf Raises' LIMIT 1;

-- Core Crusher
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Core Crusher', 'Intense core workout for a strong midsection', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 1, 3, 1, 45 FROM exercises WHERE name = 'Plank' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 3, 20, 30 FROM exercises WHERE name = 'Crunches' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 15, 30 FROM exercises WHERE name = 'Leg Raises' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 20, 30 FROM exercises WHERE name = 'Russian Twists' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 20, 30 FROM exercises WHERE name = 'Bicycle Crunches' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 6, 3, 1, 30 FROM exercises WHERE name = 'Side Plank' LIMIT 1;

-- Arms Blast
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Arms Blast', 'Dedicated biceps and triceps workout for arm growth', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 3, 10, 60 FROM exercises WHERE name = 'Barbell Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 3, 10, 60 FROM exercises WHERE name = 'Close-grip Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 12, 45 FROM exercises WHERE name = 'Hammer Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 12, 45 FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 12, 45 FROM exercises WHERE name = 'Concentration Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 6, 3, 15, 45 FROM exercises WHERE name = 'Overhead Tricep Extension' LIMIT 1;

-- Athletic Performance
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Athletic Performance', 'Functional training for sports and athleticism', 'mixed', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 4, 8, 90 FROM exercises WHERE name = 'Deadlift' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 4, 10, 60 FROM exercises WHERE name = 'Box Jumps' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 4, 15, 45 FROM exercises WHERE name = 'Kettlebell Swings' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 8, 60 FROM exercises WHERE name = 'Pull-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 4, 10, 45 FROM exercises WHERE name = 'Lunges' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 6, 3, 15, 45 FROM exercises WHERE name = 'Battle Rope Waves' LIMIT 1;

-- Quick 20 Minute Burn
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Quick 20 Minute Burn', 'Fast-paced workout when you are short on time', 'cardio', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 3, 30, 15 FROM exercises WHERE name = 'Jumping Jacks' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 3, 20, 15 FROM exercises WHERE name = 'Bodyweight Squats' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 15, 15 FROM exercises WHERE name = 'Push-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 20, 15 FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 8, 15 FROM exercises WHERE name = 'Burpees' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 6, 2, 1, 30 FROM exercises WHERE name = 'Plank' LIMIT 1;

-- Shoulder Sculpt
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Shoulder Sculpt', 'Targeted shoulder workout for defined delts', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 4, 8, 90 FROM exercises WHERE name = 'Overhead Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 3, 10, 60 FROM exercises WHERE name = 'Arnold Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 4, 15, 45 FROM exercises WHERE name = 'Lateral Raises' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 4, 15, 45 FROM exercises WHERE name = 'Front Raises' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 4, 15, 45 FROM exercises WHERE name = 'Rear Delt Flyes' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 6, 3, 15, 45 FROM exercises WHERE name = 'Face Pulls' LIMIT 1;

-- Back Builder
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Back Builder', 'Comprehensive back workout for width and thickness', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 4, 6, 120 FROM exercises WHERE name = 'Deadlift' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 4, 8, 90 FROM exercises WHERE name = 'Pull-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 4, 10, 60 FROM exercises WHERE name = 'Barbell Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 12, 60 FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 12, 45 FROM exercises WHERE name = 'Dumbbell Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 6, 3, 15, 45 FROM exercises WHERE name = 'Face Pulls' LIMIT 1;

-- Chest Destroyer
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Chest Destroyer', 'High-volume chest workout for maximum growth', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 4, 8, 90 FROM exercises WHERE name = 'Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 4, 10, 90 FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 10, 60 FROM exercises WHERE name = 'Dumbbell Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 12, 60 FROM exercises WHERE name = 'Cable Crossover' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 3, 12, 45 FROM exercises WHERE name = 'Dumbbell Flyes' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 6, 3, 15, 30 FROM exercises WHERE name = 'Push-ups' LIMIT 1;

-- Glute Focus
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Glute Focus', 'Targeted workout for glute development', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 4, 10, 90 FROM exercises WHERE name = 'Hip Thrusts' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 4, 10, 90 FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 3, 12, 60 FROM exercises WHERE name = 'Bulgarian Split Squat' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 3, 12, 60 FROM exercises WHERE name = 'Lunges' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 5, 4, 15, 45 FROM exercises WHERE name = 'Step-ups' LIMIT 1;

-- Morning Yoga Flow
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Morning Yoga Flow', 'Gentle stretching routine to start your day', 'flexibility', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 1, 1, 1, 30 FROM exercises WHERE name = 'Cat-Cow Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 2, 1, 1, 45 FROM exercises WHERE name = 'Downward Dog' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 3, 1, 1, 30 FROM exercises WHERE name = 'Hip Flexor Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 4, 1, 1, 45 FROM exercises WHERE name = 'Pigeon Pose' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) SELECT @workout_id, id, 5, 1, 1, 60 FROM exercises WHERE name = 'Childs Pose' LIMIT 1;

-- Tabata Torture
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Tabata Torture', 'Intense 4-minute rounds of maximum effort', 'cardio', TRUE);
SET @workout_id = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 1, 8, 20, 10 FROM exercises WHERE name = 'Burpees' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 2, 8, 20, 10 FROM exercises WHERE name = 'Jump Squats' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 3, 8, 20, 10 FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @workout_id, id, 4, 8, 20, 10 FROM exercises WHERE name = 'High Knees' LIMIT 1;

-- =====================================================
-- SEED DATA: PREDEFINED PROGRAMS
-- =====================================================

-- Beginner Strength Foundation
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Beginner Strength Foundation', 'Perfect for those new to weight training. Build a solid foundation with full-body workouts 3 days per week.', 'strength', 4, 3, 'beginner', TRUE);
SET @program_id = LAST_INSERT_ID();
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'Beginner Full Body A' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 2, 2 FROM workouts WHERE name = 'Beginner Full Body B' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 4, 3 FROM workouts WHERE name = 'Beginner Full Body A' AND is_predefined = TRUE LIMIT 1;

-- Push Pull Legs
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Push Pull Legs Split', 'Classic PPL split for intermediate lifters. Train 6 days per week hitting each muscle group twice.', 'muscle_gain', 6, 6, 'intermediate', TRUE);
SET @program_id = LAST_INSERT_ID();
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'Intermediate Push Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 1, 2 FROM workouts WHERE name = 'Intermediate Pull Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 2, 3 FROM workouts WHERE name = 'Intermediate Leg Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 3, 4 FROM workouts WHERE name = 'Intermediate Push Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 4, 5 FROM workouts WHERE name = 'Intermediate Pull Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 5, 6 FROM workouts WHERE name = 'Intermediate Leg Day' AND is_predefined = TRUE LIMIT 1;

-- Home Transformation
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Home Body Transformation', 'No gym? No problem! Complete bodyweight program you can do anywhere.', 'general_fitness', 4, 4, 'beginner', TRUE);
SET @program_id = LAST_INSERT_ID();
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'No Equipment Home Workout' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 1, 2 FROM workouts WHERE name = 'Full Body Stretch' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 3, 3 FROM workouts WHERE name = 'No Equipment Home Workout' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 4, 4 FROM workouts WHERE name = 'HIIT Cardio Session' AND is_predefined = TRUE LIMIT 1;

-- Fat Burning Cardio
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Fat Burning Cardio', 'High-energy cardio program designed for maximum calorie burn.', 'weight_loss', 4, 4, 'intermediate', TRUE);
SET @program_id = LAST_INSERT_ID();
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'HIIT Cardio Session' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 2, 2 FROM workouts WHERE name = 'No Equipment Home Workout' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 4, 3 FROM workouts WHERE name = 'HIIT Cardio Session' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 6, 4 FROM workouts WHERE name = 'Full Body Stretch' AND is_predefined = TRUE LIMIT 1;

-- =====================================================
-- ADDITIONAL PREDEFINED PROGRAMS
-- =====================================================

-- Upper/Lower Split
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Upper Lower Split', 'Classic 4-day split alternating between upper and lower body workouts. Great for intermediate lifters.', 'muscle_gain', 8, 4, 'intermediate', TRUE);
SET @program_id = LAST_INSERT_ID();
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'Upper Body Strength' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 1, 2 FROM workouts WHERE name = 'Lower Body Power' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 3, 3 FROM workouts WHERE name = 'Upper Body Strength' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 4, 4 FROM workouts WHERE name = 'Lower Body Power' AND is_predefined = TRUE LIMIT 1;

-- Shred Program
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, '6-Week Shred', 'Intense fat loss program combining strength training with high-intensity cardio. Designed for rapid transformation.', 'weight_loss', 6, 5, 'advanced', TRUE);
SET @program_id = LAST_INSERT_ID();
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'Upper Body Strength' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 1, 2 FROM workouts WHERE name = 'Tabata Torture' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 2, 3 FROM workouts WHERE name = 'Lower Body Power' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 4, 4 FROM workouts WHERE name = 'HIIT Cardio Session' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 5, 5 FROM workouts WHERE name = 'Core Crusher' AND is_predefined = TRUE LIMIT 1;

-- Athletic Performance Program
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Athletic Performance', 'Sport-specific training program to enhance speed, power, and agility. Perfect for athletes.', 'sport_specific', 8, 4, 'intermediate', TRUE);
SET @program_id = LAST_INSERT_ID();
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'Athletic Performance' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 1, 2 FROM workouts WHERE name = 'Quick 20 Minute Burn' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 3, 3 FROM workouts WHERE name = 'Lower Body Power' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 5, 4 FROM workouts WHERE name = 'Full Body Stretch' AND is_predefined = TRUE LIMIT 1;

-- Muscle Building Program
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Mass Builder Pro', 'High-volume muscle building program targeting all major muscle groups for maximum hypertrophy.', 'muscle_gain', 12, 5, 'advanced', TRUE);
SET @program_id = LAST_INSERT_ID();
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'Chest Destroyer' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 1, 2 FROM workouts WHERE name = 'Back Builder' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 2, 3 FROM workouts WHERE name = 'Intermediate Leg Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 4, 4 FROM workouts WHERE name = 'Shoulder Sculpt' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 5, 5 FROM workouts WHERE name = 'Arms Blast' AND is_predefined = TRUE LIMIT 1;

-- Flexibility Focus
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Flexibility Focus', 'Improve your mobility and flexibility with this dedicated stretching program.', 'flexibility', 4, 5, 'beginner', TRUE);
SET @program_id = LAST_INSERT_ID();
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'Morning Yoga Flow' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 1, 2 FROM workouts WHERE name = 'Full Body Stretch' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 2, 3 FROM workouts WHERE name = 'Morning Yoga Flow' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 4, 4 FROM workouts WHERE name = 'Full Body Stretch' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 6, 5 FROM workouts WHERE name = 'Morning Yoga Flow' AND is_predefined = TRUE LIMIT 1;

-- Quick Fit Program
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Quick Fit - 20 Min Workouts', 'No time? No excuse! Short but effective workouts for busy professionals.', 'general_fitness', 4, 5, 'beginner', TRUE);
SET @program_id = LAST_INSERT_ID();
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'Quick 20 Minute Burn' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 1, 2 FROM workouts WHERE name = 'Core Crusher' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 2, 3 FROM workouts WHERE name = 'Quick 20 Minute Burn' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 4, 4 FROM workouts WHERE name = 'Morning Yoga Flow' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 5, 5 FROM workouts WHERE name = 'Quick 20 Minute Burn' AND is_predefined = TRUE LIMIT 1;

-- Women's Glute Program
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Glute Gains', 'Specialized lower body program focusing on glute development and leg toning.', 'muscle_gain', 8, 4, 'intermediate', TRUE);
SET @program_id = LAST_INSERT_ID();
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'Glute Focus' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 1, 2 FROM workouts WHERE name = 'Core Crusher' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 3, 3 FROM workouts WHERE name = 'Intermediate Leg Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) SELECT @program_id, id, 1, 5, 4 FROM workouts WHERE name = 'Glute Focus' AND is_predefined = TRUE LIMIT 1;

-- =====================================================
-- SEED DATA: DEMO USER WORKOUT HISTORY
-- (For Statistics page demonstration)
-- =====================================================

-- Get demo user ID
SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@fitflow.com');

-- Create some workouts for the demo user first
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@demo_user_id, 'My Push Day', 'Personal chest and shoulders workout', 'strength', FALSE),
(@demo_user_id, 'My Pull Day', 'Personal back and biceps workout', 'strength', FALSE),
(@demo_user_id, 'My Leg Day', 'Personal leg workout', 'strength', FALSE),
(@demo_user_id, 'Morning Cardio', 'Quick cardio session', 'cardio', FALSE);

-- Store workout IDs
SET @demo_push_id = (SELECT id FROM workouts WHERE user_id = @demo_user_id AND name = 'My Push Day');
SET @demo_pull_id = (SELECT id FROM workouts WHERE user_id = @demo_user_id AND name = 'My Pull Day');
SET @demo_leg_id = (SELECT id FROM workouts WHERE user_id = @demo_user_id AND name = 'My Leg Day');
SET @demo_cardio_id = (SELECT id FROM workouts WHERE user_id = @demo_user_id AND name = 'Morning Cardio');

-- Add exercises to demo user workouts
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_push_id, id, 1, 4, 10, 90 FROM exercises WHERE name = 'Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_push_id, id, 2, 3, 12, 60 FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_push_id, id, 3, 3, 10, 90 FROM exercises WHERE name = 'Overhead Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_push_id, id, 4, 3, 15, 45 FROM exercises WHERE name = 'Lateral Raises' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_push_id, id, 5, 3, 12, 45 FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1;

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_pull_id, id, 1, 4, 8, 90 FROM exercises WHERE name = 'Barbell Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_pull_id, id, 2, 4, 8, 90 FROM exercises WHERE name = 'Pull-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_pull_id, id, 3, 3, 12, 60 FROM exercises WHERE name = 'Lat Pulldown' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_pull_id, id, 4, 3, 12, 45 FROM exercises WHERE name = 'Barbell Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_pull_id, id, 5, 3, 12, 45 FROM exercises WHERE name = 'Hammer Curl' LIMIT 1;

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_leg_id, id, 1, 4, 8, 120 FROM exercises WHERE name = 'Barbell Squat' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_leg_id, id, 2, 3, 10, 90 FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_leg_id, id, 3, 3, 12, 60 FROM exercises WHERE name = 'Leg Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_leg_id, id, 4, 3, 15, 45 FROM exercises WHERE name = 'Leg Extension' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
SELECT @demo_leg_id, id, 5, 4, 15, 45 FROM exercises WHERE name = 'Calf Raises' LIMIT 1;

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, duration, rest_time) 
SELECT @demo_cardio_id, id, 1, 1, 1200, 0 FROM exercises WHERE name = 'Treadmill Running' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, duration, rest_time) 
SELECT @demo_cardio_id, id, 2, 1, 900, 0 FROM exercises WHERE name = 'Rowing Machine' LIMIT 1;

-- =====================================================
-- WORKOUT LOGS: Last 30 days of demo user training
-- Creates realistic training data with progressive overload
-- =====================================================

-- Week 1 (28-25 days ago) - Starting weights
-- Day 1: Push Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_push_id, 55, 320, 4, 'Felt strong today!', DATE_SUB(NOW(), INTERVAL 28 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '10,10,9,8', 60.00, '[60, 60, 60, 60]', '[10, 10, 9, 8]' FROM exercises WHERE name = 'Bench Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,10,10', 25.00, '[25, 25, 25]', '[12, 10, 10]' FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '10,8,8', 40.00, '[40, 40, 40]', '[10, 8, 8]' FROM exercises WHERE name = 'Overhead Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,15,12', 8.00, '[8, 8, 8]', '[15, 15, 12]' FROM exercises WHERE name = 'Lateral Raises' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,10', 25.00, '[25, 25, 25]', '[12, 12, 10]' FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1;

-- Day 2: Pull Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_pull_id, 50, 290, 4, 'Good back pump', DATE_SUB(NOW(), INTERVAL 27 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '8,8,7,6', 70.00, '[70, 70, 70, 70]', '[8, 8, 7, 6]' FROM exercises WHERE name = 'Barbell Row' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '8,7,6,5', 0.00, '[0, 0, 0, 0]', '[8, 7, 6, 5]' FROM exercises WHERE name = 'Pull-ups' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,10,10', 55.00, '[55, 55, 55]', '[12, 10, 10]' FROM exercises WHERE name = 'Lat Pulldown' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,10,10', 15.00, '[15, 15, 15]', '[12, 10, 10]' FROM exercises WHERE name = 'Barbell Curl' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,10', 12.00, '[12, 12, 12]', '[12, 12, 10]' FROM exercises WHERE name = 'Hammer Curl' LIMIT 1;

-- Day 3: Leg Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_leg_id, 60, 380, 5, 'Legs destroyed!', DATE_SUB(NOW(), INTERVAL 25 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '8,8,7,6', 80.00, '[80, 80, 80, 80]', '[8, 8, 7, 6]' FROM exercises WHERE name = 'Barbell Squat' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '10,10,8', 60.00, '[60, 60, 60]', '[10, 10, 8]' FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,10', 120.00, '[120, 120, 120]', '[12, 12, 10]' FROM exercises WHERE name = 'Leg Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,15,12', 40.00, '[40, 40, 40]', '[15, 15, 12]' FROM exercises WHERE name = 'Leg Extension' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '15,15,15,12', 50.00, '[50, 50, 50, 50]', '[15, 15, 15, 12]' FROM exercises WHERE name = 'Calf Raises' LIMIT 1;

-- Day 4: Cardio
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_cardio_id, 35, 420, 4, 'Nice steady run', DATE_SUB(NOW(), INTERVAL 24 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, duration_seconds, distance_km, avg_pace, calories_burned) 
SELECT @log_id, id, 1, 1200, 4.2, 4.76, 280 FROM exercises WHERE name = 'Treadmill Running' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, duration_seconds, distance_km, calories_burned) 
SELECT @log_id, id, 1, 900, 3.0, 140 FROM exercises WHERE name = 'Rowing Machine' LIMIT 1;

-- Week 2 (21-18 days ago) - Slight progression
-- Push Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_push_id, 58, 340, 4, 'Good session', DATE_SUB(NOW(), INTERVAL 21 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '10,10,10,8', 62.50, '[62.5, 62.5, 62.5, 62.5]', '[10, 10, 10, 8]' FROM exercises WHERE name = 'Bench Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,10', 27.50, '[27.5, 27.5, 27.5]', '[12, 12, 10]' FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '10,10,8', 42.50, '[42.5, 42.5, 42.5]', '[10, 10, 8]' FROM exercises WHERE name = 'Overhead Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,15,15', 10.00, '[10, 10, 10]', '[15, 15, 15]' FROM exercises WHERE name = 'Lateral Raises' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,12', 27.50, '[27.5, 27.5, 27.5]', '[12, 12, 12]' FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1;

-- Pull Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_pull_id, 52, 300, 5, 'PR on rows!', DATE_SUB(NOW(), INTERVAL 20 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '8,8,8,7', 75.00, '[75, 75, 75, 75]', '[8, 8, 8, 7]' FROM exercises WHERE name = 'Barbell Row' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '8,8,7,6', 0.00, '[0, 0, 0, 0]', '[8, 8, 7, 6]' FROM exercises WHERE name = 'Pull-ups' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,10', 57.50, '[57.5, 57.5, 57.5]', '[12, 12, 10]' FROM exercises WHERE name = 'Lat Pulldown' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,10', 17.50, '[17.5, 17.5, 17.5]', '[12, 12, 10]' FROM exercises WHERE name = 'Barbell Curl' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,12', 14.00, '[14, 14, 14]', '[12, 12, 12]' FROM exercises WHERE name = 'Hammer Curl' LIMIT 1;

-- Leg Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_leg_id, 62, 400, 4, 'Solid leg day', DATE_SUB(NOW(), INTERVAL 18 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '8,8,8,7', 85.00, '[85, 85, 85, 85]', '[8, 8, 8, 7]' FROM exercises WHERE name = 'Barbell Squat' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '10,10,10', 65.00, '[65, 65, 65]', '[10, 10, 10]' FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,12', 130.00, '[130, 130, 130]', '[12, 12, 12]' FROM exercises WHERE name = 'Leg Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,15,15', 45.00, '[45, 45, 45]', '[15, 15, 15]' FROM exercises WHERE name = 'Leg Extension' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '15,15,15,15', 55.00, '[55, 55, 55, 55]', '[15, 15, 15, 15]' FROM exercises WHERE name = 'Calf Raises' LIMIT 1;

-- Week 3 (14-11 days ago) - More progression
-- Push Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_push_id, 60, 350, 5, 'New bench PR!', DATE_SUB(NOW(), INTERVAL 14 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '10,10,10,10', 65.00, '[65, 65, 65, 65]', '[10, 10, 10, 10]' FROM exercises WHERE name = 'Bench Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,12', 30.00, '[30, 30, 30]', '[12, 12, 12]' FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '10,10,10', 45.00, '[45, 45, 45]', '[10, 10, 10]' FROM exercises WHERE name = 'Overhead Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,15,15', 10.00, '[10, 10, 10]', '[15, 15, 15]' FROM exercises WHERE name = 'Lateral Raises' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,12,12', 30.00, '[30, 30, 30]', '[15, 12, 12]' FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1;

-- Pull Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_pull_id, 55, 310, 4, 'Consistent session', DATE_SUB(NOW(), INTERVAL 13 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '8,8,8,8', 77.50, '[77.5, 77.5, 77.5, 77.5]', '[8, 8, 8, 8]' FROM exercises WHERE name = 'Barbell Row' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '9,8,8,7', 0.00, '[0, 0, 0, 0]', '[9, 8, 8, 7]' FROM exercises WHERE name = 'Pull-ups' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,12', 60.00, '[60, 60, 60]', '[12, 12, 12]' FROM exercises WHERE name = 'Lat Pulldown' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,12', 17.50, '[17.5, 17.5, 17.5]', '[12, 12, 12]' FROM exercises WHERE name = 'Barbell Curl' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,12', 14.00, '[14, 14, 14]', '[12, 12, 12]' FROM exercises WHERE name = 'Hammer Curl' LIMIT 1;

-- Leg Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_leg_id, 65, 420, 5, 'Squat PR - 90kg!', DATE_SUB(NOW(), INTERVAL 11 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '8,8,8,8', 90.00, '[90, 90, 90, 90]', '[8, 8, 8, 8]' FROM exercises WHERE name = 'Barbell Squat' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '10,10,10', 70.00, '[70, 70, 70]', '[10, 10, 10]' FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,12,12', 140.00, '[140, 140, 140]', '[15, 12, 12]' FROM exercises WHERE name = 'Leg Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,15,15', 50.00, '[50, 50, 50]', '[15, 15, 15]' FROM exercises WHERE name = 'Leg Extension' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '20,15,15,15', 60.00, '[60, 60, 60, 60]', '[20, 15, 15, 15]' FROM exercises WHERE name = 'Calf Raises' LIMIT 1;

-- Cardio
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_cardio_id, 40, 480, 4, 'Longer run today', DATE_SUB(NOW(), INTERVAL 10 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, duration_seconds, distance_km, avg_pace, calories_burned) 
SELECT @log_id, id, 1, 1500, 5.5, 4.55, 360 FROM exercises WHERE name = 'Treadmill Running' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, duration_seconds, distance_km, calories_burned) 
SELECT @log_id, id, 1, 900, 3.2, 120 FROM exercises WHERE name = 'Rowing Machine' LIMIT 1;

-- Week 4 (7-4 days ago) - Current week
-- Push Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_push_id, 62, 360, 5, 'Feeling stronger every week!', DATE_SUB(NOW(), INTERVAL 7 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '10,10,10,10', 67.50, '[67.5, 67.5, 67.5, 67.5]', '[10, 10, 10, 10]' FROM exercises WHERE name = 'Bench Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,12', 32.50, '[32.5, 32.5, 32.5]', '[12, 12, 12]' FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '10,10,10', 47.50, '[47.5, 47.5, 47.5]', '[10, 10, 10]' FROM exercises WHERE name = 'Overhead Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,15,15', 12.00, '[12, 12, 12]', '[15, 15, 15]' FROM exercises WHERE name = 'Lateral Raises' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,15,12', 32.50, '[32.5, 32.5, 32.5]', '[15, 15, 12]' FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1;

-- Pull Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_pull_id, 55, 320, 5, 'Row strength improving!', DATE_SUB(NOW(), INTERVAL 6 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '8,8,8,8', 80.00, '[80, 80, 80, 80]', '[8, 8, 8, 8]' FROM exercises WHERE name = 'Barbell Row' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '10,9,8,8', 0.00, '[0, 0, 0, 0]', '[10, 9, 8, 8]' FROM exercises WHERE name = 'Pull-ups' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,12', 62.50, '[62.5, 62.5, 62.5]', '[12, 12, 12]' FROM exercises WHERE name = 'Lat Pulldown' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,12', 20.00, '[20, 20, 20]', '[12, 12, 12]' FROM exercises WHERE name = 'Barbell Curl' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,12,12', 16.00, '[16, 16, 16]', '[15, 12, 12]' FROM exercises WHERE name = 'Hammer Curl' LIMIT 1;

-- Leg Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_leg_id, 68, 440, 5, 'Beast mode activated!', DATE_SUB(NOW(), INTERVAL 4 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '8,8,8,8', 95.00, '[95, 95, 95, 95]', '[8, 8, 8, 8]' FROM exercises WHERE name = 'Barbell Squat' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '10,10,10', 75.00, '[75, 75, 75]', '[10, 10, 10]' FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,15,12', 150.00, '[150, 150, 150]', '[15, 15, 12]' FROM exercises WHERE name = 'Leg Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,15,15', 55.00, '[55, 55, 55]', '[15, 15, 15]' FROM exercises WHERE name = 'Leg Extension' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '20,20,15,15', 65.00, '[65, 65, 65, 65]', '[20, 20, 15, 15]' FROM exercises WHERE name = 'Calf Raises' LIMIT 1;

-- Cardio
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_cardio_id, 45, 520, 5, 'Best cardio session yet!', DATE_SUB(NOW(), INTERVAL 3 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, duration_seconds, distance_km, avg_pace, calories_burned) 
SELECT @log_id, id, 1, 1800, 6.5, 4.62, 400 FROM exercises WHERE name = 'Treadmill Running' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, duration_seconds, distance_km, calories_burned) 
SELECT @log_id, id, 1, 900, 3.5, 120 FROM exercises WHERE name = 'Rowing Machine' LIMIT 1;

-- Recent days (2-0 days ago) - Current streak
-- Push Day
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_push_id, 58, 340, 4, 'Good volume today', DATE_SUB(NOW(), INTERVAL 2 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '10,10,10,9', 67.50, '[67.5, 67.5, 67.5, 67.5]', '[10, 10, 10, 9]' FROM exercises WHERE name = 'Bench Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,10', 32.50, '[32.5, 32.5, 32.5]', '[12, 12, 10]' FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '10,10,8', 47.50, '[47.5, 47.5, 47.5]', '[10, 10, 8]' FROM exercises WHERE name = 'Overhead Press' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,15,12', 12.00, '[12, 12, 12]', '[15, 15, 12]' FROM exercises WHERE name = 'Lateral Raises' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '15,12,12', 32.50, '[32.5, 32.5, 32.5]', '[15, 12, 12]' FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1;

-- Pull Day yesterday
INSERT INTO workout_logs (user_id, workout_id, duration_minutes, calories_burned, rating, notes, completed_at) 
VALUES (@demo_user_id, @demo_pull_id, 52, 300, 4, 'Solid back workout', DATE_SUB(NOW(), INTERVAL 1 DAY));
SET @log_id = LAST_INSERT_ID();
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '8,8,8,7', 80.00, '[80, 80, 80, 80]', '[8, 8, 8, 7]' FROM exercises WHERE name = 'Barbell Row' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 4, '10,8,8,7', 0.00, '[0, 0, 0, 0]', '[10, 8, 8, 7]' FROM exercises WHERE name = 'Pull-ups' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,10', 62.50, '[62.5, 62.5, 62.5]', '[12, 12, 10]' FROM exercises WHERE name = 'Lat Pulldown' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,10', 20.00, '[20, 20, 20]', '[12, 12, 10]' FROM exercises WHERE name = 'Barbell Curl' LIMIT 1;
INSERT INTO exercise_logs (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, weight_per_set, reps_per_set) 
SELECT @log_id, id, 3, '12,12,12', 16.00, '[16, 16, 16]', '[12, 12, 12]' FROM exercises WHERE name = 'Hammer Curl' LIMIT 1;

-- =====================================================
-- DEMO ROUTE DATA
-- =====================================================

-- Create a demo route for the user
INSERT INTO routes (user_id, name, description, activity_type, distance_km, estimated_duration, elevation_gain, is_favorite, start_location, end_location) 
VALUES (@demo_user_id, 'Morning Park Run', 'My regular morning jogging route through the park', 'running', 5.2, 28, 45, TRUE, 'Home', 'Park Loop');

SET @demo_route_id = LAST_INSERT_ID();

-- Route logs for demo user
INSERT INTO route_logs (user_id, route_id, actual_duration, actual_distance_km, average_pace, average_speed, calories_burned, notes, completed_at)
VALUES 
(@demo_user_id, @demo_route_id, 1680, 5.2, 5.38, 11.1, 320, 'Nice morning run', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(@demo_user_id, @demo_route_id, 1620, 5.2, 5.19, 11.5, 330, 'Faster pace today', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(@demo_user_id, @demo_route_id, 1560, 5.2, 5.00, 12.0, 340, 'New PR!', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(@demo_user_id, @demo_route_id, 1590, 5.2, 5.10, 11.8, 335, 'Consistent run', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- =====================================================
-- DEMO PROGRAM PROGRESS
-- =====================================================

-- Demo user is enrolled in Push Pull Legs program
INSERT INTO user_program_progress (user_id, program_id, current_week, current_day, is_active)
SELECT @demo_user_id, id, 2, 3, TRUE FROM programs WHERE name = 'Push Pull Legs Split' LIMIT 1;

-- =====================================================
-- GET PHAT WITH ELMER - PHAT PROGRAM
-- Power Hypertrophy Adaptive Training
-- =====================================================

-- Additional exercises for PHAT program
INSERT IGNORE INTO exercises (name, description, category, exercise_type, muscle_group, equipment, difficulty, instructions, image_url) VALUES
('SSB Squat', 'Safety Squat Bar Squat - quad-dominant squat variation with reduced upper back stress', 'strength', 'strength', 'Legs', 'Barbell', 'intermediate', 'Position safety squat bar on upper back. Squat down keeping torso upright, drive through heels to stand.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('Tricep Dip Machine', 'Machine-assisted dips for tricep isolation', 'machine', 'strength', 'Triceps', 'Machine', 'beginner', 'Sit in machine, grip handles at sides. Push down until arms extended, control return.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400'),
('Weighted Pull-ups', 'Pull-ups with added weight for increased resistance', 'strength', 'strength', 'Back', 'Pull-up Bar', 'advanced', 'Attach weight belt or hold dumbbell between feet. Pull chest to bar, lower with control.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Close Grip Lat Pulldown', 'Narrow grip pulldown targeting lats and biceps', 'machine', 'strength', 'Back', 'Cable Machine', 'beginner', 'Use V-bar or close grip attachment. Pull to upper chest, squeeze lats.', 'https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=400'),
('EZ Bar Curl', 'Bicep curl with angled EZ bar for wrist comfort', 'strength', 'strength', 'Biceps', 'EZ Curl Bar', 'beginner', 'Stand with EZ bar at thighs. Curl weight to shoulders keeping elbows fixed.', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400'),
('Overhead Tricep Machine', 'Overhead tricep extension on machine', 'machine', 'strength', 'Triceps', 'Machine', 'beginner', 'Sit with arms overhead holding handles. Extend arms upward against resistance.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400'),
('Kettlebell Lunges', 'Walking or stationary lunges with kettlebells', 'strength', 'strength', 'Legs', 'Kettlebell', 'intermediate', 'Hold kettlebells at sides. Step forward into lunge, both knees at 90 degrees. Push back or step through.', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400'),
('Lying Leg Curl', 'Hamstring curl lying face down', 'machine', 'strength', 'Legs', 'Leg Curl Machine', 'beginner', 'Lie face down on leg curl machine. Curl legs toward glutes, lower with control.', 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400'),
('Seated Calf Raises', 'Calf raise targeting soleus muscle', 'machine', 'strength', 'Calves', 'Machine', 'beginner', 'Sit with knees under pad, balls of feet on platform. Raise heels as high as possible.', 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400'),
('Cable Row', 'Seated cable row with various grip options', 'machine', 'strength', 'Back', 'Cable Machine', 'beginner', 'Sit at cable row station. Pull handle to stomach, squeeze shoulder blades.', 'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400'),
('Prime Machine Row', 'Chest-supported machine row for back isolation', 'machine', 'strength', 'Back', 'Machine', 'beginner', 'Sit or lie against chest pad. Pull handles toward torso, squeeze back.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400'),
('Seated Dumbbell Shoulder Press', 'Seated overhead press with dumbbells', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Sit with back support, dumbbells at shoulders. Press overhead, lower with control.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Dumbbell Lateral Raises', 'Standing side raise for lateral deltoids', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Stand with dumbbells at sides. Raise arms to sides until parallel to ground.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Seated Rear Delt Raises', 'Seated bent-over rear delt isolation', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Sit and bend forward at waist. Raise dumbbells to sides, squeeze rear delts.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Weighted Dips', 'Dips with added weight for chest and triceps', 'strength', 'strength', 'Chest', 'Dip Station', 'advanced', 'Attach weight belt. Dip down with slight forward lean, push back up.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Incline Dumbbell Press', 'Incline pressing for upper chest', 'strength', 'strength', 'Chest', 'Dumbbells', 'intermediate', 'Lie on incline bench. Press dumbbells from chest to lockout.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Machine Incline Chest Press', 'Machine press at incline angle', 'machine', 'strength', 'Chest', 'Machine', 'beginner', 'Sit in incline chest press machine. Press handles forward, control return.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400'),
('Cable Crossovers', 'Cable fly for chest isolation', 'machine', 'strength', 'Chest', 'Cable Machine', 'intermediate', 'Stand between cable stations. Pull handles together in arc motion.', 'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400'),
('Preacher Curl Machine', 'Machine preacher curl for bicep isolation', 'machine', 'strength', 'Biceps', 'Machine', 'beginner', 'Sit with arms on pad. Curl handles toward shoulders.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400'),
('Spider Dumbbell Curl', 'Incline bench curl with arms hanging forward', 'strength', 'strength', 'Biceps', 'Dumbbells', 'intermediate', 'Lie face down on incline bench. Let arms hang and curl dumbbells.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Smith JM Press', 'Hybrid press/extension movement on Smith machine', 'machine', 'strength', 'Triceps', 'Smith Machine', 'intermediate', 'Lie on bench under Smith machine. Lower bar toward chin, press back up.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'),
('Leaning Overhead Cable Tricep Extension', 'Cable overhead extension with forward lean', 'machine', 'strength', 'Triceps', 'Cable Machine', 'intermediate', 'Face away from cable, lean forward. Extend arms overhead against resistance.', 'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400'),
('Cable Rope Tricep Extension', 'Tricep pushdown with rope attachment', 'machine', 'strength', 'Triceps', 'Cable Machine', 'beginner', 'Stand at cable machine with rope. Push down and spread rope at bottom.', 'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400');

-- PHAT Workout 1: Power Upper
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'PHAT Power Upper', 'Power Hypertrophy Adaptive Training - Upper body power day focusing on heavy compound lifts', 'strength', TRUE);
SET @phat_workout1 = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout1, id, 1, 3, 7, 120 FROM exercises WHERE name = 'Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout1, id, 2, 3, 10, 90 FROM exercises WHERE name = 'Tricep Dip Machine' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout1, id, 3, 2, 8, 120 FROM exercises WHERE name = 'Weighted Pull-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout1, id, 4, 2, 8, 90 FROM exercises WHERE name = 'Close Grip Lat Pulldown' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout1, id, 5, 3, 9, 90 FROM exercises WHERE name = 'Machine Shoulder Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout1, id, 6, 3, 8, 60 FROM exercises WHERE name = 'EZ Bar Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout1, id, 7, 3, 10, 60 FROM exercises WHERE name = 'Overhead Tricep Machine' LIMIT 1;

-- PHAT Workout 2: Power Lower
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'PHAT Power Lower', 'Power Hypertrophy Adaptive Training - Lower body power day with heavy squats and leg work', 'strength', TRUE);
SET @phat_workout2 = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout2, id, 1, 3, 7, 150 FROM exercises WHERE name = 'SSB Squat' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout2, id, 2, 2, 25, 90 FROM exercises WHERE name = 'Kettlebell Lunges' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout2, id, 3, 2, 8, 60 FROM exercises WHERE name = 'Leg Extension' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout2, id, 4, 2, 8, 60 FROM exercises WHERE name = 'Lying Leg Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout2, id, 5, 3, 8, 60 FROM exercises WHERE name = 'Calf Raises' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout2, id, 6, 2, 8, 45 FROM exercises WHERE name = 'Seated Calf Raises' LIMIT 1;

-- PHAT Workout 3: Back & Shoulders Hypertrophy
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'PHAT Back & Shoulders Hypertrophy', 'Power Hypertrophy Adaptive Training - High volume back and shoulder work for muscle growth', 'strength', TRUE);
SET @phat_workout3 = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout3, id, 1, 2, 7, 120 FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout3, id, 2, 3, 10, 90 FROM exercises WHERE name = 'T-Bar Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout3, id, 3, 3, 10, 90 FROM exercises WHERE name = 'Cable Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout3, id, 4, 3, 11, 75 FROM exercises WHERE name = 'Prime Machine Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout3, id, 5, 3, 10, 90 FROM exercises WHERE name = 'Seated Dumbbell Shoulder Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout3, id, 6, 3, 16, 60 FROM exercises WHERE name = 'Dumbbell Lateral Raises' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout3, id, 7, 3, 13, 60 FROM exercises WHERE name = 'Seated Rear Delt Raises' LIMIT 1;

-- PHAT Workout 4: Chest & Arms Hypertrophy
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'PHAT Chest & Arms Hypertrophy', 'Power Hypertrophy Adaptive Training - High volume chest, biceps, and triceps work', 'strength', TRUE);
SET @phat_workout4 = LAST_INSERT_ID();
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout4, id, 1, 3, 9, 120 FROM exercises WHERE name = 'Weighted Dips' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout4, id, 2, 3, 10, 90 FROM exercises WHERE name = 'Incline Dumbbell Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout4, id, 3, 3, 12, 75 FROM exercises WHERE name = 'Machine Incline Chest Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout4, id, 4, 2, 17, 60 FROM exercises WHERE name = 'Cable Crossovers' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout4, id, 5, 3, 10, 60 FROM exercises WHERE name = 'Preacher Curl Machine' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout4, id, 6, 2, 13, 60 FROM exercises WHERE name = 'Cable Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout4, id, 7, 2, 13, 60 FROM exercises WHERE name = 'Spider Dumbbell Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout4, id, 8, 3, 9, 90 FROM exercises WHERE name = 'Smith JM Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout4, id, 9, 3, 10, 60 FROM exercises WHERE name = 'Leaning Overhead Cable Tricep Extension' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) SELECT @phat_workout4, id, 10, 2, 13, 45 FROM exercises WHERE name = 'Cable Rope Tricep Extension' LIMIT 1;

-- PHAT Program: Get PHAT With Elmer
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined, image_url) VALUES
(@system_user_id, 
 'Get PHAT With Elmer', 
 'Power Hypertrophy Adaptive Training (PHAT) program combining power and hypertrophy training. Features two power days (upper/lower) followed by hypertrophy days targeting specific muscle groups. Perfect for intermediate to advanced lifters seeking both strength and size gains.',
 'muscle_gain', 
 8, 
 4, 
 'intermediate', 
 TRUE,
 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400');
SET @phat_program_id = LAST_INSERT_ID();

-- PHAT Program Schedule (Week 1 layout, repeats weekly)
-- Day 1 (Sunday): Power Upper | Day 2 (Monday): Power Lower | Day 3: Rest
-- Day 4 (Wednesday): Back & Shoulders Hypertrophy | Day 5: Rest
-- Day 6 (Friday): Chest & Arms Hypertrophy | Day 7: Rest
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index, notes) 
SELECT @phat_program_id, id, 1, 0, 1, 'Power day - focus on heavy weights with lower rep ranges. Rest 2-3 minutes between heavy compound sets.'
FROM workouts WHERE name = 'PHAT Power Upper' AND is_predefined = TRUE LIMIT 1;

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index, notes) 
SELECT @phat_program_id, id, 1, 1, 2, 'Power day - heavy leg work. Ensure proper warm-up before squats.'
FROM workouts WHERE name = 'PHAT Power Lower' AND is_predefined = TRUE LIMIT 1;

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index, notes) 
SELECT @phat_program_id, id, 1, 3, 3, 'Hypertrophy day - moderate weights, higher volume. Focus on mind-muscle connection.'
FROM workouts WHERE name = 'PHAT Back & Shoulders Hypertrophy' AND is_predefined = TRUE LIMIT 1;

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index, notes) 
SELECT @phat_program_id, id, 1, 5, 4, 'Hypertrophy day - pump work for chest and arms. Shorter rest periods (60-90 seconds).'
FROM workouts WHERE name = 'PHAT Chest & Arms Hypertrophy' AND is_predefined = TRUE LIMIT 1;

-- =====================================================
-- COMPLETE!
-- 
-- Summary:
-- - 3 Users (demo, admin, system)
-- - 38 Equipment items (with images)
-- - 120+ Exercises (with images) - includes PHAT exercises
-- - 24 Predefined Workouts (includes 4 PHAT workouts)
-- - 12 Predefined Programs (includes Get PHAT With Elmer)
-- - 4 Demo user custom workouts
-- - 16 Demo workout logs (4 weeks of training)
-- - 75+ Exercise logs with progressive overload data
-- - 4 Route logs for cardio tracking
-- - 1 Active program enrollment
-- - All tables with proper indexes and foreign keys
--
-- Test Accounts:
-- Demo: demo@fitflow.com / demo123
-- Admin: admin@fitflow.com / admin123
-- =====================================================
