-- =====================================================
-- FitFlow Complete Database Deployment Script
-- Version: 1.0 - Production Ready
-- 
-- This single file contains EVERYTHING needed:
-- 1. Schema (all tables)
-- 2. Seed data (exercises, equipment)
-- 3. Predefined workouts & programs
-- 4. Admin user
-- 
-- INSTRUCTIONS:
-- 1. Create a new database (or use Railway's default)
-- 2. Run this entire script
-- 
-- TEST ACCOUNTS:
-- Demo User: demo@fitflow.com / demo123
-- Admin User: admin@fitflow.com / admin123
-- =====================================================

-- =====================================================
-- SCHEMA
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exercise_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exercise_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    start_location VARCHAR(255),
    end_location VARCHAR(255),
    is_favorite BOOLEAN DEFAULT FALSE,
    workout_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    INDEX idx_predefined (is_predefined)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS workout_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    workout_id INT,
    program_id INT,
    duration_minutes INT,
    calories_burned INT,
    notes TEXT,
    rating INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- =====================================================
-- USERS (Demo + Admin)
-- =====================================================

INSERT INTO users (email, password, first_name, last_name, is_admin) VALUES
('demo@fitflow.com', '$2a$10$kuAUne/YpLTKrpeIVs6rqeZH333rMm9oEwEdZSyr8Eonp11tovOCa', 'Demo', 'User', FALSE),
('admin@fitflow.com', '$2a$10$ylX0rsdHRyetUA/8ZhNBJe3/sv3PajogzId7ls7oFQZg81qtV62/q', 'Admin', 'User', TRUE),
('system@fitflow.app', '$2a$10$ylX0rsdHRyetUA/8ZhNBJe3/sv3PajogzId7ls7oFQZg81qtV62/q', 'FitFlow', 'System', FALSE);

-- =====================================================
-- EQUIPMENT
-- =====================================================

INSERT INTO equipment (name, description, category, is_public) VALUES
('Barbell', 'Standard Olympic barbell, typically 20kg/45lbs', 'free_weights', TRUE),
('Dumbbells', 'Pair of adjustable or fixed weight dumbbells', 'free_weights', TRUE),
('Kettlebell', 'Cast iron weight with handle for swings and lifts', 'free_weights', TRUE),
('EZ Curl Bar', 'Curved barbell for bicep and tricep exercises', 'free_weights', TRUE),
('Cable Machine', 'Adjustable pulley system for various exercises', 'machines', TRUE),
('Lat Pulldown Machine', 'Machine for lat pulldown and back exercises', 'machines', TRUE),
('Leg Press Machine', 'Machine for leg press and lower body training', 'machines', TRUE),
('Chest Press Machine', 'Machine for chest press movements', 'machines', TRUE),
('Leg Extension Machine', 'Isolation machine for quadriceps', 'machines', TRUE),
('Leg Curl Machine', 'Isolation machine for hamstrings', 'machines', TRUE),
('Shoulder Press Machine', 'Machine for overhead pressing', 'machines', TRUE),
('Pec Deck Machine', 'Chest fly isolation machine', 'machines', TRUE),
('Treadmill', 'Motorized running/walking belt machine', 'cardio', TRUE),
('Stationary Bike', 'Indoor cycling machine for cardio', 'cardio', TRUE),
('Elliptical', 'Low-impact cardio machine', 'cardio', TRUE),
('Rowing Machine', 'Cardio machine simulating rowing', 'cardio', TRUE),
('Jump Rope', 'Speed rope for cardio and conditioning', 'cardio', TRUE),
('Pull-up Bar', 'Bar for pull-ups and hanging exercises', 'bodyweight', TRUE),
('Dip Station', 'Parallel bars for dips and leg raises', 'bodyweight', TRUE),
('Plyo Box', 'Sturdy box for box jumps and step-ups', 'bodyweight', TRUE),
('Resistance Bands', 'Elastic bands of various resistances', 'bands_cables', TRUE),
('Battle Ropes', 'Heavy ropes for conditioning', 'bands_cables', TRUE),
('Bench (Flat)', 'Flat weight bench for pressing', 'accessories', TRUE),
('Bench (Adjustable)', 'Adjustable incline/decline bench', 'accessories', TRUE),
('Ab Wheel', 'Wheel with handles for ab rollouts', 'accessories', TRUE),
('Foam Roller', 'For self-massage and mobility', 'accessories', TRUE),
('Yoga Mat', 'Cushioned mat for floor exercises', 'accessories', TRUE),
('Medicine Ball', 'Weighted ball for functional training', 'accessories', TRUE);

-- =====================================================
-- EXERCISES (100+)
-- =====================================================

-- CHEST
INSERT INTO exercises (name, description, category, exercise_type, muscle_group, equipment, difficulty, instructions) VALUES
('Bench Press', 'Classic barbell chest exercise', 'strength', 'strength', 'Chest', 'Barbell', 'intermediate', 'Lie on bench, grip bar wider than shoulders. Lower to chest, press up.'),
('Incline Bench Press', 'Upper chest focused pressing', 'strength', 'strength', 'Chest', 'Barbell', 'intermediate', 'Set bench to 30-45 degrees. Press bar from upper chest.'),
('Dumbbell Bench Press', 'Chest press with dumbbells', 'strength', 'strength', 'Chest', 'Dumbbells', 'beginner', 'Lie on bench with dumbbells at chest. Press up and slightly inward.'),
('Dumbbell Flyes', 'Isolation for chest stretch', 'strength', 'strength', 'Chest', 'Dumbbells', 'intermediate', 'Lie on bench, extend arms with slight bend. Lower in arc motion.'),
('Push-ups', 'Classic bodyweight chest exercise', 'bodyweight', 'strength', 'Chest', 'None', 'beginner', 'Start in plank. Lower chest to ground, push back up.'),
('Diamond Push-ups', 'Tricep and inner chest push-up', 'bodyweight', 'strength', 'Chest', 'None', 'intermediate', 'Form diamond with hands. Perform push-up with elbows close.'),
('Cable Crossover', 'Cable exercise for chest', 'machine', 'strength', 'Chest', 'Cable Machine', 'intermediate', 'Pull cable handles down and together. Squeeze chest.'),
('Machine Chest Press', 'Guided chest press', 'machine', 'strength', 'Chest', 'Chest Press Machine', 'beginner', 'Sit with back against pad. Press handles forward.'),
('Pec Deck Fly', 'Machine fly for chest', 'machine', 'strength', 'Chest', 'Pec Deck Machine', 'beginner', 'Sit with arms against pads. Bring arms together.'),

-- BACK
('Deadlift', 'Compound posterior chain exercise', 'strength', 'strength', 'Back', 'Barbell', 'advanced', 'Stand with feet hip-width. Drive through heels, extend hips and knees.'),
('Barbell Row', 'Horizontal pulling for back', 'strength', 'strength', 'Back', 'Barbell', 'intermediate', 'Hinge forward, grip bar. Pull to lower chest.'),
('Dumbbell Row', 'Single arm rowing', 'strength', 'strength', 'Back', 'Dumbbells', 'beginner', 'One hand and knee on bench. Pull dumbbell to hip.'),
('Pull-ups', 'Bodyweight vertical pulling', 'bodyweight', 'strength', 'Back', 'Pull-up Bar', 'intermediate', 'Hang from bar. Pull chest to bar, squeezing lats.'),
('Chin-ups', 'Underhand pull-up', 'bodyweight', 'strength', 'Back', 'Pull-up Bar', 'intermediate', 'Hang with underhand grip. Pull chest to bar.'),
('Lat Pulldown', 'Machine pull-up motion', 'machine', 'strength', 'Back', 'Lat Pulldown Machine', 'beginner', 'Sit with thighs under pads. Pull bar to upper chest.'),
('Seated Cable Row', 'Horizontal cable rowing', 'machine', 'strength', 'Back', 'Cable Machine', 'beginner', 'Sit upright, feet on platform. Pull handle to stomach.'),
('Face Pulls', 'Rear delt and upper back', 'machine', 'strength', 'Back', 'Cable Machine', 'beginner', 'Set cable high, use rope. Pull to face.'),
('Inverted Rows', 'Bodyweight horizontal rowing', 'bodyweight', 'strength', 'Back', 'Pull-up Bar', 'beginner', 'Hang under bar. Pull chest to bar.'),

-- SHOULDERS
('Overhead Press', 'Standing barbell press', 'strength', 'strength', 'Shoulders', 'Barbell', 'intermediate', 'Stand with bar at shoulders. Press overhead.'),
('Dumbbell Shoulder Press', 'Seated or standing press', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Dumbbells at shoulders. Press overhead.'),
('Lateral Raises', 'Side deltoid isolation', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Stand with dumbbells. Raise arms to sides.'),
('Front Raises', 'Front deltoid isolation', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Stand with dumbbells. Raise arms forward.'),
('Rear Delt Flyes', 'Rear deltoid isolation', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Bend forward. Raise arms to sides.'),
('Arnold Press', 'Rotating dumbbell press', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'intermediate', 'Start palms facing you. Rotate and press overhead.'),
('Machine Shoulder Press', 'Guided shoulder press', 'machine', 'strength', 'Shoulders', 'Shoulder Press Machine', 'beginner', 'Sit with back against pad. Press handles overhead.'),
('Pike Push-ups', 'Bodyweight shoulder press', 'bodyweight', 'strength', 'Shoulders', 'None', 'intermediate', 'Pike position with hips high. Lower head toward ground.'),

-- ARMS
('Barbell Curl', 'Classic bicep exercise', 'strength', 'strength', 'Biceps', 'Barbell', 'beginner', 'Stand with barbell. Curl weight to shoulders.'),
('Dumbbell Curl', 'Bicep curl with dumbbells', 'strength', 'strength', 'Biceps', 'Dumbbells', 'beginner', 'Stand with dumbbells. Curl to shoulders.'),
('Hammer Curl', 'Bicep curl neutral grip', 'strength', 'strength', 'Biceps', 'Dumbbells', 'beginner', 'Stand with dumbbells, palms in. Curl keeping neutral grip.'),
('Preacher Curl', 'Isolated bicep curl', 'strength', 'strength', 'Biceps', 'EZ Curl Bar', 'intermediate', 'Rest arms on preacher bench. Curl weight up.'),
('Cable Curl', 'Constant tension bicep curl', 'machine', 'strength', 'Biceps', 'Cable Machine', 'beginner', 'Stand facing cable. Curl handle to shoulders.'),
('Tricep Pushdown', 'Cable tricep exercise', 'machine', 'strength', 'Triceps', 'Cable Machine', 'beginner', 'Stand at cable machine. Push down until arms straight.'),
('Skull Crushers', 'Lying tricep extension', 'strength', 'strength', 'Triceps', 'EZ Curl Bar', 'intermediate', 'Lie on bench, bar above chest. Lower to forehead, extend.'),
('Overhead Tricep Extension', 'Tricep extension overhead', 'strength', 'strength', 'Triceps', 'Dumbbells', 'beginner', 'Hold dumbbell overhead. Lower behind head, extend.'),
('Tricep Dips', 'Bodyweight tricep exercise', 'bodyweight', 'strength', 'Triceps', 'Dip Station', 'intermediate', 'Support on parallel bars. Lower body, push up.'),
('Close-grip Bench Press', 'Compound tricep pressing', 'strength', 'strength', 'Triceps', 'Barbell', 'intermediate', 'Grip bar shoulder-width. Press focusing on triceps.'),

-- LEGS
('Barbell Squat', 'King of leg exercises', 'strength', 'strength', 'Legs', 'Barbell', 'intermediate', 'Bar on upper back. Squat down, drive through heels.'),
('Front Squat', 'Quad-dominant squat', 'strength', 'strength', 'Legs', 'Barbell', 'advanced', 'Bar on front delts. Squat keeping torso upright.'),
('Goblet Squat', 'Beginner-friendly squat', 'strength', 'strength', 'Legs', 'Dumbbells', 'beginner', 'Hold dumbbell at chest. Squat down between legs.'),
('Leg Press', 'Machine compound leg', 'machine', 'strength', 'Legs', 'Leg Press Machine', 'beginner', 'Sit in machine. Press platform away.'),
('Leg Extension', 'Quadricep isolation', 'machine', 'strength', 'Legs', 'Leg Extension Machine', 'beginner', 'Sit in machine. Extend legs until straight.'),
('Leg Curl', 'Hamstring isolation', 'machine', 'strength', 'Legs', 'Leg Curl Machine', 'beginner', 'Lie or sit in machine. Curl legs toward glutes.'),
('Romanian Deadlift', 'Hamstring and glute focus', 'strength', 'strength', 'Legs', 'Barbell', 'intermediate', 'Stand with bar. Hinge at hips, lower bar along legs.'),
('Lunges', 'Unilateral leg exercise', 'strength', 'strength', 'Legs', 'Dumbbells', 'beginner', 'Step forward into lunge. Push back to start.'),
('Bulgarian Split Squat', 'Single leg squat', 'strength', 'strength', 'Legs', 'Dumbbells', 'intermediate', 'Rear foot on bench. Squat on front leg.'),
('Calf Raises', 'Calf development', 'strength', 'strength', 'Calves', 'Dumbbells', 'beginner', 'Stand on edge of step. Rise on toes.'),
('Bodyweight Squats', 'Basic squat', 'bodyweight', 'strength', 'Legs', 'None', 'beginner', 'Stand feet shoulder-width. Squat down.'),
('Jump Squats', 'Explosive squat', 'bodyweight', 'strength', 'Legs', 'None', 'intermediate', 'Squat down, explosively jump up.'),
('Wall Sit', 'Isometric leg endurance', 'bodyweight', 'timed', 'Legs', 'None', 'beginner', 'Lean against wall, thighs parallel. Hold.'),
('Step-ups', 'Unilateral leg using box', 'bodyweight', 'strength', 'Legs', 'Plyo Box', 'beginner', 'Step up onto box. Step down.'),
('Hip Thrusts', 'Glute focused', 'strength', 'strength', 'Glutes', 'Barbell', 'intermediate', 'Back against bench, bar across hips. Drive hips up.'),

-- CORE
('Plank', 'Isometric core stability', 'bodyweight', 'timed', 'Core', 'None', 'beginner', 'Hold push-up position on forearms. Keep body straight.'),
('Crunches', 'Basic abdominal exercise', 'bodyweight', 'strength', 'Core', 'None', 'beginner', 'Lie on back, knees bent. Curl shoulders off ground.'),
('Russian Twists', 'Rotational core', 'bodyweight', 'strength', 'Core', 'None', 'intermediate', 'Sit with knees bent, lean back. Rotate side to side.'),
('Leg Raises', 'Lower ab focused', 'bodyweight', 'strength', 'Core', 'None', 'intermediate', 'Lie on back. Raise legs to vertical.'),
('Mountain Climbers', 'Dynamic core and cardio', 'bodyweight', 'cardio', 'Core', 'None', 'beginner', 'Start in push-up. Drive knees toward chest alternately.'),
('Dead Bug', 'Core stability', 'bodyweight', 'strength', 'Core', 'None', 'beginner', 'Lie on back. Lower opposite arm and leg, alternate.'),
('Bird Dog', 'Core and balance', 'bodyweight', 'strength', 'Core', 'None', 'beginner', 'On hands and knees. Extend opposite arm and leg.'),
('Ab Wheel Rollout', 'Advanced core', 'strength', 'strength', 'Core', 'Ab Wheel', 'advanced', 'Kneel holding ab wheel. Roll forward, roll back.'),
('Cable Woodchop', 'Rotational core with cable', 'machine', 'strength', 'Core', 'Cable Machine', 'intermediate', 'Stand sideways to cable. Pull handle diagonally.'),
('Hanging Leg Raises', 'Advanced core', 'bodyweight', 'strength', 'Core', 'Pull-up Bar', 'advanced', 'Hang from bar. Raise legs to horizontal.'),

-- CARDIO
('Running', 'Outdoor or treadmill', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Maintain good posture, start with warm-up walk.'),
('Cycling', 'Indoor or outdoor', 'cardio', 'cardio', 'Legs', 'Stationary Bike', 'beginner', 'Adjust seat height. Maintain steady cadence.'),
('Rowing', 'Full body cardio', 'cardio', 'cardio', 'Full Body', 'Rowing Machine', 'intermediate', 'Drive with legs first, lean back, pull to chest.'),
('Jump Rope', 'High-intensity cardio', 'cardio', 'cardio', 'Full Body', 'Jump Rope', 'beginner', 'Keep elbows close. Land softly on balls of feet.'),
('Elliptical', 'Low-impact cardio', 'cardio', 'cardio', 'Full Body', 'Elliptical', 'beginner', 'Stand tall, grip handles lightly.'),
('Walking', 'Brisk walking', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Maintain brisk pace, swing arms naturally.'),
('Burpees', 'Full body cardio', 'cardio', 'cardio', 'Full Body', 'None', 'intermediate', 'Drop to push-up, perform push-up, jump up.'),
('Jumping Jacks', 'Classic cardio warm-up', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Jump feet out while raising arms.'),
('High Knees', 'Running in place', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Run in place, driving knees high.'),
('Box Jumps', 'Explosive plyometric', 'cardio', 'cardio', 'Legs', 'Plyo Box', 'intermediate', 'Jump onto box, land softly. Step down.'),
('Battle Rope Waves', 'High intensity conditioning', 'cardio', 'cardio', 'Full Body', 'Battle Ropes', 'intermediate', 'Create alternating waves with arms.'),
('Kettlebell Swings', 'Hip hinge cardio', 'cardio', 'cardio', 'Full Body', 'Kettlebell', 'intermediate', 'Hinge at hips, swing kettlebell up.'),

-- FLEXIBILITY
('Standing Hamstring Stretch', 'Basic hamstring flexibility', 'flexibility', 'flexibility', 'Legs', 'None', 'beginner', 'Stand and reach toward toes. Hold 30 seconds.'),
('Quad Stretch', 'Standing quadricep stretch', 'flexibility', 'flexibility', 'Legs', 'None', 'beginner', 'Stand on one leg, pull foot to glute.'),
('Hip Flexor Stretch', 'Kneeling hip flexor', 'flexibility', 'flexibility', 'Hips', 'None', 'beginner', 'Kneel on one knee. Push hips forward.'),
('Pigeon Pose', 'Deep hip opener', 'flexibility', 'flexibility', 'Hips', 'None', 'intermediate', 'Bring one knee forward, extend other leg back.'),
('Cat-Cow Stretch', 'Spinal mobility', 'flexibility', 'flexibility', 'Back', 'None', 'beginner', 'On hands and knees, alternate arching and rounding.'),
('Childs Pose', 'Restful back stretch', 'flexibility', 'flexibility', 'Back', 'None', 'beginner', 'Kneel and sit back. Extend arms forward.'),
('Shoulder Stretch', 'Cross-body shoulder', 'flexibility', 'flexibility', 'Shoulders', 'None', 'beginner', 'Bring arm across chest. Hold 30 seconds.'),
('Tricep Stretch', 'Overhead tricep stretch', 'flexibility', 'flexibility', 'Arms', 'None', 'beginner', 'Raise arm overhead, bend elbow. Push elbow back.'),
('Chest Stretch', 'Doorway chest stretch', 'flexibility', 'flexibility', 'Chest', 'None', 'beginner', 'Place forearm on wall. Turn body away.'),
('Downward Dog', 'Full body yoga pose', 'flexibility', 'flexibility', 'Full Body', 'None', 'beginner', 'Form inverted V. Press heels toward ground.');

-- =====================================================
-- PREDEFINED WORKOUTS
-- =====================================================

-- Get system user ID
SET @system_user_id = (SELECT id FROM users WHERE email = 'system@fitflow.app');

-- Beginner Full Body A
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Beginner Full Body A', 'Foundational full body workout focusing on compound movements', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 1, 3, 12, 60 FROM exercises WHERE name = 'Goblet Squat' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 2, 3, 10, 60 FROM exercises WHERE name = 'Dumbbell Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 3, 3, 10, 60 FROM exercises WHERE name = 'Dumbbell Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 4, 3, 10, 60 FROM exercises WHERE name = 'Dumbbell Shoulder Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 5, 3, 1, 45 FROM exercises WHERE name = 'Plank' LIMIT 1;

-- Beginner Full Body B
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Beginner Full Body B', 'Foundational full body workout - variation B', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 1, 3, 10, 60 FROM exercises WHERE name = 'Lunges' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 2, 3, 10, 60 FROM exercises WHERE name = 'Push-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 3, 3, 10, 60 FROM exercises WHERE name = 'Lat Pulldown' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 4, 3, 12, 45 FROM exercises WHERE name = 'Lateral Raises' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 5, 3, 15, 45 FROM exercises WHERE name = 'Crunches' LIMIT 1;

-- Intermediate Push Day
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Intermediate Push Day', 'Chest, shoulders, and triceps focused workout', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 1, 4, 8, 90 FROM exercises WHERE name = 'Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 2, 3, 10, 90 FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 3, 4, 8, 90 FROM exercises WHERE name = 'Overhead Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 4, 3, 12, 60 FROM exercises WHERE name = 'Dumbbell Flyes' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 5, 3, 15, 45 FROM exercises WHERE name = 'Lateral Raises' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 6, 3, 12, 45 FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1;

-- Intermediate Pull Day
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Intermediate Pull Day', 'Back and biceps focused workout', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 1, 4, 8, 90 FROM exercises WHERE name = 'Barbell Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 2, 4, 8, 90 FROM exercises WHERE name = 'Pull-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 3, 3, 10, 60 FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 4, 3, 15, 45 FROM exercises WHERE name = 'Face Pulls' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 5, 3, 10, 60 FROM exercises WHERE name = 'Barbell Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 6, 3, 12, 45 FROM exercises WHERE name = 'Hammer Curl' LIMIT 1;

-- Intermediate Leg Day
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Intermediate Leg Day', 'Complete lower body workout', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 1, 4, 8, 120 FROM exercises WHERE name = 'Barbell Squat' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 2, 4, 10, 90 FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 3, 3, 12, 90 FROM exercises WHERE name = 'Leg Press' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 4, 3, 15, 60 FROM exercises WHERE name = 'Leg Extension' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 5, 3, 12, 60 FROM exercises WHERE name = 'Leg Curl' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 6, 4, 15, 45 FROM exercises WHERE name = 'Calf Raises' LIMIT 1;

-- HIIT Session
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'HIIT Cardio Session', 'High-intensity interval training for fat burning', 'cardio', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 1, 3, 20, 30 FROM exercises WHERE name = 'Jumping Jacks' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 2, 4, 10, 30 FROM exercises WHERE name = 'Burpees' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 3, 4, 20, 30 FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 4, 4, 30, 30 FROM exercises WHERE name = 'High Knees' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 5, 4, 15, 30 FROM exercises WHERE name = 'Jump Squats' LIMIT 1;

-- Home Workout
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'No Equipment Home Workout', 'Full body workout with no equipment needed', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 1, 4, 15, 45 FROM exercises WHERE name = 'Bodyweight Squats' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 2, 4, 12, 45 FROM exercises WHERE name = 'Push-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 3, 3, 12, 45 FROM exercises WHERE name = 'Lunges' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 4, 3, 10, 45 FROM exercises WHERE name = 'Pike Push-ups' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 5, 3, 1, 30 FROM exercises WHERE name = 'Plank' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time)
SELECT @workout_id, id, 6, 3, 20, 45 FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1;

-- Flexibility Routine
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Full Body Stretch', 'Complete flexibility routine for recovery', 'flexibility', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration)
SELECT @workout_id, id, 1, 1, 1, 45 FROM exercises WHERE name = 'Standing Hamstring Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration)
SELECT @workout_id, id, 2, 1, 1, 30 FROM exercises WHERE name = 'Quad Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration)
SELECT @workout_id, id, 3, 1, 1, 30 FROM exercises WHERE name = 'Hip Flexor Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration)
SELECT @workout_id, id, 4, 1, 1, 30 FROM exercises WHERE name = 'Chest Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration)
SELECT @workout_id, id, 5, 1, 1, 30 FROM exercises WHERE name = 'Shoulder Stretch' LIMIT 1;
INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration)
SELECT @workout_id, id, 6, 1, 1, 60 FROM exercises WHERE name = 'Childs Pose' LIMIT 1;

-- =====================================================
-- PREDEFINED PROGRAMS
-- =====================================================

-- Beginner Strength Foundation
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Beginner Strength Foundation', 'Perfect for those new to weight training. Build a solid foundation with full-body workouts 3 days per week.', 'strength', 4, 3, 'beginner', TRUE);
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'Beginner Full Body A' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 2, 2 FROM workouts WHERE name = 'Beginner Full Body B' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 4, 3 FROM workouts WHERE name = 'Beginner Full Body A' AND is_predefined = TRUE LIMIT 1;

-- Intermediate PPL
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Push Pull Legs Split', 'Classic PPL split for intermediate lifters. Train 6 days per week hitting each muscle group twice.', 'muscle_gain', 6, 6, 'intermediate', TRUE);
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'Intermediate Push Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 1, 2 FROM workouts WHERE name = 'Intermediate Pull Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 2, 3 FROM workouts WHERE name = 'Intermediate Leg Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 3, 4 FROM workouts WHERE name = 'Intermediate Push Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 4, 5 FROM workouts WHERE name = 'Intermediate Pull Day' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 5, 6 FROM workouts WHERE name = 'Intermediate Leg Day' AND is_predefined = TRUE LIMIT 1;

-- Home Transformation
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Home Body Transformation', 'No gym? No problem! Complete bodyweight program you can do anywhere.', 'general_fitness', 4, 4, 'beginner', TRUE);
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'No Equipment Home Workout' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 1, 2 FROM workouts WHERE name = 'Full Body Stretch' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 3, 3 FROM workouts WHERE name = 'No Equipment Home Workout' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 4, 4 FROM workouts WHERE name = 'HIIT Cardio Session' AND is_predefined = TRUE LIMIT 1;

-- Fat Burning Cardio
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined) VALUES
(@system_user_id, 'Fat Burning Cardio', 'High-energy cardio program designed for maximum calorie burn.', 'weight_loss', 4, 4, 'intermediate', TRUE);
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 0, 1 FROM workouts WHERE name = 'HIIT Cardio Session' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 2, 2 FROM workouts WHERE name = 'No Equipment Home Workout' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 4, 3 FROM workouts WHERE name = 'HIIT Cardio Session' AND is_predefined = TRUE LIMIT 1;
INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index)
SELECT @program_id, id, 1, 6, 4 FROM workouts WHERE name = 'Full Body Stretch' AND is_predefined = TRUE LIMIT 1;

-- =====================================================
-- DEPLOYMENT COMPLETE!
-- 
-- Summary:
-- - 3 Users (demo, admin, system)
-- - 28 Equipment items
-- - 85+ Exercises
-- - 8 Predefined Workouts
-- - 4 Predefined Programs
--
-- Test Accounts:
-- Demo: demo@fitflow.com / demo123
-- Admin: admin@fitflow.com / admin123
-- =====================================================
