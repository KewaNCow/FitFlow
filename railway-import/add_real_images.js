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

  // Equipment images from Unsplash (free fitness equipment photos)
  const equipmentImages = {
    'Barbell': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
    'Dumbbells': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    'Kettlebell': 'https://images.unsplash.com/photo-1517344800994-0f4b41048b59?w=400',
    'Cable Machine': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    'Treadmill': 'https://images.unsplash.com/photo-1591258370814-01609b341790?w=400',
    'Stationary Bike': 'https://images.unsplash.com/photo-1576678927484-cc907957c72b?w=400',
    'Rowing Machine': 'https://images.unsplash.com/photo-1576697176128-86d66e5e2f86?w=400',
    'Pull-up Bar': 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400',
    'Yoga Mat': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    'Jump Rope': 'https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=400',
    'Resistance Bands': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
    'Medicine Ball': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  };

  for (const [name, url] of Object.entries(equipmentImages)) {
    await connection.query(
      'UPDATE equipment SET image_url = ? WHERE name = ?',
      [url, name]
    );
  }

  // Exercise images by muscle group
  const exerciseImages = {
    // Chest exercises
    'Bench Press': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    'Push-ups': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    'Dumbbell Bench Press': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
    
    // Back exercises
    'Deadlift': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    'Pull-ups': 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400',
    'Barbell Row': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    
    // Legs
    'Barbell Squat': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
    'Lunges': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    
    // Cardio
    'Running': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400',
    'Cycling': 'https://images.unsplash.com/photo-1576678927484-cc907957c72b?w=400',
    'Jump Rope': 'https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=400',
    'Burpees': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    
    // Flexibility
    'Downward Dog': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    'Childs Pose': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'
  };

  for (const [name, url] of Object.entries(exerciseImages)) {
    await connection.query(
      'UPDATE exercises SET image_url = ? WHERE name = ?',
      [url, name]
    );
  }

  // Generic images for exercises without specific ones
  await connection.query(`
    UPDATE exercises 
    SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
    WHERE image_url IS NULL AND category = 'strength'
  `);

  await connection.query(`
    UPDATE exercises 
    SET image_url = 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400'
    WHERE image_url IS NULL AND category = 'cardio'
  `);

  await connection.query(`
    UPDATE exercises 
    SET image_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400'
    WHERE image_url IS NULL AND category = 'flexibility'
  `);

  await connection.query(`
    UPDATE exercises 
    SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
    WHERE image_url IS NULL
  `);

  console.log('✅ Added real images to exercises');

  // Program images
  const programImages = {
    'Beginner Strength Foundation': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
    'Push Pull Legs Split': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
    'Home Body Transformation': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
    'Fat Burning Cardio': 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600'
  };

  for (const [name, url] of Object.entries(programImages)) {
    await connection.query(
      'UPDATE programs SET image_url = ? WHERE name = ?',
      [url, name]
    );
  }

  // Generic image for remaining programs
  await connection.query(`
    UPDATE programs 
    SET image_url = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'
    WHERE image_url IS NULL
  `);

  console.log('✅ Added real images to programs');

  // Generic image for equipment without specific ones
  await connection.query(`
    UPDATE equipment 
    SET image_url = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'
    WHERE image_url IS NULL
  `);

  console.log('✅ Added real images to equipment');

  await connection.end();
  console.log('👋 Done! All items now have real fitness images from Unsplash');
}

addRealImages().catch(console.error);
