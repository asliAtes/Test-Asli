"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = exports.generateFutureDate = exports.generateTestId = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Configuration object for test environment
 */
exports.config = {
    baseUrl: process.env.BASE_URL || 'http://3.133.216.212/app4/kredos/comm/messaging',
    emailUrl: process.env.EMAIL_URL || 'http://3.133.216.212/app4/kredos/comm/email',
    testPhone: process.env.TEST_PHONE_NUMBER || '+17193981666',
    rcsCapablePhone: process.env.RCS_CAPABLE_PHONE || '+12244195222',
    nonRcsPhone: process.env.NON_RCS_PHONE || '+17027064712',
    additionalTestPhone: process.env.ADDITIONAL_TEST_PHONE || '+17472920712',
    timeout: parseInt(process.env.TIMEOUT || '10000'),
};
/**
 * Generate a random numeric ID for testing
 * @returns A string containing a random ID
 */
function generateTestId() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}
exports.generateTestId = generateTestId;
/**
 * Generate an ISO date string in the future
 * @param hoursInFuture Number of hours in the future (default: 24)
 * @returns ISO date string with Z timezone
 */
function generateFutureDate(hoursInFuture = 24) {
    return new Date(Date.now() + hoursInFuture * 60 * 60 * 1000).toISOString();
}
exports.generateFutureDate = generateFutureDate;
/**
 * Ensure a phone number is in E.164 format with a '+' prefix
 * @param phoneNumber The phone number to format
 * @returns The phone number in E.164 format
 */
function formatPhoneNumber(phoneNumber) {
    // If the phone number already starts with '+', return it as is
    if (phoneNumber.startsWith('+')) {
        return phoneNumber;
    }
    // Otherwise, add the '+' prefix
    return `+${phoneNumber}`;
}
exports.formatPhoneNumber = formatPhoneNumber;
