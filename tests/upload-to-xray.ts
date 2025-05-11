// scripts/upload-to-xray.ts
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config();

const XRAY_AUTH_URL = 'https://xray.cloud.getxray.app/api/v2/authenticate';
const XRAY_IMPORT_URL = 'https://xray.cloud.getxray.app/api/v2/import/feature';

// Outreach Log Validation Test Cases
const outreachLogFeatureFiles = [
  'tests/features/Outreach_Log_Validation/DEV_XXX_Outreach_Log_Validation.feature'
];

async function uploadFeatureFileToXray(featureFilePath: string) {
  try {
    const tokenRes = await axios.post(XRAY_AUTH_URL, {
      client_id: process.env.XRAY_CLIENT_ID,
      client_secret: process.env.XRAY_CLIENT_SECRET
    });
    const token = tokenRes.data;

    const form = new FormData();
    form.append('file', fs.createReadStream(featureFilePath));

    const res = await axios.post(XRAY_IMPORT_URL, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
      params: {
        projectKey: process.env.JIRA_PROJECT_KEY
      }
    });

    console.log(`✅ Upload successful for ${featureFilePath}:`, res.data);
  } catch (error: any) {
    console.error(`❌ Upload failed for ${featureFilePath}:`, error.response?.data || error.message);
  }
}

async function uploadAllFeatures() {
  const backupDir = 'tests/features/backup';
  const featureFiles = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.feature') && file.includes('DEV_1017'))
    .map(file => path.join(backupDir, file));

  for (const file of featureFiles) {
    await uploadFeatureFileToXray(file);
  }
}

async function uploadFeatureFiles() {
  await uploadAllFeatures();
  
  // Upload Outreach Log test cases
  for (const file of outreachLogFeatureFiles) {
    await uploadFeatureFileToXray(file);
  }
}

uploadFeatureFiles();