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

    // Helper function to add workout exercises
    const addWorkoutExercises = async (workoutId, exercises) => {
      for (const ex of exercises) {
        const [exercise] = await connection.query(
          'SELECT id FROM exercises WHERE name = ? LIMIT 1',
          [ex.name]
        );
        if (exercise.length > 0) {
          await connection.query(
            'INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration, rest_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [workoutId, exercise[0].id, ex.order, ex.sets, ex.reps || null, ex.duration || null, ex.rest]
          );
        }
      }
    };

    // Upper Body Hypertrophy
    const [upperBodyHypertrophy] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Upper Body Hypertrophy', 'Volume-focused upper body workout for muscle growth. 8-12 rep range for maximum hypertrophy.', 'strength', TRUE)`,
      [systemUserId]
    );
    await addWorkoutExercises(upperBodyHypertrophy.insertId, [
      { name: 'Bench Press', order: 1, sets: 4, reps: 10, rest: 90 },
      { name: 'Incline Bench Press', order: 2, sets: 3, reps: 12, rest: 75 },
      { name: 'Barbell Row', order: 3, sets: 4, reps: 10, rest: 90 },
      { name: 'Lat Pulldown', order: 4, sets: 3, reps: 12, rest: 60 },
      { name: 'Overhead Press', order: 5, sets: 3, reps: 10, rest: 75 },
      { name: 'Lateral Raises', order: 6, sets: 3, reps: 15, rest: 45 },
      { name: 'Barbell Curl', order: 7, sets: 3, reps: 12, rest: 60 },
      { name: 'Tricep Pushdown', order: 8, sets: 3, reps: 12, rest: 60 }
    ]);

    // Lower Body Hypertrophy
    const [lowerBodyHypertrophy] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Lower Body Hypertrophy', 'High-volume leg workout for building bigger, stronger legs. Focus on quad and hamstring development.', 'strength', TRUE)`,
      [systemUserId]
    );
    await addWorkoutExercises(lowerBodyHypertrophy.insertId, [
      { name: 'Barbell Squat', order: 1, sets: 4, reps: 10, rest: 120 },
      { name: 'Romanian Deadlift', order: 2, sets: 4, reps: 10, rest: 90 },
      { name: 'Leg Press', order: 3, sets: 4, reps: 15, rest: 90 },
      { name: 'Lunges', order: 4, sets: 3, reps: 12, rest: 60 },
      { name: 'Leg Extension', order: 5, sets: 3, reps: 15, rest: 60 },
      { name: 'Leg Curl', order: 6, sets: 3, reps: 15, rest: 60 },
      { name: 'Calf Raises', order: 7, sets: 4, reps: 20, rest: 45 }
    ]);

    // Arms & Core Blast
    const [armsCore] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Arms & Core Blast', 'Dedicated arm and core workout. Perfect as an accessory day or to finish your week strong.', 'strength', TRUE)`,
      [systemUserId]
    );
    await addWorkoutExercises(armsCore.insertId, [
      { name: 'Barbell Curl', order: 1, sets: 3, reps: 10, rest: 60 },
      { name: 'Hammer Curl', order: 2, sets: 3, reps: 12, rest: 60 },
      { name: 'Tricep Pushdown', order: 3, sets: 3, reps: 12, rest: 60 },
      { name: 'Overhead Tricep Extension', order: 4, sets: 3, reps: 12, rest: 60 },
      { name: 'Plank', order: 5, sets: 3, reps: 1, rest: 45 },
      { name: 'Crunches', order: 6, sets: 3, reps: 20, rest: 45 }
    ]);

    // Chest & Back Superset
    const [chestBack] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Chest & Back Superset', 'Antagonistic superset workout for chest and back. Efficient and effective upper body training.', 'strength', TRUE)`,
      [systemUserId]
    );
    await addWorkoutExercises(chestBack.insertId, [
      { name: 'Bench Press', order: 1, sets: 4, reps: 8, rest: 90 },
      { name: 'Barbell Row', order: 2, sets: 4, reps: 8, rest: 90 },
      { name: 'Incline Bench Press', order: 3, sets: 3, reps: 10, rest: 75 },
      { name: 'Pull-ups', order: 4, sets: 3, reps: 10, rest: 75 },
      { name: 'Dumbbell Flyes', order: 5, sets: 3, reps: 12, rest: 60 },
      { name: 'Seated Cable Row', order: 6, sets: 3, reps: 12, rest: 60 }
    ]);

    // Shoulders & Traps
    const [shouldersTraps] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Shoulders & Traps', 'Complete shoulder and trap development. Build boulder shoulders and a strong neck base.', 'strength', TRUE)`,
      [systemUserId]
    );
    await addWorkoutExercises(shouldersTraps.insertId, [
      { name: 'Overhead Press', order: 1, sets: 4, reps: 8, rest: 90 },
      { name: 'Dumbbell Shoulder Press', order: 2, sets: 3, reps: 10, rest: 75 },
      { name: 'Lateral Raises', order: 3, sets: 4, reps: 12, rest: 60 },
      { name: 'Front Raises', order: 4, sets: 3, reps: 12, rest: 60 },
      { name: 'Face Pulls', order: 5, sets: 3, reps: 15, rest: 45 }
    ]);

    // =====================================================
    // CARDIO & MIXED WORKOUTS
    // =====================================================
    console.log('🏃 Adding cardio and mixed workouts...');

    // Full Body Circuit
    const [fullBodyCircuit] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Full Body Circuit Training', 'High-intensity circuit combining strength and cardio. Burn calories while building muscle.', 'mixed', TRUE)`,
      [systemUserId]
    );
    await addWorkoutExercises(fullBodyCircuit.insertId, [
      { name: 'Burpees', order: 1, sets: 3, reps: 15, rest: 30 },
      { name: 'Kettlebell Swings', order: 2, sets: 3, reps: 20, rest: 30 },
      { name: 'Push-ups', order: 3, sets: 3, reps: 15, rest: 30 },
      { name: 'Box Jumps', order: 4, sets: 3, reps: 12, rest: 30 },
      { name: 'Mountain Climbers', order: 5, sets: 3, reps: 30, rest: 30 }
    ]);

    // Tabata HIIT
    const [tabata] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Tabata HIIT Protocol', 'Classic Tabata intervals: 20 seconds max effort, 10 seconds rest. 8 rounds of pure intensity.', 'cardio', TRUE)`,
      [systemUserId]
    );
    await addWorkoutExercises(tabata.insertId, [
      { name: 'Burpees', order: 1, sets: 8, duration: 20, rest: 10 },
      { name: 'Jump Squats', order: 2, sets: 8, duration: 20, rest: 10 },
      { name: 'Mountain Climbers', order: 3, sets: 8, duration: 20, rest: 10 },
      { name: 'High Knees', order: 4, sets: 8, duration: 20, rest: 10 }
    ]);

    // Steady State Endurance
    const [steadyState] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Steady State Endurance', 'Moderate intensity cardio for building aerobic base and burning fat. Sustainable pace for longer duration.', 'cardio', TRUE)`,
      [systemUserId]
    );
    await addWorkoutExercises(steadyState.insertId, [
      { name: 'Treadmill Running', order: 1, sets: 1, duration: 1800, rest: 0 },
      { name: 'Stationary Bike', order: 2, sets: 1, duration: 600, rest: 120 },
      { name: 'Rowing Machine', order: 3, sets: 1, duration: 600, rest: 0 }
    ]);

    // Deep Stretch Recovery
    const [deepStretch] = await connection.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, 'Deep Stretch Recovery', 'Long-hold stretches for maximum flexibility gains. Perfect for rest days or post-workout recovery.', 'flexibility', TRUE)`,
      [systemUserId]
    );
    await addWorkoutExercises(deepStretch.insertId, [
      { name: 'Hamstring Stretch', order: 1, sets: 2, duration: 60, rest: 30 },
      { name: 'Hip Flexor Stretch', order: 2, sets: 2, duration: 60, rest: 30 },
      { name: 'Quad Stretch', order: 3, sets: 2, duration: 60, rest: 30 }
    ]);

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

    // Helper function to add program workouts
    const addProgramWorkouts = async (programId, workouts) => {
      for (const workout of workouts) {
        const [workoutData] = await connection.query(
          'SELECT id FROM workouts WHERE name = ? AND is_predefined = TRUE LIMIT 1',
          [workout.name]
        );
        if (workoutData.length > 0) {
          await connection.query(
            'INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index) VALUES (?, ?, ?, ?)',
            [programId, workoutData[0].id, workout.day, workout.order]
          );
        }
      }
    };

    // Classic Bodybuilding Split
    const [bodybuildingSplit] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES (?, 'Classic Bodybuilding Split', 'Traditional bodybuilding program with dedicated muscle group days. Build size and definition with proven methods.', 12, 'intermediate', TRUE)`,
      [systemUserId]
    );
    await addProgramWorkouts(bodybuildingSplit.insertId, [
      { name: 'Chest & Back Superset', day: 1, order: 1 },
      { name: 'Shoulders & Traps', day: 2, order: 2 },
      { name: 'Lower Body Hypertrophy', day: 3, order: 3 },
      { name: 'Arms & Core Blast', day: 4, order: 4 },
      { name: 'Deep Stretch Recovery', day: 6, order: 5 }
    ]);

    // 8-Week Fat Shredder
    const [fatShredder] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES (?, '8-Week Fat Shredder', 'Aggressive fat loss program combining strength training and metabolic conditioning. Get lean while preserving muscle.', 8, 'intermediate', TRUE)`,
      [systemUserId]
    );
    await addProgramWorkouts(fatShredder.insertId, [
      { name: 'Full Body Circuit Training', day: 1, order: 1 },
      { name: 'Tabata HIIT Protocol', day: 2, order: 2 },
      { name: 'Upper Body Hypertrophy', day: 3, order: 3 },
      { name: 'Tabata HIIT Protocol', day: 4, order: 4 },
      { name: 'Lower Body Hypertrophy', day: 5, order: 5 }
    ]);

    // Power & Hypertrophy
    const [powerHypertrophy] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES (?, 'Power & Hypertrophy', 'Get the best of both worlds. Build maximum strength and muscle size with this hybrid program.', 10, 'advanced', TRUE)`,
      [systemUserId]
    );
    await addProgramWorkouts(powerHypertrophy.insertId, [
      { name: 'Intermediate Push Day', day: 1, order: 1 },
      { name: 'Intermediate Pull Day', day: 2, order: 2 },
      { name: 'Intermediate Leg Day', day: 3, order: 3 },
      { name: 'Upper Body Hypertrophy', day: 4, order: 4 },
      { name: 'Arms & Core Blast', day: 5, order: 5 }
    ]);

    // Busy Professional
    const [busyProfessional] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES (?, 'Busy Professional Fitness', 'Time-efficient program for people with demanding schedules. Only 3-4 workouts per week, maximum results.', 6, 'beginner', TRUE)`,
      [systemUserId]
    );
    await addProgramWorkouts(busyProfessional.insertId, [
      { name: 'Beginner Full Body A', day: 1, order: 1 },
      { name: 'Steady State Endurance', day: 3, order: 2 },
      { name: 'Beginner Full Body B', day: 5, order: 3 }
    ]);

    // Summer Shred Challenge
    const [summerShred] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) VALUES (?, 'Summer Shred Challenge', 'Get beach-ready with this high-intensity 6-week program. Combination of strength, cardio, and ab work for a shredded physique.', 6, 'intermediate', TRUE)`,
      [systemUserId]
    );
    await addProgramWorkouts(summerShred.insertId, [
      { name: 'Upper Body Hypertrophy', day: 0, order: 1 },
      { name: 'Tabata HIIT Protocol', day: 1, order: 2 },
      { name: 'Lower Body Hypertrophy', day: 2, order: 3 },
      { name: 'Full Body Circuit Training', day: 3, order: 4 },
      { name: 'Arms & Core Blast', day: 4, order: 5 },
      { name: 'Morning Yoga Flow', day: 6, order: 6 }
    ]);

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
