import type { FirebaseConfig } from '@data/firebase';

export interface Environment {
    production: boolean;
    appName: string;
    version: string;
    buildVersion?: string;
    enableDebugTools?: boolean;
    firebase?: FirebaseConfig;
    [key: string]: any;
}
