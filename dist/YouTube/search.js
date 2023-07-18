"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yt_search = void 0;
const Request_1 = require("./../Request");
const parser_1 = require("./utils/parser");
var SearchType;
(function (SearchType) {
    SearchType["Video"] = "EgIQAQ%253D%253D";
    SearchType["PlayList"] = "EgIQAw%253D%253D";
    SearchType["Channel"] = "EgIQAg%253D%253D";
})(SearchType || (SearchType = {}));
/**
 * Command to search from YouTube
 * @param search The query to search
 * @param options limit & type of YouTube search you want.
 * @returns YouTube type.
 */
async function yt_search(search, options = {}) {
    let url = 'https://www.youtube.com/results?search_query=' + search;
    options.type ??= 'video';
    if (url.indexOf('&sp=') === -1) {
        url += '&sp=';
        switch (options.type) {
            case 'channel':
                url += SearchType.Channel;
                break;
            case 'playlist':
                url += SearchType.PlayList;
                break;
            case 'video':
                url += SearchType.Video;
                break;
            default:
                throw new Error(`Unknown search type: ${options.type}`);
        }
    }
    const body = await (0, Request_1.request)(url, {
        headers: {
            'accept-language': options.language || 'en-US;q=0.9'
        }
    });
    if (body.indexOf('Our systems have detected unusual traffic from your computer network.') !== -1)
        throw new Error('Captcha page: YouTube has detected that you are a bot!');
    return (0, parser_1.ParseSearchResult)(body, options);
}
exports.yt_search = yt_search;
//# sourceMappingURL=search.js.map