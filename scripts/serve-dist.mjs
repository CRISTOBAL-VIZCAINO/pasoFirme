// Servidor estático con fallback SPA (como un hosting real configurado para Angular).
// Uso: node scripts/serve-dist.mjs dist/paso-firme-web/browser  →  http://localhost:4400
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const root = process.argv[2];
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[\/\\])+/, '');
  let file = join(root, path);
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); }
  catch { if (extname(path)) { res.writeHead(404); return res.end('not found'); } file = join(root, 'index.html'); }
  try { const body = await readFile(file); res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end('not found'); }
}).listen(4400, () => console.log('listening 4400'));
