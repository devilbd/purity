import { Injectable, container } from './di';
import { signal, type Signal } from './core';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type HttpResponseType = 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream';

export interface HttpRequestOptions {
    headers?: Record<string, string | string[]> | HttpHeaders | Headers;
    params?: Record<string, string | number | boolean | (string | number | boolean)[]> | HttpParams | URLSearchParams | string;
    body?: any;
    responseType?: HttpResponseType;
    timeout?: number;
    signal?: AbortSignal;
    withCredentials?: boolean;
    context?: Record<string, any> | Map<string, any>;
}

/**
 * Immutable, case-insensitive HTTP headers container.
 */
export class HttpHeaders {
    private map = new Map<string, string[]>();
    private displayNames = new Map<string, string>();

    constructor(
        headers?: Record<string, string | string[]> | HttpHeaders | Headers | [string, string | string[]][],
    ) {
        if (!headers) return;

        if (headers instanceof HttpHeaders) {
            headers.map.forEach((values, key) => {
                this.map.set(key, [...values]);
            });
            headers.displayNames.forEach((name, key) => {
                this.displayNames.set(key, name);
            });
        } else if (typeof Headers !== 'undefined' && headers instanceof Headers) {
            headers.forEach((value, key) => {
                this.append(key, value);
            });
        } else if (Array.isArray(headers)) {
            headers.forEach(([key, value]) => {
                this.append(key, value);
            });
        } else if (typeof headers === 'object') {
            Object.entries(headers).forEach(([key, value]) => {
                this.set(key, value);
            });
        }
    }

    private clone(): HttpHeaders {
        const copy = new HttpHeaders();
        this.map.forEach((values, key) => {
            copy.map.set(key, [...values]);
        });
        this.displayNames.forEach((name, key) => {
            copy.displayNames.set(key, name);
        });
        return copy;
    }

    public has(name: string): boolean {
        return this.map.has(name.toLowerCase());
    }

    public get(name: string): string | null {
        const values = this.map.get(name.toLowerCase());
        return values && values.length > 0 ? values.join(', ') : null;
    }

    public getAll(name: string): string[] | null {
        const values = this.map.get(name.toLowerCase());
        return values ? [...values] : null;
    }

    public keys(): string[] {
        return Array.from(this.displayNames.values());
    }

    public set(name: string, value: string | string[]): HttpHeaders {
        const clone = this.clone();
        const key = name.toLowerCase();
        const arr = Array.isArray(value) ? value.map(String) : [String(value)];
        clone.map.set(key, arr);
        clone.displayNames.set(key, name);
        return clone;
    }

    public append(name: string, value: string | string[]): HttpHeaders {
        const clone = this.clone();
        const key = name.toLowerCase();
        const arr = Array.isArray(value) ? value.map(String) : [String(value)];
        const existing = clone.map.get(key) || [];
        clone.map.set(key, [...existing, ...arr]);
        if (!clone.displayNames.has(key)) {
            clone.displayNames.set(key, name);
        }
        return clone;
    }

    public delete(name: string): HttpHeaders {
        const clone = this.clone();
        const key = name.toLowerCase();
        clone.map.delete(key);
        clone.displayNames.delete(key);
        return clone;
    }

    public forEach(fn: (value: string, name: string, headers: HttpHeaders) => void): void {
        this.displayNames.forEach((name, key) => {
            const val = this.get(key);
            if (val !== null) {
                fn(val, name, this);
            }
        });
    }

    public toRecord(): Record<string, string> {
        const record: Record<string, string> = {};
        this.displayNames.forEach((name, key) => {
            const val = this.get(key);
            if (val !== null) {
                record[name] = val;
            }
        });
        return record;
    }

    public toHeaders(): Headers {
        const h = new Headers();
        this.displayNames.forEach((name, key) => {
            const values = this.map.get(key);
            if (values) {
                values.forEach((v) => h.append(name, v));
            }
        });
        return h;
    }
}

/**
 * Immutable URL query parameters container.
 */
export class HttpParams {
    private map = new Map<string, string[]>();

