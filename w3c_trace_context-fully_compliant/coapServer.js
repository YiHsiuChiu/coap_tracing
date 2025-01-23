const coap = require('coap');
const Span = require('./span.js');
const sleep = require('sleep-promise');

function sendSpan(span, host = 'localhost', port = 3002) {
  const req = coap.request({
    hostname: host,
    port: port,
    method: 'POST',
    pathname: '/span',
    confirmable: false,
  });

  const payloadBuffer = Buffer.from(JSON.stringify(span));
  req.write(payloadBuffer);
  req.end();
  console.log("send span to gateway");
}


// // Server B
// const serverB = coap.createServer((req, res) => {
//   if (req.method === 'GET') {
//     console.log(`Server B received request: ${req.url}`);
//     // 回傳模擬數據
//     res.end('Response from Server B');
//   }
// });

// serverB.listen(5684, () => {
//   console.log('Server B is listening on port 5684');
// });

// Server A
const serverA = coap.createServer(async (req, res) => {
  if (req.method === 'GET') {
    let span = new Span('Server A', req.options.find(option => option.name == '65000').value.toString());
    console.log(`Server A received request: ${req.url}`);
    // req.options.forEach((option) => {
    //     if(option.name == '65000'){
    //         console.log(`Server A received traceparent: ${option.value.toString()}`);
    //     }
    //     else if(option.name == '65001'){
    //         console.log(`Server A received tracestate: ${option.value.toString()}`);
    //     }
    // }); 

    // random delay (300-1000ms)
    await sleep(Math.floor(Math.random() * (1000 - 300 + 1)) + 300);

    // // 呼叫 Server B
    // const reqB = coap.request({
    //   hostname: 'localhost',
    //   port: 5684,
    //   method: 'GET',
    //   pathname: '/b',
    // });

    // reqB.on('response', (resB) => {
    //   console.log(`Server A received response from Server B: ${resB.payload.toString()}`);

    //   // 將 Server B 的回應傳回 Client
    //   res.end(`Server A forwarding response: ${resB.payload.toString()}`);
    // });

    // reqB.end();
    res.end(`Hello http client!`);
    span.addEndTime();
    // span.logSpan();
    sendSpan(span);
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
