import { container, type Token, type Constructor } from './di';
import { HttpClient, type HttpInterceptor, type HttpInterceptorFn } from './http';

export interface EnvironmentConfig {
    production: boolean;
    appName?: string;
    version?: string;
    enableDebugTools?: boolean;
    [key: string]: any;
}

export type Provider =
    | Constructor
    | { provide: Token; useValue: any }
    | { provide: Token; useClass: Constructor };

export interface BootstrapOptions {
    environment?: EnvironmentConfig;
    providers?: Provider[];
    interceptors?: Array<HttpInterceptor | (new (...args: any[]) => HttpInterceptor) | HttpInterceptorFn>;
    rootSelector?: string;
}

export interface ApplicationRef {
    rootComponent: any;
    rootElement: HTMLElement | null;
    environment: EnvironmentConfig;
    destroy: () => void;
}

export const ENVIRONMENT_TOKEN: Token<EnvironmentConfig> = 'ENVIRONMENT';

let globalAppRef: ApplicationRef | null = null;

/**
 * Returns the active bootstrapped ApplicationRef instance.
 */
export function getApplicationRef(): ApplicationRef | null {
    return globalAppRef;
}

/**
 * Bootstraps a Purity application with a root component, environment settings, service providers,
 * and HTTP interceptors, while automatically managing theme and lifecycle.
 */
export async function bootstrapApplication(
    rootComponent: any,
    options: BootstrapOptions = {},
): Promise<ApplicationRef> {
    const environment: EnvironmentConfig = options.environment || {
        production: false,
    };

    // 1. Register environment in DI container
    container.registerValue(ENVIRONMENT_TOKEN, environment);
    container.registerValue('ENVIRONMENT', environment);

    // 2. Register custom providers
    if (options.providers && Array.isArray(options.providers)) {
        for (const provider of options.providers) {
            if (typeof provider === 'function') {
                container.register(provider, provider);
            } else if (provider && typeof provider === 'object') {
                if ('useValue' in provider) {
                    container.registerValue(provider.provide, provider.useValue);
                } else if ('useClass' in provider) {
                    container.register(provider.provide, provider.useClass);
                }
            }
        }
    }

    // 3. Register HTTP interceptors if configured directly in bootstrap options
    if (options.interceptors && Array.isArray(options.interceptors)) {
        const client = container.resolve<HttpClient>(HttpClient);
        for (const item of options.interceptors) {
            if (typeof item === 'function') {
                if (item.prototype && typeof item.prototype.intercept === 'function') {
                    client.use(new (item as new () => HttpInterceptor)());
                } else {
                    client.use(item as HttpInterceptorFn);
                }
            } else if (item && typeof (item as any).intercept === 'function') {
                client.use(item as HttpInterceptor);
            }
        }
    }

    // 4. Automatically initialize application theme inside bootstrap
    try {
        container.resolve('ThemeService');
    } catch {
        if (typeof document !== 'undefined') {
            const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('purity-theme') : null;
            const theme = savedTheme === 'light' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            document.body?.setAttribute('data-theme', theme);
        }
    }

    // 5. Resolve or find root element in DOM
    const rootSelector =
        options.rootSelector ||
        (rootComponent.selector ? rootComponent.selector : null);

    let rootElement: HTMLElement | null = null;
    if (rootSelector && typeof document !== 'undefined') {
        rootElement = document.querySelector(rootSelector);
    }

    // 6. Create ApplicationRef handle
    const appRef: ApplicationRef = {
        rootComponent,
        rootElement,
        environment,
        destroy: () => {
            if (
                rootElement &&
                typeof (rootElement as any).disconnectedCallback === 'function'
            ) {
                (rootElement as any).disconnectedCallback();
            }
            if (rootElement && rootElement.parentNode) {
                rootElement.parentNode.removeChild(rootElement);
            }
            globalAppRef = null;
            if (typeof window !== 'undefined') {
                delete (window as any).__PURITY_APP__;
            }
        },
    };

    globalAppRef = appRef;

    // 7. Expose debug tools if configured or in development mode
    if (typeof window !== 'undefined') {
        (window as any).__PURITY_APP__ = appRef;

        if (environment.enableDebugTools !== false && !environment.production) {
            console.log(
                `%c[Purity] 🚀 ${environment.appName || 'Application'} bootstrapped successfully (v${environment.version || '1.0.0'}) [Dev Mode]`,
                'color: #3584e4; font-weight: bold; font-size: 11px;',
            );
        }
    }

    return appRef;
}
