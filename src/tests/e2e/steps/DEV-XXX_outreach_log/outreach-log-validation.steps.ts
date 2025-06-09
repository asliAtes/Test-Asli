import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: '/Users/asliates/Desktop/KredosAI/testing-feature-test_automation_scripts/KredosApplication/automation/.env' });

interface OutreachLogValidationResult {
    fileName: string;
    formatCompliance: {
        lineEndings: boolean;
        nameConvention: boolean;
        fileStructure: boolean;
        headers: boolean;
    };
    dataQuality: {
        noNullValues: boolean;
        validFormats: boolean;
        dataTypeConsistency: boolean;
        requiredFields: boolean;
    };
    errors: string[];
}

class OutreachLogValidator {
    private s3Client: S3Client;
    private readonly bucketName = 'kredos-uscellular-production';
    private readonly prefix = 'Temporary-Files/';
    private readonly requiredHeaders = [
        'ACCOUNT_NUMBER',
        'PHONE_NUMBER',
        'MESSAGE_TEXT',
        'SEND_DATE',
        'STATUS',
        'CARRIER'
    ];

    // US holiday list for validation
    private static readonly US_HOLIDAYS = [
        { month: 1, day: 1, everyYear: true }, // New Year's Day
        { month: 7, day: 4, everyYear: true }, // Independence Day
        { month: 12, day: 25, everyYear: true }, // Christmas Day
        { month: 5, day: 26, year: 2025 }, // Memorial Day
        { month: 5, day: 25, year: 2026 },
        { month: 5, day: 31, year: 2027 },
        { month: 5, day: 29, year: 2028 },
        { month: 9, day: 2, year: 2024 }, // Labor Day
        { month: 9, day: 1, year: 2025 },
        { month: 9, day: 7, year: 2026 },
        { month: 9, day: 6, year: 2027 },
        { month: 9, day: 4, year: 2028 },
        { month: 11, day: 28, year: 2024 }, // Thanksgiving Day
        { month: 11, day: 27, year: 2025 },
        { month: 11, day: 26, year: 2026 },
        { month: 11, day: 25, year: 2027 },
        { month: 11, day: 23, year: 2028 },
    ];

    private isHolidayOrSunday(date: Date): boolean {
        // Sunday check
        if (date.getDay() === 0) return true;
        // Holiday check
        for (const h of OutreachLogValidator.US_HOLIDAYS) {
            if (h.everyYear) {
                if (date.getMonth() + 1 === h.month && date.getDate() === h.day) return true;
            } else if (h.year === date.getFullYear() && date.getMonth() + 1 === h.month && date.getDate() === h.day) {
                return true;
            }
        }
        return false;
    }

