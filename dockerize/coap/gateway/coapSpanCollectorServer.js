const coap = require('coap');
const { sendHttpSpan } = require('./utils/sendHttpSpan.js');

function startCoapSpanCollector(port) {
  return new Promise((resolve, reject) => {
    coap.registerOption("2076", Buffer.from, (buf) => buf.toString());
    coap.registerOption("2104", Buffer.from, (buf) => buf.toString());

    const server = coap.createServer(async (req, res) => {
      // console.log('Gateway CoAP Span Collector received:', req.method, req.url);

      if (req.method === 'POST' && req.url === '/span') {
        try {
          // 取得 IoT 裝置上傳的 span
          const spanData = JSON.parse(req.payload.toString());
          // console.log('Received Span from CoAP device:', spanData);

          // 轉發給 span-handler
          await sendHttpSpan(spanData);

          res.end('OK');
        } catch (err) {
          console.error('Gateway CoAP error:', err);
          res.code = '5.00';
          res.end('Error');
        }
      } else {
        // 其他路徑
        res.end('CoAP default response');
      }
    });

    server.listen(port, () => {
      console.log(`Gateway CoAP Span Collector server listening on port ${port}`);
      resolve();
    });

    server.on('error', reject);
  });
}

module.exports = { startCoapSpanCollector };
