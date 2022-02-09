import useragents from './useragents.json';

export function setUserAgent(array: string[]): void {
    useragents.push(...array);
}

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomUserAgent() {
    const random = getRandomInt(0, useragents.length - 1);
    return useragents[random];
}
