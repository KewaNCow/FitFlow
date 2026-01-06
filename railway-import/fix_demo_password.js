const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixDemoPassword() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'mysql.railway.internal',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'railway'
  });

  console.log('✅ Connected to database');

  // Generate correct hash for demo123
  const salt = await bcrypt.genSalt(10);
  const demoHash = await bcrypt.hash('demo123', salt);

  console.log(`New hash for demo123: ${demoHash}`);

  // Update demo user
  await connection.query(
    'UPDATE users SET password = ? WHERE email = ?',
    [demoHash, 'demo@fitflow.com']
  );

  console.log('✅ Demo user password updated to: demo123');

  await connection.end();
  console.log('👋 Done!');
}

fixDemoPassword().catch(console.error);
