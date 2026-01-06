-- FitFlow Database Migration v3 - Cardio Support
-- Adds cardio-specific fields to exercises and workout tracking

USE fitflow;

-- Add cardio-specific fields to exercises
ALTER TABLE exercises
ADD COLUMN exercise_type ENUM('strength', 'cardio', 'flexibility', 'timed') DEFAULT 'strength' AFTER category,
ADD COLUMN default_duration INT DEFAULT NULL AFTER video_url,
ADD COLUMN default_distance DECIMAL(8,2) DEFAULT NULL AFTER default_duration,
ADD COLUMN calories_per_minute DECIMAL(5,2) DEFAULT NULL AFTER default_distance;

-- Update exercise_type based on category
UPDATE exercises SET exercise_type = 'cardio' WHERE category = 'cardio';
UPDATE exercises SET exercise_type = 'strength' WHERE category IN ('strength', 'machine');
UPDATE exercises SET exercise_type = 'flexibility' WHERE category = 'flexibility';
UPDATE exercises SET exercise_type = 'strength' WHERE category = 'bodyweight';

-- Add cardio-specific fields to workout_exercises
ALTER TABLE workout_exercises
ADD COLUMN distance DECIMAL(8,2) DEFAULT NULL AFTER duration,
ADD COLUMN target_pace DECIMAL(5,2) DEFAULT NULL AFTER distance,
ADD COLUMN calories INT DEFAULT NULL AFTER target_pace,
ADD COLUMN intensity ENUM('low', 'moderate', 'high', 'interval') DEFAULT NULL AFTER calories;

-- Add cardio-specific fields to exercise_logs
ALTER TABLE exercise_logs
ADD COLUMN duration_seconds INT DEFAULT NULL AFTER reps_per_set,
ADD COLUMN distance_km DECIMAL(8,2) DEFAULT NULL AFTER duration_seconds,
ADD COLUMN avg_pace DECIMAL(5,2) DEFAULT NULL AFTER distance_km,
ADD COLUMN avg_heart_rate INT DEFAULT NULL AFTER avg_pace,
ADD COLUMN calories_burned INT DEFAULT NULL AFTER avg_heart_rate;

-- Insert cardio exercises if they don't exist
INSERT INTO exercises (name, description, category, exercise_type, muscle_group, equipment, difficulty, instructions, default_duration, default_distance, calories_per_minute) VALUES
('Running', 'Outdoor or treadmill running for cardiovascular fitness', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Start with a warm-up walk, then gradually increase pace to a comfortable running speed. Maintain good posture with shoulders relaxed.', 1800, 5.00, 10.0),
('Cycling', 'Indoor or outdoor cycling for cardio endurance', 'cardio', 'cardio', 'Legs', 'Bicycle', 'beginner', 'Adjust seat height so leg is slightly bent at bottom of pedal stroke. Maintain steady cadence and control breathing.', 2700, 15.00, 8.0),
('Swimming', 'Full body cardio exercise in water', 'cardio', 'cardio', 'Full Body', 'Pool', 'intermediate', 'Choose your stroke (freestyle, breaststroke, etc.). Focus on breathing rhythm and smooth, efficient movements.', 1800, 1.00, 11.0),
('Rowing Machine', 'Indoor rowing for full body cardio workout', 'cardio', 'cardio', 'Full Body', 'Rowing Machine', 'intermediate', 'Drive with legs first, then lean back slightly, finally pull handle to lower chest. Return in reverse order.', 1200, 2.00, 9.0),
('Jump Rope', 'High-intensity cardio using a jump rope', 'cardio', 'cardio', 'Full Body', 'Jump Rope', 'beginner', 'Keep elbows close to body, use wrists to rotate rope. Land softly on balls of feet with slight knee bend.', 600, NULL, 12.0),
('Elliptical', 'Low-impact cardio machine workout', 'cardio', 'cardio', 'Full Body', 'Elliptical Machine', 'beginner', 'Stand tall, grip handles lightly. Push and pull with arms while moving legs in smooth elliptical motion.', 1800, NULL, 8.5),
('Stair Climber', 'Stair climbing machine for cardio and leg strength', 'cardio', 'cardio', 'Legs', 'Stair Climber', 'intermediate', 'Stand upright, avoid leaning on handles. Step at a steady pace, driving through your heels.', 1200, NULL, 9.0),
('Walking', 'Brisk walking for low-impact cardio', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Maintain a brisk pace, swing arms naturally. Keep good posture with core engaged.', 1800, 3.00, 5.0),
('HIIT', 'High-Intensity Interval Training circuit', 'cardio', 'cardio', 'Full Body', 'None', 'advanced', 'Alternate between high-intensity bursts (30-60 sec) and rest periods (15-30 sec). Include exercises like burpees, jumping jacks, mountain climbers.', 1200, NULL, 14.0),
('Spin Class', 'Indoor cycling class with varying intensities', 'cardio', 'cardio', 'Legs', 'Spin Bike', 'intermediate', 'Follow instructor cues for resistance and speed changes. Stay seated or stand as directed, maintaining proper form.', 2700, NULL, 10.0)
ON DUPLICATE KEY UPDATE exercise_type = VALUES(exercise_type), default_duration = VALUES(default_duration);

-- Add workout category/type field
ALTER TABLE workouts
ADD COLUMN workout_type ENUM('strength', 'cardio', 'mixed', 'flexibility') DEFAULT 'strength' AFTER description;
