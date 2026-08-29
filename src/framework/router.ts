import { signal, effect, type Signal } from './core';
import { container, Injectable, type Token, type Constructor } from './di';
import { BaseDirective, Directive } from './directive';
import { Component } from './component';
import type { SeoConfig } from './seo';

export type CanActivateFn = (
    route: Route,
    state: RouterState,
) => boolean | Promise<boolean>;

export interface RouteData {
    [key: string]: any;
}

export type RouteParams = Record<string, string>;
export type QueryParams = Record<string, string>;

export interface Route {
    path: string;
    component?: Constructor | string;
    redirectTo?: string;
    title?: string | ((params: RouteParams) => string);
    seo?: SeoConfig | ((params: RouteParams, data: RouteData) => SeoConfig);
    canActivate?: Array<CanActivateFn | Token>;
    data?: RouteData;
    children?: Route[];
}

export type Routes = Route[];

export interface RouterState {
    url: string;
    path: string;
    params: RouteParams;
    queryParams: QueryParams;
    data: RouteData;
}

export interface NavigationOptions {
    replaceUrl?: boolean;
    queryParams?: QueryParams;
    state?: any;
    skipLocationChange?: boolean;
}

export interface RouterOptions {
    mode?: 'history' | 'hash' | 'memory';
    initialUrl?: string;
    scrollRestoration?: boolean;
}

/**
 * Normalizes route path strings by trimming trailing slashes while preserving root `/`.
 */
export function normalizePath(path: string): string {
    if (!path || path === '/') return '/';
    let clean = path.trim();
    if (!clean.startsWith('/')) clean = '/' + clean;
    if (clean.length > 1 && clean.endsWith('/')) clean = clean.slice(0, -1);
    return clean;
}

/**
 * Parses query strings like `?key=val&foo=bar` into typed object records.
 */
export function parseQueryString(queryString: string): QueryParams {
    const params: QueryParams = {};
    if (!queryString) return params;
    const clean = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    if (!clean) return params;

    const pairs = clean.split('&');
    for (const pair of pairs) {
        if (!pair) continue;
        const [key, val] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = val !== undefined ? decodeURIComponent(val) : '';
        }
    }
    return params;
}

/**
 * Serializes query parameters object into query string `?key=val&foo=bar`.
 */
export function serializeQueryParams(params: QueryParams): string {
    const keys = Object.keys(params);
    if (keys.length === 0) return '';
    const parts = keys.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return `?${parts.join('&')}`;
}

/**
 * Matches a URL pathname against a route pattern (e.g. `/users/:id` or `**`),
 * returning extracted route parameters or null if not matched.
 */
export function matchRoutePattern(
    routePattern: string,
    pathname: string,
): { matched: boolean; params: RouteParams } | null {
    const normPattern = normalizePath(routePattern);
    const normPath = normalizePath(pathname);

    // Wildcard catch-all
    if (normPattern === '/**' || routePattern === '**') {
        return { matched: true, params: { wildcard: normPath } };
    }

    // Exact root match
    if (normPattern === '/' && normPath === '/') {
        return { matched: true, params: {} };
    }

    const patternSegments = normPattern.split('/').filter(Boolean);
    const pathSegments = normPath.split('/').filter(Boolean);

    if (patternSegments.length !== pathSegments.length) {
        // Check for trailing wildcard `/*`
        if (
            patternSegments.length > 0 &&
            patternSegments[patternSegments.length - 1] === '*' &&
            pathSegments.length >= patternSegments.length - 1
        ) {
            const params: RouteParams = {};
            for (let i = 0; i < patternSegments.length - 1; i++) {
                const patSeg = patternSegments[i];
                const pathSeg = pathSegments[i];
                if (patSeg.startsWith(':')) {
                    params[patSeg.slice(1)] = decodeURIComponent(pathSeg);
                } else if (patSeg !== pathSeg) {
                    return null;
                }
            }
            return { matched: true, params };
        }
        return null;
    }

    const params: RouteParams = {};
    for (let i = 0; i < patternSegments.length; i++) {
        const patSeg = patternSegments[i];
        const pathSeg = pathSegments[i];

        if (patSeg.startsWith(':')) {
            params[patSeg.slice(1)] = decodeURIComponent(pathSeg);
        } else if (patSeg === '*') {
            // matches any single segment
            continue;
        } else if (patSeg !== pathSeg) {
            return null;
        }
    }

    return { matched: true, params };
}

