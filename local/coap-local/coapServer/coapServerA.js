const coap = require('coap');
const Span = require('./utils/span.js');
// const sleep = require('sleep-promise');
const SERVER_A_PORT = 3002;

function sendSpan(spanData) {
  return new Promise((resolve, reject) => {
    const req = coap.request({
      hostname: "localhost",
      port: 3001,
      method: 'POST',
      pathname: '/span',
      confirmable: true,
    });

    req.on('response', (res) => {
      let payload = '';
      res.on('data', (chunk) => payload += chunk);
      res.on('end', () => resolve(payload));
    });
    req.on('error', reject);

    req.write(JSON.stringify(spanData));
    req.end();
  });
}
const serverA = coap.createServer(async (req, res) => {
  if (req.method === 'GET') {

    const traceparentOption = req.options.find(opt => opt.name === '2076');
    const traceparent = traceparentOption ? traceparentOption.value.toString() : null;
    const span = new Span('IoT-Server-A', traceparent);
    // console.log(`Server A received request: ${req.url}`);

    // random delay (300-1000ms)
    // await sleep(Math.floor(Math.random() * (1000 - 300 + 1)) + 300);

    // payload 縮小
    res.end('a');
    span.addEndTime();
    // span.logSpan();
    sendSpan(span).catch(err => console.error("Failed sending span:", err));
  } else {
    res.code = '4.05';
    res.end('Method Not Allowed');
  }
});

serverA.listen(SERVER_A_PORT, () => {
  console.log(`CoAP Server A is listening on port ${SERVER_A_PORT}`);
});


// === 2) 建立定時器，每秒量測 CPU 使用量 ===
// 用來記錄「上一秒」的 CPU 使用量與時間
let lastCPUUsage = process.cpuUsage();  // { user: microseconds, system: microseconds }
let lastHRTime = process.hrtime();      // [seconds, nanoseconds]

// 用來累積「整段程式執行」的 CPU 時間與總時長
let totalCPUSeconds = 0;
let totalElapsedSeconds = 0;

const intervalId = setInterval(() => {
  // 取得目前 CPU usage (與「上一次量測」之間的差值)
  // diffUsage = 本次使用量 - 上次使用量
  const currentCPUUsage = process.cpuUsage();
  const diffUser = currentCPUUsage.user - lastCPUUsage.user;       // microseconds
  const diffSystem = currentCPUUsage.system - lastCPUUsage.system; // microseconds
  const diffCPU = diffUser + diffSystem;                           // microseconds (user+system)

  // 取得目前時間（與「上一次量測」之間的差值）
  const currentTime = process.hrtime();
  const diffSec = currentTime[0] - lastHRTime[0];    // 整數秒
  const diffNano = currentTime[1] - lastHRTime[1];   // 奈秒
  const elapsedSec = diffSec + diffNano / 1e9;        // 轉成小數秒

  // 將 CPU 微秒轉成秒
  const cpuUsedSec = diffCPU / 1e6;

  // 計算「單核心」的 CPU 使用百分比
  // 注意：如果是多核心，這裡的 100% 只是佔用單一核心的百分比
  const cpuPercent = (cpuUsedSec / elapsedSec) * 100;

  // 每秒印出一次 CPU 使用率
  console.log(`[1s Metrics] CPU usage = ${cpuPercent.toFixed(2)}% (interval=${elapsedSec.toFixed(2)}s)`);

  // 累積到整段的總和
  totalCPUSeconds += cpuUsedSec;
  totalElapsedSeconds += elapsedSec;

  // 更新上一次量測基準
  lastCPUUsage = currentCPUUsage;
  lastHRTime = currentTime;
}, 1000);

// === 3) 程式結束時 (Ctrl + C) 計算「整段時間」的平均 CPU 使用率 ===
process.on('SIGINT', () => {
  console.log('Received SIGINT. Calculating overall average CPU usage...');

  // 先結束 setInterval
  clearInterval(intervalId);

  // 避免「按下 Ctrl + C」與「上一次 setInterval 執行」之間的最後幾百毫秒被漏算
  // 可以再量測一次
  const currentCPUUsage = process.cpuUsage();
  const diffUser = currentCPUUsage.user - lastCPUUsage.user;
  const diffSystem = currentCPUUsage.system - lastCPUUsage.system;
  const diffCPU = diffUser + diffSystem;

  const currentTime = process.hrtime();
  const diffSec = currentTime[0] - lastHRTime[0];
  const diffNano = currentTime[1] - lastHRTime[1];
  const elapsedSec = diffSec + diffNano / 1e9;

  totalCPUSeconds += diffCPU / 1e6;
  totalElapsedSeconds += elapsedSec;

  // 計算整段程式執行的平均 CPU 使用率 (單核心)
  const avgCPUPercent = (totalCPUSeconds / totalElapsedSeconds) * 100;

  console.log(`\n=== Load Test Summary ===`);
  console.log(`Total Running Time: ${totalElapsedSeconds.toFixed(2)} sec`);
  console.log(`Average CPU Usage: ${avgCPUPercent.toFixed(2)}% (single core)`);
  console.log(`=========================\n`);

  // 正式退出
  process.exit();
});