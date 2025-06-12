import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import * as mysql from 'mysql2/promise';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let connection: mysql.Connection | null = null;
let tunnelProcess: any = null;

interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectTimeout: number;
}

interface SSHConfig {
    pemFile: string;
    remoteUser: string;
    bastionHost: string;
    localPort: number;
    remoteHost: string;
    remotePort: number;
}

Before({ tags: '@rcs-database-ssh' }, async function () {
    console.log('🚀 Starting SSH tunnel database test setup...');
});

After({ tags: '@rcs-database-ssh' }, async function () {
    console.log('🔄 Cleaning up database and SSH tunnel...');
    
    if (connection) {
        await connection.end();
        console.log('🔄 Database connection closed');
    }
    
    if (tunnelProcess) {
        tunnelProcess.kill();
        console.log('🔄 SSH tunnel closed');
    }
});

Given('I have SSH tunnel configuration for RDS access', async function () {
    const sshConfig: SSHConfig = {
        pemFile: './src/main/docs/cursor/cursor_docs/kredosai-dev.pem',
        remoteUser: 'ubuntu',
        bastionHost: '@3.133.216.212',
        localPort: 3307,
        remoteHost: 'kredos-dev-mysql.cluster-c70f5cj9qhpu.us-east-2.rds.amazonaws.com',
        remotePort: 3306
    };
    
    console.log(`🔗 SSH Tunnel: ${sshConfig.remoteUser}${sshConfig.bastionHost}`);
    console.log(`🔗 Tunnel: localhost:${sshConfig.localPort} -> ${sshConfig.remoteHost}:${sshConfig.remotePort}`);
    
    (this as any).sshConfig = sshConfig;
});

When('I establish SSH tunnel to database', async function () {
    const sshConfig = (this as any).sshConfig as SSHConfig;
    
    console.log('⏳ Setting up SSH tunnel...');
    
    const sshCommand = `ssh -i ${sshConfig.pemFile} -L ${sshConfig.localPort}:${sshConfig.remoteHost}:${sshConfig.remotePort} ${sshConfig.remoteUser}${sshConfig.bastionHost} -N`;
    
    console.log('📡 Starting SSH tunnel in background...');
    
    // Start SSH tunnel in background
    tunnelProcess = exec(sshCommand);
    
    // Wait for tunnel to establish
    console.log('⏳ Waiting for SSH tunnel to establish...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ SSH tunnel setup complete');
});

When('I connect to the database through SSH tunnel', async function () {
    const sshConfig = (this as any).sshConfig as SSHConfig;
    
    const dbConfig: DatabaseConfig = {
        host: 'localhost',
        port: sshConfig.localPort,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'xBk6sStw*rZv',
        database: process.env.DB_NAME || 'kreedos',
        connectTimeout: 30000
    };
    
    console.log('🗄️ Testing database connection through SSH tunnel...');
    
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ DATABASE CONNECTION SUCCESSFUL via SSH tunnel!');
        
        (this as any).dbConnection = connection;
        
    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            throw new Error('SSH tunnel may not be established yet, wait longer');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            throw new Error('Database credentials are incorrect');
        }
        throw new Error(`Database connection failed: ${error.message}`);
    }
});

Then('I should be able to validate RCS schema in the database', async function () {
    console.log('📊 Validating RCS schema...');
    
    if (!connection) {
        throw new Error('Database connection not established');
    }
    
    // Check if table exists
    const [tables] = await connection.execute(`
        SHOW TABLES LIKE 'mab_operational_reports_data'
    `) as any[];
    
    expect(tables.length).toBeGreaterThan(0);
    console.log('✅ mab_operational_reports_data table found');
    
    // Check RCS column
    const [columns] = await connection.execute(`
        SHOW COLUMNS FROM mab_operational_reports_data LIKE 'rcs_sms_sent_count'
    `) as any[];
    
    expect(columns.length).toBeGreaterThan(0);
    console.log('✅ rcs_sms_sent_count column exists!');
    
    const col = columns[0];
    console.log(`   Field: ${col.Field}`);
    console.log(`   Type: ${col.Type}`);
    console.log(`   Null: ${col.Null}`);
    console.log(`   Default: ${col.Default}`);
    
    (this as any).schemaValidated = true;
});