/**
 * Purity Framework Router Service
 * Fine-grained, signal-based routing service managing history, parameter extraction, and route guards.
 */
@Injectable('Router')
export class Router {
    private routes: Route[] = [];
    private options: RouterOptions = { mode: 'history', scrollRestoration: false };
    private isListening = false;

    // Reactive Router Primitives
    readonly url: Signal<string> = signal('/');
    readonly path: Signal<string> = signal('/');
    readonly params: Signal<RouteParams> = signal({});
    readonly queryParams: Signal<QueryParams> = signal({});
    readonly data: Signal<RouteData> = signal({});
    readonly activeRoute: Signal<Route | null> = signal(null);

    constructor() {
        // Automatically listen to popstate / hashchange when in browser environment
        if (typeof window !== 'undefined') {
            this.startListening();
        }
    }

    /**
     * Configures the route table and initial options for the application router.
     */
    configureRoutes(routes: Route[], options?: RouterOptions): void {
        this.routes = [...routes];
        if (options) {
            this.options = { ...this.options, ...options };
        }

        const initial = this.options.initialUrl || this.getCurrentLocationUrl();
        this.navigateByUrl(initial, { replaceUrl: true });
        this.startListening();
    }

    /**
     * Returns the configured route definitions.
     */
    getRoutes(): Route[] {
        return [...this.routes];
    }

    /**
     * Starts listening to browser navigation events (popstate / hashchange).
     */
    private startListening(): void {
        if (this.isListening || typeof window === 'undefined') return;
        this.isListening = true;

        const onNavChange = () => {
            if (this.options.mode !== 'memory') {
                this.navigateByUrl(this.getCurrentLocationUrl(), { skipLocationChange: true });
            }
        };

        window.addEventListener('popstate', onNavChange);
        window.addEventListener('hashchange', onNavChange);
    }

    /**
     * Extracts current URL from window.location based on router mode.
     */
    private getCurrentLocationUrl(): string {
        if (typeof window === 'undefined') return '/';
        if (this.options.mode === 'hash') {
            const hash = window.location.hash.slice(1);
            return hash.startsWith('/') ? hash : '/' + hash;
        }

        // History mode: check pathname + search, with fallback to hash if pathname is root
        const pathname = window.location.pathname;
        if (pathname && pathname !== '/' && !pathname.endsWith('index.html')) {
            return pathname + window.location.search;
        }

        if (window.location.hash && window.location.hash.startsWith('#/')) {
            return window.location.hash.slice(1);
        }

        return pathname || '/';
    }

    /**
     * Navigates to a target route path with optional query parameters and options.
     */
    async navigate(targetPath: string, options?: NavigationOptions): Promise<boolean> {
        let fullUrl = targetPath;
        if (options?.queryParams) {
            const qs = serializeQueryParams(options.queryParams);
            const sep = fullUrl.includes('?') ? '&' : '';
            fullUrl = fullUrl + sep + (qs.startsWith('?') ? qs.slice(1) : qs);
        }
        return this.navigateByUrl(fullUrl, options);
    }

