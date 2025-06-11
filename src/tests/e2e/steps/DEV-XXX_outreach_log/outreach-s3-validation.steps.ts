import { S3Client, ListObjectsV2Command, ListObjectsV2CommandOutput, GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as dotenv from 'dotenv';
import { DateTime } from 'luxon';
import { Given, When, Then } from '@cucumber/cucumber';

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

interface FieldIssue {
    line: number;
    value: string;
    rawLine: string;
    type: 'null' | 'undefined' | 'empty' | 'invalid_format';
}

// Test context to store state between steps
interface TestContext {
    validator: OutreachLogValidator;
    latestLogFile?: { key: string; content: string };
    validationResult?: OutreachLogValidationResult;
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

    async getLatestOutreachLog(): Promise<{ key: string; content: string }> {
        let allLogObjects: { key: string, lastModified: Date }[] = [];
        let ContinuationToken = undefined;
        
        do {
            const listCommand = new ListObjectsV2Command({
                Bucket: this.bucketName,
                ContinuationToken
            });
            const response = await this.s3Client.send(listCommand) as ListObjectsV2CommandOutput;
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
            throw new Error('No outreach log files found in S3 bucket');
        }

        const latestFile = sortedFiles[0];
        
        // Get file content
        const getCommand = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: latestFile.key
        });
        const fileResponse = await this.s3Client.send(getCommand) as GetObjectCommandOutput;
        const stream = fileResponse.Body as NodeJS.ReadableStream;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        const content = Buffer.concat(chunks).toString('utf-8');

        return { key: latestFile.key, content };
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
        this.validateLineEndings(content, result);

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
        // Satırları line ending'leri koruyarak ayır
        const lines = content.split(/(?<=\r\n|\n)/);
        let validLines = lines.filter(line => {
            // Boş satırları ve fragment satırları hariç tut
            const trimmedLine = line.replace(/[\r\n]+$/, '').trim();
            return trimmedLine !== '' && line.split(',').length === this.requiredHeaders.length;
        });

        let crlfCount = 0;
        let lfCount = 0;
        let crCount = 0;
        let noEndingCount = 0;
        let lineDetails: string[] = [];

        validLines.forEach((line, index) => {
            const originalEnding = line.match(/[\r\n]+$/)?.[0] || '';
            
            if (originalEnding === '\r\n') {
                crlfCount++;
            } else if (originalEnding === '\n') {
                lfCount++;
                lineDetails.push(`Line ${index + 1}: Found LF (\\n), hex: ${Buffer.from(originalEnding).toString('hex')}`);
            } else if (originalEnding === '\r') {
                crCount++;
                lineDetails.push(`Line ${index + 1}: Found CR (\\r), hex: ${Buffer.from(originalEnding).toString('hex')}`);
            } else {
                noEndingCount++;
                lineDetails.push(`Line ${index + 1}: No line ending found`);
            }
        });

        // Log statistics
        console.log('\n📊 LINE ENDING ANALYSIS:');
        console.log('═'.repeat(80));
        console.log(`Total valid lines analyzed: ${validLines.length}`);
        console.log(`CR+LF (\\r\\n): ${crlfCount} lines (${((crlfCount/validLines.length)*100).toFixed(1)}%)`);
        console.log(`LF only (\\n): ${lfCount} lines (${((lfCount/validLines.length)*100).toFixed(1)}%)`);
        console.log(`CR only (\\r): ${crCount} lines (${((crCount/validLines.length)*100).toFixed(1)}%)`);
        console.log(`No ending: ${noEndingCount} lines (${((noEndingCount/validLines.length)*100).toFixed(1)}%)`);

        // Show hex dump of first few lines for debugging
        console.log('\n🔍 DETAILED LINE ENDING ANALYSIS (First 5 lines):');
        validLines.slice(0, 5).forEach((line, index) => {
            const ending = line.match(/[\r\n]+$/)?.[0] || '';
            const hex = Buffer.from(ending).toString('hex');
            console.log(`Line ${index + 1}: "${ending}" (hex: ${hex})`);
        });

        if (lineDetails.length > 0) {
            console.log('\n⚠️ LINE ENDING ISSUES:');
            lineDetails.slice(0, 10).forEach(detail => console.log(detail));
            if (lineDetails.length > 10) {
                console.log(`... and ${lineDetails.length - 10} more issues`);
            }
        }

        const totalValidLines = validLines.length;
        if (totalValidLines > 0) {
            const crlfPercentage = (crlfCount / totalValidLines) * 100;
            if (crlfPercentage < 100) {
                result.formatCompliance.lineEndings = false;
                result.errors.push(`Only ${crlfPercentage.toFixed(1)}% of valid lines end with CR+LF`);
            }
        }
    }

    private validateFileName(fileName: string, result: OutreachLogValidationResult) {
        // Check file extension - should be .csv, not .pgp
        if (fileName.endsWith('.pgp')) {
            result.formatCompliance.nameConvention = false;
            result.errors.push('File extension should be .csv, not .pgp');
        }

        const pattern = /^KAI_Kredos_outreach_log_\d{14}\.csv$/;
        if (!pattern.test(fileName.split('/').pop()!)) {
            result.formatCompliance.nameConvention = false;
            result.errors.push('File name does not match the required pattern KAI_Kredos_outreach_log_yyyymmddHHmmss.csv');
        }

        // Check if file time is around 6:00pm CT (4:00pm PT)
        const timeMatch = fileName.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/);
        if (timeMatch) {
            const [_, year, month, day, hour, minute] = timeMatch;
            const fileTime = DateTime.fromObject({
                year: parseInt(year),
                month: parseInt(month),
                day: parseInt(day),
                hour: parseInt(hour),
                minute: parseInt(minute)
            }, { zone: 'America/Chicago' });

            const expectedTime = DateTime.fromObject({
                year: parseInt(year),
                month: parseInt(month),
                day: parseInt(day),
                hour: 18, // 6:00 PM CT
                minute: 0
            }, { zone: 'America/Chicago' });

            const timeDiff = Math.abs(fileTime.diff(expectedTime).as('minutes'));
            if (timeDiff > 30) { // Allow 30 minutes deviation
                result.errors.push(`File time ${fileTime.toFormat('HH:mm')} CT is not close to expected time 18:00 CT`);
            }
        }
    }

    private validateFileStructure(lines: string[], result: OutreachLogValidationResult) {
        // Check for minimum content
        if (lines.length < 2) {
            result.formatCompliance.fileStructure = false;
            result.errors.push('File must contain at least headers and one data row');
            return;
        }

        // Check for subheaders
        const headerFields = lines[0].split(',').map(h => h.trim());
        const dataLines = lines.filter(line => {
            const fields = line.trim().split(',');
            return fields.length === this.requiredHeaders.length;
        });

        if (dataLines.length === 0) {
            result.formatCompliance.fileStructure = false;
            result.errors.push('File contains no valid data rows');
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
        const issues = {
            accountNumber: [] as FieldIssue[],
            financialAccount: [] as FieldIssue[],
            templateName: [] as FieldIssue[],
            templateMemo: [] as FieldIssue[],
            timestamp: [] as FieldIssue[],
            channel: [] as FieldIssue[],
            eventName: [] as FieldIssue[],
            smsCopy: [] as string[]
        };

        console.log(`Processing data lines for analysis...`);

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i].replace(/[\r\n]+$/, '').trim();
            if (!line) continue;

            const fields = line.split(',').map(f => f.trim());
            const lineNumber = i + 2;

            // Sadece tam veri satırlarını kontrol et
            if (fields.length === this.requiredHeaders.length) {
                // AccountNumber validation
                const accountNumber = fields[0];
                if (this.isNullOrEmpty(accountNumber)) {
                    issues.accountNumber.push({
                        line: lineNumber,
                        value: accountNumber,
                        rawLine: line,
                        type: this.getNullType(accountNumber)
                    });
                }

                // FinancialAccount validation
                const financialAccount = fields[1];
                if (this.isNullOrEmpty(financialAccount)) {
                    issues.financialAccount.push({
                        line: lineNumber,
                        value: financialAccount,
                        rawLine: line,
                        type: this.getNullType(financialAccount)
                    });
                }

                // TemplateName validation
                const templateName = fields[2];
                if (this.isNullOrEmpty(templateName)) {
                    issues.templateName.push({
                        line: lineNumber,
                        value: templateName,
                        rawLine: line,
                        type: this.getNullType(templateName)
                    });
                }

                // TemplateMemo validation
                const templateMemo = fields[3];
                if (this.isNullOrEmpty(templateMemo)) {
                    issues.templateMemo.push({
                        line: lineNumber,
                        value: templateMemo,
                        rawLine: line,
                        type: this.getNullType(templateMemo)
                    });
                }

                // Timestamp validation
                const timestamp = fields[4];
                if (this.isNullOrEmpty(timestamp)) {
                    issues.timestamp.push({
                        line: lineNumber,
                        value: timestamp,
                        rawLine: line,
                        type: this.getNullType(timestamp)
                    });
                } else {
                    try {
                        const parsedTimestamp = DateTime.fromFormat(timestamp, 'MM/dd/yyyy HH:mm', { zone: 'America/Chicago' });
                        if (!parsedTimestamp.isValid) {
                            issues.timestamp.push({
                                line: lineNumber,
                                value: timestamp,
                                rawLine: line,
                                type: 'invalid_format'
                            });
                        }
                    } catch (e) {
                        issues.timestamp.push({
                            line: lineNumber,
                            value: timestamp,
                            rawLine: line,
                            type: 'invalid_format'
                        });
                    }
                }

                // Channel validation
                const channel = fields[5];
                if (this.isNullOrEmpty(channel)) {
                    issues.channel.push({
                        line: lineNumber,
                        value: channel,
                        rawLine: line,
                        type: this.getNullType(channel)
                    });
                } else if (!['smsActivities', 'emailActivities'].includes(channel)) {
                    issues.channel.push({
                        line: lineNumber,
                        value: channel,
                        rawLine: line,
                        type: 'invalid_format'
                    });
                }

                // EventName validation
                const eventName = fields[6];
                if (this.isNullOrEmpty(eventName)) {
                    issues.eventName.push({
                        line: lineNumber,
                        value: eventName,
                        rawLine: line,
                        type: this.getNullType(eventName)
                    });
                } else if (!['SMS Delivered', 'Email Delivered'].includes(eventName)) {
                    issues.eventName.push({
                        line: lineNumber,
                        value: eventName,
                        rawLine: line,
                        type: 'invalid_format'
                    });
                }

                // SMSCopy validation for email activities
                if (fields[5] === 'emailActivities' && fields[7].trim() !== '') {
                    issues.smsCopy.push(`Line ${lineNumber}: SMSCopy should be blank for email activity`);
                }
            }
        }

        // Print detailed issue reports for each field
        this.printFieldIssues('ACCOUNT NUMBER', issues.accountNumber);
        this.printFieldIssues('FINANCIAL ACCOUNT', issues.financialAccount);
        this.printFieldIssues('TEMPLATE NAME', issues.templateName);
        this.printFieldIssues('TEMPLATE MEMO', issues.templateMemo);
        this.printFieldIssues('TIMESTAMP', issues.timestamp);
        this.printFieldIssues('CHANNEL', issues.channel);
        this.printFieldIssues('EVENT NAME', issues.eventName);

        if (issues.smsCopy.length > 0) {
            console.log('\n🔍 SMS COPY ISSUES:');
            console.log(`Found ${issues.smsCopy.length} email activities with non-empty SMS copy`);
            console.log('First 10 examples:');
            issues.smsCopy.slice(0, 10).forEach(issue => console.log(issue));
        }

        // Add issues to result
        const hasIssues = (issues: FieldIssue[]) => issues.length > 0;
        
        if (hasIssues(issues.accountNumber) || hasIssues(issues.financialAccount) || 
            hasIssues(issues.templateName) || hasIssues(issues.templateMemo) ||
            hasIssues(issues.timestamp) || hasIssues(issues.channel) || 
            hasIssues(issues.eventName)) {
            result.dataQuality.noNullValues = false;
        }

        // Add error messages to result
        const addFieldErrors = (field: string, fieldIssues: FieldIssue[]) => {
            if (fieldIssues.length > 0) {
                result.errors.push(`Found ${fieldIssues.length} issues in ${field}`);
                fieldIssues.forEach(issue => {
                    result.errors.push(`Line ${issue.line}: ${field} ${issue.type} - "${issue.value}"`);
                });
            }
        };

        addFieldErrors('AccountNumber', issues.accountNumber);
        addFieldErrors('FinancialAccount', issues.financialAccount);
        addFieldErrors('TemplateName', issues.templateName);
        addFieldErrors('TemplateMemo', issues.templateMemo);
        addFieldErrors('Timestamp', issues.timestamp);
        addFieldErrors('Channel', issues.channel);
        addFieldErrors('EventName', issues.eventName);
        result.errors.push(...issues.smsCopy);
    }

    private isNullOrEmpty(value: string | null | undefined): boolean {
        return value === null || value === undefined || value.trim() === '';
    }

    private getNullType(value: string | null | undefined): 'null' | 'undefined' | 'empty' {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (value.trim() === '') return 'empty';
        return 'empty'; // Default case
    }

    private printFieldIssues(fieldName: string, issues: FieldIssue[]) {
        if (issues.length > 0) {
            console.log(`\n🔍 ${fieldName} ISSUES:`);
            console.log(`Found ${issues.length} lines with ${fieldName.toLowerCase()} issues`);
            console.log('═'.repeat(80));
            
            // Group issues by type with proper typing
            const groupedIssues = issues.reduce((acc, issue) => {
                if (!acc[issue.type]) {
                    acc[issue.type] = [];
                }
                acc[issue.type].push(issue);
                return acc;
            }, {} as { [key: string]: FieldIssue[] });

            // Print summary by type
            Object.entries(groupedIssues).forEach(([type, typeIssues]) => {
                console.log(`\n${type.toUpperCase()}: ${typeIssues.length} issues`);
                typeIssues.slice(0, 5).forEach(issue => {
                    console.log(`Line ${issue.line}:`);
                    console.log(`  Value: "${issue.value}"`);
                    console.log(`  Raw line: ${issue.rawLine}`);
                });
                if (typeIssues.length > 5) {
                    console.log(`  ... and ${typeIssues.length - 5} more similar issues`);
                }
            });
        }
    }
}

