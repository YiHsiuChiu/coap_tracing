const http = require('http');
const Span = require('./utils/span.js');
const { sendHttpSpan } = require('./utils/sendHttpSpan.js');

async function httpClient(options, data = null) {
  const span = new Span('HTTP Client');

  options.headers = {
    ...options.headers,
    traceparent: span.getTraceParent(),
    tracestate: 'rojo=00f067aa0ba902b7,congo=t61rcWkgMzE'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        span.addEndTime();
        sendHttpSpan(span).catch(err => console.error("Failed sending span:", err));
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Example usage
(async () => {
  const options = {
    hostname: "192.168.0.152",
    port: 3000,
    path: '/iot-test',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    // console.log('HTTP Client sending request:', options);
    const response = await httpClient(options);
    // console.log('HTTP Client received response:', response);
  } catch (error) {
    console.error('HTTP Client Error:', error);
  }
})();
