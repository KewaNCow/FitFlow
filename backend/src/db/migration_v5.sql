-- Migration V5: Equipment Library & Exercise Images
-- This migration is IDEMPOTENT - safe to run multiple times

-- =====================================================
-- STEP 1: Create equipment table (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('free_weights', 'machines', 'cardio', 'bodyweight', 'bands_cables', 'accessories', 'other') DEFAULT 'other',
    image_url VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- STEP 2: Create exercise_images table (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS exercise_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exercise_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- =====================================================
-- STEP 3: Add equipment_id to exercises (if not exists)
-- =====================================================
-- Check if column exists before adding
SET @dbname = DATABASE();
SET @tablename = 'exercises';
SET @columnname = 'equipment_id';
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
    'SELECT 1',
    'ALTER TABLE exercises ADD COLUMN equipment_id INT NULL, ADD FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE SET NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================================================
-- STEP 4: Seed default equipment (only if table is empty)
-- =====================================================
INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Barbell' as name, 
    'Standard Olympic barbell, typically 20kg/45lbs' as description, 
    'free_weights' as category, 
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Barbell' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Dumbbells' as name, 
    'Pair of adjustable or fixed weight dumbbells' as description, 
    'free_weights' as category, 
    'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Dumbbells' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Kettlebell' as name, 
    'Cast iron weight with handle for swings and lifts' as description, 
    'free_weights' as category, 
    'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Kettlebell' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Weight Plates' as name, 
    'Iron or rubber coated plates for barbells and machines' as description, 
    'free_weights' as category, 
    'https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Weight Plates' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'EZ Curl Bar' as name, 
    'Curved barbell for bicep and tricep exercises' as description, 
    'free_weights' as category, 
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'EZ Curl Bar' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Cable Machine' as name, 
    'Adjustable pulley system for various exercises' as description, 
    'machines' as category, 
    'https://images.unsplash.com/photo-1638805981949-362f5964521e?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Cable Machine' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Lat Pulldown Machine' as name, 
    'Machine for lat pulldown and back exercises' as description, 
    'machines' as category, 
    'https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Lat Pulldown Machine' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Leg Press Machine' as name, 
    'Machine for leg press and lower body training' as description, 
    'machines' as category, 
    'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Leg Press Machine' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Smith Machine' as name, 
    'Guided barbell system for controlled lifts' as description, 
    'machines' as category, 
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Smith Machine' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Chest Press Machine' as name, 
    'Machine for chest press movements' as description, 
    'machines' as category, 
    'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Chest Press Machine' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Rowing Machine' as name, 
    'Cardio machine simulating rowing motion' as description, 
    'machines' as category, 
    'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Rowing Machine' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Treadmill' as name, 
    'Motorized running/walking belt machine' as description, 
    'cardio' as category, 
    'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Treadmill' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Stationary Bike' as name, 
    'Indoor cycling machine for cardio' as description, 
    'cardio' as category, 
    'https://images.unsplash.com/photo-1591741535018-d8c13f08f5ed?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Stationary Bike' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Elliptical' as name, 
    'Low-impact cardio machine with elliptical motion' as description, 
    'cardio' as category, 
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Elliptical' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Stair Climber' as name, 
    'Machine simulating stair climbing' as description, 
    'cardio' as category, 
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Stair Climber' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Jump Rope' as name, 
    'Speed rope for cardio and conditioning' as description, 
    'cardio' as category, 
    'https://images.unsplash.com/photo-1601422407692-ec73cc4b7e43?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Jump Rope' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Pull-up Bar' as name, 
    'Fixed or doorway bar for pull-ups and hanging exercises' as description, 
    'bodyweight' as category, 
    'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Pull-up Bar' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Dip Station' as name, 
    'Parallel bars for dips and leg raises' as description, 
    'bodyweight' as category, 
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Dip Station' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Gymnastic Rings' as name, 
    'Adjustable rings for advanced bodyweight training' as description, 
    'bodyweight' as category, 
    'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Gymnastic Rings' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Plyo Box' as name, 
    'Sturdy box for box jumps and step-ups' as description, 
    'bodyweight' as category, 
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Plyo Box' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Resistance Bands' as name, 
    'Elastic bands of various resistances' as description, 
    'bands_cables' as category, 
    'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Resistance Bands' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'TRX Suspension Trainer' as name, 
    'Suspension straps for bodyweight exercises' as description, 
    'bands_cables' as category, 
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'TRX Suspension Trainer' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Battle Ropes' as name, 
    'Heavy ropes for conditioning and cardio' as description, 
    'bands_cables' as category, 
    'https://images.unsplash.com/photo-1544216717-3bbf52512659?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Battle Ropes' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Ab Wheel' as name, 
    'Wheel with handles for ab rollouts' as description, 
    'accessories' as category, 
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Ab Wheel' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Foam Roller' as name, 
    'Cylindrical foam for self-massage and mobility' as description, 
    'accessories' as category, 
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Foam Roller' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Yoga Mat' as name, 
    'Cushioned mat for floor exercises and stretching' as description, 
    'accessories' as category, 
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Yoga Mat' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Weight Belt' as name, 
    'Belt for adding weight to bodyweight exercises' as description, 
    'accessories' as category, 
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Weight Belt' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Medicine Ball' as name, 
    'Weighted ball for functional training' as description, 
    'accessories' as category, 
    'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Medicine Ball' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Stability Ball' as name, 
    'Large inflatable ball for core and balance work' as description, 
    'accessories' as category, 
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Stability Ball' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Bench (Flat)' as name, 
    'Flat weight bench for pressing and rows' as description, 
    'accessories' as category, 
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Bench (Flat)' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Bench (Adjustable)' as name, 
    'Adjustable incline/decline bench' as description, 
    'accessories' as category, 
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Bench (Adjustable)' AND is_public = TRUE) LIMIT 1;

INSERT INTO equipment (name, description, category, image_url, is_public)
SELECT * FROM (SELECT 
    'Power Rack' as name, 
    'Squat rack with safety bars for barbell exercises' as description, 
    'accessories' as category, 
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' as image_url, 
    TRUE as is_public
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Power Rack' AND is_public = TRUE) LIMIT 1;

-- =====================================================
-- STEP 5: Add index for better query performance
-- =====================================================
-- Only create if not exists
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exercise_images' AND INDEX_NAME = 'idx_exercise_images_exercise_id') > 0,
    'SELECT 1',
    'CREATE INDEX idx_exercise_images_exercise_id ON exercise_images(exercise_id)'
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'equipment' AND INDEX_NAME = 'idx_equipment_category') > 0,
    'SELECT 1',
    'CREATE INDEX idx_equipment_category ON equipment(category)'
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'equipment' AND INDEX_NAME = 'idx_equipment_user_id') > 0,
    'SELECT 1',
    'CREATE INDEX idx_equipment_user_id ON equipment(user_id)'
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- =====================================================
-- Migration V5 Complete!
-- This migration added:
-- 1. equipment table for equipment library
-- 2. exercise_images table for multiple images per exercise
-- 3. equipment_id column to exercises table
-- 4. 32 default equipment items with images
-- =====================================================
