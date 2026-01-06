-- =====================================================
-- FitFlow Complete Seed Data
-- Run this AFTER schema_complete.sql
-- =====================================================

USE fitflow;

-- =====================================================
-- DEMO USER (password: demo123)
-- Hash generated with bcrypt, 10 rounds
-- =====================================================
INSERT INTO users (email, password, first_name, last_name) VALUES
('demo@fitflow.com', '$2a$10$mEHV.6Aqfbzrv/mG4NoJJOe5XUYUjXPoCdvCRBe5ruLqKUtQYg4RK', 'Demo', 'User')
ON DUPLICATE KEY UPDATE first_name = 'Demo';

-- =====================================================
-- EQUIPMENT SEED DATA (32 items)
-- =====================================================
INSERT INTO equipment (name, description, category, image_url, is_public) VALUES
-- Free Weights
('Barbell', 'Standard Olympic barbell, typically 20kg/45lbs', 'free_weights', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', TRUE),
('Dumbbells', 'Pair of adjustable or fixed weight dumbbells', 'free_weights', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400', TRUE),
('Kettlebell', 'Cast iron weight with handle for swings and lifts', 'free_weights', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400', TRUE),
('Weight Plates', 'Iron or rubber coated plates for barbells', 'free_weights', 'https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?w=400', TRUE),
('EZ Curl Bar', 'Curved barbell for bicep and tricep exercises', 'free_weights', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400', TRUE),
('Trap Bar', 'Hexagonal barbell for deadlifts and shrugs', 'free_weights', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', TRUE),
-- Machines
('Cable Machine', 'Adjustable pulley system for various exercises', 'machines', 'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400', TRUE),
('Lat Pulldown Machine', 'Machine for lat pulldown and back exercises', 'machines', 'https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=400', TRUE),
('Leg Press Machine', 'Machine for leg press and lower body training', 'machines', 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400', TRUE),
('Smith Machine', 'Guided barbell system for controlled lifts', 'machines', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', TRUE),
('Chest Press Machine', 'Machine for chest press movements', 'machines', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400', TRUE),
('Leg Extension Machine', 'Isolation machine for quadriceps', 'machines', 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400', TRUE),
('Leg Curl Machine', 'Isolation machine for hamstrings', 'machines', 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400', TRUE),
('Shoulder Press Machine', 'Machine for overhead pressing', 'machines', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400', TRUE),
('Pec Deck Machine', 'Chest fly isolation machine', 'machines', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400', TRUE),
-- Cardio
('Treadmill', 'Motorized running/walking belt machine', 'cardio', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400', TRUE),
('Stationary Bike', 'Indoor cycling machine for cardio', 'cardio', 'https://images.unsplash.com/photo-1591741535018-d8c13f08f5ed?w=400', TRUE),
('Elliptical', 'Low-impact cardio machine', 'cardio', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', TRUE),
('Rowing Machine', 'Cardio machine simulating rowing', 'cardio', 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=400', TRUE),
('Stair Climber', 'Machine simulating stair climbing', 'cardio', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400', TRUE),
('Jump Rope', 'Speed rope for cardio and conditioning', 'cardio', 'https://images.unsplash.com/photo-1601422407692-ec73cc4b7e43?w=400', TRUE),
-- Bodyweight
('Pull-up Bar', 'Bar for pull-ups and hanging exercises', 'bodyweight', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400', TRUE),
('Dip Station', 'Parallel bars for dips and leg raises', 'bodyweight', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', TRUE),
('Plyo Box', 'Sturdy box for box jumps and step-ups', 'bodyweight', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400', TRUE),
('Gymnastic Rings', 'Adjustable rings for advanced bodyweight training', 'bodyweight', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400', TRUE),
-- Bands & Cables
('Resistance Bands', 'Elastic bands of various resistances', 'bands_cables', 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=400', TRUE),
('TRX Suspension Trainer', 'Suspension straps for bodyweight exercises', 'bands_cables', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', TRUE),
('Battle Ropes', 'Heavy ropes for conditioning', 'bands_cables', 'https://images.unsplash.com/photo-1544216717-3bbf52512659?w=400', TRUE),
-- Accessories
('Bench (Flat)', 'Flat weight bench for pressing', 'accessories', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', TRUE),
('Bench (Adjustable)', 'Adjustable incline/decline bench', 'accessories', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', TRUE),
('Power Rack', 'Squat rack with safety bars', 'accessories', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', TRUE),
('Ab Wheel', 'Wheel with handles for ab rollouts', 'accessories', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', TRUE),
('Foam Roller', 'For self-massage and mobility', 'accessories', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', TRUE),
('Yoga Mat', 'Cushioned mat for floor exercises', 'accessories', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', TRUE),
('Medicine Ball', 'Weighted ball for functional training', 'accessories', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400', TRUE),
('Stability Ball', 'Large inflatable ball for core work', 'accessories', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', TRUE);

-- =====================================================
-- EXERCISES SEED DATA (100+ exercises)
-- =====================================================

-- =========================
-- CHEST EXERCISES
-- =========================
INSERT INTO exercises (name, description, category, exercise_type, muscle_group, equipment, difficulty, instructions, image_url) VALUES
('Bench Press', 'Classic barbell chest exercise for building strength and mass', 'strength', 'strength', 'Chest', 'Barbell', 'intermediate', 'Lie on bench, grip bar slightly wider than shoulders. Lower to chest, press up explosively. Keep feet flat and back slightly arched.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'),
('Incline Bench Press', 'Upper chest focused pressing movement', 'strength', 'strength', 'Chest', 'Barbell', 'intermediate', 'Set bench to 30-45 degrees. Press bar from upper chest to lockout. Focus on upper chest contraction.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'),
('Decline Bench Press', 'Lower chest focused pressing movement', 'strength', 'strength', 'Chest', 'Barbell', 'intermediate', 'Set bench to decline position. Lower bar to lower chest, press up. Great for lower pec development.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'),
('Dumbbell Bench Press', 'Chest press with dumbbells for greater range of motion', 'strength', 'strength', 'Chest', 'Dumbbells', 'beginner', 'Lie on bench with dumbbells at chest level. Press up and slightly inward. Lower with control.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Dumbbell Flyes', 'Isolation exercise for chest stretch and contraction', 'strength', 'strength', 'Chest', 'Dumbbells', 'intermediate', 'Lie on bench, extend arms above chest with slight bend. Lower arms in arc motion, feel stretch, return.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Push-ups', 'Classic bodyweight chest exercise', 'bodyweight', 'strength', 'Chest', 'None', 'beginner', 'Start in plank position. Lower chest to ground keeping body straight. Push back up. Keep core tight.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Diamond Push-ups', 'Tricep and inner chest focused push-up variation', 'bodyweight', 'strength', 'Chest', 'None', 'intermediate', 'Form diamond shape with hands under chest. Perform push-up keeping elbows close to body.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Wide Push-ups', 'Outer chest focused push-up variation', 'bodyweight', 'strength', 'Chest', 'None', 'beginner', 'Place hands wider than shoulder width. Perform push-up focusing on chest stretch at bottom.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Cable Crossover', 'Isolation cable exercise for chest', 'machine', 'strength', 'Chest', 'Cable Machine', 'intermediate', 'Stand between cables set high. Pull handles down and together in arc motion. Squeeze chest at bottom.', 'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400'),
('Machine Chest Press', 'Guided chest press for beginners', 'machine', 'strength', 'Chest', 'Chest Press Machine', 'beginner', 'Sit with back against pad. Press handles forward until arms extended. Control the return.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400'),
('Pec Deck Fly', 'Machine fly for chest isolation', 'machine', 'strength', 'Chest', 'Pec Deck Machine', 'beginner', 'Sit with arms against pads. Bring arms together in front of chest. Control the return.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400'),

-- =========================
-- BACK EXERCISES
-- =========================
('Deadlift', 'Compound exercise for total posterior chain development', 'strength', 'strength', 'Back', 'Barbell', 'advanced', 'Stand with feet hip-width, grip bar outside legs. Drive through heels, extend hips and knees together. Keep back flat throughout.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('Barbell Row', 'Horizontal pulling movement for back thickness', 'strength', 'strength', 'Back', 'Barbell', 'intermediate', 'Hinge forward at hips, grip bar shoulder width. Pull bar to lower chest, squeeze shoulder blades. Lower with control.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('Dumbbell Row', 'Single arm rowing for back development', 'strength', 'strength', 'Back', 'Dumbbells', 'beginner', 'Place one hand and knee on bench. Pull dumbbell to hip, squeezing back. Lower with control.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Pull-ups', 'Bodyweight vertical pulling for lats', 'bodyweight', 'strength', 'Back', 'Pull-up Bar', 'intermediate', 'Hang from bar with overhand grip. Pull chest to bar, squeezing lats. Lower with control.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Chin-ups', 'Underhand pull-up for lats and biceps', 'bodyweight', 'strength', 'Back', 'Pull-up Bar', 'intermediate', 'Hang from bar with underhand grip. Pull chest to bar. Great for bicep involvement.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Lat Pulldown', 'Machine exercise mimicking pull-up motion', 'machine', 'strength', 'Back', 'Lat Pulldown Machine', 'beginner', 'Sit with thighs under pads. Pull bar to upper chest, squeeze lats. Control the return.', 'https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=400'),
('Seated Cable Row', 'Horizontal cable rowing for back thickness', 'machine', 'strength', 'Back', 'Cable Machine', 'beginner', 'Sit upright, feet on platform. Pull handle to stomach, squeezing shoulder blades. Return with control.', 'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400'),
('T-Bar Row', 'Rowing variation for back thickness', 'strength', 'strength', 'Back', 'Barbell', 'intermediate', 'Straddle bar, hinge forward. Pull bar to chest, squeeze back. Lower with control.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('Face Pulls', 'Rear delt and upper back exercise', 'machine', 'strength', 'Back', 'Cable Machine', 'beginner', 'Set cable high, use rope attachment. Pull to face, externally rotating shoulders. Great for posture.', 'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400'),
('Inverted Rows', 'Bodyweight horizontal rowing', 'bodyweight', 'strength', 'Back', 'Pull-up Bar', 'beginner', 'Hang under bar with body straight. Pull chest to bar, squeeze back. Lower with control.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),

-- =========================
-- SHOULDER EXERCISES
-- =========================
('Overhead Press', 'Standing barbell press for shoulder strength', 'strength', 'strength', 'Shoulders', 'Barbell', 'intermediate', 'Stand with bar at shoulders. Press overhead until arms locked. Keep core tight, avoid arching back.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('Dumbbell Shoulder Press', 'Seated or standing dumbbell pressing', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Sit or stand with dumbbells at shoulders. Press overhead, lower with control.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Lateral Raises', 'Isolation exercise for side deltoids', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Stand with dumbbells at sides. Raise arms to sides until parallel to ground. Lower with control.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Front Raises', 'Isolation exercise for front deltoids', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Stand with dumbbells at thighs. Raise arms forward until parallel to ground. Lower with control.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Rear Delt Flyes', 'Isolation exercise for rear deltoids', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'beginner', 'Bend forward at hips. Raise arms to sides, squeezing rear delts. Lower with control.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Arnold Press', 'Rotating dumbbell press for complete delt development', 'strength', 'strength', 'Shoulders', 'Dumbbells', 'intermediate', 'Start with dumbbells in front of shoulders, palms facing you. Rotate and press overhead.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Machine Shoulder Press', 'Guided pressing for shoulders', 'machine', 'strength', 'Shoulders', 'Shoulder Press Machine', 'beginner', 'Sit with back against pad. Press handles overhead. Lower with control.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400'),
('Pike Push-ups', 'Bodyweight shoulder pressing movement', 'bodyweight', 'strength', 'Shoulders', 'None', 'intermediate', 'Start in pike position with hips high. Lower head toward ground, push back up.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Handstand Push-ups', 'Advanced bodyweight shoulder press', 'bodyweight', 'strength', 'Shoulders', 'None', 'advanced', 'Kick up to handstand against wall. Lower head to ground, push back up.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Upright Row', 'Compound shoulder and trap exercise', 'strength', 'strength', 'Shoulders', 'Barbell', 'intermediate', 'Stand with barbell in front. Pull up along body to chin level, elbows high. Lower with control.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),

-- =========================
-- ARM EXERCISES
-- =========================
('Barbell Curl', 'Classic bicep building exercise', 'strength', 'strength', 'Biceps', 'Barbell', 'beginner', 'Stand with barbell at thighs. Curl weight to shoulders, keeping elbows fixed. Lower with control.', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400'),
('Dumbbell Curl', 'Bicep curl with dumbbells', 'strength', 'strength', 'Biceps', 'Dumbbells', 'beginner', 'Stand with dumbbells at sides. Curl to shoulders, supinating wrists. Lower with control.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Hammer Curl', 'Bicep curl targeting brachialis', 'strength', 'strength', 'Biceps', 'Dumbbells', 'beginner', 'Stand with dumbbells at sides, palms facing in. Curl keeping neutral grip throughout.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Preacher Curl', 'Isolated bicep curl on preacher bench', 'strength', 'strength', 'Biceps', 'EZ Curl Bar', 'intermediate', 'Rest arms on preacher bench. Curl weight up, focusing on bicep contraction.', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400'),
('Cable Curl', 'Constant tension bicep curl', 'machine', 'strength', 'Biceps', 'Cable Machine', 'beginner', 'Stand facing cable machine. Curl handle to shoulders, squeeze biceps.', 'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400'),
('Tricep Pushdown', 'Cable exercise for tricep development', 'machine', 'strength', 'Triceps', 'Cable Machine', 'beginner', 'Stand at cable machine with bar or rope. Push down until arms straight. Control the return.', 'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400'),
('Skull Crushers', 'Lying tricep extension', 'strength', 'strength', 'Triceps', 'EZ Curl Bar', 'intermediate', 'Lie on bench, hold bar above chest. Lower to forehead by bending elbows. Extend back up.', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400'),
('Overhead Tricep Extension', 'Tricep extension above head', 'strength', 'strength', 'Triceps', 'Dumbbells', 'beginner', 'Hold dumbbell overhead with both hands. Lower behind head, extend back up.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Tricep Dips', 'Bodyweight tricep exercise', 'bodyweight', 'strength', 'Triceps', 'Dip Station', 'intermediate', 'Support yourself on parallel bars. Lower body by bending elbows. Push back up.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Close-grip Bench Press', 'Compound tricep pressing movement', 'strength', 'strength', 'Triceps', 'Barbell', 'intermediate', 'Lie on bench, grip bar with hands shoulder-width or closer. Press focusing on triceps.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'),

-- =========================
-- LEG EXERCISES
-- =========================
('Barbell Squat', 'King of leg exercises for overall development', 'strength', 'strength', 'Legs', 'Barbell', 'intermediate', 'Bar on upper back, feet shoulder-width. Squat down keeping chest up. Drive through heels to stand.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('Front Squat', 'Quad-dominant squat variation', 'strength', 'strength', 'Legs', 'Barbell', 'advanced', 'Bar on front delts, elbows high. Squat keeping torso upright. Great for quad development.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('Goblet Squat', 'Beginner-friendly squat with dumbbell', 'strength', 'strength', 'Legs', 'Dumbbells', 'beginner', 'Hold dumbbell at chest. Squat down between legs, keeping torso upright.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Leg Press', 'Machine compound leg exercise', 'machine', 'strength', 'Legs', 'Leg Press Machine', 'beginner', 'Sit in machine, feet shoulder-width on platform. Lower weight by bending knees. Press back up.', 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400'),
('Leg Extension', 'Quadricep isolation exercise', 'machine', 'strength', 'Legs', 'Leg Extension Machine', 'beginner', 'Sit in machine, pad on ankles. Extend legs until straight. Lower with control.', 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400'),
('Leg Curl', 'Hamstring isolation exercise', 'machine', 'strength', 'Legs', 'Leg Curl Machine', 'beginner', 'Lie face down or sit in machine. Curl legs toward glutes. Lower with control.', 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400'),
('Romanian Deadlift', 'Hamstring and glute focused hip hinge', 'strength', 'strength', 'Legs', 'Barbell', 'intermediate', 'Stand with bar at thighs. Hinge at hips, lowering bar along legs. Drive hips forward to return.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),
('Lunges', 'Unilateral leg exercise', 'strength', 'strength', 'Legs', 'Dumbbells', 'beginner', 'Step forward into lunge, both knees at 90 degrees. Push back to start. Alternate legs.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Bulgarian Split Squat', 'Single leg squat with rear foot elevated', 'strength', 'strength', 'Legs', 'Dumbbells', 'intermediate', 'Rear foot on bench, front foot forward. Squat on front leg. Great for leg development.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Calf Raises', 'Calf development exercise', 'strength', 'strength', 'Calves', 'Dumbbells', 'beginner', 'Stand on edge of step. Rise up on toes, squeeze calves. Lower heels below platform.', 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400'),
('Bodyweight Squats', 'Basic squat without weights', 'bodyweight', 'strength', 'Legs', 'None', 'beginner', 'Stand with feet shoulder-width. Squat down keeping chest up. Stand back up.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Jump Squats', 'Explosive plyometric squat', 'bodyweight', 'strength', 'Legs', 'None', 'intermediate', 'Squat down, then explosively jump up. Land softly and repeat.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Wall Sit', 'Isometric leg endurance exercise', 'bodyweight', 'timed', 'Legs', 'None', 'beginner', 'Lean against wall with thighs parallel to ground. Hold position for time.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Step-ups', 'Unilateral leg exercise using box', 'bodyweight', 'strength', 'Legs', 'Plyo Box', 'beginner', 'Step up onto box with one leg. Step down and repeat. Alternate legs.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400'),
('Hip Thrusts', 'Glute focused hip extension', 'strength', 'strength', 'Glutes', 'Barbell', 'intermediate', 'Back against bench, bar across hips. Drive hips up, squeezing glutes. Lower with control.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'),

-- =========================
-- CORE EXERCISES
-- =========================
('Plank', 'Isometric core stability exercise', 'bodyweight', 'timed', 'Core', 'None', 'beginner', 'Hold push-up position on forearms. Keep body straight from head to heels. Hold for time.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Crunches', 'Basic abdominal exercise', 'bodyweight', 'strength', 'Core', 'None', 'beginner', 'Lie on back, knees bent. Curl shoulders off ground, squeezing abs. Lower with control.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Russian Twists', 'Rotational core exercise', 'bodyweight', 'strength', 'Core', 'None', 'intermediate', 'Sit with knees bent, lean back slightly. Rotate torso side to side, touching ground.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Leg Raises', 'Lower ab focused exercise', 'bodyweight', 'strength', 'Core', 'None', 'intermediate', 'Lie on back, legs straight. Raise legs to vertical, lower with control. Keep lower back pressed down.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Mountain Climbers', 'Dynamic core and cardio exercise', 'bodyweight', 'cardio', 'Core', 'None', 'beginner', 'Start in push-up position. Drive knees toward chest alternately in running motion.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Dead Bug', 'Core stability exercise', 'bodyweight', 'strength', 'Core', 'None', 'beginner', 'Lie on back, arms up, knees bent 90 degrees. Lower opposite arm and leg, return. Alternate.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Bird Dog', 'Core and balance exercise', 'bodyweight', 'strength', 'Core', 'None', 'beginner', 'On hands and knees. Extend opposite arm and leg, hold briefly. Return and alternate.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Ab Wheel Rollout', 'Advanced core exercise', 'strength', 'strength', 'Core', 'Ab Wheel', 'advanced', 'Kneel holding ab wheel. Roll forward extending body. Roll back to start using core.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Cable Woodchop', 'Rotational core exercise with cable', 'machine', 'strength', 'Core', 'Cable Machine', 'intermediate', 'Stand sideways to cable. Pull handle diagonally across body with rotation.', 'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400'),
('Hanging Leg Raises', 'Advanced core exercise', 'bodyweight', 'strength', 'Core', 'Pull-up Bar', 'advanced', 'Hang from bar. Raise legs to horizontal or higher. Lower with control.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),

-- =========================
-- CARDIO EXERCISES
-- =========================
('Running', 'Outdoor or treadmill running', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Start with warm-up walk, gradually increase pace. Maintain good posture with shoulders relaxed.', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400'),
('Cycling', 'Indoor or outdoor cycling', 'cardio', 'cardio', 'Legs', 'Stationary Bike', 'beginner', 'Adjust seat height so leg is slightly bent at bottom. Maintain steady cadence.', 'https://images.unsplash.com/photo-1591741535018-d8c13f08f5ed?w=400'),
('Swimming', 'Full body cardio in water', 'cardio', 'cardio', 'Full Body', 'None', 'intermediate', 'Choose your stroke. Focus on breathing rhythm and smooth movements.', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400'),
('Rowing', 'Indoor rowing for full body cardio', 'cardio', 'cardio', 'Full Body', 'Rowing Machine', 'intermediate', 'Drive with legs first, lean back, pull to chest. Return in reverse order.', 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=400'),
('Jump Rope', 'High-intensity cardio', 'cardio', 'cardio', 'Full Body', 'Jump Rope', 'beginner', 'Keep elbows close to body. Land softly on balls of feet.', 'https://images.unsplash.com/photo-1601422407692-ec73cc4b7e43?w=400'),
('Elliptical', 'Low-impact cardio machine', 'cardio', 'cardio', 'Full Body', 'Elliptical', 'beginner', 'Stand tall, grip handles lightly. Push and pull with arms while moving legs.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'),
('Stair Climbing', 'Stair climbing for cardio', 'cardio', 'cardio', 'Legs', 'Stair Climber', 'intermediate', 'Stand upright, avoid leaning on handles. Step at steady pace.', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400'),
('Walking', 'Brisk walking for low-impact cardio', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Maintain brisk pace, swing arms naturally. Keep good posture.', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400'),
('Burpees', 'Full body cardio exercise', 'cardio', 'cardio', 'Full Body', 'None', 'intermediate', 'From standing, drop to push-up, perform push-up, jump feet to hands, jump up with arms overhead.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Jumping Jacks', 'Classic cardio warm-up exercise', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Jump feet out while raising arms overhead. Jump back to start. Repeat rhythmically.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('High Knees', 'Running in place with high knees', 'cardio', 'cardio', 'Full Body', 'None', 'beginner', 'Run in place, driving knees high toward chest. Pump arms naturally.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400'),
('Box Jumps', 'Explosive plyometric exercise', 'cardio', 'cardio', 'Legs', 'Plyo Box', 'intermediate', 'Stand facing box. Jump onto box, landing softly. Step or jump down. Repeat.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400'),
('Battle Rope Waves', 'High intensity conditioning', 'cardio', 'cardio', 'Full Body', 'Battle Ropes', 'intermediate', 'Hold rope ends, create alternating waves with arms. Maintain athletic stance.', 'https://images.unsplash.com/photo-1544216717-3bbf52512659?w=400'),
('Kettlebell Swings', 'Hip hinge cardio exercise', 'cardio', 'cardio', 'Full Body', 'Kettlebell', 'intermediate', 'Hinge at hips, swing kettlebell between legs. Drive hips forward to swing up to shoulder height.', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400'),

-- =========================
-- FLEXIBILITY EXERCISES
-- =========================
('Standing Hamstring Stretch', 'Basic hamstring flexibility', 'flexibility', 'flexibility', 'Legs', 'None', 'beginner', 'Stand and reach toward toes. Keep legs straight. Hold stretch for 30 seconds.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Quad Stretch', 'Standing quadricep stretch', 'flexibility', 'flexibility', 'Legs', 'None', 'beginner', 'Stand on one leg, pull other foot to glute. Keep knees together. Hold 30 seconds each side.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Hip Flexor Stretch', 'Kneeling hip flexor stretch', 'flexibility', 'flexibility', 'Hips', 'None', 'beginner', 'Kneel on one knee, other foot forward. Push hips forward until stretch felt. Hold 30 seconds.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Pigeon Pose', 'Deep hip opener stretch', 'flexibility', 'flexibility', 'Hips', 'None', 'intermediate', 'From all fours, bring one knee forward, extend other leg back. Lower hips toward ground.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Cat-Cow Stretch', 'Spinal mobility exercise', 'flexibility', 'flexibility', 'Back', 'None', 'beginner', 'On hands and knees, alternate between arching and rounding back. Move slowly with breath.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Childs Pose', 'Restful stretch for back and hips', 'flexibility', 'flexibility', 'Back', 'None', 'beginner', 'Kneel and sit back on heels. Extend arms forward, lower chest toward ground.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Cobra Stretch', 'Back extension stretch', 'flexibility', 'flexibility', 'Back', 'None', 'beginner', 'Lie face down, hands under shoulders. Press up, extending back. Keep hips on ground.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Shoulder Stretch', 'Cross-body shoulder stretch', 'flexibility', 'flexibility', 'Shoulders', 'None', 'beginner', 'Bring one arm across chest. Use other arm to pull elbow closer. Hold 30 seconds each side.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Tricep Stretch', 'Overhead tricep stretch', 'flexibility', 'flexibility', 'Arms', 'None', 'beginner', 'Raise one arm overhead, bend elbow. Use other hand to push elbow back. Hold 30 seconds.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Chest Stretch', 'Doorway or wall chest stretch', 'flexibility', 'flexibility', 'Chest', 'None', 'beginner', 'Place forearm on wall or doorway. Turn body away until stretch felt in chest. Hold 30 seconds.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Neck Rolls', 'Gentle neck mobility', 'flexibility', 'flexibility', 'Neck', 'None', 'beginner', 'Slowly roll head in circle, stretching all sides of neck. Reverse direction.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Seated Forward Fold', 'Hamstring and back stretch', 'flexibility', 'flexibility', 'Back', 'None', 'beginner', 'Sit with legs extended. Reach toward toes, keeping back as straight as possible.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Butterfly Stretch', 'Inner thigh and hip stretch', 'flexibility', 'flexibility', 'Hips', 'None', 'beginner', 'Sit with soles of feet together. Let knees fall outward. Gently press knees toward ground.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('World Greatest Stretch', 'Dynamic full body stretch', 'flexibility', 'flexibility', 'Full Body', 'None', 'intermediate', 'Lunge forward, rotate torso toward front leg, extend arm to sky. Alternate sides.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
('Downward Dog', 'Yoga pose for full body stretch', 'flexibility', 'flexibility', 'Full Body', 'None', 'beginner', 'Form inverted V with body. Press heels toward ground, push hips up and back.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400');
