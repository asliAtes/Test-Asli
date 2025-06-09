export const defaultConfig = {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    uploadDir: process.env.UPLOAD_DIR || '/tmp/outreach-logs',
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kredos'
    },
    sftp: {
        host: process.env.SFTP_HOST || 'localhost',
        port: parseInt(process.env.SFTP_PORT || '22'),
        username: process.env.SFTP_USER || 'user',
        password: process.env.SFTP_PASSWORD || '',
        remotePath: process.env.SFTP_PATH || '/outreach-logs'
    },
    s3: {
        bucket: process.env.S3_BUCKET || 'kredos-outreach-logs',
        region: process.env.S3_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
}; 