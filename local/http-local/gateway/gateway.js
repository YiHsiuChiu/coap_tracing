const { startHttpServer } = require('./httpServer.js');
const { startHTTPSpanCollector } = require('./httpSpanCollectorServer.js');

async function main() {
  await startHttpServer(4000);
  await startHTTPSpanCollector(4001);

  // console.log("Gateway (HTTP + Span Collector) is up and running!");
}

main().catch(err => {
  console.error("Error starting Gateway:", err);
  process.exit(1);
});
