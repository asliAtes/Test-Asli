import { OutreachLogValidator } from '../tests/e2e/steps/DEV-XXX_outreach_log/outreach-log-validation.steps';
import * as dotenv from 'dotenv';
import { ListObjectsV2Command, ListObjectsV2CommandOutput, GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { DateTime } from 'luxon';

// Load environment variables
dotenv.config();

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
        console.log('Starting outreach log validation for the last 7 days...');
        
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

        // Filter for last 7 days
        const now = DateTime.utc();
        const lastWeekLogs = allLogObjects.filter(obj => {
            if (!obj.lastModified) return false;
            const fileDate = DateTime.fromJSDate(obj.lastModified).toUTC();
            return fileDate >= now.minus({ days: 7 });
        });
        if (lastWeekLogs.length === 0) {
            console.log('No outreach log files found for the last 7 days.');
            return;
        }
        // Sort by date ascending
        lastWeekLogs.sort((a, b) => (a.lastModified?.getTime() || 0) - (b.lastModified?.getTime() || 0));

        for (const log of lastWeekLogs) {
            console.log('\n------------------------------');
            console.log(`Validating file: ${log.key}`);
            console.log(`LastModified (UTC): ${log.lastModified}`);
            const centralTime = DateTime.fromJSDate(log.lastModified).setZone('America/Chicago');
            const isWeekend = centralTime.weekday === 6 || centralTime.weekday === 7;
            if (isWeekend) {
                console.log(`WARNING: This file was last modified on a weekend in US Central Time (${centralTime.toFormat('cccc, yyyy-LL-dd HH:mm:ss ZZZZ')})`);
            } else {
                console.log(`File was last modified on a weekday in US Central Time (${centralTime.toFormat('cccc, yyyy-LL-dd HH:mm:ss ZZZZ')})`);
            }

            // Get file content
            const getCommand = new GetObjectCommand({
                Bucket: bucketName,
                Key: log.key
            });
            const fileResponse = await s3Client.send(getCommand) as GetObjectCommandOutput;
            const stream = fileResponse.Body as NodeJS.ReadableStream;
            const chunks: Buffer[] = [];
            for await (const chunk of stream) {
                chunks.push(Buffer.from(chunk));
            }
            const content = Buffer.concat(chunks).toString('utf-8');

            // Validate
            const validationResult = await validator.validateOutreachLog(log.key, content);
            console.log('\nValidation Results:');
            console.log('------------------');
            console.log(`File Name: ${validationResult.fileName}`);
            console.log('\nFormat Compliance:');
            console.log(`- Line Endings (CR+LF): ${validationResult.formatCompliance.lineEndings ? '✅' : '❌'}`);
            console.log(`- File Name Convention: ${validationResult.formatCompliance.nameConvention ? '✅' : '❌'}`);
            console.log(`- File Structure: ${validationResult.formatCompliance.fileStructure ? '✅' : '❌'}`);
            console.log(`- Headers: ${validationResult.formatCompliance.headers ? '✅' : '❌'}`);
            console.log('\nData Quality:');
            console.log(`- No Null Values: ${validationResult.dataQuality.noNullValues ? '✅' : '❌'}`);
            console.log(`- Valid Formats: ${validationResult.dataQuality.validFormats ? '✅' : '❌'}`);
            console.log(`- Data Type Consistency: ${validationResult.dataQuality.dataTypeConsistency ? '✅' : '❌'}`);
            console.log(`- Required Fields: ${validationResult.dataQuality.requiredFields ? '✅' : '❌'}`);
            if (validationResult.errors.length > 0) {
                console.log('\nErrors/Warnings:');
                validationResult.errors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error}`);
                });
            } else {
                console.log('\n✅ No errors found! File validation passed successfully.');
            }
        }
    } catch (error) {
        console.error('Error during validation:', error);
        process.exit(1);
    }
}

// Run the test
testLastWeekOutreachLogs(); 