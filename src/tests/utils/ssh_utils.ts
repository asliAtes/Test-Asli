import { Client } from 'ssh2';
import * as fs from 'fs';

interface TunnelConfig {
    host: string;
    username: string;
    privateKey: string;
    dbHost: string;
    dbPort: number;
}

export async function createTunnel(config: TunnelConfig): Promise<void> {
    return new Promise((resolve, reject) => {
        const ssh = new Client();

        ssh.on('ready', () => {
            ssh.forwardOut(
                '127.0.0.1',
                0,
                config.dbHost,
                config.dbPort,
                (err, stream) => {
                    if (err) {
                        ssh.end();
                        reject(err);
                        return;
                    }

                    console.log('✅ SSH tunnel established');
                    resolve();
                }
            );
        });

        ssh.on('error', (err) => {
            console.error('❌ SSH connection error:', err);
            reject(err);
        });

        try {
            const privateKey = fs.readFileSync(config.privateKey);
            
            ssh.connect({
                host: config.host,
                username: config.username,
                privateKey,
                port: 22
            });
        } catch (error) {
            console.error('❌ Error reading SSH key:', error);
            reject(error);
        }
    });
} 