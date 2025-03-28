const { startHttpServer } = require('./httpServer.js');
const { startCoapSpanCollector } = require('./coapSpanCollectorServer.js');

let traceMap = new Map();
async function main() {
  
  await startHttpServer(3000, traceMap);
  await startCoapSpanCollector(3001, traceMap);

  // console.log("Gateway (HTTP + CoAP) is up and running!");
}

main().catch(err => {
  console.error("Error starting Gateway:", err);
  process.exit(1);
});
