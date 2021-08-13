import { RequestOptions, IncomingMessage, ClientRequest, default as http } from 'http';
import { EventEmitter } from 'node:events'
import { URL } from 'url'
import https from 'https';

const httpLibs: {
    [key: string]: {
      request: (options: RequestOptions | string | URL, callback?: (res: IncomingMessage) => void) => ClientRequest;
    };
  } = { 'http:': http, 'https:': https };