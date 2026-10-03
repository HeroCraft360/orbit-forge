import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.ORBIT_PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url ?? '/', 'http://127.0.0.1');
        const relative = decodeURIComponent(url.pathname).replace(/^[/\\]+/, '') || 'index.html';
        const file = path.resolve(root, relative);
        if (!file.startsWith(root) || !(await stat(file)).isFile()) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        const data = await readFile(file);
        res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        res.end(data);
    }
    catch {
        res.writeHead(404);
        res.end('Not found');
    }
});
server.on('error', error => { console.error('Could not start Orbit Forge:', error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log('Orbit Forge is ready: http://127.0.0.1:' + port + '\nKeep this terminal open. Press Ctrl+C to stop.'));
