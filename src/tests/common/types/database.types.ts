import { ResultSetHeader } from 'mysql2/promise';

export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export interface QueryResult<T = any> {
    [key: string]: any;
}

export interface DatabaseRecord {
    id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface MessageRecord extends DatabaseRecord {
    channel: string;
    content: string;
    status: string;
    sent_at: Date;
}

export interface RcsMetricsRecord extends DatabaseRecord {
    message_count: number;
    success_rate: number;
    date: Date;
}

export type QueryResponse<T> = T extends Array<any> ? T : T[];
export type InsertResult = ResultSetHeader;
export type UpdateResult = ResultSetHeader; 