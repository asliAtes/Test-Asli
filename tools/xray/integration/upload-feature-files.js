"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/upload-to-xray.ts
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const form_data_1 = __importDefault(require("form-data"));
dotenv.config();
const XRAY_AUTH_URL = 'https://xray.cloud.getxray.app/api/v2/authenticate';
const XRAY_IMPORT_URL = 'https://xray.cloud.getxray.app/api/v2/import/feature';
// Outreach Log Validation Test Cases
const outreachLogFeatureFiles = [
    'tests/features/Outreach_Log_Validation/DEV_XXX_Outreach_Log_Validation.feature'
];
async function uploadFeatureFileToXray(featureFilePath) {
    var _a;
    try {
        const tokenRes = await axios_1.default.post(XRAY_AUTH_URL, {
            client_id: process.env.XRAY_CLIENT_ID,
            client_secret: process.env.XRAY_CLIENT_SECRET
        });
        const token = tokenRes.data;
        const form = new form_data_1.default();
        form.append('file', fs.createReadStream(featureFilePath));
        const res = await axios_1.default.post(XRAY_IMPORT_URL, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`,
            },
            params: {
                projectKey: process.env.JIRA_PROJECT_KEY
            }
        });
        console.log(`✅ Upload successful for ${featureFilePath}:`, res.data);
    }
    catch (error) {
        console.error(`❌ Upload failed for ${featureFilePath}:`, ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
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
