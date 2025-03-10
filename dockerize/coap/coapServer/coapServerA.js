const coap = require('coap');
const Span = require('./utils/span.js');
const sleep = require('sleep-promise');
const SERVER_A_PORT = process.env.IOT_SERVER_A_PORT;

function sendSpan(spanData) {
  return new Promise((resolve, reject) => {
    const req = coap.request({
      hostname: process.env.GATEWAY_HOST,
      port: process.env.GATEWAY_PORT,
      method: 'POST',
      pathname: '/span',
      confirmable: true,
    });

    req.on('response', (res) => {
      let payload = '';
      res.on('data', (chunk) => payload += chunk);
      res.on('end', () => resolve(payload));
    });
    req.on('error', reject);

    req.write(JSON.stringify(spanData));
    req.end();
  });
}
const serverA = coap.createServer(async (req, res) => {
  if (req.method === 'GET') {

    const traceparentOption = req.options.find(opt => opt.name === '65000');
    const traceparent = traceparentOption ? traceparentOption.value.toString() : null;
    const span = new Span('Server A', traceparent);
    console.log(`Server A received request: ${req.url}`);

    // random delay (300-1000ms)
    await sleep(Math.floor(Math.random() * (1000 - 300 + 1)) + 300);

    res.end('Hello http client!');
    span.addEndTime();
    sendSpan(span).catch(err => console.error("Failed sending span:", err));
  } else {
    res.code = '4.05';
    res.end('Method Not Allowed');
  }
});

serverA.listen(SERVER_A_PORT, () => {
  console.log(`CoAP Server A is listening on port ${SERVER_A_PORT}`);
});
