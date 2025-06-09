require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Xray API configuration for Xray Cloud
const XRAY_API_BASE_URL = 'https://xray.cloud.getxray.app/api/v2';
const PROJECT_KEY = process.env.JIRA_PROJECT_KEY || 'QA';

/**
 * Get an authentication token from Xray Cloud
 */
async function getXrayToken() {
    try {
        console.log('Getting Xray authentication token...');
        
        const response = await axios.post(
            `${XRAY_API_BASE_URL}/authenticate`,
            {
                client_id: process.env.XRAY_CLIENT_ID,
                client_secret: process.env.XRAY_CLIENT_SECRET
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Successfully obtained Xray authentication token');
        return response.data;
        
    } catch (error) {
        console.error('Error getting Xray token:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Import Cucumber JSON test results to Xray
 */
async function importCucumberTests(token, cucumberJsonFilePath) {
    try {
        console.log(`Importing Cucumber tests from ${cucumberJsonFilePath}...`);
        
        // Read the JSON file
        const fileContent = fs.readFileSync(cucumberJsonFilePath);
        
        // Create form data
        const formData = new FormData();
        formData.append('file', fileContent, {
            filename: 'cucumber.json',
            contentType: 'application/json'
        });
        
        console.log('Uploading to Xray...');
        
        const response = await axios.post(
            `${XRAY_API_BASE_URL}/import/execution/cucumber`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...formData.getHeaders()
                },
                params: {
                    projectKey: PROJECT_KEY
                }
            }
        );
        
        console.log('Import successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data;
        
    } catch (error) {
        console.error('Error importing tests:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Import Cucumber feature to Xray (creates test cases)
 */
async function importCucumberFeature(token, cucumberJsonFilePath) {
    try {
        console.log(`Importing Cucumber feature from ${cucumberJsonFilePath}...`);
        
        // Read the JSON file
        const fileContent = fs.readFileSync(cucumberJsonFilePath);
        
        // Create form data
        const formData = new FormData();
        formData.append('file', fileContent, {
            filename: 'cucumber.json',
            contentType: 'application/json'
        });
        
        console.log('Uploading feature to Xray...');
        
        const response = await axios.post(
            `${XRAY_API_BASE_URL}/import/feature`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...formData.getHeaders()
                },
                params: {
                    projectKey: PROJECT_KEY
                }
            }
        );
        
        console.log('Feature import successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data;
        
    } catch (error) {
        console.error('Error importing feature:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Alternative approach: Create test cases directly via Jira API
 */
async function createTestCasesViaJira(featuresAndScenarios) {
    const auth = {
        username: process.env.JIRA_USER_EMAIL,
        password: process.env.JIRA_API_TOKEN
    };
    
    const createdIssues = [];
    
    for (const feature of featuresAndScenarios) {
        for (const scenario of feature.scenarios) {
            try {
                console.log(`Creating test case for scenario: ${scenario.name}`);
                
                // Extract DEV-number from tags if available
                const devTag = scenario.tags.find(tag => tag.match(/@DEV-\d+-TC\d+/));
                const summary = devTag ? 
                    `[${devTag.replace('@', '')}] ${scenario.name}` : 
                    `[DEV-1018] ${scenario.name}`;
                
                const testCase = {
                    fields: {
                        project: {
                            key: PROJECT_KEY
                        },
                        summary: summary,
                        description: scenario.description || `Steps:\n${scenario.steps.join('\n')}`,
                        issuetype: {
                            name: 'Test'
                        },
                        labels: scenario.tags.map(tag => tag.replace('@', ''))
                    }
                };
                
                const response = await axios.post(
                    `${process.env.JIRA_BASE_URL}/issue`,
                    testCase,
                    { auth }
                );
                
                console.log(`Created test case: ${response.data.key}`);
                createdIssues.push(response.data);
                
            } catch (error) {
                console.error(`Error creating test case for "${scenario.name}":`, error.response?.data || error.message);
            }
        }
    }
    
    return createdIssues;
}

/**
 * Parse a feature file to extract scenarios and tags
 */
function parseFeatureFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const feature = {
        name: '',
        description: '',
        tags: [],
        scenarios: []
    };
    
    let currentSection = 'none';
    let currentScenario = null;
    let featureDescription = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip comments and empty lines
        if (line.startsWith('#') || line === '') {
            continue;
        }
        
        // Parse feature tags
        if (line.startsWith('@') && currentSection === 'none') {
            feature.tags = line.split('@')
                .filter(tag => tag.trim() !== '')
                .map(tag => '@' + tag.trim());
            continue;
        }
        
        // Parse feature name
        if (line.startsWith('Feature:')) {
            currentSection = 'feature';
            feature.name = line.substring('Feature:'.length).trim();
            continue;
        }
        
        // Collect feature description
        if (currentSection === 'feature' && !line.startsWith('Background:') && !line.startsWith('@') && !line.startsWith('Scenario:')) {
            featureDescription.push(line);
            continue;
        }
        
        // Handle Background section
        if (line.startsWith('Background:')) {
            currentSection = 'background';
            continue;
        }
        
        // Parse scenario tags
        if (line.startsWith('@') && (currentSection === 'feature' || currentSection === 'background' || currentSection === 'scenario')) {
            if (currentScenario) {
                feature.scenarios.push(currentScenario);
            }
            
            currentScenario = {
                name: '',
                description: '',
                tags: line.split('@')
                    .filter(tag => tag.trim() !== '')
                    .map(tag => '@' + tag.trim()),
                steps: []
            };
            continue;
        }
        
        // Parse scenario name
        if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:')) {
            currentSection = 'scenario';
            if (!currentScenario) {
                currentScenario = {
                    name: '',
                    description: '',
                    tags: [],
                    steps: []
                };
            }
            currentScenario.name = line.replace('Scenario:', '').replace('Scenario Outline:', '').trim();
            continue;
        }
        
        // Collect scenario steps
        if (currentSection === 'scenario' && 
            (line.startsWith('Given') || line.startsWith('When') || line.startsWith('Then') || 
             line.startsWith('And') || line.startsWith('But'))) {
            currentScenario.steps.push(line);
            continue;
        }
    }
    
    // Add the last scenario if exists
    if (currentScenario) {
        feature.scenarios.push(currentScenario);
    }
    
    // Set feature description
    feature.description = featureDescription.join('\n').trim();
    
    return feature;
}

// Main function
async function main() {
    try {
        const cucumberJsonFile = 'exports/xray/DEV_1018_cucumber.json';
        const featureFile = 'tests/features/active/DEV-1018/DEV_1018_Ban_Macro_Archival.feature';
        
        console.log(`Using Cucumber JSON file: ${cucumberJsonFile}`);
        
        // Try direct Xray Cloud import first
        try {
            const token = await getXrayToken();
            
            // Try feature import first (creates test cases)
            await importCucumberFeature(token, cucumberJsonFile);
            console.log('Successfully imported feature to Xray!');
            
            // Then import test results (creates test execution)
            await importCucumberTests(token, cucumberJsonFile);
            console.log('Successfully imported test results to Xray!');
            
        } catch (xrayError) {
            console.error('Error with Xray import:', xrayError.message);
            
            // Fall back to Jira API if Xray import fails
            console.log('Falling back to Jira API for test case creation...');
            const feature = parseFeatureFile(featureFile);
            const createdIssues = await createTestCasesViaJira([feature]);
            
            if (createdIssues.length > 0) {
                console.log(`Successfully created ${createdIssues.length} test cases via Jira API!`);
                console.log('Created test cases:');
                createdIssues.forEach(issue => {
                    console.log(`- ${issue.key}: ${issue.self}`);
                });
            } else {
                console.error('Failed to create any test cases.');
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run the main function
main(); 