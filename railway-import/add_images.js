const mysql = require('mysql2/promise');

async function addImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'mysql.railway.internal',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'railway'
  });

  console.log('✅ Connected to database');

  // Add placeholder image for exercises (using a generic fitness image placeholder)
  await connection.query(`
    UPDATE exercises 
    SET image_url = CONCAT('https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=', REPLACE(name, ' ', '+'))
    WHERE image_url IS NULL
  `);

  console.log('✅ Added placeholder images to exercises');

  // Add placeholder image for equipment
  await connection.query(`
    UPDATE equipment 
    SET image_url = CONCAT('https://via.placeholder.com/300x300/10B981/FFFFFF?text=', REPLACE(name, ' ', '+'))
    WHERE image_url IS NULL
  `);

  console.log('✅ Added placeholder images to equipment');

  // Add placeholder image for programs
  await connection.query(`
    UPDATE programs 
    SET image_url = CONCAT('https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=', REPLACE(name, ' ', '+'))
    WHERE image_url IS NULL
  `);

  console.log('✅ Added placeholder images to programs');

  await connection.end();
  console.log('👋 Done! All items now have placeholder images');
}

addImages().catch(console.error);
