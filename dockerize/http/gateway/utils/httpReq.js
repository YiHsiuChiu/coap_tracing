const http = require('http');

async function snedHttpRequest(options) {
  return new Promise((resolve, reject) => {
  
      const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          try {
            resolve(responseBody);
          } catch (err) {
            reject(err);
          }
        });
      });
  
      req.on('error', reject);
      req.write("i am body");
      req.end();
    });
  }
  
  module.exports = { snedHttpRequest };
  