    /**
     * Navigates to a full URL (including pathname and query parameters).
     */
    async navigateByUrl(fullUrl: string, options?: NavigationOptions): Promise<boolean> {
        const [rawPath, rawQuery] = fullUrl.split('?');
        const cleanPath = normalizePath(rawPath || '/');
        const parsedQuery = parseQueryString(rawQuery || '');

        // 1. Resolve matching route
        const matchResult = this.findMatchingRoute(cleanPath);
        if (!matchResult) {
            console.warn(`[Purity Router] No matching route found for path "${cleanPath}"`);
            return false;
        }

        const { route, params } = matchResult;

        // 2. Handle redirectTo redirects
        if (route.redirectTo) {
            return this.navigate(route.redirectTo, options);
        }

        // 3. Execute Route Guards (canActivate)
        if (route.canActivate && route.canActivate.length > 0) {
            const routerState: RouterState = {
                url: fullUrl,
                path: cleanPath,
                params,
                queryParams: parsedQuery,
                data: route.data || {},
            };

            for (const guard of route.canActivate) {
                let guardPassed = true;
                if (typeof guard === 'function') {
                    if (guard.prototype && typeof (guard.prototype as any).canActivate === 'function') {
                        const GuardClass = guard as Constructor<any>;
                        let guardInstance: any;
                        try {
                            guardInstance = container.resolve(GuardClass);
                        } catch {
                            guardInstance = new GuardClass();
                        }
                        guardPassed = await guardInstance.canActivate(route, routerState);
                    } else {
                        guardPassed = await (guard as CanActivateFn)(route, routerState);
                    }
                } else if (typeof guard === 'string') {
                    try {
                        const guardInstance = container.resolve<any>(guard);
                        if (guardInstance && typeof guardInstance.canActivate === 'function') {
                            guardPassed = await guardInstance.canActivate(route, routerState);
                        }
                    } catch (err) {
                        console.error(`[Purity Router] Failed to resolve guard token "${guard}"`, err);
                        return false;
                    }
                }

                if (!guardPassed) {
                    return false;
                }
            }
        }

        // 4. Update reactive signals synchronously
        this.path.set(cleanPath);
        this.params.set(params);
        this.queryParams.set(parsedQuery);
        this.data.set(route.data || {});
        this.activeRoute.set(route);
        this.url.set(fullUrl);

        // 5. Update browser history if applicable
        if (
            typeof window !== 'undefined' &&
            !options?.skipLocationChange &&
            this.options.mode !== 'memory'
        ) {
            const browserUrl = this.options.mode === 'hash' ? `#${fullUrl}` : fullUrl;
            if (options?.replaceUrl) {
                window.history.replaceState(options?.state || {}, '', browserUrl);
            } else {
                window.history.pushState(options?.state || {}, '', browserUrl);
            }
        }

        // 6. Update document title and SEO metadata if configured
        if (typeof document !== 'undefined') {
            let seoService: any = null;
            try {
                seoService = container.resolve('SeoService');
            } catch {
                // SeoService not yet registered in DI container
            }

            const rawSeo = route.seo || route.data?.seo;
            if (rawSeo) {
                const seoConfig: SeoConfig = typeof rawSeo === 'function' ? rawSeo(params, route.data || {}) : rawSeo;
                if (seoService) {
                    seoService.setSeo(seoConfig);
                } else if (seoConfig.title) {
                    document.title = seoConfig.title;
                }
            } else if (route.title) {
                const title = typeof route.title === 'function' ? route.title(params) : route.title;
                if (seoService) {
                    seoService.setTitle(title);
                } else {
                    document.title = title;
                }
            }
        }

        // 7. Scroll restoration
        if (
            this.options.scrollRestoration &&
            typeof window !== 'undefined' &&
            !options?.skipLocationChange
        ) {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        }

        return true;
    }

    /**
     * Resolves the matching route definition and params from the route table.
     */
    private findMatchingRoute(
        pathname: string,
    ): { route: Route; params: RouteParams } | null {
        let wildcardRoute: Route | null = null;

        for (const route of this.routes) {
            if (route.path === '**' || route.path === '/**') {
                wildcardRoute = route;
                continue;
            }

            const match = matchRoutePattern(route.path, pathname);
            if (match) {
                return { route, params: match.params };
            }
        }

        if (wildcardRoute) {
            return { route: wildcardRoute, params: { wildcard: pathname } };
        }

        return null;
    }

    /**
     * Navigates back in browser history.
     */
    back(): void {
        if (typeof window !== 'undefined') {
            window.history.back();
        }
    }

    /**
     * Navigates forward in browser history.
     */
    forward(): void {
        if (typeof window !== 'undefined') {
            window.history.forward();
        }
    }

    /**
     * Returns the active router options.
     */
    getOptions(): RouterOptions {
        return { ...this.options };
    }

    /**
     * Checks whether a given path is currently active.
     */
    isActive(targetPath: string, exact: boolean = false): boolean {
        const current = this.path();
        const normalized = normalizePath(targetPath);
        if (exact || normalized === '/') {
            return current === normalized;
        }
        return current.startsWith(normalized);
    }
}

/**
 * <router-layout> Component
 * Host container that dynamically instantiates and mounts components for the currently active route.
 */
@Component({
    selector: 'router-layout',
})
export class RouterLayoutComponent {
    private router = container.resolve<Router>('Router');
    private currentRenderedComponent: any = null;
    private currentMountedElement: HTMLElement | null = null;

    protected onInit(): void {
        const host = this as unknown as HTMLElement;
        host.classList.add('purity-router-layout');

        // Reactively watch activeRoute signal and mount corresponding component
        effect(() => {
            const route = this.router.activeRoute();
            this.renderRouteComponent(route);
        });
    }

