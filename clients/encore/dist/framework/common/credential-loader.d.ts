export interface CredentialSource {
    type: 'excel' | 'json' | 'db' | 's3' | 'env' | 'inline';
    path?: string;
    query?: string;
    role?: string;
    sheet?: string;
    username?: string;
    password?: string;
}
export interface Credentials {
    username: string;
    password: string;
    role?: string;
    metadata?: Record<string, any>;
}
export declare class CredentialLoader {
    static loadCredentials(source: CredentialSource): Promise<Credentials>;
    static loadCredentialsByRole(role: string, source: Omit<CredentialSource, 'role'>): Promise<Credentials>;
    static loadAllCredentials(source: CredentialSource): Promise<Credentials[]>;
    static validateCredentials(credentials: Credentials): boolean;
    private static _resolveSource;
    private static _mapRecord;
    private static _loadEnvRecord;
}
