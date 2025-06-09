import { randomString } from './test_helpers';
import { getDbConnection } from './db_utils';
import fs from 'fs';
import path from 'path';

interface TestFileOptions {
    recordCount?: number;
    channelType?: string;
    includeCustomData?: boolean;
    records?: Array<Record<string, any>>;
}

interface TestFile {
    id: string;
    name: string;
    recordCount: number;
}

/**
 * Create and upload a test file
 */
export async function uploadTestFile(options: TestFileOptions): Promise<TestFile> {
    const {
        recordCount = 1,
        channelType = 'SMS',
        includeCustomData = false,
        records = []
    } = options;

    // Generate unique file name
    const fileName = `TEST_${randomString(8)}_${Date.now()}.csv`;
    const filePath = path.join(process.cwd(), 'temp', fileName);

    // Create records if not provided
    const fileRecords = records.length > 0 ? records : Array(recordCount).fill(null).map(() => ({
        phoneNumber: '+1234567890',
        message: 'Test message',
        customerId: `TEST_${randomString(6)}`,
        channelType,
        ...(includeCustomData ? {
            customField1: 'value1',
            customField2: 'value2'
        } : {})
    }));

    // Create CSV content
    const headers = Object.keys(fileRecords[0]).join(',');
    const rows = fileRecords.map(record => Object.values(record).join(','));
    const csvContent = [headers, ...rows].join('\n');

    // Ensure temp directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'temp'));
    }

    // Write file
    fs.writeFileSync(filePath, csvContent);

    // Upload file to system
    const db = await getDbConnection();
    const result = await db.insert('test_files', {
        file_name: fileName,
        status: 'PENDING',
        created_at: new Date(),
        record_count: fileRecords.length
    });

    return {
        id: result.insertId.toString(),
        name: fileName,
        recordCount: fileRecords.length
    };
}

/**
 * Wait for a file to be processed
 */
export async function waitForProcessing(fileId: string, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    const db = await getDbConnection();

    while (Date.now() - startTime < timeout) {
        const result = await db.getOne<any>(
            'SELECT status FROM test_files WHERE id = ?',
            [fileId]
        );

        if (result?.status === 'PROCESSED') {
            return;
        }

        if (result?.status === 'ERROR') {
            throw new Error(`File processing failed: ${fileId}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(`Timeout waiting for file ${fileId} to be processed`);
}

/**
 * Clean up test files
 */
export async function cleanupTestFiles(): Promise<void> {
    const db = await getDbConnection();
    await db.query('DELETE FROM test_files WHERE file_name LIKE ?', ['TEST_%']);

    const tempDir = path.join(process.cwd(), 'temp');
    if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
            if (file.startsWith('TEST_')) {
                fs.unlinkSync(path.join(tempDir, file));
            }
        });
    }
} 