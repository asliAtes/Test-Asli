const mysql = require('mysql2/promise');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const FormData = require('form-data');
require('dotenv').config();

const XRAY_API_BASE_URL = 'https://xray.cloud.getxray.app/api/v2';
const AUTH_URL = `${XRAY_API_BASE_URL}/authenticate`;
const IMPORT_URL = `${XRAY_API_BASE_URL}/import/feature`;
const SEARCH_URL = `${XRAY_API_BASE_URL}/graphql`;

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

async function getXrayToken() {
    try {
        const response = await axios.post(AUTH_URL, {
            client_id: process.env.XRAY_CLIENT_ID,
            client_secret: process.env.XRAY_CLIENT_SECRET
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error getting token:', error.message);
        throw error;
    }
}

async function searchTestByName(testName, token) {
    try {
        const response = await axios.post(
            SEARCH_URL,
            {
                query: `
                    query SearchTest($jql: String!) {
                        getTests(jql: $jql) {
                            total
                            results {
                                jira(fields: ["key"])
                            }
                        }
                    }
                `,
                variables: {
                    jql: `project = QA AND issuetype = Test AND summary ~ "${testName}"`
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const tests = response.data?.data?.getTests?.results || [];
        return tests.length > 0 ? tests[0].jira.key : null;
    } catch (error) {
        console.error('❌ Error searching test:', error.message);
        return null;
    }
}

async function importFeatureFile(filePath, token) {
    try {
        // Feature dosyasını oku ve senaryo isimlerini çıkar
        const content = fs.readFileSync(filePath, 'utf-8');
        const scenarios = content.match(/Scenario:?\s*(.+)$/gm) || [];
        
        // Her senaryo için kontrol et
        for (const scenario of scenarios) {
            const scenarioName = scenario.replace(/Scenario:?\s*/, '').trim();
            const existingTest = await searchTestByName(scenarioName, token);
            
            if (existingTest) {
                console.log(`⏭️ Test case already exists for "${scenarioName}" (${existingTest}), skipping...`);
                continue;
            }
        }

        // Eğer yeni senaryolar varsa, feature dosyasını import et
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        
        await axios.post(IMPORT_URL, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(`✅ Imported new scenarios from: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error importing file ${filePath}:`, error.message);
        throw error;
    }
}

async function main(targetTag) {
    try {
        console.log('🔍 Getting Xray authentication token...');
        const token = await getXrayToken();
        console.log('✅ Token obtained successfully');

        console.log(`🔍 Searching for feature files with tag: ${targetTag}`);
        const featureFiles = glob.sync('src/tests/e2e/features/DEV-958/DEV-1044/**/*.feature');
        console.log(`📁 Found ${featureFiles.length} feature files`);

        for (const file of featureFiles) {
            console.log(`\n📖 Processing file: ${file}`);
            const content = fs.readFileSync(file, 'utf-8');
            if (content.includes(targetTag)) {
                console.log(`🎯 Found matching tag in: ${file}`);
                try {
                    await importFeatureFile(file, token);
                } catch (error) {
                    console.error(`❌ Error importing ${file}:`, error.message);
                }
            } else {
                console.log(`⏭️ Skipping ${file} - tag not found`);
            }
        }
        
        console.log('\n✅ Import process completed');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

const targetTag = process.argv[2];
if (!targetTag) {
    console.error('Please provide a tag (e.g., @DEV-1044)');
    process.exit(1);
}
main(targetTag); 