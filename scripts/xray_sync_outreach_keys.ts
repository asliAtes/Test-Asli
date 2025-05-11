import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const FEATURE_FILE = 'tests/features/Outreach_Log_Validation/DEV_XXX_Outreach_Log_Validation.feature';
const PROJECT_KEY = process.env.JIRA_PROJECT_KEY;

function getBasicAuthHeader() {
  const token = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  return `Basic ${token}`;
}

async function getAllTests() {
  const jql = `project=${PROJECT_KEY} AND issuetype=Test`;
  const url = `${JIRA_BASE_URL}/rest/api/2/search?jql=${encodeURIComponent(jql)}&fields=summary&maxResults=1000`;
  const res = await axios.get(url, {
    headers: { Authorization: getBasicAuthHeader() }
  });
  return res.data.issues.map((issue: any) => ({ key: issue.key, summary: issue.fields.summary }));
}

function updateFeatureFileWithKeys(tests: { key: string, summary: string }[]) {
  let content = fs.readFileSync(FEATURE_FILE, 'utf8');
  tests.forEach(test => {
    // Find scenario by summary and add @QA-XXX tag if not present
    const regex = new RegExp(`^(\s*)(Scenario(?: Outline)?:\s*${escapeRegExp(test.summary)})`, 'm');
    content = content.replace(regex, `$1@${test.key}\n$1$2`);
  });
  fs.writeFileSync(FEATURE_FILE, content, 'utf8');
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

(async () => {
  const tests = await getAllTests();
  updateFeatureFileWithKeys(tests);
  console.log('Feature file updated with JIRA keys.');
})(); 