"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KredosWorld = void 0;
const cucumber_1 = require("@cucumber/cucumber");
// Initialize all shared steps
//initializeSharedSteps();
/**
 * Custom world class for sharing context between steps
 */
class KredosWorld extends cucumber_1.World {
    constructor(options) {
        super(options);
        // Initialize properties
        this.response = null;
        this.emailApiResponse = null;
        this.rcsResponse = null;
        this.data = null;
        this.emailRequestData = null;
        this.rcsData = null;
    }
}
exports.KredosWorld = KredosWorld;
// Tell Cucumber to use our custom world class
(0, cucumber_1.setWorldConstructor)(KredosWorld);
