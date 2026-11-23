// It contains Generic Functions, Different types of HTTP Methods

/**
 * - APIs Helper is a **simple type of a class**
 * - which can help you to make a different type of HTTP
 * - GET, POST, PATCH,PUT, DELETE
 *  - Generic Fn, which can used by any TestCase 
 */

import { Page, APIRequestContext, APIResponse } from '@playwright/test';
export type ApiContext = Page | APIRequestContext;
export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';

// Request Modificatoin Interface - Request Method Options
export interface ApiRequestOptions {

    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    data?: unknown; // payload, body
    params?: Record<string, string>;
    timeout?: number;
}

// RetryOptions - This interface will make sure how many times you want to retry,
// Bcz, API Requests sometimes fail, sometimes pass

export interface RetryOptions {

    condition: (response: APIResponse) => Promise<boolean> | boolean
    pollingInterval?: number;
    retryCount?: number;
}

export class ApiHelper {

    // exporting it, Bcz we want to use this in another file
    private context: ApiContext;

    constructor(context: ApiContext) {
        this.context = context;
    }

    private getRequest(): APIRequestContext {

        if ('request' in this.context) {
            return this.context.request;
        }
        return this.context;
    }

    // example1 -  https://example.com
    // example2 -  https://example.com/ param :  param1=abc&param2=xyz return-.  https://example.com/param1=abc&param2=xyz
    // exmaple3 - https://example.com/, params :  /student/1 -> https://example.com/student/1
    // builturl(example1)

    private buildUrl(url: string, params?: Record<string, string>): string {
        if(!params) return url;
        const searchParam = new URLSearchParams(params);
        return `${url}?${searchParam.toString()}`;
    }

    /**
    * Perform an HTTP API request
    */

    async callApi(options: ApiRequestOptions): Promise<APIResponse>{
        const { url, method, headers, data, params, timeout } = options;
        // It destructures the options object and assigns each named property to a separate variable. 
        // For example, url becomes options.url, method becomes options.method, and so on. 
        // These variables are then available inside callApi.

        // Extracts properties out of options:
        // const url = options.url;
        // const method = options.method;

        const request = this.getRequest();
        const fullUrl = this.buildUrl(url, params);

        switch(method){
            case 'GET':
                return await request.get(fullUrl, { headers, timeout });
            case 'POST':
                return await request.post(fullUrl, { headers, data, timeout });
            case 'PUT':
                return await request.put(fullUrl, { headers, data, timeout });
            case 'DELETE':
                return await request.delete(fullUrl, { headers, timeout });
            case 'PATCH':
                return await request.patch(fullUrl, { headers, data, timeout });
            default:
                // `method` is `never` here: the switch above is exhaustive over HttpMethod.
                throw new Error(`Unsupported HTTP method: ${String(method)}`);


        }
    }

     /**
     * Call API with retry logic
     */

    async callApiWithRetry(
        options: ApiRequestOptions,
        retryOptions: RetryOptions,
    ): Promise<APIResponse> {
        const { condition, pollingInterval = 5000, retryCount = 3 } = retryOptions;
        let lastResponse: APIResponse | null = null;

        for (let attempt = 1; attempt <= retryCount; attempt++) {
            lastResponse = await this.callApi(options);

            if (await condition(lastResponse)) {
                return lastResponse;
            }

            if (attempt < retryCount) {
                await new Promise(resolve => setTimeout(resolve, pollingInterval));
            }
        }

        return lastResponse!;
    }

/**
     * Convenience method for GET requests
     */
    async get(url: string, options?: Omit<ApiRequestOptions, 'url' | 'method'>): Promise<APIResponse> {
        return this.callApi({ url, method: 'GET', ...options });
    }
    /**
     * Convenience method for POST requests
     */
    async post(url: string, data?: unknown, options?: Omit<ApiRequestOptions, 'url' | 'method' | 'data'>): Promise<APIResponse> {
        return this.callApi({ url, method: 'POST', data, ...options });
    }

    /**
     * Convenience method for PUT requests
     */
    async put(url: string, data?: unknown, options?: Omit<ApiRequestOptions, 'url' | 'method' | 'data'>): Promise<APIResponse> {
        return this.callApi({ url, method: 'PUT', data, ...options });
    }

    /**
     * Convenience method for DELETE requests
     */
    async delete(url: string, options?: Omit<ApiRequestOptions, 'url' | 'method'>): Promise<APIResponse> {
        return this.callApi({ url, method: 'DELETE', ...options });
    }

    /**
     * Convenience method for PATCH requests
     */
    async patch(url: string, data?: unknown, options?: Omit<ApiRequestOptions, 'url' | 'method' | 'data'>): Promise<APIResponse> {
        return this.callApi({ url, method: 'PATCH', data, ...options });
    }

    /**
     * Parse JSON response with type safety
     */
    async parseJsonResponse<T>(response: APIResponse): Promise<T> {
        return await response.json() as T;
    }

    /**
     * Check if response is successful (2xx status)
     */
    isSuccess(response: APIResponse): boolean {
        const status = response.status();
        return status >= 200 && status < 300;
    }
    /**
     * Check if response is successful (2xx status)
     */
    isFailureClient(response: APIResponse): boolean {
        const status = response.status();
        return status >= 400 && status < 500;
    }


}

