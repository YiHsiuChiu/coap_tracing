const http = require("http");
const Span = require("./utils/span.js");
const { snedHttpRequest } = require("./utils/httpReq.js");
const { sendHttpSpan } = require("./utils/sendHttpSpan.js");

function startHttpServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      // console.log('[Gateway] Received request:', req.method, req.url);
      try {
        if (req.url.startsWith("/iot-test")) {
          const span = new Span("Gateway-HTTP", req.headers.traceparent);
          const forwardOptions = {
            hostname: process.env.IOT_SERVER_A_HOST,
            port: process.env.IOT_SERVER_A_PORT,
            method: req.method,
            path: "/test",
            headers: {
              ...req.headers,
              traceparent: span.getTraceParent(),
            },
          };

          const httpResp = await snedHttpRequest(forwardOptions);
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(`Got from IoT Server: ${httpResp}`);
          span.addEndTime();
          // span.logSpan();
          // 將 gateway 自身的 span 發送給 span-handler
          await sendHttpSpan(span);
        } else {
          // 預設行為
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Gateway HTTP OK");
        }
      } catch (err) {
        console.error("Gateway HTTP error:", err);
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    });

    server.listen(port, () => {
      console.log(`Gateway HTTP server listening on port ${port}`);
      resolve();
    });

    server.on("error", reject);
  });
}

module.exports = { startHttpServer };
