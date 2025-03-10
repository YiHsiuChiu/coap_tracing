const coap = require('coap');

function coapRequest(options) {
  return new Promise((resolve, reject) => {
    const req = coap.request({
      hostname: options.hostname,
      port: options.port,
      method: options.method,
      pathname: options.pathname,
      confirmable: true,
    });

    if (options.options && Array.isArray(options.options)) {
      options.options.forEach(opt => req.setOption(opt.name, opt.value));
    }
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
