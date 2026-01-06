require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const exercises = [
  // Strength - Chest
  { name: 'Bench Press', description: 'Classic chest exercise using a barbell on a flat bench', category: 'strength', muscle_group: 'Chest', equipment: 'Barbell', difficulty: 'intermediate', instructions: '1. Lie on bench with feet flat on floor\n2. Grip bar slightly wider than shoulder width\n3. Lower bar to chest with control\n4. Press bar up to starting position', image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' },
  { name: 'Incline Dumbbell Press', description: 'Upper chest focused pressing movement', category: 'strength', muscle_group: 'Chest', equipment: 'Dumbbells', difficulty: 'intermediate', instructions: '1. Set bench to 30-45 degree angle\n2. Hold dumbbells at shoulder level\n3. Press up and together\n4. Lower with control', image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400' },
  { name: 'Cable Flyes', description: 'Isolation exercise for chest using cables', category: 'strength', muscle_group: 'Chest', equipment: 'Cable Machine', difficulty: 'beginner', instructions: '1. Set cables to shoulder height\n2. Step forward with slight lean\n3. Bring handles together in arc motion\n4. Control the return', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
  { name: 'Dumbbell Flyes', description: 'Chest isolation with dumbbells on a flat bench', category: 'strength', muscle_group: 'Chest', equipment: 'Dumbbells', difficulty: 'intermediate', instructions: '1. Lie on flat bench with dumbbells\n2. Arms extended above chest, slight bend in elbows\n3. Lower arms out to sides in arc\n4. Return to starting position', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400' },
  
  // Strength - Back
  { name: 'Deadlift', description: 'Compound movement for overall back and leg strength', category: 'strength', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'advanced', instructions: '1. Stand with feet hip-width apart\n2. Grip bar just outside legs\n3. Keep back straight, drive through heels\n4. Stand tall, then lower with control', image_url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400' },
  { name: 'Barbell Rows', description: 'Bent over rowing for back thickness', category: 'strength', muscle_group: 'Back', equipment: 'Barbell', difficulty: 'intermediate', instructions: '1. Bend at hips, back parallel to floor\n2. Grip bar shoulder width\n3. Pull bar to lower chest\n4. Lower with control', image_url: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400' },
  { name: 'Lat Pulldown', description: 'Machine exercise targeting latissimus dorsi', category: 'machine', muscle_group: 'Back', equipment: 'Cable Machine', difficulty: 'beginner', instructions: '1. Sit with thighs secured under pad\n2. Grip bar wider than shoulders\n3. Pull bar to upper chest\n4. Control the return', image_url: 'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=400' },
  { name: 'Seated Cable Row', description: 'Horizontal pulling for mid-back', category: 'machine', muscle_group: 'Back', equipment: 'Cable Machine', difficulty: 'beginner', instructions: '1. Sit with feet on platform\n2. Grip handle with arms extended\n3. Pull to lower chest, squeeze shoulder blades\n4. Return with control', image_url: 'https://images.unsplash.com/photo-1534368270820-9de3d8053204?w=400' },
  { name: 'Pull-ups', description: 'Bodyweight back exercise using a bar', category: 'bodyweight', muscle_group: 'Back', equipment: 'Pull-up Bar', difficulty: 'advanced', instructions: '1. Hang from bar with overhand grip\n2. Pull body up until chin over bar\n3. Lower with control\n4. Repeat', image_url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400' },
  
  // Strength - Shoulders
  { name: 'Overhead Press', description: 'Standing barbell press for shoulder development', category: 'strength', muscle_group: 'Shoulders', equipment: 'Barbell', difficulty: 'intermediate', instructions: '1. Stand with bar at shoulder height\n2. Grip slightly wider than shoulders\n3. Press bar overhead\n4. Lower with control', image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400' },
  { name: 'Lateral Raises', description: 'Isolation for side deltoids', category: 'strength', muscle_group: 'Shoulders', equipment: 'Dumbbells', difficulty: 'beginner', instructions: '1. Stand with dumbbells at sides\n2. Raise arms out to sides\n3. Lift to shoulder height\n4. Lower with control', image_url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400' },
  { name: 'Face Pulls', description: 'Rear delt and rotator cuff exercise', category: 'strength', muscle_group: 'Shoulders', equipment: 'Cable Machine', difficulty: 'beginner', instructions: '1. Set cable to face height\n2. Pull rope to face, elbows high\n3. Squeeze rear delts\n4. Return with control', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
  { name: 'Arnold Press', description: 'Rotating dumbbell press for full shoulder development', category: 'strength', muscle_group: 'Shoulders', equipment: 'Dumbbells', difficulty: 'intermediate', instructions: '1. Start with dumbbells at chest, palms facing you\n2. Press up while rotating palms outward\n3. Finish with palms facing forward\n4. Reverse on the way down', image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400' },
  
  // Strength - Arms
  { name: 'Barbell Curl', description: 'Classic bicep building exercise', category: 'strength', muscle_group: 'Biceps', equipment: 'Barbell', difficulty: 'beginner', instructions: '1. Stand with bar at thighs\n2. Curl bar up to shoulders\n3. Keep elbows at sides\n4. Lower with control', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400' },
  { name: 'Hammer Curls', description: 'Neutral grip curl for biceps and forearms', category: 'strength', muscle_group: 'Biceps', equipment: 'Dumbbells', difficulty: 'beginner', instructions: '1. Hold dumbbells with neutral grip\n2. Curl up keeping palms facing in\n3. Squeeze at top\n4. Lower with control', image_url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400' },
  { name: 'Tricep Pushdowns', description: 'Cable exercise for tricep development', category: 'strength', muscle_group: 'Triceps', equipment: 'Cable Machine', difficulty: 'beginner', instructions: '1. Stand at cable with bar attachment\n2. Push bar down, elbows at sides\n3. Squeeze triceps at bottom\n4. Return with control', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
  { name: 'Skull Crushers', description: 'Lying tricep extension for mass building', category: 'strength', muscle_group: 'Triceps', equipment: 'EZ Bar', difficulty: 'intermediate', instructions: '1. Lie on bench with bar above chest\n2. Lower bar to forehead\n3. Keep upper arms stationary\n4. Press back up', image_url: 'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=400' },
  { name: 'Dips', description: 'Compound bodyweight exercise for triceps and chest', category: 'bodyweight', muscle_group: 'Triceps', equipment: 'Dip Bars', difficulty: 'intermediate', instructions: '1. Support yourself on parallel bars\n2. Lower body by bending elbows\n3. Keep torso upright for triceps focus\n4. Push back up', image_url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400' },
  
  // Strength - Legs
  { name: 'Barbell Squat', description: 'King of leg exercises for overall development', category: 'strength', muscle_group: 'Legs', equipment: 'Barbell', difficulty: 'intermediate', instructions: '1. Bar on upper back, feet shoulder width\n2. Sit back and down\n3. Go to parallel or below\n4. Drive up through heels', image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400' },
  { name: 'Romanian Deadlift', description: 'Hip hinge for hamstring and glute development', category: 'strength', muscle_group: 'Hamstrings', equipment: 'Barbell', difficulty: 'intermediate', instructions: '1. Hold bar at thighs\n2. Push hips back, slight knee bend\n3. Lower bar along legs\n4. Drive hips forward to stand', image_url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400' },
  { name: 'Leg Press', description: 'Machine exercise for quad development', category: 'machine', muscle_group: 'Legs', equipment: 'Leg Press Machine', difficulty: 'beginner', instructions: '1. Sit in machine with feet on platform\n2. Lower weight by bending knees\n3. Press back up\n4. Don\'t lock knees at top', image_url: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400' },
  { name: 'Leg Curls', description: 'Isolation exercise for hamstrings', category: 'machine', muscle_group: 'Hamstrings', equipment: 'Leg Curl Machine', difficulty: 'beginner', instructions: '1. Lie face down on machine\n2. Curl heels toward glutes\n3. Squeeze at top\n4. Lower with control', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
  { name: 'Leg Extensions', description: 'Isolation for quadriceps', category: 'machine', muscle_group: 'Quadriceps', equipment: 'Leg Extension Machine', difficulty: 'beginner', instructions: '1. Sit in machine with ankles under pad\n2. Extend legs fully\n3. Squeeze quads at top\n4. Lower with control', image_url: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400' },
  { name: 'Calf Raises', description: 'Standing exercise for calf development', category: 'strength', muscle_group: 'Calves', equipment: 'Smith Machine', difficulty: 'beginner', instructions: '1. Stand on edge of platform\n2. Rise up onto toes\n3. Squeeze at top\n4. Lower heels below platform', image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400' },
  { name: 'Lunges', description: 'Unilateral leg exercise for balance and strength', category: 'strength', muscle_group: 'Legs', equipment: 'Dumbbells', difficulty: 'beginner', instructions: '1. Stand with dumbbells at sides\n2. Step forward into lunge\n3. Lower back knee toward floor\n4. Push back to start', image_url: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400' },
  
  // Strength - Core
  { name: 'Cable Crunches', description: 'Weighted core exercise using cables', category: 'strength', muscle_group: 'Core', equipment: 'Cable Machine', difficulty: 'beginner', instructions: '1. Kneel at cable with rope\n2. Hold rope at head\n3. Crunch down, curling torso\n4. Return with control', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
  { name: 'Hanging Leg Raises', description: 'Advanced core exercise from hanging position', category: 'bodyweight', muscle_group: 'Core', equipment: 'Pull-up Bar', difficulty: 'advanced', instructions: '1. Hang from bar\n2. Raise legs to parallel\n3. Control the movement\n4. Lower slowly', image_url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400' },
  
  // Bodyweight exercises
  { name: 'Push-ups', description: 'Classic bodyweight chest and tricep exercise', category: 'bodyweight', muscle_group: 'Chest', equipment: 'None', difficulty: 'beginner', instructions: '1. Start in plank position\n2. Lower chest to floor\n3. Keep body straight\n4. Push back up', image_url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400' },
  { name: 'Plank', description: 'Isometric core strengthening exercise', category: 'bodyweight', muscle_group: 'Core', equipment: 'None', difficulty: 'beginner', instructions: '1. Support body on forearms and toes\n2. Keep body in straight line\n3. Engage core\n4. Hold position', image_url: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400' },
  { name: 'Mountain Climbers', description: 'Dynamic core and cardio exercise', category: 'bodyweight', muscle_group: 'Core', equipment: 'None', difficulty: 'beginner', instructions: '1. Start in push-up position\n2. Drive one knee to chest\n3. Quickly switch legs\n4. Continue alternating', image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' },
  { name: 'Burpees', description: 'Full body conditioning exercise', category: 'bodyweight', muscle_group: 'Full Body', equipment: 'None', difficulty: 'intermediate', instructions: '1. Stand, then squat down\n2. Jump feet back to plank\n3. Do a push-up\n4. Jump feet forward and jump up', image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' },
  { name: 'Bodyweight Squats', description: 'Fundamental lower body exercise', category: 'bodyweight', muscle_group: 'Legs', equipment: 'None', difficulty: 'beginner', instructions: '1. Stand with feet shoulder width\n2. Sit back and down\n3. Keep chest up\n4. Stand back up', image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400' },
  
  // Cardio
  { name: 'Treadmill Running', description: 'Indoor running for cardiovascular health', category: 'cardio', muscle_group: 'Full Body', equipment: 'Treadmill', difficulty: 'beginner', instructions: '1. Start at comfortable pace\n2. Maintain good posture\n3. Land midfoot\n4. Adjust speed as needed', image_url: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400' },
  { name: 'Cycling', description: 'Low impact cardiovascular exercise', category: 'cardio', muscle_group: 'Legs', equipment: 'Stationary Bike', difficulty: 'beginner', instructions: '1. Adjust seat height\n2. Start pedaling at steady pace\n3. Adjust resistance as needed\n4. Maintain rhythm', image_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400' },
  { name: 'Rowing', description: 'Full body cardio using rowing machine', category: 'cardio', muscle_group: 'Full Body', equipment: 'Rowing Machine', difficulty: 'intermediate', instructions: '1. Sit with feet strapped in\n2. Push with legs first\n3. Pull handle to chest\n4. Return in reverse order', image_url: 'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=400' },
  { name: 'Jumping Jacks', description: 'Classic cardio warm-up exercise', category: 'cardio', muscle_group: 'Full Body', equipment: 'None', difficulty: 'beginner', instructions: '1. Start standing with arms at sides\n2. Jump feet out, arms overhead\n3. Jump back to start\n4. Repeat rhythmically', image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' },
  { name: 'High Knees', description: 'Running in place with high knee lift', category: 'cardio', muscle_group: 'Legs', equipment: 'None', difficulty: 'beginner', instructions: '1. Run in place\n2. Drive knees up high\n3. Pump arms\n4. Keep core engaged', image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' },
  { name: 'Jump Rope', description: 'Coordination and cardio exercise', category: 'cardio', muscle_group: 'Full Body', equipment: 'Jump Rope', difficulty: 'intermediate', instructions: '1. Hold rope handles at hip level\n2. Jump as rope passes under feet\n3. Land softly on balls of feet\n4. Keep jumps small', image_url: 'https://images.unsplash.com/photo-1517649763962-0a6cb0167c73?w=400' },
  
  // Flexibility
  { name: 'Hamstring Stretch', description: 'Static stretch for hamstring flexibility', category: 'flexibility', muscle_group: 'Hamstrings', equipment: 'None', difficulty: 'beginner', instructions: '1. Sit with one leg extended\n2. Bend other leg in\n3. Reach toward toes\n4. Hold stretch', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' },
  { name: 'Hip Flexor Stretch', description: 'Stretch for tight hip flexors', category: 'flexibility', muscle_group: 'Hip Flexors', equipment: 'None', difficulty: 'beginner', instructions: '1. Kneel on one knee\n2. Front foot flat on floor\n3. Push hips forward\n4. Hold stretch', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' },
  { name: 'Shoulder Stretch', description: 'Cross-body stretch for shoulders', category: 'flexibility', muscle_group: 'Shoulders', equipment: 'None', difficulty: 'beginner', instructions: '1. Bring arm across chest\n2. Use other arm to pull closer\n3. Hold stretch\n4. Repeat other side', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' },
  { name: 'Chest Stretch', description: 'Doorway stretch for pectoral muscles', category: 'flexibility', muscle_group: 'Chest', equipment: 'None', difficulty: 'beginner', instructions: '1. Stand in doorway\n2. Place forearm on frame\n3. Step through doorway\n4. Feel stretch in chest', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' },
  { name: 'Cat-Cow Stretch', description: 'Spinal mobility exercise', category: 'flexibility', muscle_group: 'Back', equipment: 'None', difficulty: 'beginner', instructions: '1. Start on hands and knees\n2. Arch back up (cat)\n3. Drop belly down (cow)\n4. Alternate smoothly', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' }
];

async function seed() {
  let connection;
  
  try {
    // Create connection without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('🔌 Connected to MySQL server');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'fitflow'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'fitflow'}`);
    console.log('📁 Database created/selected');

    // Create tables
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          profile_image VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS exercises (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          category ENUM('strength', 'cardio', 'flexibility', 'bodyweight', 'machine') NOT NULL,
          muscle_group VARCHAR(100),
          equipment VARCHAR(100),
          difficulty ENUM('beginner', 'intermediate', 'advanced'),
          instructions TEXT,
          image_url VARCHAR(500),
          video_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workouts (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS workout_exercises (
          id INT PRIMARY KEY AUTO_INCREMENT,
          workout_id INT NOT NULL,
          exercise_id INT NOT NULL,
          order_index INT DEFAULT 0,
          sets INT DEFAULT 3,
          reps INT DEFAULT 10,
          weight DECIMAL(6,2),
          duration INT,
          rest_time INT DEFAULT 60,
          notes TEXT,
          FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS programs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          duration_weeks INT DEFAULT 4,
          difficulty ENUM('beginner', 'intermediate', 'advanced'),
          is_predefined BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS program_workouts (
          id INT PRIMARY KEY AUTO_INCREMENT,
          program_id INT NOT NULL,
          workout_id INT NOT NULL,
          day_of_week INT DEFAULT 0,
          order_index INT DEFAULT 0,
          notes TEXT,
          FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
          FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS workout_logs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          workout_id INT,
          duration_minutes INT,
          notes TEXT,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS exercise_logs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          workout_log_id INT NOT NULL,
          exercise_id INT NOT NULL,
          sets_completed INT,
          reps_completed VARCHAR(100),
          weight_used DECIMAL(6,2),
          notes TEXT,
          FOREIGN KEY (workout_log_id) REFERENCES workout_logs(id) ON DELETE CASCADE,
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
      );
    `;

    await connection.query(schema);
    console.log('📋 Tables created');

    // Clear existing exercise data
    await connection.query('DELETE FROM exercises');
    console.log('🧹 Cleared existing exercises');

    // Insert exercises
    for (const exercise of exercises) {
      await connection.query(
        `INSERT INTO exercises (name, description, category, muscle_group, equipment, difficulty, instructions, image_url, video_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exercise.name,
          exercise.description,
          exercise.category,
          exercise.muscle_group,
          exercise.equipment,
          exercise.difficulty,
          exercise.instructions,
          exercise.image_url,
          exercise.video_url || null
        ]
      );
    }
    console.log(`✅ Inserted ${exercises.length} exercises`);

    // Create demo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    // Check if demo user exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['demo@fitflow.com']
    );

    let demoUserId;
    if (existingUser.length === 0) {
      const [userResult] = await connection.query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
        ['demo@fitflow.com', hashedPassword, 'Demo', 'User']
      );
      demoUserId = userResult.insertId;
      console.log('👤 Demo user created (demo@fitflow.com / demo123)');
    } else {
      demoUserId = existingUser[0].id;
      console.log('👤 Demo user already exists');
    }

    // Create sample workouts for demo user
    const sampleWorkouts = [
      { name: 'Push Day', description: 'Chest, shoulders, and triceps focused workout' },
      { name: 'Pull Day', description: 'Back and biceps focused workout' },
      { name: 'Leg Day', description: 'Complete lower body workout' },
      { name: 'Full Body Beginner', description: 'Great starting workout for beginners' }
    ];

    for (const workout of sampleWorkouts) {
      const [existing] = await connection.query(
        'SELECT id FROM workouts WHERE user_id = ? AND name = ?',
        [demoUserId, workout.name]
      );
      
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO workouts (user_id, name, description) VALUES (?, ?, ?)',
          [demoUserId, workout.name, workout.description]
        );
      }
    }
    console.log('🏋️ Sample workouts created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('   Demo login: demo@fitflow.com / demo123\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

seed();
