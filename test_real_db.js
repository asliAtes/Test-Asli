require('dotenv').config();
const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Connection pool configuration
const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: 'kreedos',
  connectionLimit: 10,
  connectTimeout: 20000,
  ssl: {
    rejectUnauthorized: true,
    // Eğer özel bir CA sertifikası kullanılıyorsa buraya eklenebilir
    // ca: fs.readFileSync('/path/to/ca.pem')
  }
});

async function checkTunnelStatus() {
  try {
    const { stdout } = await execAsync('lsof -i :3307');
    return stdout.includes('SSH');
  } catch (error) {
    return false;
  }
}

async function setupTunnel() {
  try {
    // Önce mevcut tüneli kontrol et
    const tunnelExists = await checkTunnelStatus();
    if (tunnelExists) {
      console.log('🔄 Existing tunnel found, killing it first...');
      await execAsync('pkill -f "ssh.*3307:kredos-dev-mysql"');
    }

    console.log('🔄 Setting up new SSH tunnel...');
    await execAsync('ssh -i cursor_docs/kredosai-dev.pem -L 3307:kredos-dev-mysql.cluster-c70f5cj9qhpu.us-east-2.rds.amazonaws.com:3306 ubuntu@3.133.216.212 -N -f');
    
    // Tünelin kurulması için kısa bir bekleme
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newTunnelExists = await checkTunnelStatus();
    if (!newTunnelExists) {
      throw new Error('Failed to establish SSH tunnel');
    }
    
    console.log('✅ SSH tunnel established successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to setup SSH tunnel:', error.message);
    return false;
  }
}

async function testRealConnection(retryCount = 3) {
  let connection;
  try {
    console.log('🌐 Testing database connection through SSH tunnel...');
    
    // Tünel kontrolü ve kurulumu
    const tunnelReady = await setupTunnel();
    if (!tunnelReady) {
      throw new Error('SSH tunnel setup failed');
    }

    // Pool'dan bağlantı al
    connection = await pool.getConnection();
    console.log('✅ Database connection successful!');

    // Test sorguları
    const [tables] = await connection.execute("SHOW TABLES LIKE 'mab_operational_reports_data'");
    console.log('📊 Table check:', tables.length > 0 ? 'mab_operational_reports_data exists' : 'Table not found');

    if (tables.length > 0) {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'kreedos'
        AND TABLE_NAME = 'mab_operational_reports_data' 
        AND COLUMN_NAME = 'rcs_sms_sent_count'
      `);
      console.log('🏗️ RCS column:', columns.length > 0 ? 'rcs_sms_sent_count exists' : 'Column not found');
    }

  } catch (error) {
    console.error('💥 Database connection error:', error.message);
    
    if (retryCount > 0) {
      console.log(`🔄 Retrying... (${retryCount} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return testRealConnection(retryCount - 1);
    }
    
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log('🔒 Connection released back to pool');
    }
  }
}

// Uygulama kapatıldığında pool'u temizle
process.on('SIGINT', async () => {
  try {
    await pool.end();
    await execAsync('pkill -f "ssh.*3307:kredos-dev-mysql"');
    console.log('\n👋 Cleaned up connections and tunnel');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
});

// Test başlat
testRealConnection()
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }); 