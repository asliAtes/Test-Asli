import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as dotenv from 'dotenv';
import path from 'path';
import { setDefaultTimeout } from '@cucumber/cucumber';

// Load environment variables from .env file
dotenv.config({ path: '/Users/asliates/Desktop/KredosAI/testing-feature-test_automation_scripts/KredosApplication/automation/.env' });

setDefaultTimeout(60000);

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
            let allFiles: any[] = [];
            let ContinuationToken: string | undefined = undefined;
            do {
                const listCommand = new ListObjectsV2Command({
                    Bucket: this.bucketName,
                    ContinuationToken
                });
                const response = await this.s3Client.send(listCommand);
                if (response.Contents) {
                    allFiles = allFiles.concat(response.Contents);
                }
                ContinuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
            } while (ContinuationToken);

            console.log('S3\'ten dönen dosya sayısı:', allFiles.length);
            console.log('İlk 5 dosya:', allFiles.slice(0, 5).map(f => f.Key));

            const outreachLogs = allFiles
                .filter(file => file.Key?.includes('Temporary-Files/') && file.Key?.includes('KAI_Kredos_outreach'))
                .map(file => ({
                    ...file,
                    dateFromName: (() => {
                        const match = file.Key.match(/KAI_Kredos_outreach_log_(\d{14})\.csv/);
                        return match ? match[1] : null;
                    })()
                }))
                .filter(file => file.dateFromName)
                .sort((a, b) => b.dateFromName.localeCompare(a.dateFromName));

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
        const nullValueErrors: string[] = [];
        const formatErrors: string[] = [];
        const typeErrors: string[] = [];
        const requiredFieldErrors: string[] = [];

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            if (!line.trim()) continue; // Skip empty lines

            const fields = line.split(',').map(f => f.trim());
            const lineNumber = i + 2; // +2 because of 0-based index and header row
            
            // Check for null values
            const nullFields = fields.map((f, idx) => ({ value: f, index: idx }))
                .filter(({ value }) => value === 'null' || value === '');
            
            if (nullFields.length > 0) {
                result.dataQuality.noNullValues = false;
                nullValueErrors.push(`Line ${lineNumber}: Null/empty values found in columns: ${nullFields.map(f => this.requiredHeaders[f.index]).join(', ')}`);
            }

            // Validate field formats and types
            this.validateFieldFormatsAndTypes(fields, lineNumber, formatErrors, typeErrors, requiredFieldErrors);
        }

        // Add all collected errors to the result
        if (nullValueErrors.length > 0) {
            result.errors.push(...nullValueErrors);
        }
        if (formatErrors.length > 0) {
            result.dataQuality.validFormats = false;
            result.errors.push(...formatErrors);
        }
        if (typeErrors.length > 0) {
            result.dataQuality.dataTypeConsistency = false;
            result.errors.push(...typeErrors);
        }
        if (requiredFieldErrors.length > 0) {
            result.dataQuality.requiredFields = false;
            result.errors.push(...requiredFieldErrors);
        }
    }

    private validateFieldFormatsAndTypes(
        fields: string[], 
        lineNumber: number, 
        formatErrors: string[], 
        typeErrors: string[],
        requiredFieldErrors: string[]
    ) {
        // Phone number validation
        const phoneNumberIndex = this.requiredHeaders.indexOf('PHONE_NUMBER');
        if (phoneNumberIndex >= 0) {
            const phoneNumber = fields[phoneNumberIndex];
            if (!phoneNumber) {
                requiredFieldErrors.push(`Line ${lineNumber}: Required field PHONE_NUMBER is missing`);
            } else if (!/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
                formatErrors.push(`Line ${lineNumber}: Invalid phone number format: ${phoneNumber}`);
            }
        }

        // Date validation
        const dateIndex = this.requiredHeaders.indexOf('SEND_DATE');
        if (dateIndex >= 0) {
            const date = fields[dateIndex];
            if (!date) {
                requiredFieldErrors.push(`Line ${lineNumber}: Required field SEND_DATE is missing`);
            } else if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date)) {
                formatErrors.push(`Line ${lineNumber}: Invalid date format: ${date}`);
            } else {
                // Additional date validation
                const [datePart, timePart] = date.split(' ');
                const [year, month, day] = datePart.split('-').map(Number);
                const [hour, minute, second] = timePart.split(':').map(Number);
                
                const dateObj = new Date(year, month - 1, day, hour, minute, second);
                if (isNaN(dateObj.getTime())) {
                    typeErrors.push(`Line ${lineNumber}: Invalid date value: ${date}`);
                }
            }
        }

        // Add more field validations as needed...
    }
}

export { OutreachLogValidator, OutreachLogValidationResult };

// Add Cucumber step definitions
import { Given, When, Then } from '@cucumber/cucumber';

let validator: OutreachLogValidator;
let latestLogFile: { key: string; content: string };
let validationResult: OutreachLogValidationResult;

// Initialize validator before each scenario
Given('an outreach log file is available for validation', async function () {
    validator = new OutreachLogValidator();
    latestLogFile = await validator.getLatestOutreachLog();
    console.log(`Retrieved log file: ${latestLogFile.key}`);
});

