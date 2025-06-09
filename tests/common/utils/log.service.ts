import * as fs from 'fs';
import * as path from 'path';

export class LogService {
    private logDir: string;
    private logFile: string;

    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        this.logFile = path.join(this.logDir, 'archive_process.log');
    }

    async log(message: string): Promise<void> {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        await fs.promises.appendFile(this.logFile, logEntry);
    }

    async getRecentLogs(limit: number = 10): Promise<string[]> {
        try {
            const content = await fs.promises.readFile(this.logFile, 'utf-8');
            return content
                .split('\n')
                .filter(line => line.trim())
                .slice(-limit);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    async clearLogs(): Promise<void> {
        try {
            await fs.promises.unlink(this.logFile);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }
} 