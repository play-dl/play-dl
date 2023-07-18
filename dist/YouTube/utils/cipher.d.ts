interface formatOptions {
    url?: string;
    sp?: string;
    signatureCipher?: string;
    cipher?: string;
    s?: string;
}
/**
 * Main function which handles all queries related to video format deciphering
 * @param formats video formats
 * @param html5player url of html5player
 * @returns array of format.
 */
export declare function format_decipher(formats: formatOptions[], html5player: string): Promise<formatOptions[]>;
export {};
//# sourceMappingURL=cipher.d.ts.map