Then('I should be able to discover the complete table structure', async function () {
    console.log('📊 Discovering table structure...');
    
    if (!connection) {
        throw new Error('Database connection not established');
    }
    
    // Get all columns in the table
    const [allColumns] = await connection.execute(`
        DESCRIBE mab_operational_reports_data
    `) as any[];
    
    expect(allColumns.length).toBeGreaterThan(0);
    
    console.log('📋 All table columns:');
    allColumns.forEach((col: any, index: number) => {
        console.log(`   ${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} - Default: ${col.Default}`);
    });
    
    // Look for communication type related columns
    const commTypeColumns = allColumns.filter((col: any) => 
        col.Field.toLowerCase().includes('comm') || 
        col.Field.toLowerCase().includes('type') ||
        col.Field.toLowerCase().includes('message')
    );
    
    console.log('\n📋 Communication/Type related columns:');
    commTypeColumns.forEach((col: any) => {
        console.log(`   - ${col.Field} (${col.Type})`);
    });
    
    (this as any).tableStructure = allColumns;
});

Then('I should find RCS data records in the database', async function () {
    console.log('📊 Validating RCS data records...');
    
    if (!connection) {
        throw new Error('Database connection not established');
    }
    
    // Count RCS records
    const [rcsCount] = await connection.execute(`
        SELECT COUNT(*) as total_rcs_records
        FROM mab_operational_reports_data 
        WHERE rcs_sms_sent_count IS NOT NULL 
        AND rcs_sms_sent_count > 0
    `) as any[];
    
    const totalRecords = rcsCount[0].total_rcs_records;
    console.log(`📊 Total RCS records: ${totalRecords}`);
    
    expect(totalRecords).toBeGreaterThan(0);
    
    // Get sample data
    const [sampleData] = await connection.execute(`
        SELECT *
        FROM mab_operational_reports_data 
        WHERE rcs_sms_sent_count IS NOT NULL 
        AND rcs_sms_sent_count > 0
        LIMIT 3
    `) as any[];
    
    if (sampleData.length > 0) {
        console.log('\n📊 Sample RCS data structure:');
        sampleData.forEach((row: any, index: number) => {
            console.log(`   Record ${index + 1}:`);
            Object.keys(row).forEach(key => {
                if (key.includes('rcs') || key.includes('type') || key.includes('comm') || key.includes('customer') || key.includes('date')) {
                    console.log(`      ${key}: ${row[key]}`);
                }
            });
            console.log('');
        });
    }
    
    (this as any).rcsRecordsFound = totalRecords;
});

When('I search for test data from date {string}', async function (testDate: string) {
    console.log(`📊 Searching for test data from ${testDate}...`);
    
    if (!connection) {
        throw new Error('Database connection not established');
    }
    
    const allColumns = (this as any).tableStructure;
    
    // Find date columns
    const dateColumns = allColumns.filter((col: any) => 
        col.Field.toLowerCase().includes('date') ||
        col.Field.toLowerCase().includes('time') ||
        col.Field.toLowerCase().includes('created') ||
        col.Field.toLowerCase().includes('sent')
    );
    
    if (dateColumns.length > 0) {
        const dateColumn = dateColumns[0].Field;
        console.log(`📅 Using date column: ${dateColumn}`);
        
        const [testData] = await connection.execute(`
            SELECT *
            FROM mab_operational_reports_data 
            WHERE DATE(${dateColumn}) = ?
            AND rcs_sms_sent_count IS NOT NULL
            LIMIT 5
        `, [testDate]) as any[];
        
        console.log(`📊 Found ${testData.length} records for ${testDate}`);
        
        if (testData.length > 0) {
            testData.forEach((row: any, index: number) => {
                console.log(`   Record ${index + 1}:`);
                console.log(`      RCS Count: ${row.rcs_sms_sent_count}`);
                console.log(`      Date: ${row[dateColumn]}`);
                
                Object.keys(row).forEach(key => {
                    if (key.includes('customer') || key.includes('phone') || key.includes('type')) {
                        console.log(`      ${key}: ${row[key]}`);
                    }
                });
                console.log('');
            });
            
            // Check for specific values
            const twoValueRecords = testData.filter((r: any) => r.rcs_sms_sent_count === 2);
            if (twoValueRecords.length > 0) {
                console.log(`✅ VERIFIED: Found ${twoValueRecords.length} records with RCS count = 2 (matches UI!)`);
            }
        }
        
        (this as any).testDataFound = testData.length;
    } else {
        console.log('⚠️ No date columns found for test data search');
        (this as any).testDataFound = 0;
    }
});