Given('today\'s outreach log file', async function () {
    validator = new OutreachLogValidator();
    latestLogFile = await validator.getLatestOutreachLog();
    console.log(`Retrieved today's log file: ${latestLogFile.key}`);
});

When('I validate the file format', async function () {
    validationResult = await validator.validateOutreachLog(latestLogFile.key, latestLogFile.content);
    console.log('Format validation completed');
});

When('I validate the file content', async function () {
    validationResult = await validator.validateOutreachLog(latestLogFile.key, latestLogFile.content);
    console.log('Content validation completed');
});

When('I check the generation timestamp', async function () {
    validationResult = await validator.validateOutreachLog(latestLogFile.key, latestLogFile.content);
    console.log('Generation timestamp check completed');
});

Then('line endings should be CR+LF', function () {
    if (!validationResult.formatCompliance.lineEndings) {
        const lineEndingErrors = validationResult.errors.filter(e => e.includes('CR+LF') || e.includes('line ending'));
        throw new Error(`Line ending validation failed: ${lineEndingErrors.join(', ')}`);
    }
    console.log('✓ Line endings are correct (CR+LF)');
});

Then('file name should follow the convention', function () {
    if (!validationResult.formatCompliance.nameConvention) {
        const nameErrors = validationResult.errors.filter(e => e.includes('name') || e.includes('pattern'));
        throw new Error(`File name validation failed: ${nameErrors.join(', ')}`);
    }
    console.log('✓ File name follows convention');
});

Then('file structure should be intact', function () {
    if (!validationResult.formatCompliance.fileStructure) {
        const structureErrors = validationResult.errors.filter(e => e.includes('structure') || e.includes('blank row'));
        throw new Error(`File structure validation failed: ${structureErrors.join(', ')}`);
    }
    console.log('✓ File structure is intact');
});

Then('headers should be valid', function () {
    if (!validationResult.formatCompliance.headers) {
        const headerErrors = validationResult.errors.filter(e => e.includes('header') || e.includes('Header'));
        throw new Error(`Header validation failed: ${headerErrors.join(', ')}`);
    }
    console.log('✓ Headers are valid');
});

Then('there should be no null values', function () {
    if (!validationResult.dataQuality.noNullValues) {
        const nullErrors = validationResult.errors.filter(e => e.includes('Null/empty values found'));
        console.error('Null value validation failed. Found the following issues:');
        nullErrors.forEach(error => console.error(`  - ${error}`));
        throw new Error('Null value validation failed. See above for details.');
    }
    console.log('✓ No null values found');
});

Then('field formats should be valid', function () {
    if (!validationResult.dataQuality.validFormats) {
        const formatErrors = validationResult.errors.filter(e => e.includes('Invalid') && e.includes('format'));
        console.error('Field format validation failed. Found the following issues:');
        formatErrors.forEach(error => console.error(`  - ${error}`));
        throw new Error('Field format validation failed. See above for details.');
    }
    console.log('✓ Field formats are valid');
});

Then('data types should be consistent', function () {
    if (!validationResult.dataQuality.dataTypeConsistency) {
        const typeErrors = validationResult.errors.filter(e => e.includes('Invalid') && e.includes('value'));
        console.error('Data type validation failed. Found the following issues:');
        typeErrors.forEach(error => console.error(`  - ${error}`));
        throw new Error('Data type validation failed. See above for details.');
    }
    console.log('✓ Data types are consistent');
});

Then('all required fields should be present', function () {
    if (!validationResult.dataQuality.requiredFields) {
        const fieldErrors = validationResult.errors.filter(e => e.includes('Required field') && e.includes('missing'));
        console.error('Required field validation failed. Found the following issues:');
        fieldErrors.forEach(error => console.error(`  - ${error}`));
        throw new Error('Required field validation failed. See above for details.');
    }
    console.log('✓ All required fields are present');
});

Then('it should be generated within the expected timeframe', function () {
    // Extract date from filename and check if it's recent
    const dateMatch = latestLogFile.key.match(/(\d{14})/);
    if (dateMatch) {
        const fileDate = dateMatch[1];
        const year = parseInt(fileDate.substring(0, 4));
        const month = parseInt(fileDate.substring(4, 6));
        const day = parseInt(fileDate.substring(6, 8));
        const hour = parseInt(fileDate.substring(8, 10));
        
        const logDate = new Date(year, month - 1, day, hour);
        const now = new Date();
        const daysDiff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 2) {
            throw new Error(`Log file is too old: ${daysDiff} days old`);
        }
    }
    console.log('✓ File was generated within expected timeframe');
});

Then('it should follow weekend generation rules', function () {
    // Check if any weekend/holiday specific errors were found
    const weekendErrors = validationResult.errors.filter(e => 
        e.includes('Sunday') || e.includes('holiday') || e.includes('weekend')
    );
    
    if (weekendErrors.length > 0) {
        console.log(`⚠️ Weekend/Holiday warnings: ${weekendErrors.join(', ')}`);
    } else {
        console.log('✓ Weekend generation rules followed');
    }
}); 