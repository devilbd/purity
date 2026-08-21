import { Injectable } from '../framework/core';

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}

export const firebaseConfig: FirebaseConfig = {
    apiKey:
        import.meta.env.VITE_FIREBASE_API_KEY ||
        'AIzaSyDhh4CKHyHxKU7bZ5qOhGoVRDTgasoUfS0',
    authDomain:
        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
        'purity-d470d.firebaseapp.com',
    projectId:
        import.meta.env.VITE_FIREBASE_PROJECT_ID || 'purity-d470d',
    storageBucket:
        import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
        'purity-d470d.firebasestorage.app',
    messagingSenderId:
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '196144189978',
    appId:
        import.meta.env.VITE_FIREBASE_APP_ID ||
        '1:196144189978:web:f64f7ff6a0cf3e01de77a3',
    measurementId:
        import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-VK790J8H7J',
};

@Injectable('FirebaseService')
export class FirebaseService {
    readonly config: FirebaseConfig = firebaseConfig;
}
