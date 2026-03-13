// ============================================================
// serve.js  —  Minimal static file server for local development.
//              No dependencies beyond Node.js built-ins.
//
// Usage:
//   node serve.js          (default port 3000)
//   node serve.js 8080     (custom port)
// ============================================================

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2], 10) || 3000;
const ROOT = __dirname;

const MIME = {
  '.html' : 'text/html; charset=utf-8',
  '.js'   : 'application/javascript; charset=utf-8',
  '.css'  : 'text/css; charset=utf-8',
  '.scss' : 'text/css; charset=utf-8',
  '.ts'   : 'application/javascript; charset=utf-8',
  '.png'  : 'image/png',
  '.jpg'  : 'image/jpeg',
  '.jpeg' : 'image/jpeg',
  '.gif'  : 'image/gif',
  '.svg'  : 'image/svg+xml',
  '.ico'  : 'image/x-icon',
  '.woff' : 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf'  : 'font/ttf',
  '.mp3'  : 'audio/mpeg',
  '.ogg'  : 'audio/ogg',
  '.wav'  : 'audio/wav',
  '.json' : 'application/json',
  '.map'  : 'application/json',
};

const server = http.createServer((req, res) => {
  // Strip query strings, decode URI, prevent path traversal.
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.normalize(path.join(ROOT, urlPath));

  // Block requests that escape the project root.
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err && err.code === 'ENOENT' && path.extname(filePath) === '') {
      // Bare import with no extension (e.g. /dist/js/events/EventBus).
      // Try appending .js — this is how TypeScript ES module output works.
      fs.readFile(filePath + '.js', (err2, data2) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME['.js'] });
        res.end(data2);
      });
      return;
    }

    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }

    const ext      = path.extname(filePath).toLowerCase();
    const mimeType = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Dev server running at http://localhost:${PORT}\n`);
});
