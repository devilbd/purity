import { Injectable, signal } from '@purity/core';
import { environment } from '@environments/environment';

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

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
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || environment.firebase?.apiKey || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || environment.firebase?.authDomain || 'purity-d470d.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || environment.firebase?.projectId || 'purity-d470d',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || environment.firebase?.storageBucket || 'purity-d470d.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || environment.firebase?.messagingSenderId || '196144189978',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || environment.firebase?.appId || '1:196144189978:web:f64f7ff6a0cf3e01de77a3',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || import.meta.env.VITE_GA_MEASUREMENT_ID || environment.firebase?.measurementId || 'G-VK790J8H7J',
};

let isAnalyticsInitialized = false;

/**
 * Initializes Google Analytics 4 (GA4) / Firebase Analytics and configures page tracking.
 */
export function initGoogleAnalytics(measurementId?: string): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return false;
    }

    const mId = (measurementId || firebaseConfig.measurementId || 'G-VK790J8H7J').trim();
    if (!mId) {
        return false;
    }

    // 1. Initialize dataLayer and window.gtag
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
        window.gtag = function () {
            window.dataLayer.push(arguments);
        };
    }

    // 2. Inject Google Tag Manager gtag.js script if not already in DOM
    const scriptId = 'google-analytics-gtag';
    if (!document.getElementById(scriptId) && !document.querySelector(`script[src*="${mId}"]`)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(mId)}`;
        document.head.appendChild(script);
    }

    if (!isAnalyticsInitialized) {
        // 3. Configure Google Analytics & Firebase App association
        window.gtag('js', new Date());
        window.gtag('config', mId, {
            app_id: firebaseConfig.appId,
            debug_mode: true,
            send_page_view: true,
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
        });

        isAnalyticsInitialized = true;
        console.info(`[Firebase/Analytics] Google Analytics (GA4) active (Measurement ID: ${mId}, App ID: ${firebaseConfig.appId})`);

        // 4. Auto-track SPA navigation events
        window.addEventListener('popstate', () => {
            trackPageView(document.title, window.location.pathname);
        });
        window.addEventListener('hashchange', () => {
            trackPageView(document.title, window.location.pathname + window.location.hash);
        });
    }

    return true;
}

/**
 * Logs a custom event to Firebase / Google Analytics (GA4).
 */
export function logAnalyticsEvent(eventName: string, params?: Record<string, any>): void {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', eventName, {
            ...params,
            debug_mode: true,
        });
        if (!environment.production) {
            console.debug(`[Firebase/Analytics] Event: ${eventName}`, params);
        }
    }
}

/**
 * Tracks a page view with custom title and path.
 */
export function trackPageView(pageTitle?: string, pagePath?: string): void {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        const mId = firebaseConfig.measurementId || 'G-VK790J8H7J';
        window.gtag('config', mId, {
            app_id: firebaseConfig.appId,
            debug_mode: true,
            page_title: pageTitle || document.title,
            page_path: pagePath || window.location.pathname,
            page_location: window.location.href,
        });
        if (!environment.production) {
            console.debug(`[Firebase/Analytics] PageView: ${pageTitle || document.title} (${pagePath || window.location.pathname})`);
        }
    }
}

/**
 * Sets the user ID for Google Analytics.
 */
export function setAnalyticsUserId(userId: string): void {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('set', { user_id: userId });
    }
}

/**
 * Sets user properties for Google Analytics.
 */
export function setAnalyticsUserProperties(properties: Record<string, any>): void {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('set', 'user_properties', properties);
    }
}

@Injectable('FirebaseService')
export class FirebaseService {
    readonly config: FirebaseConfig = firebaseConfig;
    readonly isInitialized = signal<boolean>(false);

    constructor() {
        this.init();
    }

    public init(): void {
        const success = initGoogleAnalytics(this.config.measurementId);
        this.isInitialized.set(success);
    }

    public logEvent(eventName: string, params?: Record<string, any>): void {
        logAnalyticsEvent(eventName, params);
    }

    public trackPageView(pageTitle?: string, pagePath?: string): void {
        trackPageView(pageTitle, pagePath);
    }

    public setUserId(userId: string): void {
        setAnalyticsUserId(userId);
    }

    public setUserProperties(properties: Record<string, any>): void {
        setAnalyticsUserProperties(properties);
    }
}
