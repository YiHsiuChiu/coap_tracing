const http = require('http');

async function sendHttpSpan(spanData) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(spanData);
    const options = {
      hostname: "localhost",
      port: 5555,
      path: '/span',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { sendHttpSpan };
