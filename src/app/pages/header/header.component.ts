import { Component, inject, signal } from '@purity/core';
import { ThemeService, type AppTheme } from '@data/theme.service';
import './header.component.scss';

@Component({
    selector: 'header-component',
    templateUrl: './src/app/pages/header/header.component.html',
})
export class HeaderComponent {
    public themeService = inject(ThemeService);
    public isDark = signal<boolean>(true);
    public currentTheme = signal<AppTheme>('dark');

    protected onInit(): void {
        (window as any).header = this;
        (window as any).themeService = this.themeService;

        const host = this as unknown as HTMLElement;
        const btn = host.querySelector<HTMLButtonElement>('.theme-toggle-btn');
        if (btn) {
            btn.onclick = (e: MouseEvent) => {
                e.preventDefault();
                this.onToggleTheme();
            };
        }

        this.syncState();
    }

    public onToggleTheme(): void {
        this.themeService.toggleTheme();
        this.syncState();
    }

    private syncState(): void {
        this.isDark.set(this.themeService.isDark());
        this.currentTheme.set(this.themeService.currentTheme());
    }
}
