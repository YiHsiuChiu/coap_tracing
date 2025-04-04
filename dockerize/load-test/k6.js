import http from "k6/http";
import { check, sleep } from "k6";
import { randomBytes } from "k6/crypto";
export const options = {
    stages: [
      { duration: '10s', target: 20 }, 
      { duration: '30s', target: 20 },
      { duration: '10s', target: 0 }, 
    ],
  };
export default function () {
  const traceId = randomBytes(16, "hex");
  const spanId = randomBytes(8, "hex");
  const traceHeader = `00-${traceId}-${spanId}-01`;

  const gatewayHost = __ENV.GATEWAY_HOST;
  const gatewayPort = __ENV.GATEWAY_PORT;
  const url = `http://${gatewayHost}:${gatewayPort}/iot-test`;

  let res = http.get(url, {
    headers: {
      traceparent: traceHeader,
      "Content-Type": "application/json",
    },
  });
  check(res, { "status 200": (r) => r.status === 200 });

  sleep(1);
}
