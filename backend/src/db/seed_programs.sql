-- =====================================================
-- FitFlow Predefined Training Programs
-- Run this AFTER seed_complete.sql
-- Creates system user and predefined workouts/programs
-- =====================================================

USE fitflow;

-- =====================================================
-- CREATE SYSTEM USER FOR PREDEFINED CONTENT
-- =====================================================
INSERT INTO users (email, password, first_name, last_name) VALUES
('system@fitflow.app', '$2a$10$systempasswordhashnotusedforlogin', 'FitFlow', 'System');

SET @system_user_id = LAST_INSERT_ID();

-- =====================================================
-- BEGINNER STRENGTH WORKOUTS
-- =====================================================

-- Full Body A
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Beginner Full Body A', 'Foundational full body workout focusing on compound movements', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Goblet Squat' LIMIT 1), 1, 3, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Dumbbell Bench Press' LIMIT 1), 2, 3, 10, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Dumbbell Row' LIMIT 1), 3, 3, 10, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Dumbbell Shoulder Press' LIMIT 1), 4, 3, 10, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Plank' LIMIT 1), 5, 3, 1, 45);

-- Full Body B
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Beginner Full Body B', 'Foundational full body workout - variation B', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Lunges' LIMIT 1), 1, 3, 10, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Push-ups' LIMIT 1), 2, 3, 10, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Lat Pulldown' LIMIT 1), 3, 3, 10, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Lateral Raises' LIMIT 1), 4, 3, 12, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Crunches' LIMIT 1), 5, 3, 15, 45);

-- =====================================================
-- INTERMEDIATE STRENGTH WORKOUTS
-- =====================================================

-- Push Day
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Intermediate Push Day', 'Chest, shoulders, and triceps focused workout', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Bench Press' LIMIT 1), 1, 4, 8, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1), 2, 3, 10, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Overhead Press' LIMIT 1), 3, 4, 8, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Dumbbell Flyes' LIMIT 1), 4, 3, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Lateral Raises' LIMIT 1), 5, 3, 15, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1), 6, 3, 12, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Overhead Tricep Extension' LIMIT 1), 7, 3, 12, 45);

-- Pull Day
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Intermediate Pull Day', 'Back and biceps focused workout', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Barbell Row' LIMIT 1), 1, 4, 8, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Pull-ups' LIMIT 1), 2, 4, 8, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1), 3, 3, 10, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Face Pulls' LIMIT 1), 4, 3, 15, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Barbell Curl' LIMIT 1), 5, 3, 10, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Hammer Curl' LIMIT 1), 6, 3, 12, 45);

-- Leg Day
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Intermediate Leg Day', 'Complete lower body workout', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Barbell Squat' LIMIT 1), 1, 4, 8, 120),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1), 2, 4, 10, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Leg Press' LIMIT 1), 3, 3, 12, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Leg Extension' LIMIT 1), 4, 3, 15, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Leg Curl' LIMIT 1), 5, 3, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Calf Raises' LIMIT 1), 6, 4, 15, 45);

-- =====================================================
-- ADVANCED STRENGTH WORKOUTS
-- =====================================================

-- Heavy Upper
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Advanced Upper Power', 'Heavy compound upper body for strength gains', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Bench Press' LIMIT 1), 1, 5, 5, 180),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Barbell Row' LIMIT 1), 2, 5, 5, 180),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Overhead Press' LIMIT 1), 3, 4, 6, 120),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Pull-ups' LIMIT 1), 4, 4, 8, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Close-grip Bench Press' LIMIT 1), 5, 3, 8, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Barbell Curl' LIMIT 1), 6, 3, 8, 60);

-- Heavy Lower
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Advanced Lower Power', 'Heavy compound lower body for strength gains', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Barbell Squat' LIMIT 1), 1, 5, 5, 180),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Deadlift' LIMIT 1), 2, 5, 5, 180),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Front Squat' LIMIT 1), 3, 3, 6, 120),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squat' LIMIT 1), 4, 3, 8, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Hip Thrusts' LIMIT 1), 5, 3, 10, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Hanging Leg Raises' LIMIT 1), 6, 3, 12, 60);

-- =====================================================
-- CARDIO WORKOUTS
-- =====================================================

-- Beginner Cardio
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Beginner Cardio Session', '30-minute low to moderate intensity cardio', 'cardio', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration, intensity) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Walking' LIMIT 1), 1, 1, 1, 600, 'low'),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Cycling' LIMIT 1), 2, 1, 1, 900, 'moderate'),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Walking' LIMIT 1), 3, 1, 1, 300, 'low');

