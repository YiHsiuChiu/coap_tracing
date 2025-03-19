const coap = require('coap');
function toBinary(text) {
  return Buffer.from(text);
}

function toString(data) {
  return data.toString()
}
coap.registerOption(process.env.OPT_NUM, toBinary, toString)
function coapRequest(options) {
  return new Promise((resolve, reject) => {
    const req = coap.request({
      hostname: options.hostname,
      port: options.port,
      method: options.method,
      pathname: options.pathname,
      token: options.token,
      confirmable: true
    });
    if(options.options.value){
      // 因實驗情境不考慮tracestate，所以只用第一個option
      req.setOption(options.options.name, options.options.value);
    }
    
    req.on('response', (res) => {
      // let responseBody = res.payload.toString()
      // resolve(responseBody)
      let payload = '';
      res.on('data', chunk => payload += chunk);
      res.on('end', () => resolve(payload));
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
}

module.exports = { coapRequest };