    constructor() {
        this.s3Client = new S3Client({ 
            region: 'us-east-2',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
                sessionToken: process.env.AWS_SESSION_TOKEN
            }
        });
    }

    async getLatestOutreachLog(): Promise<{ key: string; content: string }> {
        try {
            // List all objects in the bucket with the specified prefix
            const listCommand = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: this.prefix
            });

            const response = await this.s3Client.send(listCommand);
            if (!response.Contents || response.Contents.length === 0) {
                throw new Error('No outreach log files found');
            }

            // Filter for outreach log files and get the latest one
            const outreachLogs = response.Contents
                .filter(file => file.Key?.match(/KAI_Kredos_outreach_log_\d{14}\.csv$/))
                .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0));

            if (outreachLogs.length === 0) {
                throw new Error('No valid outreach log files found');
            }

            const latestLog = outreachLogs[0];
            console.log(`Found latest log file: ${latestLog.Key}`);

            // Get the content of the latest file
            const getCommand = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: latestLog.Key
            });

            const fileResponse = await this.s3Client.send(getCommand);
            const stream = fileResponse.Body as Readable;
            const chunks: Buffer[] = [];

            return new Promise((resolve, reject) => {
                stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
                stream.on('error', err => reject(err));
                stream.on('end', () => {
                    resolve({
                        key: latestLog.Key!,
                        content: Buffer.concat(chunks).toString('utf-8')
                    });
                });
            });
        } catch (error) {
            console.error('Error fetching latest outreach log:', error);
            throw error;
        }
    }

    async validateOutreachLog(fileName: string, content: string): Promise<OutreachLogValidationResult> {
        const lines = content.split(/\r\n|\n/);
        const result: OutreachLogValidationResult = {
            fileName,
            formatCompliance: {
                lineEndings: true,
                nameConvention: true,
                fileStructure: true,
                headers: true
            },
            dataQuality: {
                noNullValues: true,
                validFormats: true,
                dataTypeConsistency: true,
                requiredFields: true
            },
            errors: []
        };

        // --- DETAILED LINE ENDING CHECK ---
        // Check that every line ends with CR+LF (except possibly the last blank line)
        const rawLines = content.match(/.*?(\r\n|\n|$)/g) || [];
        let allCRLF = true;
        for (let i = 0; i < rawLines.length - 1; i++) {
            if (!rawLines[i].endsWith('\r\n')) {
                allCRLF = false;
                result.errors.push(`Line ${i + 1} does not end with CR+LF`);
            }
        }
        if (!allCRLF) {
            result.formatCompliance.lineEndings = false;
        }

        // --- BLANK ROW AT END CHECK ---
        if (lines.length < 2 || lines[lines.length - 1].trim() !== '') {
            result.errors.push('File does not end with a single blank row after the header');
            result.formatCompliance.fileStructure = false;
        }

        // --- HOLIDAY/SUNDAY CHECK ---
        // Try to extract date from filename (expecting yyyymmdd in name)
        const dateMatch = fileName.match(/(\d{8})/);
        let fileDate: Date | null = null;
        if (dateMatch) {
            const y = parseInt(dateMatch[1].substring(0, 4));
            const m = parseInt(dateMatch[1].substring(4, 6));
            const d = parseInt(dateMatch[1].substring(6, 8));
            fileDate = new Date(Date.UTC(y, m - 1, d));
        }
        if (fileDate && this.isHolidayOrSunday(fileDate)) {
            // Only header and blank row should be present
            if (lines.length > 2 && lines.slice(1, -1).some(l => l.trim() !== '')) {
                result.errors.push('File for Sunday/holiday should only contain header and a blank row, but data rows were found');
                result.formatCompliance.fileStructure = false;
            }
        }

        // --- EXTENSION CHECK ---
        if (fileName.endsWith('.crlf')) {
            result.errors.push('File extension should not be .crlf');
            result.formatCompliance.nameConvention = false;
        }

        // --- EXISTING CHECKS ---
        this.validateLineEndings(content, result); // keep for backward compatibility
        this.validateFileName(fileName, result);
        this.validateFileStructure(lines, result);
        this.validateHeaders(lines[0], result);

        // Data Quality Checks
        if (lines.length > 1) {
            this.validateDataQuality(lines.slice(1), result);
        }

        return result;
    }

    private validateLineEndings(content: string, result: OutreachLogValidationResult) {
        if (!content.includes('\r\n')) {
            result.formatCompliance.lineEndings = false;
            result.errors.push('File does not use CR+LF line endings');
        }
    }

    private validateFileName(fileName: string, result: OutreachLogValidationResult) {
        const pattern = /^KAI_Kredos_outreach_log_\d{14}\.csv$/;
        if (!pattern.test(fileName.split('/').pop()!)) {
            result.formatCompliance.nameConvention = false;
            result.errors.push('File name does not match the required pattern');
        }
    }

    private validateFileStructure(lines: string[], result: OutreachLogValidationResult) {
        if (lines.length < 2) {
            result.formatCompliance.fileStructure = false;
            result.errors.push('File must contain at least headers and one data row');
        }
    }

    private validateHeaders(headerLine: string, result: OutreachLogValidationResult) {
        const headers = headerLine.split(',').map(h => h.trim());
        const headersLower = headers.map(h => h.toLowerCase());
        let headerCaseWarnings: string[] = [];
        let headerMappingWarnings: string[] = [];

        // Define mapping: expected header -> accepted alternatives
        const headerMappings: Record<string, string[]> = {
            ACCOUNT_NUMBER: ['ACCOUNT_NUMBER', 'ACCOUNTNUMBER'],
            PHONE_NUMBER: ['PHONE_NUMBER', 'PHONENUMBER'],
            MESSAGE_TEXT: ['MESSAGE_TEXT'],
            SEND_DATE: ['SEND_DATE', 'TIMESTAMPCST-CDT'],
            STATUS: ['STATUS'],
            CARRIER: ['CARRIER', 'CHANNEL']
        };

        // Check if all required headers are present (case-insensitive, with mapping)
        for (const required of this.requiredHeaders) {
            const alternatives = headerMappings[required] || [required];
            // Find if any alternative is present (case-insensitive)
            const foundIdx = headers.findIndex(h => alternatives.some(a => a.toLowerCase() === h.toLowerCase()));
            if (foundIdx === -1) {
                result.formatCompliance.headers = false;
                result.errors.push(`Missing required header: ${required}`);
            } else {
                // If found but not exact match, report as mapping warning
                if (headers[foundIdx] !== required) {
                    headerMappingWarnings.push(`Header mapping: expected '${required}', found '${headers[foundIdx]}'`);
                }
                // Also check for case inconsistency
                if (headers[foundIdx] !== alternatives.find(a => a === headers[foundIdx])) {
                    if (headers[foundIdx].toLowerCase() === required.toLowerCase() && headers[foundIdx] !== required) {
                        headerCaseWarnings.push(`Header case inconsistency: expected '${required}', found '${headers[foundIdx]}'`);
                    }
                }
            }
        }

        // Report header mapping and case inconsistencies as warnings, but do not fail the test
        if (headerMappingWarnings.length > 0) {
            result.errors.push(...headerMappingWarnings);
        }
        if (headerCaseWarnings.length > 0) {
            result.errors.push(...headerCaseWarnings);
        }

        // Check if headers are in uppercase (for reporting only)
        if (headers.some(h => h !== h.toUpperCase())) {
            result.errors.push('Not all headers are in uppercase');
        }
    }

    private validateDataQuality(dataLines: string[], result: OutreachLogValidationResult) {
        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            if (!line.trim()) continue; // Skip empty lines

            const fields = line.split(',').map(f => f.trim());
            
            // Check for null values
            if (fields.some(f => f === 'null' || f === '')) {
                result.dataQuality.noNullValues = false;
                result.errors.push(`Null or empty value found in line ${i + 2}`);
            }

            // Validate field formats
            this.validateFieldFormats(fields, i + 2, result);
        }
    }

    private validateFieldFormats(fields: string[], lineNumber: number, result: OutreachLogValidationResult) {
        // Phone number format (simple check for demonstration)
        const phoneNumberIndex = this.requiredHeaders.indexOf('PHONE_NUMBER');
        if (phoneNumberIndex >= 0 && fields[phoneNumberIndex]) {
            if (!/^\d{10}$/.test(fields[phoneNumberIndex].replace(/\D/g, ''))) {
                result.dataQuality.validFormats = false;
                result.errors.push(`Invalid phone number format in line ${lineNumber}`);
            }
        }

        // Date format
        const dateIndex = this.requiredHeaders.indexOf('SEND_DATE');
        if (dateIndex >= 0 && fields[dateIndex]) {
            if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fields[dateIndex])) {
                result.dataQuality.validFormats = false;
                result.errors.push(`Invalid date format in line ${lineNumber}`);
            }
        }
    }
}

export { OutreachLogValidator, OutreachLogValidationResult }; 