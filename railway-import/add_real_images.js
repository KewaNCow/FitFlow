const mysql = require('mysql2/promise');

async function addRealImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'mysql.railway.internal',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'railway'
  });

  console.log('✅ Connected to database');

  // Using exercise demonstration GIFs/images from ExRx.net and other reliable sources
  // All images are placeholder.com with exercise names for now - you can replace with actual CDN later
  
  const exerciseImages = {
    // CHEST
    'Bench Press': 'https://placehold.co/400x300/4F46E5/FFFFFF/png?text=Bench+Press',
    'Incline Bench Press': 'https://placehold.co/400x300/4F46E5/FFFFFF/png?text=Incline+Bench+Press',
    'Dumbbell Bench Press': 'https://placehold.co/400x300/4F46E5/FFFFFF/png?text=Dumbbell+Bench+Press',
    'Dumbbell Flyes': 'https://placehold.co/400x300/4F46E5/FFFFFF/png?text=Dumbbell+Flyes',
    'Push-ups': 'https://placehold.co/400x300/4F46E5/FFFFFF/png?text=Push-ups',
    'Diamond Push-ups': 'https://placehold.co/400x300/4F46E5/FFFFFF/png?text=Diamond+Push-ups',
    'Cable Crossover': 'https://placehold.co/400x300/4F46E5/FFFFFF/png?text=Cable+Crossover',
    'Machine Chest Press': 'https://placehold.co/400x300/4F46E5/FFFFFF/png?text=Machine+Chest+Press',
    'Pec Deck Fly': 'https://placehold.co/400x300/4F46E5/FFFFFF/png?text=Pec+Deck+Fly',
    
    // BACK
    'Deadlift': 'https://placehold.co/400x300/EF4444/FFFFFF/png?text=Deadlift',
    'Barbell Row': 'https://placehold.co/400x300/EF4444/FFFFFF/png?text=Barbell+Row',
    'Dumbbell Row': 'https://placehold.co/400x300/EF4444/FFFFFF/png?text=Dumbbell+Row',
    'Pull-ups': 'https://placehold.co/400x300/EF4444/FFFFFF/png?text=Pull-ups',
    'Chin-ups': 'https://placehold.co/400x300/EF4444/FFFFFF/png?text=Chin-ups',
    'Lat Pulldown': 'https://placehold.co/400x300/EF4444/FFFFFF/png?text=Lat+Pulldown',
    'Seated Cable Row': 'https://placehold.co/400x300/EF4444/FFFFFF/png?text=Seated+Cable+Row',
    'Face Pulls': 'https://placehold.co/400x300/EF4444/FFFFFF/png?text=Face+Pulls',
    'Inverted Rows': 'https://placehold.co/400x300/EF4444/FFFFFF/png?text=Inverted+Rows',
    
    // SHOULDERS
    'Overhead Press': 'https://placehold.co/400x300/F59E0B/FFFFFF/png?text=Overhead+Press',
    'Dumbbell Shoulder Press': 'https://placehold.co/400x300/F59E0B/FFFFFF/png?text=Shoulder+Press',
    'Lateral Raises': 'https://placehold.co/400x300/F59E0B/FFFFFF/png?text=Lateral+Raises',
    'Front Raises': 'https://placehold.co/400x300/F59E0B/FFFFFF/png?text=Front+Raises',
    'Rear Delt Flyes': 'https://placehold.co/400x300/F59E0B/FFFFFF/png?text=Rear+Delt+Flyes',
    'Arnold Press': 'https://placehold.co/400x300/F59E0B/FFFFFF/png?text=Arnold+Press',
    'Machine Shoulder Press': 'https://placehold.co/400x300/F59E0B/FFFFFF/png?text=Machine+Shoulder+Press',
    'Pike Push-ups': 'https://placehold.co/400x300/F59E0B/FFFFFF/png?text=Pike+Push-ups',
    
    // ARMS
    'Barbell Curl': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Barbell+Curl',
    'Dumbbell Curl': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Dumbbell+Curl',
    'Hammer Curl': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Hammer+Curl',
    'Preacher Curl': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Preacher+Curl',
    'Cable Curl': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Cable+Curl',
    'Tricep Pushdown': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Tricep+Pushdown',
    'Skull Crushers': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Skull+Crushers',
    'Overhead Tricep Extension': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Tricep+Extension',
    'Tricep Dips': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Tricep+Dips',
    'Close-grip Bench Press': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Close-grip+Bench',
    
    // LEGS
    'Barbell Squat': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Barbell+Squat',
    'Front Squat': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Front+Squat',
    'Goblet Squat': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Goblet+Squat',
    'Leg Press': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Leg+Press',
    'Leg Extension': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Leg+Extension',
    'Leg Curl': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Leg+Curl',
    'Romanian Deadlift': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Romanian+Deadlift',
    'Lunges': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Lunges',
    'Bulgarian Split Squat': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Bulgarian+Split+Squat',
    'Calf Raises': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Calf+Raises',
    'Bodyweight Squats': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Bodyweight+Squats',
    'Jump Squats': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Jump+Squats',
    'Wall Sit': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Wall+Sit',
    'Step-ups': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Step-ups',
    'Hip Thrusts': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Hip+Thrusts',
    
    // CORE
    'Plank': 'https://placehold.co/400x300/EC4899/FFFFFF/png?text=Plank',
    'Crunches': 'https://placehold.co/400x300/EC4899/FFFFFF/png?text=Crunches',
    'Russian Twists': 'https://placehold.co/400x300/EC4899/FFFFFF/png?text=Russian+Twists',
    'Leg Raises': 'https://placehold.co/400x300/EC4899/FFFFFF/png?text=Leg+Raises',
    'Mountain Climbers': 'https://placehold.co/400x300/EC4899/FFFFFF/png?text=Mountain+Climbers',
    'Dead Bug': 'https://placehold.co/400x300/EC4899/FFFFFF/png?text=Dead+Bug',
    'Bird Dog': 'https://placehold.co/400x300/EC4899/FFFFFF/png?text=Bird+Dog',
    'Ab Wheel Rollout': 'https://placehold.co/400x300/EC4899/FFFFFF/png?text=Ab+Wheel+Rollout',
    'Cable Woodchop': 'https://placehold.co/400x300/EC4899/FFFFFF/png?text=Cable+Woodchop',
    'Hanging Leg Raises': 'https://placehold.co/400x300/EC4899/FFFFFF/png?text=Hanging+Leg+Raises',
    
    // CARDIO
    'Running': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=Running',
    'Cycling': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=Cycling',
    'Rowing': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=Rowing',
    'Jump Rope': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=Jump+Rope',
    'Elliptical': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=Elliptical',
    'Walking': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=Walking',
    'Burpees': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=Burpees',
    'Jumping Jacks': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=Jumping+Jacks',
    'High Knees': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=High+Knees',
    'Box Jumps': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=Box+Jumps',
    'Battle Rope Waves': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=Battle+Rope+Waves',
    'Kettlebell Swings': 'https://placehold.co/400x300/06B6D4/FFFFFF/png?text=Kettlebell+Swings',
    
    // FLEXIBILITY
    'Standing Hamstring Stretch': 'https://placehold.co/400x300/A855F7/FFFFFF/png?text=Hamstring+Stretch',
    'Quad Stretch': 'https://placehold.co/400x300/A855F7/FFFFFF/png?text=Quad+Stretch',
    'Hip Flexor Stretch': 'https://placehold.co/400x300/A855F7/FFFFFF/png?text=Hip+Flexor+Stretch',
    'Pigeon Pose': 'https://placehold.co/400x300/A855F7/FFFFFF/png?text=Pigeon+Pose',
    'Cat-Cow Stretch': 'https://placehold.co/400x300/A855F7/FFFFFF/png?text=Cat-Cow+Stretch',
    'Childs Pose': 'https://placehold.co/400x300/A855F7/FFFFFF/png?text=Childs+Pose',
    'Shoulder Stretch': 'https://placehold.co/400x300/A855F7/FFFFFF/png?text=Shoulder+Stretch',
    'Tricep Stretch': 'https://placehold.co/400x300/A855F7/FFFFFF/png?text=Tricep+Stretch',
    'Chest Stretch': 'https://placehold.co/400x300/A855F7/FFFFFF/png?text=Chest+Stretch',
    'Downward Dog': 'https://placehold.co/400x300/A855F7/FFFFFF/png?text=Downward+Dog'
  };

  console.log(`Updating ${Object.keys(exerciseImages).length} exercises with images...`);
  
  for (const [name, url] of Object.entries(exerciseImages)) {
    await connection.query(
      'UPDATE exercises SET image_url = ? WHERE name = ?',
      [url, name]
    );
  }

  console.log('✅ Updated all exercises with matching images');

  // Equipment images - color-coded by category
  const equipmentImages = {
    // Free weights (blue)
    'Barbell': 'https://placehold.co/400x300/3B82F6/FFFFFF/png?text=Barbell',
    'Dumbbells': 'https://placehold.co/400x300/3B82F6/FFFFFF/png?text=Dumbbells',
    'Kettlebell': 'https://placehold.co/400x300/3B82F6/FFFFFF/png?text=Kettlebell',
    'EZ Curl Bar': 'https://placehold.co/400x300/3B82F6/FFFFFF/png?text=EZ+Curl+Bar',
    
    // Machines (green)
    'Cable Machine': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Cable+Machine',
    'Lat Pulldown Machine': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Lat+Pulldown',
    'Leg Press Machine': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Leg+Press',
    'Chest Press Machine': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Chest+Press',
    'Leg Extension Machine': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Leg+Extension',
    'Leg Curl Machine': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Leg+Curl',
    'Shoulder Press Machine': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Shoulder+Press',
    'Pec Deck Machine': 'https://placehold.co/400x300/10B981/FFFFFF/png?text=Pec+Deck',
    
    // Cardio (orange)
    'Treadmill': 'https://placehold.co/400x300/F97316/FFFFFF/png?text=Treadmill',
    'Stationary Bike': 'https://placehold.co/400x300/F97316/FFFFFF/png?text=Stationary+Bike',
    'Elliptical': 'https://placehold.co/400x300/F97316/FFFFFF/png?text=Elliptical',
    'Rowing Machine': 'https://placehold.co/400x300/F97316/FFFFFF/png?text=Rowing+Machine',
    'Jump Rope': 'https://placehold.co/400x300/F97316/FFFFFF/png?text=Jump+Rope',
    
    // Bodyweight (purple)
    'Pull-up Bar': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Pull-up+Bar',
    'Dip Station': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Dip+Station',
    'Plyo Box': 'https://placehold.co/400x300/8B5CF6/FFFFFF/png?text=Plyo+Box',
    
    // Bands & cables (red)
    'Resistance Bands': 'https://placehold.co/400x300/EF4444/FFFFFF/png?text=Resistance+Bands',
    'Battle Ropes': 'https://placehold.co/400x300/EF4444/FFFFFF/png?text=Battle+Ropes',
    
    // Accessories (gray)
    'Bench (Flat)': 'https://placehold.co/400x300/6B7280/FFFFFF/png?text=Flat+Bench',
    'Bench (Adjustable)': 'https://placehold.co/400x300/6B7280/FFFFFF/png?text=Adjustable+Bench',
    'Ab Wheel': 'https://placehold.co/400x300/6B7280/FFFFFF/png?text=Ab+Wheel',
    'Foam Roller': 'https://placehold.co/400x300/6B7280/FFFFFF/png?text=Foam+Roller',
    'Yoga Mat': 'https://placehold.co/400x300/6B7280/FFFFFF/png?text=Yoga+Mat',
    'Medicine Ball': 'https://placehold.co/400x300/6B7280/FFFFFF/png?text=Medicine+Ball'
  };

  console.log(`Updating ${Object.keys(equipmentImages).length} equipment items with images...`);
  
  for (const [name, url] of Object.entries(equipmentImages)) {
    await connection.query(
      'UPDATE equipment SET image_url = ? WHERE name = ?',
      [url, name]
    );
  }

  console.log('✅ Updated all equipment with matching images');

  // Program images
  const programImages = {
    'Beginner Strength Foundation': 'https://placehold.co/600x400/4F46E5/FFFFFF/png?text=Beginner+Strength',
    'Push Pull Legs Split': 'https://placehold.co/600x400/EF4444/FFFFFF/png?text=Push+Pull+Legs',
    'Home Body Transformation': 'https://placehold.co/600x400/10B981/FFFFFF/png?text=Home+Transformation',
    'Fat Burning Cardio': 'https://placehold.co/600x400/F59E0B/FFFFFF/png?text=Fat+Burning+Cardio'
  };

  console.log(`Updating ${Object.keys(programImages).length} programs with images...`);
  
  for (const [name, url] of Object.entries(programImages)) {
    await connection.query(
      'UPDATE programs SET image_url = ? WHERE name = ?',
      [url, name]
    );
  }

  console.log('✅ Updated all programs with matching images');

  await connection.end();
  console.log('👋 Done! All items now have working, color-coded images that match their names');
  console.log('💡 Images are placeholders - you can replace with real photos from your own CDN later');
}

addRealImages().catch(console.error);
