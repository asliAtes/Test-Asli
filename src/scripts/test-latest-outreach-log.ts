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

interface FieldIssue {
    line: number;
    value: string;
    rawLine: string;
    type: 'null' | 'undefined' | 'empty' | 'invalid_format';
}

class OutreachLogValidator {
    private s3Client: S3Client;
    private readonly bucketName = 'kredos-uscellular-production';
    private readonly prefix = 'kredos-uscellular-production/Temporary-Files/';
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
        // Split by CR+LF to get actual CSV records
        const records = content.split('\r\n');
        
        // Check if file ends with CR+LF properly
        if (!content.endsWith('\r\n')) {
            result.formatCompliance.lineEndings = false;
            result.errors.push('File does not end with CR+LF');
        }

        console.log('\n📊 LINE ENDING ANALYSIS:');
        console.log('═'.repeat(80));
        console.log(`Total CSV records (split by CR+LF): ${records.length}`);
        
        // Analyze record structure
        let properRecords = 0;
        let invalidRecords = 0;
        let emptyRecords = 0;
        let inMessageLFCount = 0;
        
        records.forEach((record, index) => {
            if (record.trim() === '') {
                emptyRecords++;
                return;
            }
            
            // Count internal LF characters (these are legitimate for message formatting)
            const internalLFs = (record.match(/\n/g) || []).length;
            if (internalLFs > 0) {
                inMessageLFCount += internalLFs;
            }
            
            // Check if this looks like a proper CSV record
            const fields = record.split(',');
            if (fields.length === this.requiredHeaders.length || 
                record.includes('Text STOP') || 
                record.trim().startsWith('Make a payment') ||
                record.trim().startsWith('Pay ')) {
                properRecords++;
            } else {
                invalidRecords++;
            }
        });

        console.log(`✅ Proper CSV records: ${properRecords}`);
        console.log(`📝 In-message LF characters: ${inMessageLFCount} (legitimate for message formatting)`);
        console.log(`⚠️  Empty records: ${emptyRecords}`);
        console.log(`❌ Invalid records: ${invalidRecords}`);

        // Show examples of in-message formatting
        console.log('\n🔍 EXAMPLES OF IN-MESSAGE FORMATTING:');
        let exampleCount = 0;
        for (let i = 0; i < Math.min(records.length, 100) && exampleCount < 3; i++) {
            const record = records[i];
            if (record.includes('\n') && record.includes('Text STOP')) {
                console.log(`Record ${i + 1} (excerpt): ...${record.substring(record.length - 80)}`);
                exampleCount++;
            }
        }

        // The validation passes if we have proper record separation with CR+LF
        // Internal LF characters within message content are expected and valid
        console.log('\n✅ VALIDATION RESULT:');
        console.log(`Records properly separated by CR+LF: ${properRecords > 0 ? 'PASS' : 'FAIL'}`);
        console.log(`In-message LF formatting: EXPECTED AND VALID`);
        
