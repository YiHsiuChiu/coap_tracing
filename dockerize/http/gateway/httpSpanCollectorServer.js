const http = require('http');
const { sendHttpSpan } = require('./utils/sendHttpSpan.js');

function startHTTPSpanCollector(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      // console.log('Gateway HTTP Span Collector received:', req.method, req.url);

      if (req.method === 'POST' && req.url === '/span') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const spanData = JSON.parse(body);
            // console.log('[Gateway - HTTP Collector] Received Span:', spanData);
            await sendHttpSpan();

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('OK');
          } catch (err) {
            console.error('[Gateway - HTTP Collector] Error handling Span:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error');
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    server.listen(port, () => {
      console.log(`[Gateway - HTTP Span Collector] Server is listening on port ${port}`);
      resolve();
    });

    server.on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = { startHTTPSpanCollector };