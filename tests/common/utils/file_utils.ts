import { randomString } from './test_helpers';
import { getDbConnection } from './db_utils';
import fs from 'fs';
import path from 'path';

export interface FileUploadOptions {
    recordCount?: number;
    channelType?: string;
    records?: Array<{
        channelType: string;
        [key: string]: any;
    }>;
}

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
export async function uploadTestFile(options: FileUploadOptions): Promise<TestFile> {
    // Implementation will be added later
    return {
        id: 'test-file-id',
        name: 'test-file.csv',
        recordCount: options.recordCount || options.records?.length || 0
    };
}

/**
 * Wait for a file to be processed
 */
export async function waitForProcessing(fileId: string): Promise<void> {
    // Implementation will be added later
    await new Promise(resolve => setTimeout(resolve, 1000));
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