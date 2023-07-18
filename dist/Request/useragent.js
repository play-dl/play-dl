"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomUserAgent = exports.setUserAgent = void 0;
const useragents_json_1 = __importDefault(require("./useragents.json"));
function setUserAgent(array) {
    useragents_json_1.default.push(...array);
}
exports.setUserAgent = setUserAgent;
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomUserAgent() {
    const random = getRandomInt(0, useragents_json_1.default.length - 1);
    return useragents_json_1.default[random];
}
exports.getRandomUserAgent = getRandomUserAgent;
//# sourceMappingURL=useragent.js.map