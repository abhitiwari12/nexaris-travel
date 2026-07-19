import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = process.argv[2] || 'public';
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  const safePath = normalize(url.pathname).replace(/^([/\\])+/, '');
  const filePath = join(root, safePath || 'index.html');
  const target = existsSync(filePath) ? filePath : join(root, 'index.html');
  response.setHeader('Content-Type', types[extname(target)] || 'application/octet-stream');
  createReadStream(target).pipe(response);
}).listen(port, () => {
  console.log(`Nexaris Travel available at http://localhost:${port}`);
});
