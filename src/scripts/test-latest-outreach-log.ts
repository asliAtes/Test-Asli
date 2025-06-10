import { S3Client, ListObjectsV2Command, ListObjectsV2CommandOutput, GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as dotenv from 'dotenv';
import { DateTime } from 'luxon';

// Load environment variables
dotenv.config();

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
        'ACCOUNTNUMBER',
        'FINANCIALACCOUNT', 
        'TEMPLATENAME',
        'TEMPLATEMEMO',
        'TIMESTAMPCST-CDT',
        'CHANNEL',
        'EVENTNAME',
        'SMSCOPY'
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
        const dateMatch = fileName.match(/(\d{8})/);
        let fileDate: Date | null = null;
        if (dateMatch) {
            const y = parseInt(dateMatch[1].substring(0, 4));
            const m = parseInt(dateMatch[1].substring(4, 6));
            const d = parseInt(dateMatch[1].substring(6, 8));
            fileDate = new Date(Date.UTC(y, m - 1, d));
        }
        if (fileDate && this.isHolidayOrSunday(fileDate)) {
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

        this.validateLineEndings(content, result);
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
        let headerCaseWarnings: string[] = [];
        let headerMappingWarnings: string[] = [];

        const headerMappings: Record<string, string[]> = {
            ACCOUNTNUMBER: ['ACCOUNTNUMBER'],
            FINANCIALACCOUNT: ['FINANCIALACCOUNT'],
            TEMPLATENAME: ['TEMPLATENAME'],
            TEMPLATEMEMO: ['TEMPLATEMEMO'],
            'TIMESTAMPCST-CDT': ['TIMESTAMPCST-CDT'],
            CHANNEL: ['CHANNEL'],
            EVENTNAME: ['EVENTNAME'],
            SMSCOPY: ['SMSCOPY']
        };

        for (const required of this.requiredHeaders) {
            const alternatives = headerMappings[required] || [required];
            const foundIdx = headers.findIndex(h => alternatives.some(a => a.toLowerCase() === h.toLowerCase()));
            if (foundIdx === -1) {
                result.formatCompliance.headers = false;
                result.errors.push(`Missing required header: ${required}`);
            } else {
                if (headers[foundIdx] !== required) {
                    headerMappingWarnings.push(`Header mapping: expected '${required}', found '${headers[foundIdx]}'`);
                }
                if (headers[foundIdx].toLowerCase() === required.toLowerCase() && headers[foundIdx] !== required) {
                    headerCaseWarnings.push(`Header case inconsistency: expected '${required}', found '${headers[foundIdx]}'`);
                }
            }
        }

        if (headerMappingWarnings.length > 0) {
            result.errors.push(...headerMappingWarnings);
        }
        if (headerCaseWarnings.length > 0) {
            result.errors.push(...headerCaseWarnings);
        }

        if (headers.some(h => h !== h.toUpperCase())) {
            result.errors.push('Not all headers are in uppercase');
        }
    }

    private validateDataQuality(dataLines: string[], result: OutreachLogValidationResult) {
        const nullValueErrors: string[] = [];
        const formatErrors: string[] = [];
        const typeErrors: string[] = [];
        const requiredFieldErrors: string[] = [];

        // Track null values by column
        const columnNullCounts: Record<number, number> = {};
        const columnTotalCounts: Record<number, number> = {};
        const sampleNullValues: Record<number, string[]> = {};

        // NEW: Track structure vs data quality issues separately
        const structureIssues = {
            correctFieldCount: 0,
            incorrectFieldCount: 0,
            emptyLines: 0,
            fragmentLines: 0, // Lines with just message fragments
            oversizedLines: 0  // Lines with too many fields
        };

        // Track null values only in properly structured rows
        const properRowNullCounts: Record<number, number> = {};
        const properRowTotalCounts: Record<number, number> = {};

        console.log(`Processing all ${dataLines.length.toLocaleString()} data lines for comprehensive analysis...`);

        // Error counters to prevent memory overflow
        let nullValueErrorCount = 0;
        let formatErrorCount = 0;
        let typeErrorCount = 0; 
        let requiredFieldErrorCount = 0;
        const MAX_ERRORS_PER_TYPE = 1000; // Limit errors to prevent stack overflow

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            if (!line.trim()) {
                structureIssues.emptyLines++;
                continue;
            }

            const fields = line.split(',').map(f => f.trim());
            const lineNumber = i + 2;
            
            // Categorize line by structure
            if (fields.length === this.requiredHeaders.length) {
                structureIssues.correctFieldCount++;
                
                // Only analyze null values in properly structured rows
                for (let colIndex = 0; colIndex < fields.length; colIndex++) {
                    properRowTotalCounts[colIndex] = (properRowTotalCounts[colIndex] || 0) + 1;
                    
                    const value = fields[colIndex];
                    if (!value || value === '' || value === 'null') {
                        properRowNullCounts[colIndex] = (properRowNullCounts[colIndex] || 0) + 1;
                    }
                }
            } else if (fields.length === 1) {
                structureIssues.fragmentLines++;
                // Check if it's a message fragment
                const content = fields[0].toLowerCase();
                if (content.includes('text stop') || content.includes('end.') || content.length < 50) {
                    // This is likely a message fragment, not real data
                }
            } else if (fields.length > this.requiredHeaders.length) {
                structureIssues.oversizedLines++;
            } else {
                structureIssues.incorrectFieldCount++;
            }
            
            // Track ALL column statistics for comparison (old method)
            for (let colIndex = 0; colIndex < Math.max(fields.length, 8); colIndex++) {
                columnTotalCounts[colIndex] = (columnTotalCounts[colIndex] || 0) + 1;
                
                const value = fields[colIndex];
                if (!value || value === '' || value === 'null') {
                    columnNullCounts[colIndex] = (columnNullCounts[colIndex] || 0) + 1;
                    
                    // Store sample null locations
                    if (!sampleNullValues[colIndex]) {
                        sampleNullValues[colIndex] = [];
                    }
                    if (sampleNullValues[colIndex].length < 5) {
                        sampleNullValues[colIndex].push(`Line ${lineNumber}`);
                    }
                }
            }
            
            // Check for null values - but limit error collection
            const nullFields = fields.map((f, idx) => ({ value: f, index: idx }))
                .filter(({ value }) => value === 'null' || value === '');
            
            if (nullFields.length > 0) {
                result.dataQuality.noNullValues = false;
                nullValueErrorCount++;
                if (nullValueErrors.length < MAX_ERRORS_PER_TYPE) {
                    nullValueErrors.push(`Line ${lineNumber}: Null/empty values found in columns: ${nullFields.map(f => this.requiredHeaders[f.index] || `Column${f.index}`).join(', ')}`);
                }
            }

            // Validate field formats - but limit error collection
            const lineFormatErrors: string[] = [];
            const lineTypeErrors: string[] = [];
            const lineRequiredFieldErrors: string[] = [];
            
            this.validateFieldFormatsAndTypes(fields, lineNumber, lineFormatErrors, lineTypeErrors, lineRequiredFieldErrors);
            
            // Count errors but limit storage
            formatErrorCount += lineFormatErrors.length;
            typeErrorCount += lineTypeErrors.length;
            requiredFieldErrorCount += lineRequiredFieldErrors.length;
            
            if (formatErrors.length < MAX_ERRORS_PER_TYPE) {
                formatErrors.push(...lineFormatErrors.slice(0, MAX_ERRORS_PER_TYPE - formatErrors.length));
            }
            if (typeErrors.length < MAX_ERRORS_PER_TYPE) {
                typeErrors.push(...lineTypeErrors.slice(0, MAX_ERRORS_PER_TYPE - typeErrors.length));
            }
            if (requiredFieldErrors.length < MAX_ERRORS_PER_TYPE) {
                requiredFieldErrors.push(...lineRequiredFieldErrors.slice(0, MAX_ERRORS_PER_TYPE - requiredFieldErrors.length));
            }
            
            // Progress indicator for large files
            if (i % 10000 === 0 && i > 0) {
                console.log(`  Processed ${i.toLocaleString()}/${dataLines.length.toLocaleString()} lines (${((i/dataLines.length)*100).toFixed(1)}%)...`);
            }
        }

        // NEW: Structure Analysis Report
        console.log('\n🏗️  CSV STRUCTURE ANALYSIS:');
        console.log('═'.repeat(80));
        console.log('┌──────────────────────────────────────────────────────────────────────┐');
        console.log('│                          STRUCTURE BREAKDOWN                         │');
        console.log('├──────────────────────────────────────────────────────────────────────┤');
        const totalLines = dataLines.length;
        console.log(`│ Total Data Lines:      ${totalLines.toLocaleString().padStart(10)} (100.0%)                     │`);
        console.log(`│ Properly Structured:   ${structureIssues.correctFieldCount.toLocaleString().padStart(10)} (${((structureIssues.correctFieldCount/totalLines)*100).toFixed(1).padStart(5)}%)                     │`);
        console.log(`│ Message Fragments:     ${structureIssues.fragmentLines.toLocaleString().padStart(10)} (${((structureIssues.fragmentLines/totalLines)*100).toFixed(1).padStart(5)}%)                     │`);
        console.log(`│ Oversized Rows:        ${structureIssues.oversizedLines.toLocaleString().padStart(10)} (${((structureIssues.oversizedLines/totalLines)*100).toFixed(1).padStart(5)}%)                     │`);
        console.log(`│ Other Malformed:       ${structureIssues.incorrectFieldCount.toLocaleString().padStart(10)} (${((structureIssues.incorrectFieldCount/totalLines)*100).toFixed(1).padStart(5)}%)                     │`);
        console.log(`│ Empty Lines:           ${structureIssues.emptyLines.toLocaleString().padStart(10)} (${((structureIssues.emptyLines/totalLines)*100).toFixed(1).padStart(5)}%)                     │`);
        console.log('└──────────────────────────────────────────────────────────────────────┘');

        // Generate detailed column analysis - CORRECTED for properly structured rows
        console.log('\n📊 NULL VALUES IN PROPERLY STRUCTURED ROWS ONLY:');
        console.log('═'.repeat(80));
        console.log('┌─────────────────────────────────────────────────────────────────────────┐');
        console.log('│                    TRUE DATA QUALITY ANALYSIS                           │');
        console.log('├─────────────────────────────────────────────────────────────────────────┤');
        
        const headerNames = [
            'ACCOUNTNUMBER', 'FINANCIALACCOUNT', 'TEMPLATENAME', 'TEMPLATEMEMO',
            'TIMESTAMPCST-CDT', 'CHANNEL', 'EVENTNAME', 'SMSCOPY'
        ];
        
        for (let colIndex = 0; colIndex < 8; colIndex++) {
            const headerName = headerNames[colIndex];
            const nullCount = properRowNullCounts[colIndex] || 0;
            const totalCount = properRowTotalCounts[colIndex] || 0;
            const nullPercentage = totalCount > 0 ? ((nullCount / totalCount) * 100).toFixed(1) : '0.0';
            
            let status = '✅ CLEAN';
            if (nullCount > 0) {
                if (nullCount > totalCount * 0.1) {
                    status = '🔴 CRITICAL';
                } else if (nullCount > totalCount * 0.01) {
                    status = '🟡 WARNING';
                } else {
                    status = '🟠 MINOR';
                }
            }
            
            console.log(`│ Col ${colIndex + 1}: ${headerName.padEnd(20)} │ ${nullCount.toString().padStart(4)} nulls/${totalCount.toString().padStart(5)} (${nullPercentage.padStart(5)}%) │ ${status.padEnd(9)} │`);
        }
        console.log('└─────────────────────────────────────────────────────────────────────────┘');

        // ORIGINAL analysis for comparison
        console.log('\n📊 ALL ROWS NULL ANALYSIS (INCLUDING MALFORMED):');
        console.log('═'.repeat(80));
        console.log('┌─────────────────────────────────────────────────────────────────────────┐');
        console.log('│                   INFLATED BY STRUCTURE ISSUES                          │');
        console.log('├─────────────────────────────────────────────────────────────────────────┤');
        
        for (let colIndex = 0; colIndex < Math.max(8, Math.max(...Object.keys(columnTotalCounts).map(Number))); colIndex++) {
            const headerName = headerNames[colIndex] || `UNKNOWN_COL_${colIndex}`;
            const nullCount = columnNullCounts[colIndex] || 0;
            const totalCount = columnTotalCounts[colIndex] || 0;
            const nullPercentage = totalCount > 0 ? ((nullCount / totalCount) * 100).toFixed(1) : '0.0';
            
            let status = '✅ CLEAN';
            if (nullCount > 0) {
                if (nullCount > totalCount * 0.1) {
                    status = '🔴 CRITICAL';
                } else if (nullCount > totalCount * 0.01) {
                    status = '🟡 WARNING';
                } else {
                    status = '🟠 MINOR';
                }
            }
            
            console.log(`│ Col ${colIndex + 1}: ${headerName.padEnd(20)} │ ${nullCount.toString().padStart(4)} nulls/${totalCount.toString().padStart(4)} (${nullPercentage.padStart(5)}%) │ ${status.padEnd(9)} │`);
        }
        console.log('└─────────────────────────────────────────────────────────────────────────┘');

        // Add error summary instead of individual errors
        if (nullValueErrorCount > 0) {
            result.dataQuality.noNullValues = false;
            result.errors.push(`CRITICAL: ${nullValueErrorCount.toLocaleString()} lines contain null/empty values (${nullValueErrors.length} samples shown)`);
            result.errors.push(...nullValueErrors);
        }
        if (formatErrorCount > 0) {
            result.dataQuality.validFormats = false;
            result.errors.push(`CRITICAL: ${formatErrorCount.toLocaleString()} format validation errors (${formatErrors.length} samples shown)`);
            result.errors.push(...formatErrors);
        }
        if (typeErrorCount > 0) {
            result.dataQuality.dataTypeConsistency = false;
            result.errors.push(`CRITICAL: ${typeErrorCount.toLocaleString()} data type consistency errors (${typeErrors.length} samples shown)`);
            result.errors.push(...typeErrors);
        }
        if (requiredFieldErrorCount > 0) {
            result.dataQuality.requiredFields = false;
            result.errors.push(`CRITICAL: ${requiredFieldErrorCount.toLocaleString()} required field errors (${requiredFieldErrors.length} samples shown)`);
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
        // Limit errors per line to prevent overflow
        const MAX_ERRORS_PER_LINE = 3;
        let errorsThisLine = 0;

        // Validate TIMESTAMPCST-CDT field (should contain date/time)
        const dateTimeIndex = this.requiredHeaders.indexOf('TIMESTAMPCST-CDT');
        if (dateTimeIndex >= 0 && dateTimeIndex < fields.length && errorsThisLine < MAX_ERRORS_PER_LINE) {
            const dateTime = fields[dateTimeIndex];
            if (!dateTime) {
                requiredFieldErrors.push(`Line ${lineNumber}: Required field TIMESTAMPCST-CDT is missing`);
                errorsThisLine++;
            } else {
                // Check for common date formats
                const hasDatePattern = /\d{1,2}\/\d{1,2}\/\d{4}/.test(dateTime) || 
                                     /\d{4}-\d{2}-\d{2}/.test(dateTime) || 
                                     /\d{1,2}-\d{1,2}-\d{4}/.test(dateTime);
                if (!hasDatePattern && errorsThisLine < MAX_ERRORS_PER_LINE) {
                    formatErrors.push(`Line ${lineNumber}: TIMESTAMPCST-CDT field may not contain valid date format: ${dateTime.substring(0, 20)}...`);
                    errorsThisLine++;
                }
            }
        }

        // Validate ACCOUNTNUMBER field (should be numeric) - only if we haven't hit error limit
        const accountIndex = this.requiredHeaders.indexOf('ACCOUNTNUMBER');
        if (accountIndex >= 0 && accountIndex < fields.length && errorsThisLine < MAX_ERRORS_PER_LINE) {
            const account = fields[accountIndex];
            if (!account) {
                requiredFieldErrors.push(`Line ${lineNumber}: Required field ACCOUNTNUMBER is missing`);
                errorsThisLine++;
            } else if (!/^\d+$/.test(account.replace(/[^\d]/g, '')) && errorsThisLine < MAX_ERRORS_PER_LINE) {
                formatErrors.push(`Line ${lineNumber}: ACCOUNTNUMBER should be numeric: ${account.substring(0, 15)}...`);
                errorsThisLine++;
            }
        }

        // Check for field count mismatch - most critical error
        if (fields.length !== this.requiredHeaders.length && errorsThisLine < MAX_ERRORS_PER_LINE) {
            requiredFieldErrors.push(`Line ${lineNumber}: Expected ${this.requiredHeaders.length} fields, found ${fields.length}`);
            errorsThisLine++;
        }
    }
}

