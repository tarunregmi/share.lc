import { IncomingMessage, ServerResponse } from 'node:http';
import { FileSystem } from './file-system.js';
import { ResponseData } from '../types/index.js';
import path from 'node:path';
import { getContentType } from '../utils/content-types.js';

export class ServerRouter {
  #fs: FileSystem;
  staticFolder?: string;

  constructor() {
    this.#fs = new FileSystem();
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

  public hostStaticFolder(path: string) {
    this.staticFolder = path;
  }

  protected methodNotAllowed(response: ServerResponse<IncomingMessage>) {
    response.statusCode = 405;
    this.#endJSON(response, { message: 'Method Not Allowed', data: {} });
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
}
