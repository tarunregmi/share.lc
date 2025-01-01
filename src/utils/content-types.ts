import { extname } from 'node:path';

export function getContentType(url: string) {
  let type: string | undefined;

  switch (extname(url)) {
    case '.png':
      type = 'image/x-png';
      break;
    case '.svg':
      type = 'image/svg+xml';
      break;
    case '.css':
      type = 'text/css';
      break;
    case '.js':
      type = 'text/javascript';
      break;
    case '.html':
      type = 'text/html';
      break;
  }

  return type;
}
