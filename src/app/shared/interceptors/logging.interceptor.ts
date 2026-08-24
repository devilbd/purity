import type { HttpInterceptor, HttpRequest, HttpResponse, HttpNextFn } from '@purity/core';

/**
 * Centralized Logging Interceptor.
 * Measures request duration, logs URLs, status codes, and network errors to the console.
 */
export class LoggingInterceptor implements HttpInterceptor {
    public async intercept(req: HttpRequest, next: HttpNextFn): Promise<HttpResponse<any>> {
        const start = performance.now();
        const timestamp = new Date().toLocaleTimeString();

        console.log(
            `%c[HTTP Request] ${timestamp} %c${req.method} %c${req.url}`,
            'color: #9a9996;',
            'color: #3584e4; font-weight: bold;',
            'color: var(--text-main, #ffffff);',
        );

        try {
            const res = await next(req);
            const duration = Math.round(performance.now() - start);

            console.log(
                `%c[HTTP Response] ${timestamp} %c${req.method} ${req.url} %c-> ${res.status} ${res.statusText} (${duration}ms)`,
                'color: #9a9996;',
                'color: #2ec27e; font-weight: bold;',
                'color: #2ec27e;',
            );

            return res;
        } catch (err: any) {
            const duration = Math.round(performance.now() - start);

            console.error(
                `%c[HTTP Error] ${timestamp} %c${req.method} ${req.url} %cfailed (${err.status || 'Network'}) in ${duration}ms:`,
                'color: #9a9996;',
                'color: #e01b24; font-weight: bold;',
                'color: #e01b24;',
                err,
            );

            throw err;
        }
    }
}