// Test context to store state between steps
const testContext: TestContext = {
    validator: new OutreachLogValidator()
};

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

// Export the function for manual testing
export { testLastWeekOutreachLogs };

// Step Definitions
Given('an outreach log file is available for validation', async function () {
    testContext.latestLogFile = await testContext.validator.getLatestOutreachLog();
    console.log(`Retrieved log file: ${testContext.latestLogFile.key}`);
});

Given('today\'s outreach log file', async function () {
    testContext.latestLogFile = await testContext.validator.getLatestOutreachLog();
    console.log(`Retrieved today's log file: ${testContext.latestLogFile.key}`);
});

When('I validate the file format', async function () {
    if (!testContext.latestLogFile) {
        throw new Error('No log file available for validation');
    }
    testContext.validationResult = await testContext.validator.validateOutreachLog(
        testContext.latestLogFile.key,
        testContext.latestLogFile.content
    );
    console.log('Format validation completed');
});

When('I validate the file content', async function () {
    if (!testContext.latestLogFile) {
        throw new Error('No log file available for validation');
    }
    testContext.validationResult = await testContext.validator.validateOutreachLog(
        testContext.latestLogFile.key,
        testContext.latestLogFile.content
    );
    console.log('Content validation completed');
});

Then('line endings should be CR+LF for all valid data lines', function () {
    if (!testContext.validationResult?.formatCompliance.lineEndings) {
        throw new Error('Line endings validation failed: ' + testContext.validationResult?.errors.join(', '));
    }
});

Then('line ending statistics should be reported', function () {
    // Statistics are already logged in validateLineEndings method
    console.log('Line ending statistics have been reported');
});

Then('any line ending issues should be detailed with hex values', function () {
    // Hex values are already logged in validateLineEndings method
    console.log('Line ending hex values have been reported');
});

Then('file name should match pattern {string}', function (pattern: string) {
    if (!testContext.validationResult?.formatCompliance.nameConvention) {
        throw new Error('File name pattern validation failed: ' + testContext.validationResult?.errors.join(', '));
    }
});

Then('file should not have .pgp extension', function () {
    if (testContext.latestLogFile?.key.endsWith('.pgp')) {
        throw new Error('File has .pgp extension');
    }
});

Then('file generation time should be around 6:00 PM CT with 30 minutes tolerance', function () {
    const timeErrors = testContext.validationResult?.errors.filter(e => e.includes('CT is not close to expected time'));
    if (timeErrors?.length) {
        throw new Error('File generation time validation failed: ' + timeErrors.join(', '));
    }
});

// ... add more step definitions for other scenarios ... 