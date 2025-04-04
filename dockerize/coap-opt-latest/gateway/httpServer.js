const http = require('http');
const Span = require('./utils/span.js');
const { coapRequest } = require('./utils/coapReq.js');
const { sendHttpSpan } = require('./utils/sendHttpSpan.js');

function startHttpServer(port, traceMap) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      // console.log('Gateway HTTP received:', req.method, req.url);
      try {
        
        if (req.url.startsWith('/iot-test')) {
          const span = new Span('Gateway-HTTP', req.headers.traceparent);
          const coapOpts = {
            hostname: process.env.IOT_SERVER_A_HOST,
            port: process.env.IOT_SERVER_A_PORT,
            method: 'GET',
            pathname: '/test',
            token: Buffer.from(span.getSpanId(), 'hex'),
            options: []
          };
          if (req.headers.traceparent) {
            coapOpts.options.push({ name: "2132", value: span.getTraceId().slice(-8) });
          }
          // if (req.headers.tracestate) {
          //   coapOpts.options.push({ name: "2104", value: req.headers.tracestate });
          // }
          traceMap.set(span.getTraceId().slice(-8), span.getTraceId());
          const coapResp = await coapRequest(coapOpts);
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(`Got from CoAP Server: ${coapResp}`);
          span.addEndTime();
          // span.logSpan();
          // 將 gateway 自身的 span 發送給 span-handler
          await sendHttpSpan(span); 
        } else {
          // 預設行為
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Gateway HTTP OK');
        }
        
      } catch (err) {
        console.error('Gateway HTTP error:', err);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });

    server.listen(port, () => {
      console.log(`Gateway HTTP server listening on port ${port}`);
      resolve();
    });

    server.on('error', reject);
  });
}

module.exports = { startHttpServer };
