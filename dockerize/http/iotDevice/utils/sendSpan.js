const http = require('http');
async function sendSpanToGateway(span) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(span);

    const options = {
      hostname: process.env.GATEWAY_HOST,
      port: process.env.GATEWAY_PORT,
      path: "/span",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        try {
          resolve(responseBody);
        } catch (err) {
          reject(
            new Error(
              "Failed to parse response from Gateway Collector: " + err.message
            )
          );
        }
      });
    });

    req.on("error", (err) => {
      reject(
        new Error("Failed to send span to Gateway Collector: " + err.message)
      );
    });

    req.write(data);
    req.end();
    // console.log("[Server A] Send span to Gateway's collector");
  });
}

module.exports = { sendSpanToGateway };