// Debug: Check if AWS credentials are loaded
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;

console.log('AWS Credentials Status:');
console.log('----------------------');
console.log(`Access Key ID: ${accessKeyId ? '✅ Present' : '❌ Missing'} (${accessKeyId ? accessKeyId.substring(0, 4) + '...' : 'N/A'})`);
console.log(`Secret Key: ${secretKey ? '✅ Present' : '❌ Missing'} (${secretKey ? '****' : 'N/A'})`);
console.log(`Session Token: ${sessionToken ? '✅ Present' : '❌ Missing'} (${sessionToken ? sessionToken.substring(0, 4) + '...' : 'N/A'})`);
console.log('----------------------\n');

async function testLastWeekOutreachLogs() {
    try {
        console.log('🔍 ANALYZING LATEST OUTREACH LOG FILE...');
        console.log('=====================================\n');
        
        const validator = new OutreachLogValidator();
        const s3Client = validator['s3Client'];
        const bucketName = 'kredos-uscellular-production';
        let allLogObjects: { key: string, lastModified: Date }[] = [];
        let ContinuationToken = undefined;
        do {
            const listCommand = new ListObjectsV2Command({
                Bucket: bucketName,
                ContinuationToken
            });
            const response = await s3Client.send(listCommand) as ListObjectsV2CommandOutput;
            if (response.Contents) {
                response.Contents.forEach((file: any) => {
                    if (file.Key && file.Key.includes('KAI_Kredos_outreach_log') && file.Key.endsWith('.csv')) {
                        allLogObjects.push({ key: file.Key, lastModified: file.LastModified });
                    }
                });
            }
            ContinuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
        } while (ContinuationToken);

        // Get the most recent file
        const sortedFiles = allLogObjects.sort((a, b) => (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0));
        
        if (sortedFiles.length === 0) {
            console.log('❌ No outreach log files found in S3 bucket.');
            return;
        }

        const latestFile = sortedFiles[0];
        console.log(`📋 TOTAL FILES IN S3: ${allLogObjects.length}`);
        console.log(`🎯 ANALYZING LATEST FILE: ${latestFile.key}`);
        
        const centralTime = DateTime.fromJSDate(latestFile.lastModified).setZone('America/Chicago');
        const now = DateTime.utc();
        const fileAge = now.diff(DateTime.fromJSDate(latestFile.lastModified)).as('hours');
        
        console.log(`📅 File Date: ${centralTime.toFormat('yyyy-LL-dd HH:mm:ss ZZZZ')}`);
        console.log(`⏰ File Age: ${fileAge.toFixed(1)} hours old`);
        console.log(`📆 Day of Week: ${centralTime.toFormat('cccc')}`);
        
        const isWeekend = centralTime.weekday === 6 || centralTime.weekday === 7;
        if (isWeekend) {
            console.log(`⚠️  WEEKEND FILE DETECTED`);
        } else {
            console.log(`✅ WEEKDAY FILE`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📥 DOWNLOADING AND ANALYZING FILE...');
        console.log('='.repeat(60));

        // Get file content
        const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: latestFile.key
        });
        const fileResponse = await s3Client.send(getCommand) as GetObjectCommandOutput;
        const stream = fileResponse.Body as NodeJS.ReadableStream;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        const content = Buffer.concat(chunks).toString('utf-8');

        // Basic file statistics
        const lines = content.split(/\r\n|\n/);
        const fileSize = content.length;
        const headerLine = lines[0] || '';
        const headers = headerLine.split(',').map(h => h.trim());
        
        console.log(`\n📊 FILE STATISTICS:`);
        console.log(`├─ File Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`├─ Total Lines: ${lines.length.toLocaleString()}`);
        console.log(`├─ Data Lines: ${(lines.length - 1).toLocaleString()}`);
        console.log(`├─ Header Columns: ${headers.length}`);
        console.log(`└─ Average Line Length: ${(fileSize / lines.length).toFixed(1)} characters`);

        console.log(`\n📋 HEADERS FOUND:`);
        headers.forEach((header, index) => {
            console.log(`├─ ${index + 1}. "${header}"`);
        });

        // Sample data lines
        console.log(`\n📄 SAMPLE DATA LINES (first 3):`);
        lines.slice(1, 4).forEach((line, index) => {
            if (line.trim()) {
                const fields = line.split(',').map(f => f.trim());
                console.log(`├─ Line ${index + 2}: ${fields.length} fields`);
                console.log(`│  └─ Sample: ${fields.slice(0, 3).join(' | ')}...`);
            }
        });

        console.log('\n' + '='.repeat(60));
        console.log('🔬 RUNNING COMPREHENSIVE VALIDATION...');
        console.log('='.repeat(60));

        // Run validation with increased sample size for better analysis
        const validationResult = await validator.validateOutreachLog(latestFile.key, content);
        
        // DETAILED ROW-BY-ROW ANALYSIS
        console.log('\n🔍 DETAILED ROW-BY-ROW ANALYSIS:');
        console.log('='.repeat(80));
        
        // Header analysis first
        console.log('\n📋 HEADER ANALYSIS:');
        const requiredHeaders = ['ACCOUNTNUMBER', 'FINANCIALACCOUNT', 'TEMPLATENAME', 'TEMPLATEMEMO', 'TIMESTAMPCST-CDT', 'CHANNEL', 'EVENTNAME', 'SMSCOPY'];
        const headerMappings = {
            ACCOUNTNUMBER: ['ACCOUNTNUMBER'],
            FINANCIALACCOUNT: ['FINANCIALACCOUNT'],
            TEMPLATENAME: ['TEMPLATENAME'],
            TEMPLATEMEMO: ['TEMPLATEMEMO'],
            'TIMESTAMPCST-CDT': ['TIMESTAMPCST-CDT'],
            CHANNEL: ['CHANNEL'],
            EVENTNAME: ['EVENTNAME'],
            SMSCOPY: ['SMSCOPY']
        };
        
        console.log('┌────────────────────────────────────────────────────────────┐');
        console.log('│                    HEADER MAPPING ANALYSIS                 │');
        console.log('├────────────────────────────────────────────────────────────┤');
        
        requiredHeaders.forEach((required, index) => {
            const alternatives = headerMappings[required] || [required];
            const foundIdx = headers.findIndex(h => alternatives.some(a => a.toLowerCase() === h.toLowerCase()));
            
            if (foundIdx === -1) {
                console.log(`│ Column ${index + 1}: ${required.padEnd(20)} │ ❌ MISSING                │`);
            } else {
                const found = headers[foundIdx];
                const status = found === required ? '✅ EXACT' : '⚠️  MAPPED';
                console.log(`│ Column ${index + 1}: ${required.padEnd(20)} │ ${status} (${found}) │`);
            }
        });
        console.log('└────────────────────────────────────────────────────────────┘');

        // Create column mapping for data analysis
        const columnMapping: Record<string, number> = {};
        requiredHeaders.forEach(required => {
            const alternatives = headerMappings[required] || [required];
            const foundIdx = headers.findIndex(h => alternatives.some(a => a.toLowerCase() === h.toLowerCase()));
            if (foundIdx >= 0) {
                columnMapping[required] = foundIdx;
            }
        });

        console.log('\n📊 SAMPLE DATA ROWS ANALYSIS (First 20 rows):');
        console.log('═'.repeat(100));
        
        // Analyze first 20 data rows in detail
        for (let i = 1; i <= Math.min(21, lines.length - 1); i++) {
            const line = lines[i];
            if (!line || !line.trim()) {
                console.log(`\nRow ${i + 1}: [EMPTY ROW]`);
                continue;
            }
            
            const fields = line.split(',').map(f => f.trim());
            console.log(`\n┌─ ROW ${i + 1} ─────────────────────────────────────────────────────┐`);
            console.log(`│ Total Fields: ${fields.length} | Expected: ${headers.length}                    │`);
            console.log('├───────────────────────────────────────────────────────────────┤');
            
            // Check each required field
            requiredHeaders.forEach((required, reqIndex) => {
                const colIndex = columnMapping[required];
                if (colIndex === undefined) {
                    console.log(`│ ${required.padEnd(15)}: ❌ HEADER MISSING                  │`);
                } else if (colIndex >= fields.length) {
                    console.log(`│ ${required.padEnd(15)}: ❌ FIELD MISSING (col ${colIndex})        │`);
                } else {
                    const value = fields[colIndex];
                    if (!value || value === '' || value === 'null') {
                        console.log(`│ ${required.padEnd(15)}: ❌ EMPTY/NULL                      │`);
                    } else {
                        // Validate format based on field type
                        let status = '✅ OK';
                        let issue = '';
                        
                        if (required === 'PHONE_NUMBER') {
                            if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
                                status = '❌ INVALID';
                                issue = `(${value.length} chars: "${value.substring(0, 15)}...")`;
                            }
                        } else if (required === 'SEND_DATE') {
                            if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
                                status = '❌ INVALID';
                                issue = `(format: "${value.substring(0, 20)}...")`;
                            }
                        }
                        
                        const displayValue = value.length > 25 ? value.substring(0, 25) + '...' : value;
                        console.log(`│ ${required.padEnd(15)}: ${status} "${displayValue}" ${issue}│`);
                    }
                }
            });
            
            // Show extra fields if any
            if (fields.length > headers.length) {
                console.log(`│ EXTRA FIELDS    : ⚠️  ${fields.length - headers.length} extra field(s) found      │`);
            }
            
            console.log('└───────────────────────────────────────────────────────────────┘');
        }

        // ENHANCED Line ending analysis with hex inspection
        console.log('\n🔍 DETAILED LINE ENDING ANALYSIS (First 20 lines):');
        console.log('═'.repeat(90));
        const rawLines = content.match(/.*?(\r\n|\n|$)/g) || [];
        
        console.log('┌────────────────────────────────────────────────────────────────────────────────────┐');
        console.log('│                              HEX BYTE ANALYSIS                                     │');
        console.log('├────────────────────────────────────────────────────────────────────────────────────┤');
        
        for (let i = 0; i < Math.min(20, rawLines.length); i++) {
            const line = rawLines[i];
            const lineContent = line.replace(/\r?\n/g, '');
            const linePreview = lineContent.substring(0, 40);
            
            // Get the actual ending bytes
            let endingBytes = '';
            let status = '';
            
            if (line.endsWith('\r\n')) {
                endingBytes = '0D 0A (CR+LF)';
                status = '✅ CORRECT';
            } else if (line.endsWith('\n')) {
                endingBytes = '0A (LF only)';
                status = '❌ WRONG';
            } else if (line.endsWith('\r')) {
                endingBytes = '0D (CR only)';
                status = '❌ WRONG';
            } else {
                endingBytes = '(no ending)';
                status = '❌ NONE';
            }
            
            // Show line type
            let lineType = '';
            if (i === 0) {
                lineType = '[HEADER]';
            } else if (lineContent.trim() === '') {
                lineType = '[EMPTY]';
            } else if (lineContent.includes('Text STOP') || lineContent.length < 50) {
                lineType = '[FRAGMENT]';
            } else if (lineContent.split(',').length > 8) {
                lineType = '[DATA+]';
            } else if (lineContent.split(',').length === 8) {
                lineType = '[DATA]';
            } else {
                lineType = '[OTHER]';
            }
            
            console.log(`│ L${(i + 1).toString().padStart(2)}: ${status.padEnd(10)} ${endingBytes.padEnd(15)} ${lineType.padEnd(10)} │ "${linePreview}..." │`);
        }
        console.log('└────────────────────────────────────────────────────────────────────────────────────┘');

        // Statistical analysis of line endings across the entire file
        console.log('\n📊 COMPREHENSIVE LINE ENDING STATISTICS:');
        console.log('═'.repeat(80));
        
        let crlfCount = 0;
        let lfOnlyCount = 0;
        let crOnlyCount = 0;
        let noEndingCount = 0;
        
        const lineTypeCounts = {
            header: { crlf: 0, lf: 0, cr: 0, none: 0 },
            data: { crlf: 0, lf: 0, cr: 0, none: 0 },
            fragment: { crlf: 0, lf: 0, cr: 0, none: 0 },
            empty: { crlf: 0, lf: 0, cr: 0, none: 0 },
            other: { crlf: 0, lf: 0, cr: 0, none: 0 }
        };
        
        for (let i = 0; i < rawLines.length; i++) {
            const line = rawLines[i];
            const lineContent = line.replace(/\r?\n/g, '');
            
            // Determine line type
            let category = 'other';
            if (i === 0) {
                category = 'header';
            } else if (lineContent.trim() === '') {
                category = 'empty';
            } else if (lineContent.includes('Text STOP') || lineContent.length < 50) {
                category = 'fragment';
            } else if (lineContent.split(',').length >= 8) {
                category = 'data';
            }
            
            // Count ending type
            if (line.endsWith('\r\n')) {
                crlfCount++;
                lineTypeCounts[category].crlf++;
            } else if (line.endsWith('\n')) {
                lfOnlyCount++;
                lineTypeCounts[category].lf++;
            } else if (line.endsWith('\r')) {
                crOnlyCount++;
                lineTypeCounts[category].cr++;
            } else {
                noEndingCount++;
                lineTypeCounts[category].none++;
            }
        }
        
        const totalLines = rawLines.length;
        console.log('┌──────────────────────────────────────────────────────────────────────┐');
        console.log('│                        OVERALL LINE ENDING STATS                     │');
        console.log('├──────────────────────────────────────────────────────────────────────┤');
        console.log(`│ Total Lines:        ${totalLines.toLocaleString().padStart(10)}                                    │`);
        console.log(`│ CR+LF (correct):    ${crlfCount.toLocaleString().padStart(10)} (${((crlfCount/totalLines)*100).toFixed(1).padStart(5)}%)                    │`);
        console.log(`│ LF only (wrong):    ${lfOnlyCount.toLocaleString().padStart(10)} (${((lfOnlyCount/totalLines)*100).toFixed(1).padStart(5)}%)                    │`);
        console.log(`│ CR only (wrong):    ${crOnlyCount.toLocaleString().padStart(10)} (${((crOnlyCount/totalLines)*100).toFixed(1).padStart(5)}%)                    │`);
        console.log(`│ No ending (wrong):  ${noEndingCount.toLocaleString().padStart(10)} (${((noEndingCount/totalLines)*100).toFixed(1).padStart(5)}%)                    │`);
        console.log('└──────────────────────────────────────────────────────────────────────┘');

        console.log('\n┌────────────────────────────────────────────────────────────────────────────────┐');
        console.log('│                          LINE TYPE BREAKDOWN                                   │');
        console.log('├────────────────────────────────────────────────────────────────────────────────┤');
        
        Object.entries(lineTypeCounts).forEach(([type, counts]) => {
            const total = counts.crlf + counts.lf + counts.cr + counts.none;
            if (total > 0) {
                const crlfPct = ((counts.crlf / total) * 100).toFixed(1);
                const lfPct = ((counts.lf / total) * 100).toFixed(1);
                console.log(`│ ${type.toUpperCase().padEnd(8)}: ${total.toLocaleString().padStart(7)} total │ CR+LF: ${counts.crlf.toLocaleString().padStart(6)} (${crlfPct.padStart(5)}%) │ LF: ${counts.lf.toLocaleString().padStart(6)} (${lfPct.padStart(5)}%) │`);
            }
        });
        console.log('└────────────────────────────────────────────────────────────────────────────────┘');

        console.log(`\n📈 VALIDATION RESULTS SUMMARY:`);
        console.log(`┌─────────────────────────────────────────┐`);
        console.log(`│              COMPLIANCE STATUS          │`);
        console.log(`├─────────────────────────────────────────┤`);
        console.log(`│ Line Endings (CR+LF): ${validationResult.formatCompliance.lineEndings ? '✅ PASS' : '❌ FAIL'}    │`);
        console.log(`│ File Name Pattern:    ${validationResult.formatCompliance.nameConvention ? '✅ PASS' : '❌ FAIL'}    │`);
        console.log(`│ File Structure:       ${validationResult.formatCompliance.fileStructure ? '✅ PASS' : '❌ FAIL'}    │`);
        console.log(`│ Headers Valid:        ${validationResult.formatCompliance.headers ? '✅ PASS' : '❌ FAIL'}    │`);
        console.log(`├─────────────────────────────────────────┤`);
        console.log(`│ No Null Values:       ${validationResult.dataQuality.noNullValues ? '✅ PASS' : '❌ FAIL'}    │`);
        console.log(`│ Valid Formats:        ${validationResult.dataQuality.validFormats ? '✅ PASS' : '❌ FAIL'}    │`);
        console.log(`│ Data Consistency:     ${validationResult.dataQuality.dataTypeConsistency ? '✅ PASS' : '❌ FAIL'}    │`);
        console.log(`│ Required Fields:      ${validationResult.dataQuality.requiredFields ? '✅ PASS' : '❌ FAIL'}    │`);
        console.log(`└─────────────────────────────────────────┘`);

        // Categorize and count errors
        const errorCategories = {
            lineEndings: validationResult.errors.filter(e => e.includes('CR+LF')).length,
            missingHeaders: validationResult.errors.filter(e => e.includes('Missing required header')).length,
            headerMapping: validationResult.errors.filter(e => e.includes('Header mapping')).length,
            nullValues: validationResult.errors.filter(e => e.includes('Null/empty values')).length,
            invalidFormats: validationResult.errors.filter(e => e.includes('Invalid') && e.includes('format')).length,
            missingFields: validationResult.errors.filter(e => e.includes('Required field') && e.includes('missing')).length,
            other: validationResult.errors.filter(e => 
                !e.includes('CR+LF') && 
                !e.includes('Missing required header') && 
                !e.includes('Header mapping') && 
                !e.includes('Null/empty values') && 
                !(e.includes('Invalid') && e.includes('format')) &&
                !(e.includes('Required field') && e.includes('missing'))
            ).length
        };

        console.log(`\n📊 ERROR BREAKDOWN:`);
        console.log(`┌─────────────────────────────────────────┐`);
        console.log(`│              ERROR STATISTICS           │`);
        console.log(`├─────────────────────────────────────────┤`);
        console.log(`│ Total Issues Found: ${validationResult.errors.length.toLocaleString().padStart(13)} │`);
        console.log(`├─────────────────────────────────────────┤`);
        console.log(`│ Line Ending Issues:    ${errorCategories.lineEndings.toLocaleString().padStart(10)} │`);
        console.log(`│ Missing Headers:       ${errorCategories.missingHeaders.toLocaleString().padStart(10)} │`);
        console.log(`│ Header Mapping:        ${errorCategories.headerMapping.toLocaleString().padStart(10)} │`);
        console.log(`│ Null/Empty Values:     ${errorCategories.nullValues.toLocaleString().padStart(10)} │`);
        console.log(`│ Invalid Formats:       ${errorCategories.invalidFormats.toLocaleString().padStart(10)} │`);
        console.log(`│ Missing Fields:        ${errorCategories.missingFields.toLocaleString().padStart(10)} │`);
        console.log(`│ Other Issues:          ${errorCategories.other.toLocaleString().padStart(10)} │`);
        console.log(`└─────────────────────────────────────────┘`);

        // Show critical issues first
        console.log(`\n🚨 CRITICAL ISSUES (Top 10):`);
        const criticalIssues = validationResult.errors.filter(e => 
            e.includes('Missing required header') || 
            e.includes('Header mapping') ||
            e.includes('extension') ||
            e.includes('blank row')
        );
        criticalIssues.slice(0, 10).forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });

        // Show data quality issues
        if (errorCategories.nullValues > 0 || errorCategories.invalidFormats > 0 || errorCategories.missingFields > 0) {
            console.log(`\n⚠️  DATA QUALITY ISSUES (Top 10):`);
            const dataIssues = validationResult.errors.filter(e => 
                e.includes('Null/empty values') || 
                (e.includes('Invalid') && e.includes('format')) ||
                (e.includes('Required field') && e.includes('missing'))
            );
            dataIssues.slice(0, 10).forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        // Performance metrics
        const lineEndingErrorRate = (errorCategories.lineEndings / lines.length * 100);
        const dataQualityErrorRate = ((errorCategories.nullValues + errorCategories.invalidFormats + errorCategories.missingFields) / 100 * 100);

        console.log(`\n📈 QUALITY METRICS:`);
        console.log(`┌─────────────────────────────────────────┐`);
        console.log(`│            QUALITY ASSESSMENT           │`);
        console.log(`├─────────────────────────────────────────┤`);
        console.log(`│ Line Ending Error Rate: ${lineEndingErrorRate.toFixed(1).padStart(9)}% │`);
        console.log(`│ Data Quality Error Rate: ${dataQualityErrorRate.toFixed(1).padStart(8)}% │`);
        console.log(`│ Header Compliance:       ${validationResult.formatCompliance.headers ? 'PASS' : 'FAIL'.padStart(8)} │`);
        console.log(`│ Overall File Health:     ${validationResult.errors.length === 0 ? 'EXCELLENT' : validationResult.errors.length < 100 ? 'GOOD' : validationResult.errors.length < 1000 ? 'POOR' : 'CRITICAL'.padStart(8)} │`);
        console.log(`└─────────────────────────────────────────┘`);

        // Recommendations
        console.log(`\n💡 RECOMMENDATIONS:`);
        if (errorCategories.lineEndings > 0) {
            console.log(`🔧 Fix line ending format - implement CR+LF encoding`);
        }
        if (errorCategories.missingHeaders > 0) {
            console.log(`🔧 Add missing required headers: PHONE_NUMBER, MESSAGE_TEXT, STATUS`);
        }
        if (errorCategories.headerMapping > 0) {
            console.log(`🔧 Standardize header naming convention`);
        }
        if (errorCategories.invalidFormats > 0) {
            console.log(`🔧 Implement field format validation (phone numbers, dates)`);
        }
        if (errorCategories.nullValues > 0 || errorCategories.missingFields > 0) {
            console.log(`🔧 Add data completeness checks`);
        }

        console.log(`\n✅ ANALYSIS COMPLETE!`);
        console.log(`📄 Report generated for: ${latestFile.key}`);
        console.log(`🕐 Analysis time: ${new Date().toISOString()}`);

    } catch (error) {
        console.error('❌ Error during validation:', error);
        process.exit(1);
    }
}

// Run the test
testLastWeekOutreachLogs(); 