    protected onDestroy(): void {
        this.teardownCurrentComponent();
    }

    private teardownCurrentComponent(): void {
        if (
            this.currentRenderedComponent &&
            typeof this.currentRenderedComponent.onDestroy === 'function'
        ) {
            try {
                this.currentRenderedComponent.onDestroy();
            } catch (e) {
                console.error('[Purity Router] Error in component onDestroy:', e);
            }
        }

        if (this.currentMountedElement && this.currentMountedElement.parentNode) {
            this.currentMountedElement.parentNode.removeChild(this.currentMountedElement);
        }

        this.currentRenderedComponent = null;
        this.currentMountedElement = null;
    }

    private renderRouteComponent(route: Route | null): void {
        const host = this as unknown as HTMLElement;
        this.teardownCurrentComponent();
        host.innerHTML = '';

        if (!route || !route.component) {
            return;
        }

        let elementToMount: HTMLElement | null = null;

        if (typeof route.component === 'string') {
            // String custom element tag (e.g. 'home-view')
            elementToMount = document.createElement(route.component);
            this.currentMountedElement = elementToMount;
            this.currentRenderedComponent = elementToMount;
        } else if (typeof route.component === 'function') {
            // Component class constructor
            const ComponentClass = route.component as any;
            let selector = ComponentClass.selector || ComponentClass.__options?.selector;
            if (!selector && typeof ComponentClass.name === 'string') {
                selector = ComponentClass.name
                    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                    .replace(/[\s_]+/g, '-')
                    .toLowerCase()
                    .replace(/-component$/, '');
            }

            if (selector) {
                elementToMount = document.createElement(selector);
                this.currentMountedElement = elementToMount;
                this.currentRenderedComponent = elementToMount;
            } else {
                try {
                    const instance = new ComponentClass();
                    this.currentRenderedComponent = instance;
                    if (instance instanceof HTMLElement) {
                        elementToMount = instance;
                        this.currentMountedElement = elementToMount;
                    }
                } catch (err) {
                    console.error('[Purity Router] Failed to instantiate route component', err);
                }
            }
        }

        if (elementToMount) {
            // Forward route parameters to component instance if supported
            if (this.currentRenderedComponent) {
                if ('routeParams' in this.currentRenderedComponent) {
                    this.currentRenderedComponent.routeParams = this.router.params;
                }
                if ('queryParams' in this.currentRenderedComponent) {
                    this.currentRenderedComponent.queryParams = this.router.queryParams;
                }
                if ('routeData' in this.currentRenderedComponent) {
                    this.currentRenderedComponent.routeData = this.router.data;
                }
            }

            host.appendChild(elementToMount);
        }
    }
}

/**
 * routerLink Directive
 * Binds click events on anchor tags or buttons to trigger programmatic SPA router navigation,
 * and dynamically manages .active-link and .active-route CSS classes.
 */
@Directive('routerLink')
export class RouterLinkDirective extends BaseDirective {
    private router = container.resolve<Router>('Router');
    private clickHandler?: (e: MouseEvent) => void;

    onInit(): void {
        this.clickHandler = (event: MouseEvent) => {
            // Allow middle click / ctrl+click for new tabs if it is a link
            if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) {
                return;
            }

            event.preventDefault();
            const currentTarget = this.value || this.element.getAttribute('routerLink') || this.element.getAttribute('href') || '/';
            this.router.navigate(currentTarget);
        };

        this.element.addEventListener('click', this.clickHandler);

        // Reactively toggle active classes whenever the active route pathname changes
        effect(() => {
            const currentTarget = this.value || this.element.getAttribute('routerLink') || this.element.getAttribute('href') || '/';
            const isActive = this.router.isActive(currentTarget, currentTarget === '/');

            if (this.element.tagName === 'A') {
                const isHash = this.router.getOptions().mode === 'hash';
                this.element.setAttribute('href', isHash ? `#${currentTarget}` : currentTarget);
            }

            this.element.classList.toggle('active-link', isActive);
            this.element.classList.toggle('active-route', isActive);
            this.element.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
    }

    onChanges(newValue: any): void {
        this.value = newValue;
    }

    onDestroy(): void {
        if (this.clickHandler) {
            this.element.removeEventListener('click', this.clickHandler);
        }
    }
}
