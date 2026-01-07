const mysql = require('mysql2/promise');

async function fixWorkoutExercises() {
  console.log('🔄 Connecting to MySQL...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'mysql.railway.internal',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'railway',
    multipleStatements: false
  });

  console.log('✅ Connected!');

  try {
    // First, let's see what exercises exist
    console.log('\n📋 Checking available exercises...');
    const [exercises] = await connection.query('SELECT name FROM exercises ORDER BY name LIMIT 20');
    console.log('Sample exercises:', exercises.map(e => e.name).join(', '));

    // Get the Upper Body Hypertrophy workout
    const [workouts] = await connection.query(
      "SELECT id FROM workouts WHERE name = 'Upper Body Hypertrophy' LIMIT 1"
    );

    if (workouts.length === 0) {
      console.log('❌ Upper Body Hypertrophy workout not found');
      process.exit(1);
    }

    const workoutId = workouts[0].id;
    console.log(`\n✅ Found workout ID: ${workoutId}`);

    // Try to add exercises one by one
    const exercisesToAdd = [
      { name: 'Bench Press', order: 1, sets: 4, reps: 10, rest: 90 },
      { name: 'Incline Bench Press', order: 2, sets: 3, reps: 12, rest: 75 },
      { name: 'Barbell Row', order: 3, sets: 4, reps: 10, rest: 90 },
      { name: 'Lat Pulldown', order: 4, sets: 3, reps: 12, rest: 60 },
      { name: 'Overhead Press', order: 5, sets: 3, reps: 10, rest: 75 },
      { name: 'Lateral Raises', order: 6, sets: 3, reps: 15, rest: 45 },
      { name: 'Barbell Curl', order: 7, sets: 3, reps: 12, rest: 60 },
      { name: 'Tricep Pushdown', order: 8, sets: 3, reps: 12, rest: 60 }
    ];

    console.log('\n🔄 Adding exercises...');
    let added = 0;
    let notFound = [];

    for (const ex of exercisesToAdd) {
      const [exercise] = await connection.query(
        'SELECT id FROM exercises WHERE name = ? LIMIT 1',
        [ex.name]
      );
      
      if (exercise.length > 0) {
        await connection.query(
          'INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, rest_time) VALUES (?, ?, ?, ?, ?, ?)',
          [workoutId, exercise[0].id, ex.order, ex.sets, ex.reps, ex.rest]
        );
        console.log(`  ✅ Added: ${ex.name}`);
        added++;
      } else {
        console.log(`  ❌ Not found: ${ex.name}`);
        notFound.push(ex.name);
      }
    }

    console.log(`\n✅ Added ${added} exercises`);
    if (notFound.length > 0) {
      console.log(`⚠️  Missing exercises: ${notFound.join(', ')}`);
      console.log('\n💡 You may need to add these exercises first or use different exercise names.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixWorkoutExercises();
