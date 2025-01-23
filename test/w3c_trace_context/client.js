const coap = require('coap');

function toBinary(text) {
    return Buffer.from(text);
}

function toString(data) {
    return data.toString()
}

coap.registerOption("65000", toBinary, toString)
coap.registerOption("65001", toBinary, toString)

const clientReq = coap.request({
    hostname: 'localhost',
    port: 5683,
    method: 'GET',
    pathname: '/example',
});

clientReq.setOption("65000", "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01") // traceparent
clientReq.setOption("65001", "congo=t61rcWkgMzE") // tracestate

clientReq.on('response', (res) => {
    console.log('Response:', res.payload.toString());
});

clientReq.end();
