const { startHttpServer } = require('./httpServer.js');
const { startCoapSpanCollector } = require('./coapSpanCollectorServer.js');

async function main() {
  await startHttpServer(3000);
  await startCoapSpanCollector(3001);

  // console.log("Gateway (HTTP + CoAP) is up and running!");
}

main().catch(err => {
  console.error("Error starting Gateway:", err);
  process.exit(1);
});
