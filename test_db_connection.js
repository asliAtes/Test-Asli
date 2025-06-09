const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔗 Testing database connection through SSH tunnel...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'xBk6sStw*rZv',
      database: 'kreedos',
      port: 3306,
      timeout: 60000,
      connectTimeout: 60000
    });
    
    console.log('✅ Database connection successful!');
    
    // Test basic query
    const [rows] = await connection.execute("SHOW TABLES LIKE 'mab_operational_reports_data'");
    console.log('📊 Table check:', rows.length > 0 ? 'mab_operational_reports_data exists' : 'Table not found');
    
    // Test column exists
    if (rows.length > 0) {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'kreedos'
        AND TABLE_NAME = 'mab_operational_reports_data' 
        AND COLUMN_NAME = 'rcs_sms_sent_count'
      `);
      console.log('🏗️ Column check:', columns.length > 0 ? 'rcs_sms_sent_count column exists' : 'Column not found');
    }
    
    await connection.end();
    console.log('🔒 Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection(); 