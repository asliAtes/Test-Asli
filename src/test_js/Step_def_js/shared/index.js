"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSharedSteps = void 0;
const common_assertions_1 = require("./common_assertions");
/**
 * Initialize all shared step definitions
 * This should be called only once, from the main support file
 */
function initializeSharedSteps() {
    // Initialize common assertions
    (0, common_assertions_1.defineCommonAssertions)();
    // Add other shared step definitions here as needed
}
exports.initializeSharedSteps = initializeSharedSteps;