Then('I should be able to analyze data integrity and distribution', async function () {
    console.log('📊 Analyzing data integrity and distribution...');
    
    if (!connection) {
        throw new Error('Database connection not established');
    }
    
    // Data integrity check
    const [integrityStats] = await connection.execute(`
        SELECT 
            MIN(rcs_sms_sent_count) as min_rcs,
            MAX(rcs_sms_sent_count) as max_rcs,
            AVG(rcs_sms_sent_count) as avg_rcs,
            COUNT(*) as total_rcs_records,
            COUNT(DISTINCT rcs_sms_sent_count) as unique_rcs_values
        FROM mab_operational_reports_data 
        WHERE rcs_sms_sent_count IS NOT NULL
        AND rcs_sms_sent_count > 0
    `) as any[];
    
    const stats = integrityStats[0];
    console.log('📊 RCS Data Integrity:');
    console.log(`   Min RCS Count: ${stats.min_rcs}`);
    console.log(`   Max RCS Count: ${stats.max_rcs}`);
    console.log(`   Avg RCS Count: ${stats.avg_rcs}`);
    console.log(`   Total RCS Records: ${stats.total_rcs_records}`);
    console.log(`   Unique RCS Values: ${stats.unique_rcs_values}`);
    
    expect(stats.total_rcs_records).toBeGreaterThan(0);
    expect(stats.min_rcs).toBeGreaterThanOrEqual(0);
    expect(stats.max_rcs).toBeGreaterThan(0);
    
    // Value distribution
    const [valueDistribution] = await connection.execute(`
        SELECT 
            rcs_sms_sent_count as rcs_value,
            COUNT(*) as frequency
        FROM mab_operational_reports_data 
        WHERE rcs_sms_sent_count IS NOT NULL
        AND rcs_sms_sent_count > 0
        GROUP BY rcs_sms_sent_count
        ORDER BY frequency DESC
        LIMIT 10
    `) as any[];
    
    console.log('📊 RCS Value Distribution:');
    valueDistribution.forEach((row: any) => {
        console.log(`   RCS Count ${row.rcs_value}: ${row.frequency} records`);
        if (row.rcs_value === 2) {
            console.log(`      ✅ Found the "2" value from UI! (${row.frequency} records)`);
        }
    });
    
    expect(valueDistribution.length).toBeGreaterThan(0);
    
    (this as any).dataIntegrityValidated = true;
});

Then('the database validation should be complete and successful', async function () {
    console.log('\n🎉 SSH TUNNEL DATABASE TEST: SUCCESS!');
    console.log('✅ SSH Tunnel: ESTABLISHED');
    console.log('✅ Database Connection: WORKING');
    console.log('✅ RCS Schema: VALIDATED');
    console.log('✅ RCS Column: FOUND');
    console.log(`✅ RCS Data: ${(this as any).rcsRecordsFound} records found`);
    console.log('✅ Data Structure: ANALYZED');
    console.log('✅ Data Integrity: CHECKED');
    console.log('🎯 DEV-1044: DATABASE LEVEL FULLY VALIDATED!');
    
    // Verify all validation steps completed
    expect((this as any).schemaValidated).toBeTruthy();
    expect((this as any).rcsRecordsFound).toBeGreaterThan(0);
    expect((this as any).dataIntegrityValidated).toBeTruthy();
    
    console.log('\n📋 FINAL DATABASE VALIDATION: COMPLETE SUCCESS!');
}); 