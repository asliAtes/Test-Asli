const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Xray API configuration
const config = {
    baseURL: process.env.JIRA_BASE_URL || 'https://your-jira-instance/rest/api/2',
    headers: {
        'Authorization': `Bearer ${process.env.JIRA_API_TOKEN}`,
        'Content-Type': 'application/json'
    }
};

// Feature file'ları oku
function getFeatureFiles(directory) {
    return fs.readdirSync(directory)
        .filter(file => file.endsWith('.feature'))
        .map(file => path.join(directory, file));
}

// Test run oluştur
async function createTestRun(featureFile) {
    const testRun = {
        fields: {
            project: {
                key: process.env.JIRA_PROJECT_KEY || 'YOUR_PROJECT_KEY'
            },
            summary: `Test Run for ${path.basename(featureFile)}`,
            description: `Automated test run for ${featureFile}`,
            issuetype: {
                name: 'Test Execution'
            }
        }
    };

    try {
        const response = await axios.post(`${config.baseURL}/issue`, testRun, config);
        return response.data;
    } catch (error) {
        console.error('Error creating test run:', error);
    }
}

// Test sonuçlarını güncelle
async function updateTestResults(testRunKey, results) {
    const update = {
        testExecutionKey: testRunKey,
        tests: results.map(result => ({
            testKey: result.testKey,
            status: result.status,
            comment: result.comment
        }))
    };

    try {
        await axios.post(`${config.baseURL}/xray/import/execution`, update, config);
    } catch (error) {
        console.error('Error updating test results:', error);
    }
}

// Feature file'ı active klasörüne kopyala
function copyFeatureToActive(featureFile) {
    const fileName = path.basename(featureFile);
    const activePath = path.join('tests/features/active', fileName);
    fs.copyFileSync(featureFile, activePath);
    return activePath;
}

// Feature file'ı backup'a geri taşı
function moveFeatureToBackup(featureFile) {
    const fileName = path.basename(featureFile);
    const backupPath = path.join('tests/features/backup', fileName);
    fs.renameSync(featureFile, backupPath);
}

module.exports = {
    getFeatureFiles,
    createTestRun,
    updateTestResults,
    copyFeatureToActive,
    moveFeatureToBackup
}; 