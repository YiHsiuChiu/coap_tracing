const coap = require('coap');
function toBinary(text) {
  return Buffer.from(text);
}

function toString(data) {
  return data.toString()
}
coap.registerOption("2132", toBinary, toString)
function coapRequest(options) {
  return new Promise((resolve, reject) => {
    const req = coap.request({
      hostname: options.hostname,
      port: options.port,
      method: options.method,
      pathname: options.pathname,
      confirmable: true,
    });
    if(options.options.length > 0){
      // 因實驗情境不考慮tracestate，所以只用第一個option
      req.setOption(options.options[0].name, options.options[0].value);
    }
    
    req.on('response', (res) => {
      let responseBody = res.payload.toString()
      resolve(responseBody)
      // let payload = '';
      // res.on('data', chunk => payload += chunk);
      // res.on('end', () => resolve(payload));
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
}

module.exports = { coapRequest };
