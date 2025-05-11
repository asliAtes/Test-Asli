require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Xray API configuration
const config = {
    baseURL: process.env.JIRA_BASE_URL,
    headers: {
        'Authorization': 'Basic ' + Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64'),
        'Content-Type': 'application/json'
    }
};

// Feature file'ı parse et
function parseFeatureFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let feature = {
        name: '',
        description: [],
        tags: [],
        scenarios: []
    };
    
    let currentScenario = null;
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('@')) {
            const tags = line.split('@').filter(t => t).map(t => t.trim());
            if (currentScenario) {
                currentScenario.tags.push(...tags);
            } else {
                feature.tags.push(...tags);
            }
        }
        else if (line.startsWith('Feature:')) {
            feature.name = line.replace('Feature:', '').trim();
        }
        else if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:')) {
            if (currentScenario) {
                feature.scenarios.push(currentScenario);
            }
            currentScenario = {
                name: line.replace('Scenario:', '').replace('Outline:', '').trim(),
                description: '',
                tags: [],
                steps: []
            };
        }
        else if (line.startsWith('Given ') || line.startsWith('When ') || line.startsWith('Then ') || line.startsWith('And ') || line.startsWith('But ')) {
            if (currentScenario) {
                currentScenario.steps.push(line);
            }
        }
        else if (line && !currentScenario) {
            feature.description.push(line);
        }
        else if (line && currentScenario) {
            if (!currentScenario.description) {
                currentScenario.description = line;
            }
        }
    }
    
    if (currentScenario) {
        feature.scenarios.push(currentScenario);
    }
    
    return feature;
}

// Test case oluştur
async function createTestCase(scenario, featureName, featureTags) {
    const devNumber = featureName.match(/DEV_(\d+)/)?.[1] || 'XXX';
    const tcNumber = scenario.tags.find(tag => tag.startsWith('@DEV-'))?.replace('@', '') || `DEV-${devNumber}-TC${Math.floor(Math.random() * 1000)}`;
    
    const testCase = {
        fields: {
            project: {
                key: process.env.JIRA_PROJECT_KEY
            },
            summary: `[DEV-${devNumber}] ${scenario.name}`,
            description: {
                type: "doc",
                version: 1,
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: scenario.description || "No description provided"
                            }
                        ]
                    },
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "\nSteps:"
                            }
                        ]
                    },
                    ...scenario.steps.map(step => ({
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: `${step.keyword} ${step.text}`
                            }
                        ]
                    }))
                ]
            },
            issuetype: {
                name: "Test"
            },
            labels: [
                ...featureTags.map(tag => tag.replace('@', '')),
                ...scenario.tags.map(tag => tag.replace('@', '')),
                tcNumber
            ]
        }
    };

    try {
        const response = await axios.post(
            `${process.env.JIRA_BASE_URL}/rest/api/2/issue`,
            testCase,
            config
        );
        console.log(`Created test case: ${response.data.key}`);
        return response.data;
    } catch (error) {
        console.error('Error creating test case:', error.response?.data || error.message);
        return null;
    }
}

// Feature file'ı Xray'e aktar
async function importFeatureToXray(featureFilePath) {
    console.log(`Importing ${featureFilePath} to Xray...`);
    
    const feature = parseFeatureFile(featureFilePath);
    
    for (const scenario of feature.scenarios) {
        await createTestCase(scenario, feature.name, feature.tags);
    }
}

// Tüm feature file'ları işle
async function importAllFeatures() {
    const backupDir = 'tests/features/backup';
    const featureFiles = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.feature'))
        .map(file => path.join(backupDir, file));

    for (const file of featureFiles) {
        await importFeatureToXray(file);
    }
}

// Script'i çalıştır
if (process.argv[2]) {
    importFeatureToXray(process.argv[2]);
} else {
    importAllFeatures();
} 