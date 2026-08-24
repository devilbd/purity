import type { Environment } from './environment.interface';

export const environment: Environment = {
    production: true,
    appName: 'Purity',
    version: '1.0.0',
    enableDebugTools: false,
    firebase: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'purity-d470d.firebaseapp.com',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'purity-d470d',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'purity-d470d.firebasestorage.app',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '196144189978',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:196144189978:web:f64f7ff6a0cf3e01de77a3',
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-VK790J8H7J',
    },
};
