-- =====================================================
-- Additional Predefined Workouts and Programs
-- Run this AFTER seed_programs.sql
-- Adds 10 more workouts and 5 more programs
-- =====================================================

USE fitflow;

-- Get system user ID
SET @system_user_id = (SELECT id FROM users WHERE email = 'system@fitflow.app' LIMIT 1);

-- =====================================================
-- ADDITIONAL STRENGTH WORKOUTS
-- =====================================================

-- Upper Body Focus
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Upper Body Hypertrophy', 'Volume-focused upper body workout for muscle growth. 8-12 rep range for maximum hypertrophy.', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Bench Press' LIMIT 1), 1, 4, 10, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1), 2, 3, 12, 75),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Barbell Row' LIMIT 1), 3, 4, 10, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Lat Pulldown' LIMIT 1), 4, 3, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Overhead Press' LIMIT 1), 5, 3, 10, 75),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Lateral Raises' LIMIT 1), 6, 3, 15, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Barbell Curl' LIMIT 1), 7, 3, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1), 8, 3, 12, 60);

-- Lower Body Hypertrophy
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Lower Body Hypertrophy', 'High-volume leg workout for building bigger, stronger legs. Focus on quad and hamstring development.', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Barbell Squat' LIMIT 1), 1, 4, 10, 120),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1), 2, 4, 10, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Leg Press' LIMIT 1), 3, 4, 15, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Walking Lunges' LIMIT 1), 4, 3, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Leg Extension' LIMIT 1), 5, 3, 15, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Leg Curl' LIMIT 1), 6, 3, 15, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Calf Raises' LIMIT 1), 7, 4, 20, 45);

-- Arms & Abs Finisher
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Arms & Core Blast', 'Dedicated arm and core workout. Perfect as an accessory day or to finish your week strong.', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Barbell Curl' LIMIT 1), 1, 3, 10, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Hammer Curl' LIMIT 1), 2, 3, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1), 3, 3, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Overhead Tricep Extension' LIMIT 1), 4, 3, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Plank' LIMIT 1), 5, 3, 1, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Crunches' LIMIT 1), 6, 3, 20, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Russian Twists' LIMIT 1), 7, 3, 20, 45);

-- Chest & Back Focus
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Chest & Back Superset', 'Antagonistic superset workout for chest and back. Efficient and effective upper body training.', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Bench Press' LIMIT 1), 1, 4, 8, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Barbell Row' LIMIT 1), 2, 4, 8, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1), 3, 3, 10, 75),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Pull-ups' LIMIT 1), 4, 3, 10, 75),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Dumbbell Flyes' LIMIT 1), 5, 3, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1), 6, 3, 12, 60);

-- Shoulder & Trap Workout
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Shoulders & Traps', 'Complete shoulder and trap development. Build boulder shoulders and a strong neck base.', 'strength', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Overhead Press' LIMIT 1), 1, 4, 8, 90),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Dumbbell Shoulder Press' LIMIT 1), 2, 3, 10, 75),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Lateral Raises' LIMIT 1), 3, 4, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Front Raises' LIMIT 1), 4, 3, 12, 60),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Face Pulls' LIMIT 1), 5, 3, 15, 45),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Shrugs' LIMIT 1), 6, 4, 12, 60);

-- =====================================================
-- CARDIO & MIXED WORKOUTS
-- =====================================================

-- Full Body Circuit
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Full Body Circuit Training', 'High-intensity circuit combining strength and cardio. Burn calories while building muscle.', 'mixed', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Burpees' LIMIT 1), 1, 3, 15, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Kettlebell Swings' LIMIT 1), 2, 3, 20, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Push-ups' LIMIT 1), 3, 3, 15, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Box Jumps' LIMIT 1), 4, 3, 12, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Battle Ropes' LIMIT 1), 5, 3, 30, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1), 6, 3, 30, 30);

-- Tabata Intervals
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Tabata HIIT Protocol', 'Classic Tabata intervals: 20 seconds max effort, 10 seconds rest. 8 rounds of pure intensity.', 'cardio', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Burpees' LIMIT 1), 1, 8, NULL, 20, 10),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Jump Squats' LIMIT 1), 2, 8, NULL, 20, 10),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1), 3, 8, NULL, 20, 10),
(@workout_id, (SELECT id FROM exercises WHERE name = 'High Knees' LIMIT 1), 4, 8, NULL, 20, 10);

-- Endurance Cardio
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Steady State Endurance', 'Moderate intensity cardio for building aerobic base and burning fat. Sustainable pace for longer duration.', 'cardio', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, duration, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Treadmill Running' LIMIT 1), 1, 1, 1800, 0),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Stationary Bike' LIMIT 1), 2, 1, 600, 120),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Rowing Machine' LIMIT 1), 3, 1, 600, 0);

-- =====================================================
-- FLEXIBILITY WORKOUTS
-- =====================================================

