export declare function getCookies(): undefined | string;
export declare function setCookie(key: string, value: string): boolean;
export declare function uploadCookie(): void;
export declare function setCookieToken(options: {
    cookie: string;
}): void;
/**
 * Updates cookies locally either in file or in memory.
 *
 * Example
 * ```ts
 * const response = ... // Any https package get function.
 *
 * play.cookieHeaders(response.headers['set-cookie'])
 * ```
 * @param headCookie response headers['set-cookie'] array
 * @returns Nothing
 */
export declare function cookieHeaders(headCookie: string[]): void;
//# sourceMappingURL=cookie.d.ts.map