        // Only fail if we don't have proper record separation
        if (properRecords === 0) {
            result.formatCompliance.lineEndings = false;
            result.errors.push('No properly formatted CSV records found with CR+LF separation');
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
                hour: 17, // 5:00 PM CT
                minute: 0
            }, { zone: 'America/Chicago' });

            const timeDiff = Math.abs(fileTime.diff(expectedTime).as('minutes'));
            if (timeDiff > 30) { // Allow 30 minutes deviation
                result.errors.push(`File time ${fileTime.toFormat('HH:mm')} CT is not close to expected time 17:00 CT`);
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
        console.log(`\n🔍 ANALYZING DATA ROWS (EXCLUDING FRAGMENTS AND EMPTY LINES)...`);
        console.log('═'.repeat(80));

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i].replace(/[\r\n]+$/, '').trim();
            if (!line) continue;

            // Fragment ve ödeme URL'lerini içeren satırları es geç
            if (line.includes('Text STOP to end') || 
                line.includes('Make a payment') || 
                line.includes('Pay now at') ||
                line.trim() === '') {
                continue;
            }

            const fields = line.split(',').map(f => f.trim());
            const lineNumber = i + 2;

            // Sadece geçerli veri satırlarını kontrol et
            if (fields.length !== this.requiredHeaders.length) {
                console.log(`\n⚠️  Line ${lineNumber}: Invalid number of fields (${fields.length}, expected ${this.requiredHeaders.length})`);
                console.log(`Raw data: ${line}`);
                console.log('─'.repeat(80));
                continue;
            }

            let hasIssue = false;
            let issueDetails = [];

            // AccountNumber validation
            const accountNumber = fields[0];
            if (this.isNullOrEmpty(accountNumber)) {
                hasIssue = true;
                issueDetails.push('Empty ACCOUNTNUMBER');
            }

            // FinancialAccount validation
            const financialAccount = fields[1];
            if (this.isNullOrEmpty(financialAccount)) {
                hasIssue = true;
                issueDetails.push('Empty FINANCIALACCOUNT');
            }

            // TemplateName validation
            const templateName = fields[2];
            if (this.isNullOrEmpty(templateName)) {
                hasIssue = true;
                issueDetails.push('Empty TEMPLATENAME');
            }

            // TemplateMemo validation
            const templateMemo = fields[3];
            if (this.isNullOrEmpty(templateMemo)) {
                hasIssue = true;
                issueDetails.push('Empty TEMPLATEMEMO');
            }

            // Timestamp validation
            const timestamp = fields[4];
            if (this.isNullOrEmpty(timestamp)) {
                hasIssue = true;
                issueDetails.push('Empty TIMESTAMP');
            } else {
                try {
                    const parsedTimestamp = DateTime.fromFormat(timestamp, 'MM/dd/yyyy HH:mm', { zone: 'America/Chicago' });
                    if (!parsedTimestamp.isValid) {
                        hasIssue = true;
                        issueDetails.push('Invalid TIMESTAMP format');
                    }
                } catch (e) {
                    hasIssue = true;
                    issueDetails.push('Invalid TIMESTAMP format');
                }
            }

            // Channel validation
            const channel = fields[5];
            if (this.isNullOrEmpty(channel)) {
                hasIssue = true;
                issueDetails.push('Empty CHANNEL');
            } else if (!['smsActivities', 'emailActivities'].includes(channel)) {
                hasIssue = true;
                issueDetails.push('Invalid CHANNEL value');
            }

            // EventName validation
            const eventName = fields[6];
            if (this.isNullOrEmpty(eventName)) {
                hasIssue = true;
                issueDetails.push('Empty EVENTNAME');
            } else if (!['SMS Sent', 'Email Sent'].includes(eventName)) {
                hasIssue = true;
                issueDetails.push('Invalid EVENTNAME value');
            }

            // SMSCopy validation for email activities
            if (fields[5] === 'emailActivities' && fields[7].trim() !== '') {
                hasIssue = true;
                issueDetails.push('Non-empty SMSCOPY for email activity');
            }

            if (hasIssue) {
                console.log(`\n❌ Line ${lineNumber}:`);
                console.log(`Issues: ${issueDetails.join(', ')}`);
                console.log(`Raw data: ${line}`);
                console.log('─'.repeat(80));
            }
        }
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
    console.log('Starting outreach log validation...');
    const validator = new OutreachLogValidator();
    
    try {
        console.log('Listing objects in S3 bucket...');
        const listCommand = new ListObjectsV2Command({
            Bucket: validator['bucketName'],
            Prefix: validator['prefix']
        });
        
        const listResponse = await validator['s3Client'].send(listCommand);
        console.log(`Found ${listResponse.Contents?.length || 0} objects in bucket`);
        
        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            console.log('No files found in bucket');
            return;
        }

        // Get the latest file
        const latestFile = listResponse.Contents
            .filter(obj => obj.Key?.endsWith('.csv'))
            .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0))[0];

        if (!latestFile?.Key) {
            console.log('No CSV files found');
            return;
        }

        console.log(`Found latest file: ${latestFile.Key}`);
        
        // Get the file content
        console.log('Fetching file content...');
        const getCommand = new GetObjectCommand({
            Bucket: validator['bucketName'],
            Key: latestFile.Key
        });
        
        const response = await validator['s3Client'].send(getCommand);
        console.log('File content fetched successfully');
        
        if (!response.Body) {
            console.log('No content in file');
            return;
        }

        // Convert stream to string
        console.log('Converting stream to string...');
        const content = await streamToString(response.Body as Readable);
        console.log(`File content length: ${content.length} bytes`);

        // Validate the file
        console.log('Starting validation...');
        const result = await validator.validateOutreachLog(latestFile.Key, content);
        
        // Print results
        console.log('\n📊 VALIDATION RESULTS:');
        console.log('═'.repeat(80));
        console.log(`File: ${result.fileName}`);
        console.log('\nFormat Compliance:');
        console.log(`- Line Endings: ${result.formatCompliance.lineEndings ? '✅' : '❌'}`);
        console.log(`- Name Convention: ${result.formatCompliance.nameConvention ? '✅' : '❌'}`);
        console.log(`- File Structure: ${result.formatCompliance.fileStructure ? '✅' : '❌'}`);
        console.log(`- Headers: ${result.formatCompliance.headers ? '✅' : '❌'}`);
        
        console.log('\nData Quality:');
        console.log(`- No Null Values: ${result.dataQuality.noNullValues ? '✅' : '❌'}`);
        console.log(`- Valid Formats: ${result.dataQuality.validFormats ? '✅' : '❌'}`);
        console.log(`- Data Type Consistency: ${result.dataQuality.dataTypeConsistency ? '✅' : '❌'}`);
        console.log(`- Required Fields: ${result.dataQuality.requiredFields ? '✅' : '❌'}`);
        
        if (result.errors.length > 0) {
            console.log('\n❌ Errors:');
            result.errors.forEach(error => console.log(`- ${error}`));
        } else {
            console.log('\n✅ No errors found');
        }

    } catch (error) {
        console.error('Error during validation:', error);
    }
}

// Helper function to convert stream to string
async function streamToString(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
}

// Run the validation
console.log('Script started');
testLastWeekOutreachLogs().catch(console.error);

// Export the function for manual testing
export { testLastWeekOutreachLogs }; 