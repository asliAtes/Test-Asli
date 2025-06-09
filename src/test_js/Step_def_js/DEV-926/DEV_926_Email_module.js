"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const axios_1 = __importDefault(require("axios"));
const assert_1 = __importDefault(require("assert"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Use different variable names to avoid conflicts
let emailResponse;
let emailData;
function generateEmailId() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}
(0, cucumber_1.Given)('email test data for {string}', function (scenario) {
    const customerId = generateEmailId();
    const testEmail = "test@example.com";
    // Base template for required fields
    const baseTemplate = {
        mode: "SINGLE",
        carrier: "SENDGRID",
        singleRequest: {
            to: testEmail,
            subject: "Important Notice Regarding Your Account",
            treatmentUserId: customerId,
            clientName: "USCC",
            templateId: "d-b240674a8e494851a0c5bb8f016cca5f",
            firstName: "TEST",
            lastName: "USER",
            pastDue: "$187.50",
            quickPayLink: "https://pay.example.com/quickpay",
            payNumber: "+11234567890",
            link: "https://www.example.com/account",
            paAmount: "$100.00",
            paPayDate: "2025-04-10",
            messageTemplateId: "TID_MMLO_20240615",
            body: "<b>Hello TEST,</b><div><p>We're reaching out regarding your past due balance of $187.50.</p></div>",
            timeZone: "America/New_York",
            callbackUrl: "https://api.example.com/email-status"
        }
    };
    const testCases = {
        TC01: {
            ...baseTemplate, // Include all required fields for successful case
        },
        TC02: {
            mode: "SINGLE",
            carrier: "SENDGRID",
            singleRequest: {
                // Deliberately missing required fields for validation
                subject: "Important Notice Regarding Your Account",
                treatmentUserId: customerId,
                templateId: "d-b240674a8e494851a0c5bb8f016cca5f"
            }
        },
        TC03: {
            ...baseTemplate,
            singleRequest: {
                ...baseTemplate.singleRequest,
                to: "invalid-email", // Invalid email format for validation
            }
        }
    };
    emailData = testCases[scenario];
    console.log(`📦 Prepared test data for scenario ${scenario}:`, JSON.stringify(emailData, null, 2));
});
(0, cucumber_1.When)('the email request is submitted to the communication module', async function () {
    var _a, _b, _c, _d, _e;
    try {
        const BASE_URL = ((_a = process.env.BASE_URL) === null || _a === void 0 ? void 0 : _a.replace('/messaging', '/email')) || 'http://localhost:8080/email';
        console.log('📍 Email Request URL:', BASE_URL);
        emailResponse = await axios_1.default.post(BASE_URL, emailData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: parseInt(process.env.TIMEOUT || '10000'),
            validateStatus: (status) => true // Allow any status code for validation
        });
        console.log('✅ Email Response:', {
            statusCode: (_b = emailResponse.data) === null || _b === void 0 ? void 0 : _b.statusCode,
            message: (_c = emailResponse.data) === null || _c === void 0 ? void 0 : _c.message,
            result: (_d = emailResponse.data) === null || _d === void 0 ? void 0 : _d.result
        });
    }
    catch (error) {
        console.error('❌ Email Request Error:', {
            message: error.message,
            code: error.code,
            response: (_e = error.response) === null || _e === void 0 ? void 0 : _e.data
        });
        if (error.response) {
            emailResponse = { data: error.response.data };
        }
        else {
            throw error; // Re-throw network or configuration errors
        }
    }
});
(0, cucumber_1.Then)('the email should be processed successfully', function () {
    const response = emailResponse === null || emailResponse === void 0 ? void 0 : emailResponse.data;
    console.log('🔍 Validating successful email processing:', response);
    try {
        assert_1.default.strictEqual(response === null || response === void 0 ? void 0 : response.statusCode, 200, 'Expected status code 200');
        assert_1.default.strictEqual(response === null || response === void 0 ? void 0 : response.result, true, 'Expected result to be true');
        console.log('✅ Email successfully processed');
    }
    catch (error) {
        console.error('❌ Email processing validation failed:', {
            expected: { statusCode: 200, result: true },
            actual: { statusCode: response === null || response === void 0 ? void 0 : response.statusCode, result: response === null || response === void 0 ? void 0 : response.result },
            message: response === null || response === void 0 ? void 0 : response.message
        });
        throw error;
    }
});
(0, cucumber_1.Then)('the email response should indicate {string}', function (expectedMessage) {
    var _a, _b, _c, _d;
    const response = emailResponse === null || emailResponse === void 0 ? void 0 : emailResponse.data;
    console.log('🔍 Validating email error response:', {
        expected: expectedMessage,
        actual: response
    });
    try {
        switch (expectedMessage) {
            case "400 Bad Request":
                assert_1.default.strictEqual(response === null || response === void 0 ? void 0 : response.statusCode, 400, 'Expected status code 400');
                break;
            case "Invalid email format":
                assert_1.default.strictEqual(response === null || response === void 0 ? void 0 : response.statusCode, 400, 'Expected status code 400');
                assert_1.default.ok(((_a = response === null || response === void 0 ? void 0 : response.message) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('invalid')) &&
                    ((_b = response === null || response === void 0 ? void 0 : response.message) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('email')), 'Expected error message to indicate invalid email format');
                break;
            default:
                assert_1.default.ok(((_c = response === null || response === void 0 ? void 0 : response.message) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(expectedMessage.toLowerCase())) ||
                    ((_d = response === null || response === void 0 ? void 0 : response.statusCodeDescription) === null || _d === void 0 ? void 0 : _d.includes(expectedMessage)), `Expected response to include "${expectedMessage}"`);
        }
        console.log('✅ Email error response validation passed');
    }
    catch (error) {
        console.error('❌ Email error response validation failed:', {
            expected: expectedMessage,
            actual: {
                statusCode: response === null || response === void 0 ? void 0 : response.statusCode,
                message: response === null || response === void 0 ? void 0 : response.message,
                description: response === null || response === void 0 ? void 0 : response.statusCodeDescription
            }
        });
        throw error;
    }
});
