const http = require('http');
const coap = require('coap');
const Span = require('./span.js');

const HTTP_PORT = 3000; // Port number for the http server
const COAP_PORT = 3002; // Port number for the coap server (for collecting spans)

function toBinary(text) {
  return Buffer.from(text);
}

function toString(data) {
  return data.toString()
}

coap.registerOption("65002", toBinary, toString) // traceId

function sendSpan(span, host = 'localhost', port = 3001) {
  return new Promise((resolve, reject) => {
      const data = JSON.stringify(span);

      const options = {
          hostname: host,
          port: port,
          path: '/span',
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(data),
          },
      };

      const req = http.request(options, (res) => {
          let responseBody = '';

          res.on('data', (chunk) => {
              responseBody += chunk;
          });

          res.on('end', () => {
              try {
                  resolve(JSON.parse(responseBody));
              } catch (err) {
                  reject(new Error('Failed to parse response: ' + err.message));
              }
          });
      });

      req.on('error', (err) => {
          reject(new Error('Request failed: ' + err.message));
      });

      // Send the data
      req.write(data);
      req.end();
      console.log("send span to spans_handler");
  });
}

let traceMap = new Map();

// Create an HTTP server
const server = http.createServer((httpReq, httpRes) => {
  console.log('received a request:', httpReq.method, httpReq.url);
  // console.log('Headers:', httpReq.headers);

  let body = '';

  // Collect request body data
  httpReq.on('data', (chunk) => {
    body += chunk;
  });

  // When request is complete
  httpReq.on('end', () => {
    // console.log('Body:', body || 'No body');
    
    let responseBody = '';
    let span = new Span('Gateway', httpReq.headers.traceparent);

    // Forward the request to the CoAP server
    const coapReq = coap.request({
      hostname: 'localhost',
      port: 5683,
      method: httpReq.method,
      pathname: httpReq.url,
      token: Buffer.from(span.getSpanId(), 'hex'),
    });

    traceMap.set(span.getTraceId().slice(-8), span.getTraceId());
    coapReq.setOption("65002", span.getTraceId().slice(-8)); // traceparent

    coapReq.on('response', (coapRes) => {
      console.log('get response:', coapRes.payload.toString());
      responseBody = coapRes.payload.toString()
      // Respond to the client
      httpRes.writeHead(200, { 'Content-Type': 'text/plain' });
      httpRes.end(responseBody);
      span.addEndTime();
      // span.logSpan();
      sendSpan(span);
    });

    coapReq.end();

  });

  httpReq.on('error', (err) => {
    console.error('Error receiving request:', err);
  });
});

// Start the server
server.listen(HTTP_PORT, () => {
  console.log(`Server is listening on http://localhost:${HTTP_PORT}`);
});

// Create a CoAP server
const spanCollector = coap.createServer(async(req, res) => {
  if (req.method === 'POST' && req.url === '/span') {
    const span = JSON.parse(req.payload.toString());
    span.traceId = traceMap.get(span.traceId);
    console.log('received a span from coap devices:', span);
    sendSpan(span);      
  }
});

spanCollector.listen(COAP_PORT, () => {
  console.log(`Server A is listening on port ${COAP_PORT}`);
});