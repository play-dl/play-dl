/// <reference types="node" />
/// <reference types="node" />
import { IncomingMessage } from 'node:http';
import { RequestOptions } from 'node:https';
interface RequestOpts extends RequestOptions {
    body?: string;
    method?: 'GET' | 'POST' | 'HEAD';
    cookies?: boolean;
    cookieJar?: {
        [key: string]: string;
    };
}
/**
 * Main module which play-dl uses to make a request to stream url.
 * @param url URL to make https request to
 * @param options Request options for https request
 * @returns IncomingMessage from the request
 */
export declare function request_stream(req_url: string, options?: RequestOpts): Promise<IncomingMessage>;
/**
 * Main module which play-dl uses to make a request
 * @param url URL to make https request to
 * @param options Request options for https request
 * @returns body of that request
 */
export declare function request(req_url: string, options?: RequestOpts): Promise<string>;
export declare function request_resolve_redirect(url: string): Promise<string>;
export declare function request_content_length(url: string): Promise<number>;
export {};
//# sourceMappingURL=index.d.ts.map