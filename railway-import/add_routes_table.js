const mysql = require('mysql2/promise');

async function addRoutesTable() {
  console.log('🔄 Connecting to Railway MySQL...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'mysql.railway.internal',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'railway',
    multipleStatements: true
  });

  console.log('✅ Connected!');

  try {
    // Check if routes table exists
    console.log('🔍 Checking if routes table exists...');
    const [tables] = await connection.query("SHOW TABLES LIKE 'routes'");
    
    if (tables.length > 0) {
      console.log('📋 Routes table already exists, checking structure...');
      
      // Check columns
      const [columns] = await connection.query("DESCRIBE routes");
      const columnNames = columns.map(c => c.Field);
      console.log('📊 Current columns:', columnNames.join(', '));
      
      // Check for missing columns and add them
      const requiredColumns = [
        { name: 'workout_id', sql: 'ALTER TABLE routes ADD COLUMN workout_id INT DEFAULT NULL' },
        { name: 'elevation_gain', sql: 'ALTER TABLE routes ADD COLUMN elevation_gain INT DEFAULT NULL' },
        { name: 'start_location', sql: 'ALTER TABLE routes ADD COLUMN start_location VARCHAR(255) DEFAULT NULL' },
        { name: 'end_location', sql: 'ALTER TABLE routes ADD COLUMN end_location VARCHAR(255) DEFAULT NULL' }
      ];

      for (const col of requiredColumns) {
        if (!columnNames.includes(col.name)) {
          console.log(`➕ Adding missing column: ${col.name}`);
          await connection.query(col.sql);
        }
      }
      
      console.log('✅ Routes table structure is up to date!');
    } else {
      console.log('📝 Creating routes table...');
      
      await connection.query(`
        CREATE TABLE routes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          activity_type ENUM('running', 'biking', 'walking', 'hiking') DEFAULT 'running',
          distance_km DECIMAL(8,2),
          estimated_duration INT,
          elevation_gain INT,
          waypoints JSON,
          start_location VARCHAR(255),
          end_location VARCHAR(255),
          is_favorite BOOLEAN DEFAULT FALSE,
          workout_id INT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_activity_type (activity_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ Routes table created!');
    }

    // Check if route_logs table exists
    console.log('🔍 Checking if route_logs table exists...');
    const [logTables] = await connection.query("SHOW TABLES LIKE 'route_logs'");
    
    if (logTables.length === 0) {
      console.log('📝 Creating route_logs table...');
      
      await connection.query(`
        CREATE TABLE route_logs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          route_id INT,
          activity_type ENUM('running', 'biking', 'walking', 'hiking') DEFAULT 'running',
          distance_km DECIMAL(8,2),
          duration_minutes INT,
          avg_pace DECIMAL(5,2),
          calories_burned INT,
          notes TEXT,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
          INDEX idx_user_id (user_id),
          INDEX idx_route_id (route_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ Route_logs table created!');
    } else {
      console.log('✅ Route_logs table already exists!');
    }

    // Check if workouts table has route_id column
    console.log('🔍 Checking workouts table for route_id column...');
    const [workoutCols] = await connection.query("DESCRIBE workouts");
    const workoutColNames = workoutCols.map(c => c.Field);
    
    if (!workoutColNames.includes('route_id')) {
      console.log('➕ Adding route_id column to workouts table...');
      await connection.query('ALTER TABLE workouts ADD COLUMN route_id INT DEFAULT NULL');
      console.log('✅ route_id added to workouts!');
    } else {
      console.log('✅ workouts.route_id already exists!');
    }

    console.log('');
    console.log('🎉 All done! Routes feature is ready to use.');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }

  await connection.end();
  console.log('👋 Connection closed.');
  process.exit(0);
}

addRoutesTable().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