-- Deep Stretch Session
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Deep Stretch Recovery', 'Long-hold stretches for maximum flexibility gains. Perfect for rest days or post-workout recovery.', 'flexibility', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, duration, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Hamstring Stretch' LIMIT 1), 1, 2, 60, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Hip Flexor Stretch' LIMIT 1), 2, 2, 60, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Chest Stretch' LIMIT 1), 3, 2, 60, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Shoulder Stretch' LIMIT 1), 4, 2, 60, 30),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Quad Stretch' LIMIT 1), 5, 2, 60, 30);

-- Yoga Flow
INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES
(@system_user_id, 'Morning Yoga Flow', 'Gentle yoga sequence to wake up your body. Perfect way to start your day with mindful movement.', 'flexibility', TRUE);
SET @workout_id = LAST_INSERT_ID();

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, duration, rest_time) VALUES
(@workout_id, (SELECT id FROM exercises WHERE name = 'Cat-Cow Stretch' LIMIT 1), 1, 3, 60, 0),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Downward Dog' LIMIT 1), 2, 3, 30, 0),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Child\'s Pose' LIMIT 1), 3, 2, 60, 0),
(@workout_id, (SELECT id FROM exercises WHERE name = 'Pigeon Pose' LIMIT 1), 4, 2, 90, 0);

-- =====================================================
-- ADDITIONAL PROGRAMS
-- =====================================================

-- Bodybuilding Split (12 weeks)
INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES
(@system_user_id, 'Classic Bodybuilding Split', 'Traditional bodybuilding program with dedicated muscle group days. Build size and definition with proven methods.', 12, 'intermediate', TRUE);
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Chest & Back Superset' LIMIT 1), 1, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Shoulders & Traps' LIMIT 1), 2, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Lower Body Hypertrophy' LIMIT 1), 3, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Arms & Core Blast' LIMIT 1), 4, 4),
(@program_id, (SELECT id FROM workouts WHERE name = 'Deep Stretch Recovery' LIMIT 1), 6, 5);

-- Fat Loss Program (8 weeks)
INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES
(@system_user_id, '8-Week Fat Shredder', 'Aggressive fat loss program combining strength training and metabolic conditioning. Get lean while preserving muscle.', 8, 'intermediate', TRUE);
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Full Body Circuit Training' LIMIT 1), 1, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Tabata HIIT Protocol' LIMIT 1), 2, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Upper Body Hypertrophy' LIMIT 1), 3, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Tabata HIIT Protocol' LIMIT 1), 4, 4),
(@program_id, (SELECT id FROM workouts WHERE name = 'Lower Body Hypertrophy' LIMIT 1), 5, 5);

-- Strength & Size (10 weeks)
INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES
(@system_user_id, 'Power & Hypertrophy', 'Get the best of both worlds. Build maximum strength and muscle size with this hybrid program.', 10, 'advanced', TRUE);
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Push Day' LIMIT 1), 1, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Pull Day' LIMIT 1), 2, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Intermediate Leg Day' LIMIT 1), 3, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Upper Body Hypertrophy' LIMIT 1), 4, 4),
(@program_id, (SELECT id FROM workouts WHERE name = 'Arms & Core Blast' LIMIT 1), 5, 5);

-- Busy Professional (6 weeks)
INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES
(@system_user_id, 'Busy Professional Fitness', 'Time-efficient program for people with demanding schedules. Only 3-4 workouts per week, maximum results.', 6, 'beginner', TRUE);
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body A' LIMIT 1), 1, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Steady State Endurance' LIMIT 1), 3, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Beginner Full Body B' LIMIT 1), 5, 3);

-- Summer Shred (6 weeks)
INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES
(@system_user_id, 'Summer Shred Challenge', 'Get beach-ready with this high-intensity 6-week program. Combination of strength, cardio, and ab work for a shredded physique.', 6, 'intermediate', TRUE);
SET @program_id = LAST_INSERT_ID();

INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index) VALUES
(@program_id, (SELECT id FROM workouts WHERE name = 'Upper Body Hypertrophy' LIMIT 1), 0, 1),
(@program_id, (SELECT id FROM workouts WHERE name = 'Tabata HIIT Protocol' LIMIT 1), 1, 2),
(@program_id, (SELECT id FROM workouts WHERE name = 'Lower Body Hypertrophy' LIMIT 1), 2, 3),
(@program_id, (SELECT id FROM workouts WHERE name = 'Full Body Circuit Training' LIMIT 1), 3, 4),
(@program_id, (SELECT id FROM workouts WHERE name = 'Arms & Core Blast' LIMIT 1), 4, 5),
(@program_id, (SELECT id FROM workouts WHERE name = 'Morning Yoga Flow' LIMIT 1), 6, 6);

-- =====================================================
-- SEED DATA SUMMARY
-- Total Additional Content:
-- - 10 New Predefined Workouts
-- - 5 New Predefined Programs
-- Combined with seed_programs.sql:
-- - 25+ Predefined Workouts
-- - 14 Predefined Programs
-- =====================================================

