import { Server as _Server, createServer } from 'node:http';
import { ServerRouter } from './server-router.js';
import getIPv4 from '../utils/network.js';

export class Server extends ServerRouter {
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

      if (request.url?.split('/')[1] === this.#fsBase) this.serveFileSystem(response, url.pathname);
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