    constructor(
        params?: Record<string, string | number | boolean | (string | number | boolean)[]> | HttpParams | URLSearchParams | string,
    ) {
        if (!params) return;

        if (params instanceof HttpParams) {
            params.map.forEach((values, key) => {
                this.map.set(key, [...values]);
            });
        } else if (typeof URLSearchParams !== 'undefined' && params instanceof URLSearchParams) {
            params.forEach((value, key) => {
                this.append(key, value);
            });
        } else if (typeof params === 'string') {
            const clean = params.startsWith('?') ? params.slice(1) : params;
            const search = new URLSearchParams(clean);
            search.forEach((value, key) => {
                this.append(key, value);
            });
        } else if (typeof params === 'object') {
            Object.entries(params).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    this.set(key, value);
                } else if (value !== undefined && value !== null) {
                    this.set(key, String(value));
                }
            });
        }
    }

    private clone(): HttpParams {
        const copy = new HttpParams();
        this.map.forEach((values, key) => {
            copy.map.set(key, [...values]);
        });
        return copy;
    }

    public has(name: string): boolean {
        return this.map.has(name);
    }

    public get(name: string): string | null {
        const values = this.map.get(name);
        return values && values.length > 0 ? values[0] : null;
    }

    public getAll(name: string): string[] | null {
        const values = this.map.get(name);
        return values ? [...values] : null;
    }

    public keys(): string[] {
        return Array.from(this.map.keys());
    }

    public set(name: string, value: string | number | boolean | (string | number | boolean)[]): HttpParams {
        const clone = this.clone();
        const arr = Array.isArray(value) ? value.map(String) : [String(value)];
        clone.map.set(name, arr);
        return clone;
    }

    public append(name: string, value: string | number | boolean | (string | number | boolean)[]): HttpParams {
        const clone = this.clone();
        const arr = Array.isArray(value) ? value.map(String) : [String(value)];
        const existing = clone.map.get(name) || [];
        clone.map.set(name, [...existing, ...arr]);
        return clone;
    }

    public delete(name: string): HttpParams {
        const clone = this.clone();
        clone.map.delete(name);
        return clone;
    }

    public toString(): string {
        const search = new URLSearchParams();
        this.map.forEach((values, key) => {
            values.forEach((v) => search.append(key, v));
        });
        return search.toString();
    }
}

/**
 * Representation of an outgoing HTTP request.
 */
export class HttpRequest<T = any> {
    public readonly method: HttpMethod;
    public readonly url: string;
    public readonly headers: HttpHeaders;
    public readonly params: HttpParams;
    public readonly body: T | null;
    public readonly responseType: HttpResponseType;
    public readonly timeout?: number;
    public readonly signal?: AbortSignal;
    public readonly withCredentials?: boolean;
    public readonly context: Map<string, any>;

    constructor(
        method: HttpMethod,
        url: string,
        options: HttpRequestOptions = {},
    ) {
        this.method = (method.toUpperCase() as HttpMethod) || 'GET';
        this.url = url;
        this.headers = options.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options.headers);
        this.params = options.params instanceof HttpParams ? options.params : new HttpParams(options.params);
        this.body = options.body !== undefined ? options.body : null;
        this.responseType = options.responseType || 'json';
        this.timeout = options.timeout;
        this.signal = options.signal;
        this.withCredentials = options.withCredentials;

        this.context = new Map();
        if (options.context) {
            if (options.context instanceof Map) {
                options.context.forEach((v, k) => this.context.set(k, v));
            } else {
                Object.entries(options.context).forEach(([k, v]) => this.context.set(k, v));
            }
        }
    }

    /**
     * Creates an immutable clone with updated properties.
     */
    public clone(update: Partial<HttpRequestOptions & { method?: HttpMethod; url?: string }> = {}): HttpRequest<any> {
        return new HttpRequest(
            update.method || this.method,
            update.url || this.url,
            {
                headers: update.headers !== undefined ? update.headers : this.headers,
                params: update.params !== undefined ? update.params : this.params,
                body: update.body !== undefined ? update.body : this.body,
                responseType: update.responseType || this.responseType,
                timeout: update.timeout !== undefined ? update.timeout : this.timeout,
                signal: update.signal || this.signal,
                withCredentials: update.withCredentials !== undefined ? update.withCredentials : this.withCredentials,
                context: update.context || this.context,
            },
        );
    }

    /**
     * Resolves the full URL including serialized query parameters.
     */
    public getUrlWithParams(): string {
        const query = this.params.toString();
        if (!query) return this.url;
        const separator = this.url.includes('?') ? '&' : '?';
        return `${this.url}${separator}${query}`;
    }
}

/**
 * Representation of an incoming HTTP response.
 */
export class HttpResponse<T = any> {
    public readonly data: T;
    public readonly status: number;
    public readonly statusText: string;
    public readonly headers: HttpHeaders;
    public readonly url: string;
    public readonly ok: boolean;
    public readonly request: HttpRequest;

