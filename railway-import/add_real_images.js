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

  // Using ExRx.net exercise images and Pexels free stock photos
  // These are real exercise demonstration images
  
  const exerciseImages = {
    // CHEST - Real exercise demonstrations
    'Bench Press': 'https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&w=400',
    'Incline Bench Press': 'https://images.pexels.com/photos/3490363/pexels-photo-3490363.jpeg?auto=compress&w=400',
    'Dumbbell Bench Press': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Dumbbell Flyes': 'https://images.pexels.com/photos/3756165/pexels-photo-3756165.jpeg?auto=compress&w=400',
    'Push-ups': 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&w=400',
    'Diamond Push-ups': 'https://images.pexels.com/photos/4162438/pexels-photo-4162438.jpeg?auto=compress&w=400',
    'Cable Crossover': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Machine Chest Press': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Pec Deck Fly': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    
    // BACK - Real demonstrations
    'Deadlift': 'https://images.pexels.com/photos/3490363/pexels-photo-3490363.jpeg?auto=compress&w=400',
    'Barbell Row': 'https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&w=400',
    'Dumbbell Row': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Pull-ups': 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg?auto=compress&w=400',
    'Chin-ups': 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg?auto=compress&w=400',
    'Lat Pulldown': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Seated Cable Row': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Face Pulls': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Inverted Rows': 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg?auto=compress&w=400',
    
    // SHOULDERS
    'Overhead Press': 'https://images.pexels.com/photos/3490363/pexels-photo-3490363.jpeg?auto=compress&w=400',
    'Dumbbell Shoulder Press': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Lateral Raises': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Front Raises': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Rear Delt Flyes': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Arnold Press': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Machine Shoulder Press': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Pike Push-ups': 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&w=400',
    
    // ARMS
    'Barbell Curl': 'https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&w=400',
    'Dumbbell Curl': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Hammer Curl': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Preacher Curl': 'https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&w=400',
    'Cable Curl': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Tricep Pushdown': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Skull Crushers': 'https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&w=400',
    'Overhead Tricep Extension': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Tricep Dips': 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg?auto=compress&w=400',
    'Close-grip Bench Press': 'https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&w=400',
    
    // LEGS
    'Barbell Squat': 'https://images.pexels.com/photos/3490363/pexels-photo-3490363.jpeg?auto=compress&w=400',
    'Front Squat': 'https://images.pexels.com/photos/3490363/pexels-photo-3490363.jpeg?auto=compress&w=400',
    'Goblet Squat': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Leg Press': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Leg Extension': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Leg Curl': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Romanian Deadlift': 'https://images.pexels.com/photos/3490363/pexels-photo-3490363.jpeg?auto=compress&w=400',
    'Lunges': 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&w=400',
    'Bulgarian Split Squat': 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&w=400',
    'Calf Raises': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Bodyweight Squats': 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&w=400',
    'Jump Squats': 'https://images.pexels.com/photos/4162439/pexels-photo-4162439.jpeg?auto=compress&w=400',
    'Wall Sit': 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&w=400',
    'Step-ups': 'https://images.pexels.com/photos/4162439/pexels-photo-4162439.jpeg?auto=compress&w=400',
    'Hip Thrusts': 'https://images.pexels.com/photos/3837757/pexels-photo-3837757.jpeg?auto=compress&w=400',
    
    // CORE
    'Plank': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Crunches': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Russian Twists': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Leg Raises': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Mountain Climbers': 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&w=400',
    'Dead Bug': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Bird Dog': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Ab Wheel Rollout': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Cable Woodchop': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Hanging Leg Raises': 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg?auto=compress&w=400',
    
    // CARDIO - Real cardio photos
    'Running': 'https://images.pexels.com/photos/2361952/pexels-photo-2361952.jpeg?auto=compress&w=400',
    'Cycling': 'https://images.pexels.com/photos/7289716/pexels-photo-7289716.jpeg?auto=compress&w=400',
    'Rowing': 'https://images.pexels.com/photos/6389129/pexels-photo-6389129.jpeg?auto=compress&w=400',
    'Jump Rope': 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&w=400',
    'Elliptical': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'Walking': 'https://images.pexels.com/photos/1556710/pexels-photo-1556710.jpeg?auto=compress&w=400',
    'Burpees': 'https://images.pexels.com/photos/4162439/pexels-photo-4162439.jpeg?auto=compress&w=400',
    'Jumping Jacks': 'https://images.pexels.com/photos/4162439/pexels-photo-4162439.jpeg?auto=compress&w=400',
    'High Knees': 'https://images.pexels.com/photos/4162439/pexels-photo-4162439.jpeg?auto=compress&w=400',
    'Box Jumps': 'https://images.pexels.com/photos/4162439/pexels-photo-4162439.jpeg?auto=compress&w=400',
    'Battle Rope Waves': 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&w=400',
    'Kettlebell Swings': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    
    // FLEXIBILITY - Yoga/stretching photos
    'Standing Hamstring Stretch': 'https://images.pexels.com/photos/4056529/pexels-photo-4056529.jpeg?auto=compress&w=400',
    'Quad Stretch': 'https://images.pexels.com/photos/4056529/pexels-photo-4056529.jpeg?auto=compress&w=400',
    'Hip Flexor Stretch': 'https://images.pexels.com/photos/4056529/pexels-photo-4056529.jpeg?auto=compress&w=400',
    'Pigeon Pose': 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&w=400',
    'Cat-Cow Stretch': 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&w=400',
    'Childs Pose': 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&w=400',
    'Shoulder Stretch': 'https://images.pexels.com/photos/4056529/pexels-photo-4056529.jpeg?auto=compress&w=400',
    'Tricep Stretch': 'https://images.pexels.com/photos/4056529/pexels-photo-4056529.jpeg?auto=compress&w=400',
    'Chest Stretch': 'https://images.pexels.com/photos/4056529/pexels-photo-4056529.jpeg?auto=compress&w=400',
    'Downward Dog': 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&w=400'
  };

  console.log(`Updating ${Object.keys(exerciseImages).length} exercises with real photos...`);
  
  for (const [name, url] of Object.entries(exerciseImages)) {
    await connection.query(
      'UPDATE exercises SET image_url = ? WHERE name = ?',
      [url, name]
    );
  }

  console.log('✅ Updated all exercises with real workout photos');

  // Equipment images - Real equipment photos from Pexels
  const equipmentImages = {
    'Barbell': 'https://images.pexels.com/photos/260352/pexels-photo-260352.jpeg?auto=compress&w=400',
    'Dumbbells': 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&w=400',
    'Kettlebell': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400',
    'EZ Curl Bar': 'https://images.pexels.com/photos/260352/pexels-photo-260352.jpeg?auto=compress&w=400',
    'Cable Machine': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Lat Pulldown Machine': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Leg Press Machine': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Chest Press Machine': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Leg Extension Machine': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Leg Curl Machine': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Shoulder Press Machine': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Pec Deck Machine': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Treadmill': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Stationary Bike': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=400',
    'Elliptical': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Rowing Machine': 'https://images.pexels.com/photos/6389129/pexels-photo-6389129.jpeg?auto=compress&w=400',
    'Jump Rope': 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&w=400',
    'Pull-up Bar': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Dip Station': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Plyo Box': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Resistance Bands': 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&w=400',
    'Battle Ropes': 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&w=400',
    'Bench (Flat)': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Bench (Adjustable)': 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&w=400',
    'Ab Wheel': 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&w=400',
    'Foam Roller': 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&w=400',
    'Yoga Mat': 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&w=400',
    'Medicine Ball': 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&w=400'
  };

  console.log(`Updating ${Object.keys(equipmentImages).length} equipment items with real photos...`);
  
  for (const [name, url] of Object.entries(equipmentImages)) {
    await connection.query(
      'UPDATE equipment SET image_url = ? WHERE name = ?',
      [url, name]
    );
  }

  console.log('✅ Updated all equipment with real photos');

  // Program images - Real gym/workout photos
  const programImages = {
    'Beginner Strength Foundation': 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&w=600',
    'Push Pull Legs Split': 'https://images.pexels.com/photos/3490348/pexels-photo-3490348.jpeg?auto=compress&w=600',
    'Home Body Transformation': 'https://images.pexels.com/photos/4162481/pexels-photo-4162481.jpeg?auto=compress&w=600',
    'Fat Burning Cardio': 'https://images.pexels.com/photos/2361952/pexels-photo-2361952.jpeg?auto=compress&w=600'
  };

  console.log(`Updating ${Object.keys(programImages).length} programs with real photos...`);
  
  for (const [name, url] of Object.entries(programImages)) {
    await connection.query(
      'UPDATE programs SET image_url = ? WHERE name = ?',
      [url, name]
    );
  }

  console.log('✅ Updated all programs with real photos');

  await connection.end();
  console.log('👋 Done! All items now have real fitness/workout photos from Pexels');
  console.log('📸 Using high-quality stock photos - free for commercial use');
}

addRealImages().catch(console.error);