-- Intermediate Cardio
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Intermediate HIIT Session', 'High-intensity interval training', 'cardio', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration, intensity) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Jumping Jacks' LIMIT 1), 1, 3, 20, NULL, 'moderate'),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Burpees' LIMIT 1), 2, 4, 10, NULL, 'high'),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1), 3, 4, 20, NULL, 'high'),
(@workout_id, (SELECT id FROM exercises WHERE name = 'High Knees' LIMIT 1), 4, 4, 30, NULL, 'high'),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Jump Squats' LIMIT 1), 5, 4, 15, NULL, 'high');

-- Advanced Cardio
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Advanced Conditioning', 'Intense full-body conditioning circuit', 'cardio', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration, intensity) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Battle Rope Waves' LIMIT 1), 1, 4, 1, 30, 'high'),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Kettlebell Swings' LIMIT 1), 2, 4, 20, NULL, 'high'),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Box Jumps' LIMIT 1), 3, 4, 12, NULL, 'high'),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Burpees' LIMIT 1), 4, 4, 15, NULL, 'high'),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Rowing' LIMIT 1), 5, 3, 1, 120, 'interval');

-- =====================================================
-- FLEXIBILITY WORKOUTS
-- =====================================================

-- Morning Stretch
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Morning Stretch Routine', '15-minute morning mobility routine', 'flexibility', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Cat-Cow Stretch' LIMIT 1), 1, 2, 10, NULL),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Downward Dog' LIMIT 1), 2, 1, 1, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Hip Flexor Stretch' LIMIT 1), 3, 1, 1, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Shoulder Stretch' LIMIT 1), 4, 1, 1, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Neck Rolls' LIMIT 1), 5, 2, 10, NULL);

-- Full Body Stretch
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Full Body Stretch', 'Complete flexibility routine for recovery', 'flexibility', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Standing Hamstring Stretch' LIMIT 1), 1, 1, 1, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Quad Stretch' LIMIT 1), 2, 1, 1, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Hip Flexor Stretch' LIMIT 1), 3, 1, 1, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Pigeon Pose' LIMIT 1), 4, 1, 1, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Chest Stretch' LIMIT 1), 5, 1, 1, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Shoulder Stretch' LIMIT 1), 6, 1, 1, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Tricep Stretch' LIMIT 1), 7, 1, 1, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Seated Forward Fold' LIMIT 1), 8, 1, 1, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Childs Pose' LIMIT 1), 9, 1, 1, 60);

-- =====================================================
-- BODYWEIGHT WORKOUTS
-- =====================================================

-- Home Workout
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'No Equipment Home Workout', 'Full body workout with no equipment needed', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Bodyweight Squats' LIMIT 1), 1, 4, 15, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Push-ups' LIMIT 1), 2, 4, 12, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Lunges' LIMIT 1), 3, 3, 12, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Pike Push-ups' LIMIT 1), 4, 3, 10, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Plank' LIMIT 1), 5, 3, 1, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1), 6, 3, 20, 45);

-- Advanced Calisthenics
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Advanced Calisthenics', 'Challenging bodyweight workout', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Pull-ups' LIMIT 1), 1, 4, 10, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Tricep Dips' LIMIT 1), 2, 4, 12, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Handstand Push-ups' LIMIT 1), 3, 3, 8, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squat' LIMIT 1), 4, 3, 10, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Jump Squats' LIMIT 1), 5, 3, 15, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Hanging Leg Raises' LIMIT 1), 6, 3, 12, 60);

-- =====================================================
-- PREDEFINED PROGRAMS
-- =====================================================

-- Beginner Full Body Program (4 weeks)
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined, image_url) VALUES
(@system_user_id, 'Beginner Strength Foundation', 'Perfect for those new to weight training. Build a solid foundation with full-body workouts 3 days per week. Focus on learning proper form and building basic strength.', 'strength', 4, 3, 'beginner', TRUE, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600');
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body A' LIMIT 1), 1, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body B' LIMIT 1), 1, 2, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body A' LIMIT 1), 1, 4, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body B' LIMIT 1), 2, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body A' LIMIT 1), 2, 2, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body B' LIMIT 1), 2, 4, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body A' LIMIT 1), 3, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body B' LIMIT 1), 3, 2, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body A' LIMIT 1), 3, 4, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body B' LIMIT 1), 4, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body A' LIMIT 1), 4, 2, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body B' LIMIT 1), 4, 4, 3);

-- Intermediate Push/Pull/Legs Program (6 weeks)
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined, image_url) VALUES
(@system_user_id, 'Intermediate Push Pull Legs', 'The classic PPL split for intermediate lifters. Train 6 days per week with each muscle group hit twice. Great for building muscle and strength.', 'muscle_gain', 6, 6, 'intermediate', TRUE, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600');
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Push Day' LIMIT 1), 1, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Pull Day' LIMIT 1), 1, 1, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Leg Day' LIMIT 1), 1, 2, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Push Day' LIMIT 1), 1, 3, 4),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Pull Day' LIMIT 1), 1, 4, 5),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Leg Day' LIMIT 1), 1, 5, 6),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Push Day' LIMIT 1), 2, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Pull Day' LIMIT 1), 2, 1, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Leg Day' LIMIT 1), 2, 2, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Push Day' LIMIT 1), 2, 3, 4),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Pull Day' LIMIT 1), 2, 4, 5),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Leg Day' LIMIT 1), 2, 5, 6);

