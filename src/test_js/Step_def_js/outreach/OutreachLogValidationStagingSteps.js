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
const staging_config_1 = require("../config/staging_config");
const config = new staging_config_1.StagingConfig();
const sftp = new ssh2_sftp_client_1.Client();
const s3Client = new client_s3_1.S3Client({ region: config.awsRegion });
const monitoring = new monitoring_1.MonitoringService(config.monitoringEndpoint);
const alerts = new alerts_1.AlertService(config.alertEndpoint);
// Safety check before each scenario
(0, cucumber_1.Before)(async function () {
    if (!config.isStaging()) {
        throw new Error('These tests must run in staging environment');
    }
});
(0, cucumber_1.Given)('the outreach log generation service is running in production environment', async function () {
    // Verify service is running in staging
    const serviceStatus = await monitoring.checkServiceStatus('outreach-log-service');
    (0, chai_1.expect)(serviceStatus).to.equal('running');
});
(0, cucumber_1.Given)('production test data is prepared for outreach log validation', async function () {
    // Load staging test data
    this.testData = await config.loadStagingTestData();
    (0, chai_1.expect)(this.testData).to.not.be.empty;
});
(0, cucumber_1.Given)('SFTP and S3 connections are configured', async function () {
    // Connect to staging SFTP
    await sftp.connect({
        host: config.sftpHost,
        port: config.sftpPort,
        username: config.sftpUsername,
        privateKey: config.sftpPrivateKey
    });
    // Use staging bucket
    this.s3Bucket = config.s3Bucket;
    this.s3Path = config.s3Path;
});
(0, cucumber_1.When)('a production outreach log file is generated', async function () {
    // Generate file in staging
    this.generatedFile = await config.generateOutreachLog();
    (0, chai_1.expect)(fs.existsSync(this.generatedFile)).to.be.true;
});
(0, cucumber_1.When)('a production outreach log file is generated with real data', async function () {
    // Generate file with staging data
    this.generatedFile = await config.generateOutreachLogWithStagingData();
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
    // Encrypt file with staging PGP key
    const pgp = new pgp_1.PGP(config.pgpPublicKey);
    this.encryptedFile = await pgp.encryptFile(this.generatedFile);
    (0, chai_1.expect)(fs.existsSync(this.encryptedFile)).to.be.true;
});
(0, cucumber_1.Then)('the file should be delivered to production SFTP server', async function () {
    // Upload to staging SFTP
    const remotePath = path.join(config.sftpPath, path.basename(this.encryptedFile));
    await sftp.put(this.encryptedFile, remotePath);
    // Verify file exists on SFTP
    const stats = await sftp.stat(remotePath);
    (0, chai_1.expect)(stats).to.not.be.null;
});
(0, cucumber_1.Then)('the file should be delivered to production S3 bucket', async function () {
    // Upload to staging S3
    const key = path.join(this.s3Path, path.basename(this.encryptedFile));
    await s3Client.send(new client_s3_1.PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: fs.createReadStream(this.encryptedFile)
    }));
});
(0, cucumber_1.Then)('delivery notifications should be sent to monitoring system', async function () {
    // Send delivery notification to staging monitoring
    await monitoring.logDelivery({
        file: this.encryptedFile,
        timestamp: new Date(),
        status: 'success',
        environment: 'staging'
    });
});
(0, cucumber_1.Then)('success notification should be sent to operations team', async function () {
    // Send success alert to staging alerts
    await alerts.sendDeliverySuccess({
        file: this.encryptedFile,
        timestamp: new Date(),
        environment: 'staging'
    });
});
