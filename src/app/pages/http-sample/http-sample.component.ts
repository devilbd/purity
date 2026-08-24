import { Component, signal, inject, ViewChild, HttpClient } from '@purity/core';
import type { LoaderComponent } from '@components/loader/loader.component';
import './http-sample.component.scss';

export interface PostItem {
    id?: number;
    title: string;
    body: string;
    userId?: number;
}

@Component({
    selector: 'http-sample',
    templateUrl: './src/app/pages/http-sample/http-sample.component.html',
})
export class HttpSampleComponent {
    private http = inject(HttpClient);

    @ViewChild('#http-loader')
    public httpLoader?: LoaderComponent | null;

    // Reactive State Signals
    public requestMethod = signal<string>('GET');
    public requestUrl = signal<string>('https://jsonplaceholder.typicode.com/posts/1');
    public responseStatus = signal<string>('Idle (No request sent)');
    public responseBody = signal<string>('// Response data will appear here');
    public responseHeaders = signal<string>('// Response headers');
    public isRequestLoading = signal<boolean>(false);


    public async sendGetRequest(): Promise<void> {
        this.requestMethod.set('GET');
        this.requestUrl.set('https://jsonplaceholder.typicode.com/posts/1');
        await this.executeRequest(() =>
            this.http.get<PostItem>(this.requestUrl(), {
                params: { timestamp: Date.now() },
            }),
        );
    }

    public async sendPostRequest(): Promise<void> {
        this.requestMethod.set('POST');
        this.requestUrl.set('https://jsonplaceholder.typicode.com/posts');
        await this.executeRequest(() =>
            this.http.post<PostItem>(this.requestUrl(), {
                title: 'New Purity Post',
                body: 'Purity HTTP Client is reactive, modular, and lightweight!',
                userId: 1,
            }),
        );
    }

    public async sendPutRequest(): Promise<void> {
        this.requestMethod.set('PUT');
        this.requestUrl.set('https://jsonplaceholder.typicode.com/posts/1');
        await this.executeRequest(() =>
            this.http.put<PostItem>(this.requestUrl(), {
                id: 1,
                title: 'Updated Post via Purity',
                body: 'Updated post content passed cleanly through the interceptors pipeline.',
            }),
        );
    }

    public async sendDeleteRequest(): Promise<void> {
        this.requestMethod.set('DELETE');
        this.requestUrl.set('https://jsonplaceholder.typicode.com/posts/1');
        await this.executeRequest(() =>
            this.http.delete(this.requestUrl()),
        );
    }

    public async sendErrorRequest(): Promise<void> {
        this.requestMethod.set('GET');
        this.requestUrl.set('https://jsonplaceholder.typicode.com/non-existent-endpoint-404');
        await this.executeRequest(() =>
            this.http.get(this.requestUrl()),
        );
    }

    private async executeRequest(action: () => Promise<any>): Promise<void> {
        this.isRequestLoading.set(true);
        this.responseStatus.set('Fetching...');
        this.responseBody.set('Loading response...');
        this.responseHeaders.set('Loading headers...');

        this.httpLoader?.show();

        try {
            const res = await action();
            this.responseStatus.set(`${res.status} ${res.statusText || 'OK'}`);
            this.responseBody.set(JSON.stringify(res.data, null, 2));

            const headersRecord = res.headers.toRecord();
            this.responseHeaders.set(
                Object.keys(headersRecord).length > 0
                    ? JSON.stringify(headersRecord, null, 2)
                    : '// No custom response headers returned',
            );
        } catch (err: any) {
            this.responseStatus.set(`${err.status || 0} ${err.statusText || 'Error'}`);
            this.responseBody.set(
                JSON.stringify(
                    {
                        name: err.name,
                        message: err.message,
                        status: err.status,
                        statusText: err.statusText,
                        errorBody: err.error,
                    },
                    null,
                    2,
                ),
            );
            this.responseHeaders.set(
                JSON.stringify(err.headers ? err.headers.toRecord() : {}, null, 2),
            );
        } finally {
            this.isRequestLoading.set(false);
            this.httpLoader?.hide();
        }
    }
}
