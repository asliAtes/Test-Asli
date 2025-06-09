require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Xray Cloud API endpoints
const AUTH_URL = 'https://xray.cloud.getxray.app/api/v2/authenticate';
const IMPORT_URL = 'https://xray.cloud.getxray.app/api/v2/import/feature';

// Your Xray Cloud credentials
const CLIENT_ID = 'CFC840D6062B4AE9921E8BFEFB99A800';
const CLIENT_SECRET = '1b5c61346d7632fcbe1338336dbe36848b4c92e4c6c6421920d368c2b43f02d6';
const PROJECT_KEY = 'QA';

// Feature files to process
const FEATURE_FILES = [
    'tests/features/DEV-1003/DEV_1003_Create_RCS_Tab.feature',
    'tests/features/DEV-1004/DEV_1004_Add_RCS_Graphs.feature',
    'tests/features/DEV-1005/DEV_1005_Add_RCS_Tables.feature'
];

async function getAuthToken() {
    try {
        console.log('Attempting to authenticate with Xray...');
        console.log('Using Client ID:', CLIENT_ID);
        
        const response = await axios.post(AUTH_URL, {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        });
        
        console.log('Authentication token received');
        return response.data;
    } catch (error) {
        console.error('Error getting auth token:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        throw error;
    }
}

async function importFeature(token, filePath) {
    try {
        console.log('Sending feature file to Xray...');
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        
        const response = await axios.post(`${IMPORT_URL}?projectKey=${PROJECT_KEY}`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error importing feature:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        throw error;
    }
}

async function processFeatureFiles() {
    try {
        console.log('Starting Xray export process...');
        console.log('Using Project Key:', PROJECT_KEY);
        
        // Get authentication token
        const token = await getAuthToken();
        console.log('Authentication successful');

        // Process each feature file
        for (const filePath of FEATURE_FILES) {
            console.log(`\nProcessing ${filePath}...`);
            
            if (!fs.existsSync(filePath)) {
                console.error(`File not found: ${filePath}`);
                continue;
            }
            
            // Import to Xray
            const result = await importFeature(token, filePath);
            console.log(`Successfully imported ${path.basename(filePath)}`);
            console.log('Test cases created/updated:', result);
        }

        console.log('\nAll features have been successfully exported to Xray!');
    } catch (error) {
        console.error('\nError during export:', error.message);
        process.exit(1);
    }
}

// Run the export
processFeatureFiles(); 