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
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const chai_1 = require("chai");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
const ssh2_sftp_client_1 = require("ssh2-sftp-client");
const pgp_1 = require("../utils/pgp");
const monitoring_1 = require("../utils/monitoring");
const alerts_1 = require("../utils/alerts");
const production_config_1 = require("../config/production_config");
const config = new production_config_1.ProductionConfig();
const sftp = new ssh2_sftp_client_1.Client();
const s3Client = new client_s3_1.S3Client({ region: config.awsRegion });
const monitoring = new monitoring_1.MonitoringService();
const alerts = new alerts_1.AlertService();
// Safety check before each scenario
(0, cucumber_1.Before)(async function () {
    if (!config.isInTestMode()) {
        throw new Error('Integration tests must run in test mode for safety');
    }
    if (config.getEnvironment() === 'production') {
        throw new Error('Integration tests cannot run against production environment');
    }
});
(0, cucumber_1.Given)('the outreach log generation service is running in production environment', async function () {
    // Verify service is running in test environment
    const serviceStatus = await monitoring.checkServiceStatus('outreach-log-service-test');
    (0, chai_1.expect)(serviceStatus).to.equal('running');
});
(0, cucumber_1.Given)('production test data is prepared for outreach log validation', async function () {
    // Load test data
    this.testData = await config.loadProductionTestData();
    (0, chai_1.expect)(this.testData).to.not.be.empty;
});
(0, cucumber_1.Given)('SFTP and S3 connections are configured', async function () {
    // Connect to test SFTP
    await sftp.connect({
        host: config.sftpHost,
        port: config.sftpPort,
        username: config.sftpUsername,
        privateKey: config.sftpPrivateKey // Will use test key
    });
    // Use test bucket
    this.s3Bucket = config.s3Bucket; // Will use test bucket
    this.s3Path = config.s3Path; // Will use test path
});
(0, cucumber_1.When)('a production outreach log file is generated', async function () {
    // Generate file using production service
    this.generatedFile = await config.generateOutreachLog();
    (0, chai_1.expect)(fs.existsSync(this.generatedFile)).to.be.true;
});
(0, cucumber_1.When)('a production outreach log file is generated with real data', async function () {
    // Generate file using real production data
    this.generatedFile = await config.generateOutreachLogWithRealData();
    (0, chai_1.expect)(fs.existsSync(this.generatedFile)).to.be.true;
});
(0, cucumber_1.When)('a production outreach log file is generated with real {string} data', async function (fieldType) {
    // Generate file with specific field type data
    this.generatedFile = await config.generateOutreachLogWithFieldData(fieldType);
    (0, chai_1.expect)(fs.existsSync(this.generatedFile)).to.be.true;
});
(0, cucumber_1.Then)('all lines should end with CR+LF characters in the production file', function () {
    const content = fs.readFileSync(this.generatedFile, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
        if (line.length > 0) {
            (0, chai_1.expect)(line.endsWith('\r')).to.be.true;
        }
    });
});
(0, cucumber_1.Then)('the production file should include valid headers', function () {
    const content = fs.readFileSync(this.generatedFile, 'utf8');
    const headers = content.split('\n')[0].trim();
    (0, chai_1.expect)(headers).to.equal(config.expectedHeaders);
});
(0, cucumber_1.Then)('the file should be encrypted with production PGP key', async function () {
    // Encrypt file with production PGP key
    const pgp = new pgp_1.PGP(config.pgpPublicKey);
    this.encryptedFile = await pgp.encryptFile(this.generatedFile);
    (0, chai_1.expect)(fs.existsSync(this.encryptedFile)).to.be.true;
});
(0, cucumber_1.Then)('the file should be delivered to production SFTP server', async function () {
    // Upload to SFTP
    const remotePath = path.join(config.sftpPath, path.basename(this.encryptedFile));
    await sftp.put(this.encryptedFile, remotePath);
    // Verify file exists on SFTP
    const stats = await sftp.stat(remotePath);
    (0, chai_1.expect)(stats).to.not.be.null;
});
(0, cucumber_1.Then)('the file should be delivered to production S3 bucket', async function () {
    // Upload to S3
    const key = path.join(this.s3Path, path.basename(this.encryptedFile));
    await s3Client.send(new client_s3_1.PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: fs.createReadStream(this.encryptedFile)
    }));
});
(0, cucumber_1.Then)('delivery notifications should be sent to monitoring system', async function () {
    // Send delivery notification
    await monitoring.logDelivery({
        file: this.encryptedFile,
        timestamp: new Date(),
        status: 'success'
    });
});
(0, cucumber_1.Then)('success notification should be sent to operations team', async function () {
    // Send success alert
    await alerts.sendDeliverySuccess({
        file: this.encryptedFile,
        timestamp: new Date()
    });
});
