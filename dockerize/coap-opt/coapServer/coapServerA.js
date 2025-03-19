const coap = require('coap');
const ISpan = require('./utils/iotSpan.js');
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
    let span = new ISpan('Server A', req.options.find(option => option.name == '2132').value.toString(), req._packet.token.toString('hex'));
    console.log(`Server A received request: ${req.url}`);

    // payload 縮小
    res.end('a');
    span.addEndTime();
    span.logSpan();
    sendSpan(span).catch(err => console.error("Failed sending span:", err));
  } else {
    res.code = '4.05';
    res.end('Method Not Allowed');
  }
});

serverA.listen(SERVER_A_PORT, () => {
  console.log(`CoAP Server A is listening on port ${SERVER_A_PORT}`);
});
