const http = require('http');
const Span = require('./utils/span.js');
// const sleep = require('sleep-promise');
const { sendSpanToGateway } = require('./utils/sendSpan.js');
const SERVER_A_PORT = process.env.IOT_SERVER_A_PORT;


const serverA = http.createServer(async (req, res) => {
  if (req.method === 'GET') {
    // console.log(`[Server A] Received GET ${req.url}`);
    const span = new Span('Gateway-HTTP', req.headers.traceparent);
    

    // random delay (300-1000ms)
    // await sleep(Math.floor(Math.random() * (1000 - 300 + 1)) + 300);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(`a`);
    res.end(`a`);
    span.addEndTime();
    await sendSpanToGateway(span).catch(err => console.error("Failed sending span:", err));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

serverA.listen(SERVER_A_PORT, () => {
  console.log(`[IOT Server A] HTTP server listening on port ${SERVER_A_PORT}`);
});