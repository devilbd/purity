import type { HttpInterceptor, HttpRequest, HttpResponse, HttpNextFn } from '@purity/core';

/**
 * Centralized Authentication Interceptor.
 * Automatically injects Bearer authorization tokens into outgoing HTTP requests.
 */
export class AuthInterceptor implements HttpInterceptor {
    private token = 'purity_jwt_sample_token';

    public setToken(token: string): void {
        this.token = token;
    }

    public async intercept(req: HttpRequest, next: HttpNextFn): Promise<HttpResponse<any>> {
        // Skip auth injection if Authorization header already provided
        if (req.headers.has('Authorization')) {
            return next(req);
        }

        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${this.token}`),
        });

        return next(authReq);
    }
}
