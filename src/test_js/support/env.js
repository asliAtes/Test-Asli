"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.logResults = exports.sendRequest = exports.generateTestId = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Base configurations
exports.config = {
    baseUrl: process.env.BASE_URL || 'http://3.133.216.212/app4/kredos/comm/messaging',
    timeout: parseInt(process.env.TIMEOUT || '10000'),
    emailEndpoint: ((_a = process.env.BASE_URL) === null || _a === void 0 ? void 0 : _a.replace('/messaging', '/email')) || 'http://3.133.216.212/app4/kredos/comm/email',
    testPhone: process.env.TEST_PHONE_NUMBER || '+17193981666',
    rcsCapablePhone: process.env.RCS_CAPABLE_PHONE || '+12244195222',
    nonRcsPhone: process.env.NON_RCS_PHONE || '+17027064712'
};
// Utility functions
function generateTestId() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}
exports.generateTestId = generateTestId;
// HTTP utilities
async function sendRequest(endpoint, data, timeout) {
    var _a;
    const axios = require('axios');
    try {
        const response = await axios.post(endpoint, data, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: timeout || exports.config.timeout,
        });
        return {
            success: true,
            data: response.data,
            status: response.status
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            response: error.response,
            status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status
        };
    }
}
exports.sendRequest = sendRequest;
// Test result reporting
function logResults(testName, result) {
    console.log(`\n========== ${testName} ==========`);
    if (result.success) {
        console.log('✅ Status:', result.status);
        console.log('📋 Response:', JSON.stringify(result.data, null, 2));
    }
    else {
        console.error('❌ Error:', result.error);
        if (result.response) {
            console.error('📋 Response:', JSON.stringify(result.response.data, null, 2));
        }
    }
}
exports.logResults = logResults;
