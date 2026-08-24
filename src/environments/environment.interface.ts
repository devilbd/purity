import type { FirebaseConfig } from '@data/firebase';

export interface Environment {
    production: boolean;
    appName: string;
    version: string;
    enableDebugTools?: boolean;
    firebase?: FirebaseConfig;
    [key: string]: any;
}
