const mysql = require('mysql2/promise');

async function addMoreContent() {
  console.log('🔄 Connecting to MySQL...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'mysql.railway.internal',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'railway',
    multipleStatements: true
  });

  console.log('✅ Connected!');

  // Get system user ID
  console.log('🔍 Getting system user ID...');
  const [users] = await connection.query(
    "SELECT id FROM users WHERE email = 'system@fitflow.app' LIMIT 1"
  );

  if (users.length === 0) {
    console.error('❌ System user not found! Run the main import first.');
    process.exit(1);
  }

  const systemUserId = users[0].id;
  console.log(`✅ System user found: ID ${systemUserId}`);

  // Check if content already exists
  console.log('🔍 Checking for existing additional workouts...');
  const [existingWorkouts] = await connection.query(
    "SELECT COUNT(*) as count FROM workouts WHERE name = 'Upper Body Hypertrophy'"
  );

  if (existingWorkouts[0].count > 0) {
    console.log('⚠️  Additional content already exists. Skipping import.');
    await connection.end();
    console.log('👋 Done!');
    process.exit(0);
  }

  console.log('📊 Adding additional workouts and programs...');

  try {
    // =====================================================
    // ADDITIONAL STRENGTH WORKOUTS
    // =====================================================
    console.log('💪 Adding strength workouts...');

    // Upper Body Hypertrophy
    const [upperBodyHypertrophy] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Upper Body Hypertrophy', 'Volume-focused upper body workout for muscle growth. 8-12 rep range for maximum hypertrophy.', 'strength', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
       SELECT ?, id, 1, 4, 10, 90 FROM exercises WHERE name = 'Bench Press' LIMIT 1
       UNION ALL SELECT ?, id, 2, 3, 12, 75 FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1
       UNION ALL SELECT ?, id, 3, 4, 10, 90 FROM exercises WHERE name = 'Barbell Row' LIMIT 1
       UNION ALL SELECT ?, id, 4, 3, 12, 60 FROM exercises WHERE name = 'Lat Pulldown' LIMIT 1
       UNION ALL SELECT ?, id, 5, 3, 10, 75 FROM exercises WHERE name = 'Overhead Press' LIMIT 1
       UNION ALL SELECT ?, id, 6, 3, 15, 45 FROM exercises WHERE name = 'Lateral Raises' LIMIT 1
       UNION ALL SELECT ?, id, 7, 3, 12, 60 FROM exercises WHERE name = 'Barbell Curl' LIMIT 1
       UNION ALL SELECT ?, id, 8, 3, 12, 60 FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1`,
      [upperBodyHypertrophy.insertId, upperBodyHypertrophy.insertId, upperBodyHypertrophy.insertId, upperBodyHypertrophy.insertId, upperBodyHypertrophy.insertId, upperBodyHypertrophy.insertId, upperBodyHypertrophy.insertId, upperBodyHypertrophy.insertId]
    );

    // Lower Body Hypertrophy
    const [lowerBodyHypertrophy] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Lower Body Hypertrophy', 'High-volume leg workout for building bigger, stronger legs. Focus on quad and hamstring development.', 'strength', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
       SELECT ?, id, 1, 4, 10, 120 FROM exercises WHERE name = 'Barbell Squat' LIMIT 1
       UNION ALL SELECT ?, id, 2, 4, 10, 90 FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1
       UNION ALL SELECT ?, id, 3, 4, 15, 90 FROM exercises WHERE name = 'Leg Press' LIMIT 1
       UNION ALL SELECT ?, id, 4, 3, 12, 60 FROM exercises WHERE name = 'Lunges' LIMIT 1
       UNION ALL SELECT ?, id, 5, 3, 15, 60 FROM exercises WHERE name = 'Leg Extension' LIMIT 1
       UNION ALL SELECT ?, id, 6, 3, 15, 60 FROM exercises WHERE name = 'Leg Curl' LIMIT 1
       UNION ALL SELECT ?, id, 7, 4, 20, 45 FROM exercises WHERE name = 'Calf Raises' LIMIT 1`,
      [lowerBodyHypertrophy.insertId, lowerBodyHypertrophy.insertId, lowerBodyHypertrophy.insertId, lowerBodyHypertrophy.insertId, lowerBodyHypertrophy.insertId, lowerBodyHypertrophy.insertId, lowerBodyHypertrophy.insertId]
    );

    // Arms & Core Blast
    const [armsCore] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Arms & Core Blast', 'Dedicated arm and core workout. Perfect as an accessory day or to finish your week strong.', 'strength', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
       SELECT ?, id, 1, 3, 10, 60 FROM exercises WHERE name = 'Barbell Curl' LIMIT 1
       UNION ALL SELECT ?, id, 2, 3, 12, 60 FROM exercises WHERE name = 'Hammer Curl' LIMIT 1
       UNION ALL SELECT ?, id, 3, 3, 12, 60 FROM exercises WHERE name = 'Tricep Pushdown' LIMIT 1
       UNION ALL SELECT ?, id, 4, 3, 12, 60 FROM exercises WHERE name = 'Overhead Tricep Extension' LIMIT 1
       UNION ALL SELECT ?, id, 5, 3, 1, 45 FROM exercises WHERE name = 'Plank' LIMIT 1
       UNION ALL SELECT ?, id, 6, 3, 20, 45 FROM exercises WHERE name = 'Crunches' LIMIT 1`,
      [armsCore.insertId, armsCore.insertId, armsCore.insertId, armsCore.insertId, armsCore.insertId, armsCore.insertId]
    );

    // Chest & Back Superset
    const [chestBack] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Chest & Back Superset', 'Antagonistic superset workout for chest and back. Efficient and effective upper body training.', 'strength', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
       SELECT ?, id, 1, 4, 8, 90 FROM exercises WHERE name = 'Bench Press' LIMIT 1
       UNION ALL SELECT ?, id, 2, 4, 8, 90 FROM exercises WHERE name = 'Barbell Row' LIMIT 1
       UNION ALL SELECT ?, id, 3, 3, 10, 75 FROM exercises WHERE name = 'Incline Bench Press' LIMIT 1
       UNION ALL SELECT ?, id, 4, 3, 10, 75 FROM exercises WHERE name = 'Pull-ups' LIMIT 1
       UNION ALL SELECT ?, id, 5, 3, 12, 60 FROM exercises WHERE name = 'Dumbbell Flyes' LIMIT 1
       UNION ALL SELECT ?, id, 6, 3, 12, 60 FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1`,
      [chestBack.insertId, chestBack.insertId, chestBack.insertId, chestBack.insertId, chestBack.insertId, chestBack.insertId]
    );

    // Shoulders & Traps
    const [shouldersTraps] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Shoulders & Traps', 'Complete shoulder and trap development. Build boulder shoulders and a strong neck base.', 'strength', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
       SELECT ?, id, 1, 4, 8, 90 FROM exercises WHERE name = 'Overhead Press' LIMIT 1
       UNION ALL SELECT ?, id, 2, 3, 10, 75 FROM exercises WHERE name = 'Dumbbell Shoulder Press' LIMIT 1
       UNION ALL SELECT ?, id, 3, 4, 12, 60 FROM exercises WHERE name = 'Lateral Raises' LIMIT 1
       UNION ALL SELECT ?, id, 4, 3, 12, 60 FROM exercises WHERE name = 'Front Raises' LIMIT 1
       UNION ALL SELECT ?, id, 5, 3, 15, 45 FROM exercises WHERE name = 'Face Pulls' LIMIT 1`,
      [shouldersTraps.insertId, shouldersTraps.insertId, shouldersTraps.insertId, shouldersTraps.insertId, shouldersTraps.insertId]
    );

    // =====================================================
    // CARDIO & MIXED WORKOUTS
    // =====================================================
    console.log('🏃 Adding cardio and mixed workouts...');

    // Full Body Circuit
    const [fullBodyCircuit] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Full Body Circuit Training', 'High-intensity circuit combining strength and cardio. Burn calories while building muscle.', 'mixed', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) 
       SELECT ?, id, 1, 3, 15, 30 FROM exercises WHERE name = 'Burpees' LIMIT 1
       UNION ALL SELECT ?, id, 2, 3, 20, 30 FROM exercises WHERE name = 'Kettlebell Swings' LIMIT 1
       UNION ALL SELECT ?, id, 3, 3, 15, 30 FROM exercises WHERE name = 'Push-ups' LIMIT 1
       UNION ALL SELECT ?, id, 4, 3, 12, 30 FROM exercises WHERE name = 'Box Jumps' LIMIT 1
       UNION ALL SELECT ?, id, 5, 3, 30, 30 FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1`,
      [fullBodyCircuit.insertId, fullBodyCircuit.insertId, fullBodyCircuit.insertId, fullBodyCircuit.insertId, fullBodyCircuit.insertId]
    );

    // Tabata HIIT
    const [tabata] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Tabata HIIT Protocol', 'Classic Tabata intervals: 20 seconds max effort, 10 seconds rest. 8 rounds of pure intensity.', 'cardio', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, duration, rest_time) 
       SELECT ?, id, 1, 8, 20, 10 FROM exercises WHERE name = 'Burpees' LIMIT 1
       UNION ALL SELECT ?, id, 2, 8, 20, 10 FROM exercises WHERE name = 'Jump Squats' LIMIT 1
       UNION ALL SELECT ?, id, 3, 8, 20, 10 FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1
       UNION ALL SELECT ?, id, 4, 8, 20, 10 FROM exercises WHERE name = 'High Knees' LIMIT 1`,
      [tabata.insertId, tabata.insertId, tabata.insertId, tabata.insertId]
    );

    // Steady State Endurance
    const [steadyState] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Steady State Endurance', 'Moderate intensity cardio for building aerobic base and burning fat. Sustainable pace for longer duration.', 'cardio', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, duration, rest_time) 
       SELECT ?, id, 1, 1, 1800, 0 FROM exercises WHERE name = 'Treadmill Running' LIMIT 1
       UNION ALL SELECT ?, id, 2, 1, 600, 120 FROM exercises WHERE name = 'Stationary Bike' LIMIT 1
       UNION ALL SELECT ?, id, 3, 1, 600, 0 FROM exercises WHERE name = 'Rowing Machine' LIMIT 1`,
      [steadyState.insertId, steadyState.insertId, steadyState.insertId]
    );

    // Deep Stretch Recovery
    const [deepStretch] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Deep Stretch Recovery', 'Long-hold stretches for maximum flexibility gains. Perfect for rest days or post-workout recovery.', 'flexibility', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, duration, rest_time) 
       SELECT ?, id, 1, 2, 60, 30 FROM exercises WHERE name = 'Hamstring Stretch' LIMIT 1
       UNION ALL SELECT ?, id, 2, 2, 60, 30 FROM exercises WHERE name = 'Hip Flexor Stretch' LIMIT 1
       UNION ALL SELECT ?, id, 3, 2, 60, 30 FROM exercises WHERE name = 'Quad Stretch' LIMIT 1`,
      [deepStretch.insertId, deepStretch.insertId, deepStretch.insertId]
    );

    // Morning Yoga Flow
    const [yogaFlow] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Morning Yoga Flow', 'Gentle yoga sequence to wake up your body. Perfect way to start your day with mindful movement.', 'flexibility', TRUE)`,
      [systemUserId]
    );

    console.log('✅ Added 10 additional workouts!');

    // =====================================================
    // ADDITIONAL PROGRAMS
    // =====================================================
    console.log('📋 Adding programs...');

    // Classic Bodybuilding Split
    const [bodybuildingSplit] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES (?, 'Classic Bodybuilding Split', 'Traditional bodybuilding program with dedicated muscle group days. Build size and definition with proven methods.', 12, 'intermediate', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index)
       SELECT ?, id, 1, 1 FROM workouts WHERE name = 'Chest & Back Superset' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 2, 2 FROM workouts WHERE name = 'Shoulders & Traps' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 3, 3 FROM workouts WHERE name = 'Lower Body Hypertrophy' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 4, 4 FROM workouts WHERE name = 'Arms & Core Blast' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 6, 5 FROM workouts WHERE name = 'Deep Stretch Recovery' AND is_predefined = TRUE LIMIT 1`,
      [bodybuildingSplit.insertId, bodybuildingSplit.insertId, bodybuildingSplit.insertId, bodybuildingSplit.insertId, bodybuildingSplit.insertId]
    );

    // 8-Week Fat Shredder
    const [fatShredder] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES (?, '8-Week Fat Shredder', 'Aggressive fat loss program combining strength training and metabolic conditioning. Get lean while preserving muscle.', 8, 'intermediate', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index)
       SELECT ?, id, 1, 1 FROM workouts WHERE name = 'Full Body Circuit Training' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 2, 2 FROM workouts WHERE name = 'Tabata HIIT Protocol' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 3, 3 FROM workouts WHERE name = 'Upper Body Hypertrophy' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 4, 4 FROM workouts WHERE name = 'Tabata HIIT Protocol' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 5, 5 FROM workouts WHERE name = 'Lower Body Hypertrophy' AND is_predefined = TRUE LIMIT 1`,
      [fatShredder.insertId, fatShredder.insertId, fatShredder.insertId, fatShredder.insertId, fatShredder.insertId]
    );

    // Power & Hypertrophy
    const [powerHypertrophy] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES (?, 'Power & Hypertrophy', 'Get the best of both worlds. Build maximum strength and muscle size with this hybrid program.', 10, 'advanced', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index)
       SELECT ?, id, 1, 1 FROM workouts WHERE name = 'Intermediate Push Day' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 2, 2 FROM workouts WHERE name = 'Intermediate Pull Day' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 3, 3 FROM workouts WHERE name = 'Intermediate Leg Day' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 4, 4 FROM workouts WHERE name = 'Upper Body Hypertrophy' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 5, 5 FROM workouts WHERE name = 'Arms & Core Blast' AND is_predefined = TRUE LIMIT 1`,
      [powerHypertrophy.insertId, powerHypertrophy.insertId, powerHypertrophy.insertId, powerHypertrophy.insertId, powerHypertrophy.insertId]
    );

    // Busy Professional
    const [busyProfessional] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES (?, 'Busy Professional Fitness', 'Time-efficient program for people with demanding schedules. Only 3-4 workouts per week, maximum results.', 6, 'beginner', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index)
       SELECT ?, id, 1, 1 FROM workouts WHERE name = 'Beginner Full Body A' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 3, 2 FROM workouts WHERE name = 'Steady State Endurance' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 5, 3 FROM workouts WHERE name = 'Beginner Full Body B' AND is_predefined = TRUE LIMIT 1`,
      [busyProfessional.insertId, busyProfessional.insertId, busyProfessional.insertId]
    );

    // Summer Shred Challenge
    const [summerShred] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES (?, 'Summer Shred Challenge', 'Get beach-ready with this high-intensity 6-week program. Combination of strength, cardio, and ab work for a shredded physique.', 6, 'intermediate', TRUE)`,
      [systemUserId]
    );
    await connection.query(
      `INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index)
       SELECT ?, id, 0, 1 FROM workouts WHERE name = 'Upper Body Hypertrophy' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 1, 2 FROM workouts WHERE name = 'Tabata HIIT Protocol' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 2, 3 FROM workouts WHERE name = 'Lower Body Hypertrophy' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 3, 4 FROM workouts WHERE name = 'Full Body Circuit Training' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 4, 5 FROM workouts WHERE name = 'Arms & Core Blast' AND is_predefined = TRUE LIMIT 1
       UNION ALL SELECT ?, id, 6, 6 FROM workouts WHERE name = 'Morning Yoga Flow' AND is_predefined = TRUE LIMIT 1`,
      [summerShred.insertId, summerShred.insertId, summerShred.insertId, summerShred.insertId, summerShred.insertId, summerShred.insertId]
    );

    console.log('✅ Added 5 additional programs!');
    console.log('');
    console.log('🎉 All additional content imported successfully!');
    console.log('📊 Summary:');
    console.log('   - 10 New Workouts');
    console.log('   - 5 New Programs');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error);
    process.exit(1);
  }

  await connection.end();
  console.log('👋 Done!');
  process.exit(0);
}

addMoreContent().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