    constructor(init: {
        data: T;
        status: number;
        statusText: string;
        headers: HttpHeaders;
        url: string;
        request: HttpRequest;
    }) {
        this.data = init.data;
        this.status = init.status;
        this.statusText = init.statusText;
        this.headers = init.headers;
        this.url = init.url;
        this.ok = init.status >= 200 && init.status < 300;
        this.request = init.request;
    }
}

/**
 * Custom error thrown when an HTTP request fails or returns a non-2xx status.
 */
export class HttpErrorResponse extends Error {
    public readonly error: any;
    public readonly status: number;
    public readonly statusText: string;
    public readonly url: string;
    public readonly headers: HttpHeaders;
    public readonly request: HttpRequest;

    constructor(init: {
        error: any;
        status: number;
        statusText: string;
        url: string;
        headers: HttpHeaders;
        request: HttpRequest;
        message?: string;
    }) {
        super(init.message || `Http failure response for ${init.url}: ${init.status} ${init.statusText}`);
        this.name = 'HttpErrorResponse';
        this.error = init.error;
        this.status = init.status;
        this.statusText = init.statusText;
        this.url = init.url;
        this.headers = init.headers;
        this.request = init.request;

        Object.setPrototypeOf(this, HttpErrorResponse.prototype);
    }
}

export type HttpNextFn = (req: HttpRequest) => Promise<HttpResponse<any>>;

/**
 * HTTP Interceptor contract for intercepting and mutating requests and responses.
 */
export interface HttpInterceptor {
    intercept(req: HttpRequest, next: HttpNextFn): Promise<HttpResponse<any>>;
}

export type HttpInterceptorFn = (req: HttpRequest, next: HttpNextFn) => Promise<HttpResponse<any>>;

export const HTTP_INTERCEPTORS = 'HTTP_INTERCEPTORS';

/**
 * Provider helper to register centralized HTTP interceptors for bootstrapApplication.
 */
export function provideHttpInterceptors(
    ...interceptors: Array<HttpInterceptor | (new (...args: any[]) => HttpInterceptor) | HttpInterceptorFn>
): { provide: string; useValue: Array<HttpInterceptor | HttpInterceptorFn> } {
    const resolved = interceptors.map((item) => {
        if (typeof item === 'function' && item.prototype && typeof item.prototype.intercept === 'function') {
            return new (item as new () => HttpInterceptor)();
        }
        return item as HttpInterceptor | HttpInterceptorFn;
    });

    return {
        provide: HTTP_INTERCEPTORS,
        useValue: resolved,
    };
}

/**
 * Default HTTP fetch backend executing requests via window.fetch().
 */
export class HttpFetchBackend {
    public async handle(req: HttpRequest): Promise<HttpResponse<any>> {
        const url = req.getUrlWithParams();
        let headers = req.headers;

        // Auto-detect JSON body
        let bodyPayload: BodyInit | null = null;
        if (req.body !== null && req.body !== undefined) {
            const isRawBody =
                (typeof Blob !== 'undefined' && req.body instanceof Blob) ||
                (typeof ArrayBuffer !== 'undefined' && req.body instanceof ArrayBuffer) ||
                (typeof FormData !== 'undefined' && req.body instanceof FormData) ||
                (typeof URLSearchParams !== 'undefined' && req.body instanceof URLSearchParams) ||
                typeof req.body === 'string';

            if (isRawBody) {
                bodyPayload = req.body;
            } else {
                bodyPayload = JSON.stringify(req.body);
                if (!headers.has('Content-Type')) {
                    headers = headers.set('Content-Type', 'application/json');
                }
            }
        }

        if (!headers.has('Accept')) {
            if (req.responseType === 'json') {
                headers = headers.set('Accept', 'application/json, text/plain, */*');
            } else if (req.responseType === 'text') {
                headers = headers.set('Accept', 'text/plain, */*');
            }
        }

        // Handle timeout and cancellation
        let timeoutId: any;
        const controller = new AbortController();
        let effectiveSignal = controller.signal;

        if (req.signal) {
            if (req.signal.aborted) {
                controller.abort();
            } else {
                req.signal.addEventListener('abort', () => controller.abort());
            }
        }

        if (req.timeout && req.timeout > 0) {
            timeoutId = setTimeout(() => {
                controller.abort();
            }, req.timeout);
        }

        const fetchInit: RequestInit = {
            method: req.method,
            headers: headers.toRecord(),
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : bodyPayload,
            signal: effectiveSignal,
            credentials: req.withCredentials ? 'include' : 'same-origin',
        };

        try {
            const rawResponse = await fetch(url, fetchInit);
            if (timeoutId) clearTimeout(timeoutId);

            const responseHeaders = new HttpHeaders(rawResponse.headers);

            let parsedData: any = null;
            if (rawResponse.status !== 204 && req.method !== 'HEAD') {
                switch (req.responseType) {
                    case 'json':
                        try {
                            const text = await rawResponse.text();
                            parsedData = text ? JSON.parse(text) : null;
                        } catch {
                            parsedData = null;
                        }
                        break;
                    case 'text':
                        parsedData = await rawResponse.text();
                        break;
                    case 'blob':
                        parsedData = await rawResponse.blob();
                        break;
                    case 'arraybuffer':
                        parsedData = await rawResponse.arrayBuffer();
                        break;
                    case 'stream':
                        parsedData = rawResponse.body;
                        break;
                    default:
                        parsedData = await rawResponse.text();
                }
            }

            const httpResponse = new HttpResponse({
                data: parsedData,
                status: rawResponse.status,
                statusText: rawResponse.statusText,
                headers: responseHeaders,
                url: rawResponse.url || url,
                request: req,
            });

            if (!rawResponse.ok) {
                throw new HttpErrorResponse({
                    error: parsedData,
                    status: rawResponse.status,
                    statusText: rawResponse.statusText,
                    url: rawResponse.url || url,
                    headers: responseHeaders,
                    request: req,
                });
            }

            return httpResponse;
        } catch (err: any) {
            if (timeoutId) clearTimeout(timeoutId);

            if (err instanceof HttpErrorResponse) {
                throw err;
            }

            const isAbort = err.name === 'AbortError' || controller.signal.aborted;
            throw new HttpErrorResponse({
                error: err,
                status: 0,
                statusText: isAbort ? 'Request Timeout / Aborted' : 'Network Failure',
                url,
                headers: new HttpHeaders(),
                request: req,
                message: err.message || 'Network request failed',
            });
        }
    }
}