-- Advanced Powerlifting Program (8 weeks)
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined, image_url) VALUES
(@system_user_id, 'Advanced Strength Builder', 'Intense program for experienced lifters looking to maximize strength gains. Focus on heavy compound movements with progressive overload.', 'strength', 8, 4, 'advanced', TRUE, 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600');
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Advanced Upper Power' LIMIT 1), 1, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Advanced Lower Power' LIMIT 1), 1, 1, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Advanced Upper Power' LIMIT 1), 1, 3, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Advanced Lower Power' LIMIT 1), 1, 4, 4);

-- Cardio & Fat Loss Program (4 weeks)
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined, image_url) VALUES
(@system_user_id, 'Fat Burning Cardio', 'High-energy cardio program designed for maximum calorie burn. Mix of HIIT and steady-state cardio for optimal fat loss.', 'weight_loss', 4, 4, 'intermediate', TRUE, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600');
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate HIIT Session' LIMIT 1), 1, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Cardio Session' LIMIT 1), 1, 2, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate HIIT Session' LIMIT 1), 1, 4, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Advanced Conditioning' LIMIT 1), 1, 6, 4);

-- Home Workout Program (4 weeks)
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined, image_url) VALUES
(@system_user_id, 'Home Body Transformation', 'No gym? No problem! Complete bodyweight program you can do anywhere. Build strength and burn fat from home.', 'general_fitness', 4, 4, 'beginner', TRUE, 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600');
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'No Equipment Home Workout' LIMIT 1), 1, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Morning Stretch Routine' LIMIT 1), 1, 1, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'No Equipment Home Workout' LIMIT 1), 1, 2, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Full Body Stretch' LIMIT 1), 1, 4, 4);

-- Flexibility & Mobility Program (4 weeks)
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined, image_url) VALUES
(@system_user_id, 'Flexibility & Mobility', 'Improve your range of motion and reduce injury risk. Perfect as a standalone program or complement to strength training.', 'flexibility', 4, 3, 'beginner', TRUE, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600');
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Morning Stretch Routine' LIMIT 1), 1, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Full Body Stretch' LIMIT 1), 1, 2, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Morning Stretch Routine' LIMIT 1), 1, 4, 3);

-- Athlete Conditioning (6 weeks)
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined, image_url) VALUES
(@system_user_id, 'Athletic Performance', 'Sport-specific conditioning program combining strength, power, and cardio. Build explosive athleticism.', 'sport_specific', 6, 5, 'advanced', TRUE, 'https://images.unsplash.com/photo-1544216717-3bbf52512659?w=600');
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Advanced Upper Power' LIMIT 1), 1, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Advanced Conditioning' LIMIT 1), 1, 1, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Advanced Lower Power' LIMIT 1), 1, 2, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate HIIT Session' LIMIT 1), 1, 3, 4),
(@program_id, (SELECT id FROM workouts WHERE name = 'Full Body Stretch' LIMIT 1), 1, 5, 5);

-- Calisthenics Mastery (8 weeks)
INSERT INTO programs (user_id, name, description, category, duration_weeks, days_per_week, difficulty, is_predefined, image_url) VALUES
(@system_user_id, 'Calisthenics Mastery', 'Master your bodyweight with this progressive calisthenics program. Build functional strength and impressive skills.', 'strength', 8, 4, 'advanced', TRUE, 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600');
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, week_number, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Advanced Calisthenics' LIMIT 1), 1, 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Morning Stretch Routine' LIMIT 1), 1, 1, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Advanced Calisthenics' LIMIT 1), 1, 3, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Full Body Stretch' LIMIT 1), 1, 5, 4);

-- =====================================================
-- SEED DATA COMPLETE!
-- Summary:
-- - 35+ Equipment items
-- - 100+ Exercises across all categories
-- - 15+ Predefined Workouts
-- - 9 Predefined Programs for all levels:
--   * Beginner Strength Foundation (4 weeks)
--   * Intermediate Push Pull Legs (6 weeks)
--   * Advanced Strength Builder (8 weeks)
--   * Fat Burning Cardio (4 weeks)
--   * Home Body Transformation (4 weeks)
--   * Flexibility & Mobility (4 weeks)
--   * Athletic Performance (6 weeks)
--   * Calisthenics Mastery (8 weeks)
-- =====================================================
