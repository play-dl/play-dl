"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format_decipher = void 0;
const node_url_1 = require("node:url");
const Request_1 = require("./../../Request");
// RegExp for various js functions
const var_js = '[a-zA-Z_\\$]\\w*';
const singlequote_js = `'[^'\\\\]*(:?\\\\[\\s\\S][^'\\\\]*)*'`;
const duoblequote_js = `"[^"\\\\]*(:?\\\\[\\s\\S][^"\\\\]*)*"`;
const quote_js = `(?:${singlequote_js}|${duoblequote_js})`;
const key_js = `(?:${var_js}|${quote_js})`;
const prop_js = `(?:\\.${var_js}|\\[${quote_js}\\])`;
const empty_js = `(?:''|"")`;
const reverse_function = ':function\\(a\\)\\{' + '(?:return )?a\\.reverse\\(\\)' + '\\}';
const slice_function = ':function\\(a,b\\)\\{' + 'return a\\.slice\\(b\\)' + '\\}';
const splice_function = ':function\\(a,b\\)\\{' + 'a\\.splice\\(0,b\\)' + '\\}';
const swap_function = ':function\\(a,b\\)\\{' +
    'var c=a\\[0\\];a\\[0\\]=a\\[b(?:%a\\.length)?\\];a\\[b(?:%a\\.length)?\\]=c(?:;return a)?' +
    '\\}';
const obj_regexp = new RegExp(`var (${var_js})=\\{((?:(?:${key_js}${reverse_function}|${key_js}${slice_function}|${key_js}${splice_function}|${key_js}${swap_function}),?\\r?\\n?)+)\\};`);
const function_regexp = new RegExp(`${`function(?: ${var_js})?\\(a\\)\\{` + `a=a\\.split\\(${empty_js}\\);\\s*` + `((?:(?:a=)?${var_js}`}${prop_js}\\(a,\\d+\\);)+)` +
    `return a\\.join\\(${empty_js}\\)` +
    `\\}`);
const reverse_regexp = new RegExp(`(?:^|,)(${key_js})${reverse_function}`, 'm');
const slice_regexp = new RegExp(`(?:^|,)(${key_js})${slice_function}`, 'm');
const splice_regexp = new RegExp(`(?:^|,)(${key_js})${splice_function}`, 'm');
const swap_regexp = new RegExp(`(?:^|,)(${key_js})${swap_function}`, 'm');
/**
 * Function to get tokens from html5player body data.
 * @param body body data of html5player.
 * @returns Array of tokens.
 */
function js_tokens(body) {
    const function_action = function_regexp.exec(body);
    const object_action = obj_regexp.exec(body);
    if (!function_action || !object_action)
        return null;
    const object = object_action[1].replace(/\$/g, '\\$');
    const object_body = object_action[2].replace(/\$/g, '\\$');
    const function_body = function_action[1].replace(/\$/g, '\\$');
    let result = reverse_regexp.exec(object_body);
    const reverseKey = result && result[1].replace(/\$/g, '\\$').replace(/\$|^'|^"|'$|"$/g, '');
    result = slice_regexp.exec(object_body);
    const sliceKey = result && result[1].replace(/\$/g, '\\$').replace(/\$|^'|^"|'$|"$/g, '');
    result = splice_regexp.exec(object_body);
    const spliceKey = result && result[1].replace(/\$/g, '\\$').replace(/\$|^'|^"|'$|"$/g, '');
    result = swap_regexp.exec(object_body);
    const swapKey = result && result[1].replace(/\$/g, '\\$').replace(/\$|^'|^"|'$|"$/g, '');
    const keys = `(${[reverseKey, sliceKey, spliceKey, swapKey].join('|')})`;
    const myreg = `(?:a=)?${object}(?:\\.${keys}|\\['${keys}'\\]|\\["${keys}"\\])` + `\\(a,(\\d+)\\)`;
    const tokenizeRegexp = new RegExp(myreg, 'g');
    const tokens = [];
    while ((result = tokenizeRegexp.exec(function_body)) !== null) {
        const key = result[1] || result[2] || result[3];
        switch (key) {
            case swapKey:
                tokens.push(`sw${result[4]}`);
                break;
            case reverseKey:
                tokens.push('rv');
                break;
            case sliceKey:
                tokens.push(`sl${result[4]}`);
                break;
            case spliceKey:
                tokens.push(`sp${result[4]}`);
                break;
        }
    }
    return tokens;
}
/**
 * Function to decipher signature
 * @param tokens Tokens from js_tokens function
 * @param signature Signatured format url
 * @returns deciphered signature
 */
function deciper_signature(tokens, signature) {
    let sig = signature.split('');
    const len = tokens.length;
    for (let i = 0; i < len; i++) {
        let token = tokens[i], pos;
        switch (token.slice(0, 2)) {
            case 'sw':
                pos = parseInt(token.slice(2));
                swappositions(sig, pos);
                break;
            case 'rv':
                sig.reverse();
                break;
            case 'sl':
                pos = parseInt(token.slice(2));
                sig = sig.slice(pos);
                break;
            case 'sp':
                pos = parseInt(token.slice(2));
                sig.splice(0, pos);
                break;
        }
    }
    return sig.join('');
}
/**
 * Function to swap positions in a array
 * @param array array
 * @param position position to switch with first element
 */
function swappositions(array, position) {
    const first = array[0];
    array[0] = array[position];
    array[position] = first;
}
/**
 * Sets Download url with some extra parameter
 * @param format video fomat
 * @param sig deciphered signature
 * @returns void
 */
function download_url(format, sig) {
    if (!format.url)
        return;
    const decoded_url = decodeURIComponent(format.url);
    const parsed_url = new node_url_1.URL(decoded_url);
    parsed_url.searchParams.set('ratebypass', 'yes');
    if (sig) {
        parsed_url.searchParams.set(format.sp || 'signature', sig);
    }
    format.url = parsed_url.toString();
}
/**
 * Main function which handles all queries related to video format deciphering
 * @param formats video formats
 * @param html5player url of html5player
 * @returns array of format.
 */
async function format_decipher(formats, html5player) {
    const body = await (0, Request_1.request)(html5player);
    const tokens = js_tokens(body);
    formats.forEach((format) => {
        const cipher = format.signatureCipher || format.cipher;
        if (cipher) {
            const params = Object.fromEntries(new node_url_1.URLSearchParams(cipher));
            Object.assign(format, params);
            delete format.signatureCipher;
            delete format.cipher;
        }
        if (tokens && format.s) {
            const sig = deciper_signature(tokens, format.s);
            download_url(format, sig);
            delete format.s;
            delete format.sp;
        }
    });
    return formats;
}
exports.format_decipher = format_decipher;
//# sourceMappingURL=cipher.js.map