export interface HttpResource<T> {
    data: Signal<T | null>;
    loading: Signal<boolean>;
    error: Signal<HttpErrorResponse | Error | null>;
    status: Signal<number | null>;
    refetch: () => Promise<HttpResponse<T> | null>;
}

const BREEZE_PROGRESS_FRAMES: string[] = Array.from({ length: 23 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `url('/cursors/progress-${num}.svg') 4 4, progress`;
});

let loadingCursorTimer: any = null;
let currentProgressFrameIndex = 0;
let activeLoadingHolders = 0;

/**
 * Starts the animated Breeze progress/loading cursor.
 * Supports reference counting across multiple concurrent HTTP requests and loaders.
 */
export function startLoadingCursor(): void {
    if (typeof document === 'undefined') return;
    activeLoadingHolders++;
    document.documentElement.classList.add('http-loading');
    document.body?.classList.add('http-loading');

    if (!loadingCursorTimer) {
        currentProgressFrameIndex = 0;
        loadingCursorTimer = setInterval(() => {
            currentProgressFrameIndex = (currentProgressFrameIndex + 1) % BREEZE_PROGRESS_FRAMES.length;
            document.documentElement.style.setProperty(
                '--cursor-progress',
                BREEZE_PROGRESS_FRAMES[currentProgressFrameIndex],
            );
        }, 45);
    }
}

/**
 * Stops the animated Breeze progress/loading cursor when all holders have released it.
 */
export function stopLoadingCursor(): void {
    if (typeof document === 'undefined') return;
    activeLoadingHolders = Math.max(0, activeLoadingHolders - 1);
    if (activeLoadingHolders === 0) {
        document.documentElement.classList.remove('http-loading');
        document.body?.classList.remove('http-loading');

        if (loadingCursorTimer) {
            clearInterval(loadingCursorTimer);
            loadingCursorTimer = null;
        }
        document.documentElement.style.removeProperty('--cursor-progress');
    }
}

/**
 * Injectable HTTP Client Service providing comprehensive HTTP methods,
 * interceptor pipeline chaining, and reactive signal helpers.
 */
@Injectable('HttpClient')
export class HttpClient {
    private backend = new HttpFetchBackend();
    private interceptors: Array<HttpInterceptor | HttpInterceptorFn> = [];

    // Global Telemetry Signals
    public activeRequests = signal<number>(0);
    public isLoading = signal<boolean>(false);

    constructor() {
        // Resolve any DI-provided interceptors
        try {
            const diInterceptors = container.resolve<Array<HttpInterceptor | HttpInterceptorFn>>(HTTP_INTERCEPTORS);
            if (Array.isArray(diInterceptors)) {
                this.interceptors.push(...diInterceptors);
            }
        } catch {
            // No DI interceptors configured
        }
    }

