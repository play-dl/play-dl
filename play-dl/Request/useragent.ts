const useragents: string[] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0",
    "Mozilla/5.0 (X11; Linux i686; rv:97.0) Gecko/20100101 Firefox/97.0",
    "Mozilla/5.0 (Linux x86_64; rv:97.0) Gecko/20100101 Firefox/97.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:97.0) Gecko/20100101 Firefox/97.0",
    "Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:97.0) Gecko/20100101 Firefox/97.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36 Edg/97.0.1072.69",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36 Vivaldi/4.3"
];

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
