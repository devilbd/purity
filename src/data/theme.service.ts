import { Injectable, signal } from '@purity/core';

export type AppTheme = 'dark' | 'light';

@Injectable('ThemeService')
export class ThemeService {
    public currentTheme = signal<AppTheme>('dark');
    public isDark = signal<boolean>(true);

    constructor() {
        this.initTheme();
    }

    /**
     * Initializes theme state with Dark as base default.
     */
    public initTheme(): void {
        if (typeof window === 'undefined') return;

        const savedTheme = localStorage.getItem('purity-theme') as AppTheme | null;
        const activeTheme: AppTheme = savedTheme === 'light' ? 'light' : 'dark';
        this.applyTheme(activeTheme, Boolean(savedTheme));
    }

    /**
     * Sets the active theme ('dark' or 'light') and persists preference to localStorage.
     */
    public setTheme(theme: AppTheme): void {
        this.applyTheme(theme, true);
    }

    /**
     * Toggles between 'dark' and 'light' themes.
     */
    public toggleTheme(): void {
        const nextTheme: AppTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
    }

    private applyTheme(theme: AppTheme, persist = true): void {
        this.currentTheme.set(theme);
        this.isDark.set(theme === 'dark');

        if (persist) {
            try {
                localStorage.setItem('purity-theme', theme);
            } catch {
                // Ignore storage quota or security errors
            }
        }

        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
            document.body?.setAttribute('data-theme', theme);
        }
    }
}

/**
 * Standalone helper to initialize the theme immediately before/during bootstrap.
 * Dark theme is always the default base.
 */
export function initTheme(): void {
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem('purity-theme');
    const activeTheme: AppTheme = savedTheme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.body?.setAttribute('data-theme', activeTheme);
}