    /**
     * Appends an interceptor into the execution pipeline.
     */
    public addInterceptor(interceptor: HttpInterceptor | HttpInterceptorFn): () => void {
        this.interceptors.push(interceptor);
        return () => {
            const idx = this.interceptors.indexOf(interceptor);
            if (idx >= 0) {
                this.interceptors.splice(idx, 1);
            }
        };
    }

    /**
     * Method chaining alias for adding interceptors.
     */
    public use(interceptor: HttpInterceptor | HttpInterceptorFn): this {
        this.addInterceptor(interceptor);
        return this;
    }

    /**
     * Core request dispatcher executing through the interceptor pipeline.
     */
    public async request<T = any>(
        method: HttpMethod,
        url: string,
        options?: HttpRequestOptions,
    ): Promise<HttpResponse<T>> {
        const initialReq = new HttpRequest<T>(method, url, options);

        this.activeRequests.update((count) => count + 1);
        this.isLoading.set(true);
        startLoadingCursor();

        const chain: Array<HttpInterceptorFn> = this.interceptors.map((interceptor) => {
            if (typeof interceptor === 'function') {
                return interceptor;
            }
            return (req, next) => interceptor.intercept(req, next);
        });

        // Backend handler is the terminal step in the chain
        const backendHandler: HttpNextFn = (req) => this.backend.handle(req);

        let index = -1;
        const dispatch = (i: number, currentReq: HttpRequest): Promise<HttpResponse<any>> => {
            if (i <= index) {
                return Promise.reject(new Error('[HttpClient] next() called multiple times in interceptor'));
            }
            index = i;
            const fn = chain[i];
            if (fn) {
                return fn(currentReq, (nextReq) => dispatch(i + 1, nextReq));
            }
            return backendHandler(currentReq);
        };

        try {
            const response = await dispatch(0, initialReq);
            return response as HttpResponse<T>;
        } finally {
            this.activeRequests.update((count) => Math.max(0, count - 1));
            const stillActive = this.activeRequests() > 0;
            this.isLoading.set(stillActive);
            stopLoadingCursor();
        }
    }

    /**
     * Standard HTTP GET request.
     */
    public get<T = any>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
        return this.request<T>('GET', url, options);
    }

    /**
     * Standard HTTP POST request.
     */
    public post<T = any>(url: string, body?: any, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
        return this.request<T>('POST', url, { ...options, body });
    }

    /**
     * Standard HTTP PUT request.
     */
    public put<T = any>(url: string, body?: any, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
        return this.request<T>('PUT', url, { ...options, body });
    }

    /**
     * Standard HTTP PATCH request.
     */
    public patch<T = any>(url: string, body?: any, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
        return this.request<T>('PATCH', url, { ...options, body });
    }

    /**
     * Standard HTTP DELETE request.
     */
    public delete<T = any>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
        return this.request<T>('DELETE', url, options);
    }

    /**
     * Standard HTTP HEAD request.
     */
    public head(url: string, options?: HttpRequestOptions): Promise<HttpResponse<null>> {
        return this.request<null>('HEAD', url, options);
    }

    /**
     * Standard HTTP OPTIONS request.
     */
    public options<T = any>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
        return this.request<T>('OPTIONS', url, options);
    }

    /**
     * Reactive Signal Resource Helper.
     * Generates fine-grained reactive signals (`data`, `loading`, `error`, `status`)
     * that automatically manage request lifecycle and enable effortless template binding.
     */
    public createResource<T>(
        fetcher: () => Promise<HttpResponse<T>>,
        autoFetch = true,
    ): HttpResource<T> {
        const data = signal<T | null>(null);
        const loading = signal<boolean>(false);
        const error = signal<HttpErrorResponse | Error | null>(null);
        const status = signal<number | null>(null);

        const execute = async (): Promise<HttpResponse<T> | null> => {
            loading.set(true);
            error.set(null);
            try {
                const res = await fetcher();
                data.set(res.data);
                status.set(res.status);
                return res;
            } catch (err: any) {
                error.set(err);
                if (err instanceof HttpErrorResponse) {
                    status.set(err.status);
                } else {
                    status.set(0);
                }
                return null;
            } finally {
                loading.set(false);
            }
        };

        if (autoFetch) {
            execute();
        }

        return {
            data,
            loading,
            error,
            status,
            refetch: execute,
        };
    }
}
