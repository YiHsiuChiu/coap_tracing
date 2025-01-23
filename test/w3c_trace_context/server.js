const coap = require('coap');

// Server B
const serverB = coap.createServer((req, res) => {
  if (req.method === 'GET') {
    console.log(`Server B received request: ${req.url}`);
    // 回傳模擬數據
    res.end('Response from Server B');
  }
});

serverB.listen(5684, () => {
  console.log('Server B is listening on port 5684');
});

// Server A
const serverA = coap.createServer((req, res) => {
  if (req.method === 'GET') {
    console.log(`Server A received request: ${req.url}`);
    console.log(`Server A received options: ${JSON.stringify(req.options)}`);

    // 呼叫 Server B
    const reqB = coap.request({
      hostname: 'localhost',
      port: 5684,
      method: 'GET',
      pathname: '/b',
    });

    reqB.on('response', (resB) => {
      console.log(`Server A received response from Server B: ${resB.payload.toString()}`);

      // 將 Server B 的回應傳回 Client
      res.end(`Server A forwarding response: ${resB.payload.toString()}`);
    });

    reqB.end();
  }
});

serverA.listen(5683, () => {
  console.log('Server A is listening on port 5683');
});

// // Client
// const clientReq = coap.request({
//   hostname: 'localhost',
//   port: 5683,
//   method: 'GET',
//   pathname: '/a',
// });

// clientReq.on('response', (res) => {
//   console.log(`Client received response: ${res.payload.toString()}`);
// });

// clientReq.end();
