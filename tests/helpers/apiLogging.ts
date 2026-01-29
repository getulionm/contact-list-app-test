import type { APIRequestContext, APIResponse } from "@playwright/test";

export type ApiClient = Pick<APIRequestContext, 'get' | 'post' | 'put' | 'patch' | 'delete'>;

// type CallOptions<T extends keyof APIRequestContext> = Parameters<APIRequestContext[T]>[1];

async function logIfError(res: APIResponse, method: string, url: string, options?: {data?: unknown}) {
    if (res.status() < 400) return;

    console.error(`\n[API ${res.status()}] ${method.toUpperCase()} ${url}`)
    if (options?.data !== undefined) {
        try {
            console.error('[Request data]')
            console.error(JSON.stringify(options.data, null, 2))
        } catch {
            console.error('[Request data] <unserializable')
        }
    }

    try {
        const text = await res.text();
        if (text) {
            console.error('[response body]')
            console.error(text)
        } else {
            console.error('[response body] <empty>')
        }
    } catch {
        console.error('[Response body] <failed to read')
    }
}

export function attachApiErrorLogging(api: APIRequestContext): ApiClient {
    async function wrap<T extends keyof ApiClient> (
        method: T,
        url: string,
        options?:any
    ) {
        const res = await (api[method] as any)(url, options);
        await logIfError(res, method as string, url, options);
        return res
    }
    return {
        get: (url, options) => wrap('get', url, options),
        post: (url, options) => wrap('post', url, options),
        put: (url, options) => wrap('put', url, options),
        patch: (url, options) => wrap('patch', url, options),
        delete: (url, options) => wrap('delete', url, options)
    }
}