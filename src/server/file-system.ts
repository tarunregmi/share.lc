import * as os from 'node:os';
import * as fs from 'node:fs';

export class FileSystem {
  platform: string;
  root: string;

  constructor() {
    this.platform = os.platform();
    this.root = os.homedir();
  }

  public doesExist(path: string): Promise<boolean> {
    return Promise.resolve(fs.existsSync(path));
  }

  public readFile(path: string): Promise<string> {
    return Promise.resolve(fs.readFileSync(path, { encoding: 'utf-8' }));
  }
}
