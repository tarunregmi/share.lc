import { createServer, Server as _Server, IncomingMessage, ServerResponse, STATUS_CODES } from 'node:http';
import getIPv4 from '../utils/network.js';
import { FileSystem } from './file-system.js';
import path, { extname } from 'node:path';
import { getContentType } from '../utils/content-types.js';
import { ResponseData } from '../types/index.js';

class Router {
  #fs!: FileSystem;
  staticFolder?: string;

  constructor() {
    this.#fs = new FileSystem();
  }

  #end(response: ServerResponse<IncomingMessage>, message?: string) {
    response.end(
      JSON.stringify({
        status: response.statusCode,
        message: message || STATUS_CODES[response.statusCode],
      })
    );
  }

  #endJSON(response: ServerResponse<IncomingMessage>, data: ResponseData) {
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(data));
  }

  async #endFile(response: ServerResponse<IncomingMessage>, path: string) {
    try {
      response.statusCode = 200;
      response.end(await this.#fs.readFile(path));
    } catch (error) {
      response.statusCode = 500;
      this.#endJSON(response, { message: 'Unable to read file.', data: {} });
    }
  }

  protected methodNotAllowed(response: ServerResponse<IncomingMessage>) {
    response.writeHead(405, { 'content-type': 'application/json' });
    this.#end(response);
  }

  protected notFound(response: ServerResponse<IncomingMessage>) {
    response.writeHead(404, { 'content-type': 'application/json' });
    this.#end(response);
  }

  protected async serveStaticFolder(response: ServerResponse<IncomingMessage>, pathname: string) {
    if (!this.staticFolder) {
      response.statusCode = 503;
      return this.#endJSON(response, { message: 'Static folder is not configured.', data: {} });
    }

    let requestedPath = path.join(this.staticFolder, pathname);
    let doesPathExist = await this.#fs.doesExist(requestedPath);
    let contentType = getContentType(requestedPath);

    if (!doesPathExist) {
      response.statusCode = 404;
      return this.#endJSON(response, { message: `The requested resource wasn't found.`, data: {} });
    }

    if (!contentType) {
      requestedPath = path.join(requestedPath, 'index.html');
      if (await this.#fs.doesExist(requestedPath)) contentType = 'text/html';
    }

    if (!contentType) {
      response.statusCode = 415;
      return this.#endJSON(response, { message: 'Invalid mimi-type', data: {} });
    }

    response.setHeader('content-type', contentType);
    await this.#endFile(response, requestedPath);
  }

  protected serveFileSystem(_request: IncomingMessage, _response: ServerResponse<IncomingMessage>) {}

  public hostStaticFolder(path: string) {
    this.staticFolder = path;
  }
}

export class Server extends Router {
  #server: _Server;
  #host!: string;
  #port!: number;
  #fsBase!: string;
  #localIP?: string;

  public constructor() {
    super();
    this.#server = createServer();
    this.#localIP = getIPv4();
    this.#fsBase = 'fs';
  }

  #requestHandler() {
    this.#server.on('request', async (request, response) => {
      if (request.method !== 'GET') return this.methodNotAllowed(response);

      const url = new URL(`http://${this.#host}:${this.#port}${request.url}`);

      if (request.url?.split('/')[1] === this.#fsBase) this.serveFileSystem(request, response);
      else return this.serveStaticFolder(response, url.pathname);
    });
  }

  public listen(host?: string, port?: number) {
    this.#host = host || '0.0.0.0';
    this.#port = port || 8090;
    this.#server.listen(this.#port, this.#host, this.displayAccessInfo.bind(this));
    this.#requestHandler();
  }

  public close() {
    this.#server.close(() => console.log('Server closed.'));
    this.#server.closeIdleConnections();
    this.#server.closeAllConnections();
  }

  public displayAccessInfo() {
    console.log('\nYou can now view \x1b[33mshare.lc\x1b[0m in the browser\n');
    console.log(`   \x1b[33mLocal:\x1b[0m${this.#localIP ? '           ' : ' '}http://localhost:${this.#port}`);
    if (this.#localIP) {
      console.log(`   \x1b[33mOn Your Network:\x1b[0m http://${this.#localIP}:${this.#port}\n`);
    }
  }
}
