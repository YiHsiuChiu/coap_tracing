const coap = require('coap');

function toBinary(text) {
  return Buffer.from(text);
}

function toString(data) {
  return data.toString()
}
coap.registerOption("2132", toBinary, toString) // traceparent
// coap.registerOption("2104", toBinary, toString) // tracestate

function coapRequest(options) {
  return new Promise((resolve, reject) => {
    const req = coap.request({
      hostname: options.hostname,
      port: options.port,
      method: options.method,
      pathname: options.pathname,
      token: options.token,
      confirmable: true,
    });
    if(options.options.length > 0){
      // options.options.forEach(opt => req.setOption(opt.name, opt.value));
      // 因實驗情境不考慮tracestate，所以只用第一個option
      req.setOption(options.options[0].name, options.options[0].value);
    }
    // if (options.options && Array.isArray(options.options)) {
    //   options.options.forEach(opt => req.setOption(opt.name, opt.value));
    // }
    req.on('response', (res) => {
      let payload = '';
      res.on('data', chunk => payload += chunk);
      res.on('end', () => resolve(payload));
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
}

module.exports = { coapRequest };
