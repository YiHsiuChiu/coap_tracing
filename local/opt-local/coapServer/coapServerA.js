const coap = require('coap');
const ISpan = require('./utils/iotSpan.js');
const SERVER_A_PORT = 5666;

function sendSpan(spanData) {
  return new Promise((resolve, reject) => {
    const req = coap.request({
      hostname: "localhost",
      port: 3001,
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
    // console.log(`Server A received request: ${req.url}}`);
    const traceparentOption = req.options.find(opt => opt.name === '2132');
    const traceId = traceparentOption ? traceparentOption.value.toString() : null;
    const span = new ISpan('IoT-Server-A', traceId ,req._packet.token.toString('hex'));
    // payload 縮小
    res.end('a');
    span.addEndTime();
    // span.logSpan();
    sendSpan(span).catch(err => console.error("Failed sending span:", err));
  } else {
    console.log("test req stram")
    res.code = '4.05';
    res.end('Method Not Allowed');
  }
});

serverA.listen(SERVER_A_PORT, () => {
  console.log(`CoAP Server A is listening on port ${SERVER_A_PORT}`);
});
