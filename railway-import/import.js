const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
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

  // Use the complete installation file (fitflow_complete.sql)
  const sqlFile = path.join(__dirname, 'fitflow_complete.sql');
  console.log('📄 Reading SQL file:', sqlFile);
  
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('📊 Executing SQL...');
  
  try {
    await connection.query(sql);
    console.log('✅ Database imported successfully!');
    console.log('🎉 All tables and data created!');
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }

  await connection.end();
  console.log('👋 Done!');
  process.exit(0);
}

importDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
