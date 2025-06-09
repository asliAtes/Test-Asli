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
exports.ArchiveService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const csv_writer_1 = require("csv-writer");
class ArchiveService {
    constructor(dbService, s3Service) {
        this.identifiedRecords = [];
        this.latestExportPath = '';
        this.dbService = dbService;
        this.s3Service = s3Service;
    }
    async identifyRecordsForArchiving(daysOld = 60) {
        this.identifiedRecords = await this.dbService.getOldRecords(daysOld);
        return this.identifiedRecords;
    }
    getIdentifiedRecords() {
        return this.identifiedRecords;
    }
    async exportToCSV() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportDir = path.join(process.cwd(), 'exports');
        // Ensure exports directory exists
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }
        this.latestExportPath = path.join(exportDir, `archive_${timestamp}.csv`);
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: this.latestExportPath,
            header: [
                { id: 'id', title: 'ID' },
                { id: 'timestamp', title: 'Timestamp' },
                { id: 'data', title: 'Data' }
            ]
        });
        await csvWriter.writeRecords(this.identifiedRecords);
        return this.latestExportPath;
    }
    getLatestExportPath() {
        return this.latestExportPath;
    }
    async uploadToS3() {
        if (!this.latestExportPath) {
            throw new Error('No export file available. Run exportToCSV first.');
        }
        const key = `archives/${path.basename(this.latestExportPath)}`;
        await this.s3Service.uploadFile(this.latestExportPath, key);
    }
    async verifyS3Upload() {
        try {
            const key = `archives/${path.basename(this.latestExportPath)}`;
            const exists = await this.s3Service.verifyFileExists(key);
            if (!exists) {
                return { success: false, error: 'File not found in S3' };
            }
            const metadata = await this.s3Service.getFileMetadata(key);
            if (!metadata['archive-date']) {
                return { success: false, error: 'Missing archive metadata' };
            }
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async cleanupArchivedRecords() {
        // In a real implementation, this would use a transaction
        // and verify S3 upload success before deletion
        await this.dbService.cleanup();
    }
}
exports.ArchiveService = ArchiveService;
