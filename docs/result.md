## 壓測紀錄

透過 K6 constant-arrival-rate 方式進行壓測，constant-arrival-rate 會盡可能得達到我們設定的 RPS 頻率，基本上在 latency 陡增點前 `http_reqs` 都是符合的。下面這些是一些細節跟測試結論：
- 以 RPS 10 遞增的方式對 CoAP, optimized CoAP, HTTP version 分別進行壓測，每個 RPS 頻率分別進行 1~多次的測試 -> 以取得符合我們預期的最佳結果
- latency 陡增點的推斷是基於 load-test/analyze.js 計算出 Gateway / IoT device 壓測完後總共的 span counts，不同就代表 Gateway 塞車了
- 用 coap-record.bash / http-record.bash 紀錄壓測期間 Gateway / IoT device 分別的 avg CPU% 
- 都有注意 VUs 是否足夠～
- 下方紀錄有些有記錄到 overall k6 結果有些沒有
- 目前記錄到的最佳的優化是 RPS = 20 時，Optimized CoAP 對比 HTTP 的 IoT device 端延遲從 0.1790... 降低到 0.0791..，優化了約 **55.81%**
- Optimized CoAP gateway 端 Latency 陡增點是 RPS = 104 (透過去壓測 103 跟 105 得出的結論)
- CoAP gateway 端 Latency 陡增點是 RPS = 96 (透過去壓測 96 跟 97 得出的結論)
- HTTP gateway 端 Latency 陡增點是 RPS = 44 （44大多穩定，45時大多時候都會導致 gateway 端 span 數與 IoT device 端 span 數不同 -> 故推斷 44 為陡增點）

## 10 PRS
### CoAP 版本
**CPU**
- CoAP IoT 在壓測期間平均 CPU 使用量：2.47%
- CoAP Gateway 在壓測期間平均 CPU 使用量：5.84%

**Latency**
- Gateway
{ count: 601, avg: 4.46089850249584, p95: 7, p99: 10, min: 1, max: 28 }
- IoT Server A
{ count: 601, avg: 0.2961730449251248, p95: 1, p99: 1, min: 0, max: 4 }

**overall**
```
checks.........................: 100.00% 601 out of 601
     data_received..................: 115 kB  1.9 kB/s
     data_sent......................: 111 kB  1.9 kB/s
     http_req_blocked...............: avg=27.14µs  min=3.91µs  med=15.79µs  max=934.4µs  p(90)=20.7µs   p(95)=34.7µs
     http_req_connecting............: avg=6.28µs   min=0s      med=0s       max=766.32µs p(90)=0s       p(95)=0s
     http_req_duration..............: avg=5.67ms   min=1.28ms  med=5.84ms   max=28.78ms  p(90)=7.74ms   p(95)=8.71ms
       { expected_response:true }...: avg=5.67ms   min=1.28ms  med=5.84ms   max=28.78ms  p(90)=7.74ms   p(95)=8.71ms
     http_req_failed................: 0.00%   0 out of 601
     http_req_receiving.............: avg=192.55µs min=31.08µs med=145.08µs max=1.91ms   p(90)=375.62µs p(95)=480.28µs
     http_req_sending...............: avg=90.69µs  min=11.95µs med=74.2µs   max=933.53µs p(90)=158.2µs  p(95)=242.91µs
     http_req_tls_handshaking.......: avg=0s       min=0s      med=0s       max=0s       p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=5.39ms   min=1.21ms  med=5.52ms   max=28.66ms  p(90)=7.33ms   p(95)=8.35ms
     http_reqs......................: 601     10.015351/s
     iteration_duration.............: avg=6.34ms   min=1.44ms  med=6.58ms   max=29.15ms  p(90)=8.55ms   p(95)=9.55ms
     iterations.....................: 601     10.015351/s
     vus............................: 1       min=0          max=1
     vus_max........................: 10      min=10         max=10
```

### HTTP 版本

**CPU**
HTTP IoT 在壓測期間平均 CPU 使用量：2.06%
HTTP Gateway 在壓測期間平均 CPU 使用量：4.80%

**Latency**
- Gateway
{ count: 601, avg: 2.693843594009983, p95: 4, p99: 11, min: 0, max: 127 }
- IoT Server A
{ count: 601, avg: 0.33943427620632277, p95: 1, p99: 1, min: 0, max: 4 }

**overall**
```
checks.........................: 100.00% 601 out of 601
     data_received..................: 114 kB  1.9 kB/s
     data_sent......................: 111 kB  1.9 kB/s
     http_req_blocked...............: avg=35.86µs  min=3.33µs   med=15.75µs  max=2.28ms   p(90)=22.04µs  p(95)=35.41µs
     http_req_connecting............: avg=7.73µs   min=0s       med=0s       max=977.08µs p(90)=0s       p(95)=0s
     http_req_duration..............: avg=4.31ms   min=573.54µs med=3.37ms   max=131.76ms p(90)=5.02ms   p(95)=6.22ms
       { expected_response:true }...: avg=4.31ms   min=573.54µs med=3.37ms   max=131.76ms p(90)=5.02ms   p(95)=6.22ms
     http_req_failed................: 0.00%   0 out of 601
     http_req_receiving.............: avg=234.17µs min=32.08µs  med=148.91µs max=16.91ms  p(90)=333.95µs p(95)=403.29µs
     http_req_sending...............: avg=90.47µs  min=12.29µs  med=69.16µs  max=2.66ms   p(90)=143.16µs p(95)=224.99µs
     http_req_tls_handshaking.......: avg=0s       min=0s       med=0s       max=0s       p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=3.98ms   min=518.12µs med=3.11ms   max=130.57ms p(90)=4.69ms   p(95)=5.85ms
     http_reqs......................: 601     10.014717/s
     iteration_duration.............: avg=5.11ms   min=706.7µs  med=4.17ms   max=134.29ms p(90)=6.04ms   p(95)=7.77ms
     iterations.....................: 601     10.014717/s
     vus............................: 0       min=0          max=3
     vus_max........................: 10      min=10         max=10
```


### Optimze CoAP version

**CPU**
- CoAP IoT 在壓測期間平均 CPU 使用量：3.00%
- CoAP Gateway 在壓測期間平均 CPU 使用量：6.04%

**Latency**
- Gateway
{ count: 601, avg: 4.364392678868552, p95: 6, p99: 8, min: 1, max: 16 }
- IoT Server A
{ count: 601, avg: 0.22795341098169716, p95: 1, p99: 1, min: 0, max: 2 }
```
checks.........................: 100.00% 600 out of 600
     data_received..................: 115 kB  1.9 kB/s
     data_sent......................: 111 kB  1.8 kB/s
     http_req_blocked...............: avg=27.66µs  min=2.66µs  med=15.08µs  max=1.16ms   p(90)=22.56µs  p(95)=48.75µs
     http_req_connecting............: avg=6.97µs   min=0s      med=0s       max=815.06µs p(90)=0s       p(95)=0s
     http_req_duration..............: avg=6.82ms   min=1.3ms   med=6ms      max=113.03ms p(90)=10.16ms  p(95)=14.2ms
       { expected_response:true }...: avg=6.82ms   min=1.3ms   med=6ms      max=113.03ms p(90)=10.16ms  p(95)=14.2ms
     http_req_failed................: 0.00%   0 out of 600
     http_req_receiving.............: avg=214.63µs min=26.16µs med=144.03µs max=7.58ms   p(90)=342.12µs p(95)=428.55µs
     http_req_sending...............: avg=94.14µs  min=10.08µs med=62.41µs  max=2.23ms   p(90)=152.32µs p(95)=271.76µs
     http_req_tls_handshaking.......: avg=0s       min=0s      med=0s       max=0s       p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=6.51ms   min=1.25ms  med=5.74ms   max=112.91ms p(90)=9.56ms   p(95)=13.85ms
     http_reqs......................: 600     9.999675/s
     iteration_duration.............: avg=7.66ms   min=1.42ms  med=6.72ms   max=125.5ms  p(90)=11.13ms  p(95)=16.32ms
     iterations.....................: 600     9.999675/s
     vus............................: 0       min=0          max=1
     vus_max........................: 10      min=10         max=10
     
```

---
## 20 PRS

### CoAP 版本
**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：1.81%
CoAP Gateway 在壓測期間平均 CPU 使用量：4.85%

**Latency**
- Gateway
{ count: 1201, avg: 1.642797668609492, p95: 3, p99: 11, min: 0, max: 64 }
- IoT Server A
{ count: 1201, avg: 0.09825145711906745, p95: 1, p99: 1, min: 0, max: 9 }


### optimized CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：2.43%
CoAP IoT 在壓測期間平均記憶體使用量：36.11 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：4.59%
CoAP Gateway 在壓測期間平均記憶體使用量：48.49 MiB

**Latency**
- Gateway
{ count: 1201, avg: 2.0432972522897583, p95: 4, p99: 10, min: 0, max: 163 }
- IoT Server A
{ count: 1201, avg: 0.0791007493755204, p95: 1, p99: 1, min: 0, max: 4 }


### HTTP 版本

**CPU**
HTTP IoT 在壓測期間平均 CPU 使用量：1.69%
HTTP Gateway 在壓測期間平均 CPU 使用量：3.59%

**Latency**
- Gateway
{ count: 1201, avg: 1.0915903413821815, p95: 2, p99: 4, min: 0, max: 100 }
- IoT Server A
{ count: 1201, avg: 0.17901748542880933, p95: 1, p99: 1, min: 0, max: 70 }

---

## 30 RPS

### CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：2.78%
CoAP IoT 在壓測期間平均記憶體使用量：24.45 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：4.93%
CoAP Gateway 在壓測期間平均記憶體使用量：36.71 MiB

**Latency**
- Gateway
{ count: 1801, avg: 0.9089394780677401, p95: 2, p99: 3, min: 0, max: 24 }
- IoT Server A
{ count: 1801, avg: 0.05385896724042199, p95: 1, p99: 1, min: 0, max: 1 }


### CoAP Optimize 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：2.20%
CoAP IoT 在壓測期間平均記憶體使用量：33.00 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：4.73%
CoAP Gateway 在壓測期間平均記憶體使用量：40.79 MiB

**Latency**
- Gateway
{ count: 1801, avg: 1.5519156024430871, p95: 2, p99: 11, min: 0, max: 314 }
- IoT Server A
{ count: 1801, avg: 0.03997779011660189, p95: 0, p99: 1, min: 0, max: 4 }



### HTTP 版本

**CPU**
HTTP IoT 在壓測期間平均 CPU 使用量：2.35%
HTTP IoT 在壓測期間平均記憶體使用量：12.17 MiB
HTTP Gateway 在壓測期間平均 CPU 使用量：3.63%
HTTP Gateway 在壓測期間平均記憶體使用量：22.37 MiB

**Latency**
- Gateway
{ count: 1801, avg: 0.8900610771793448, p95: 2, p99: 12, min: 0, max: 158 }
- IoT Server A
{ count: 1801, avg: 0.09272626318711827, p95: 1, p99: 1, min: 0, max: 16 }

---

## 40 PRS

### CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：4.37%
CoAP IoT 在壓測期間平均記憶體使用量：26.28 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：7.58%
CoAP Gateway 在壓測期間平均記憶體使用量：43.41 MiB

**Latency**
- Gateway
{ count: 2400, avg: 2.118333333333333, p95: 3, p99: 39, min: 0, max: 136 }
- IoT Server A
{ count: 2400, avg: 0.06916666666666667, p95: 1, p99: 1, min: 0, max: 35 }


### CoAP Optimize 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：2.78%
CoAP IoT 在壓測期間平均記憶體使用量：39.81 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：6.86%
CoAP Gateway 在壓測期間平均記憶體使用量：44.51 MiB

**latency**
- Gateway
{ count: 2400, avg: 1.23625, p95: 2, p99: 7, min: 0, max: 44 }
- IoT Server A
{ count: 2400, avg: 0.05125, p95: 0, p99: 1, min: 0, max: 4 }


### HTTP 版本

**CPU**
HTTP IoT 在壓測期間平均 CPU 使用量：2.02%
HTTP IoT 在壓測期間平均記憶體使用量：10.55 MiB
HTTP Gateway 在壓測期間平均 CPU 使用量：3.61%
HTTP Gateway 在壓測期間平均記憶體使用量：20.16 MiB

**latency**
- Gateway
{ count: 2401, avg: 0.5064556434818825, p95: 1, p99: 3, min: 0, max: 75 }
- IoT Server A  
{ count: 2401, avg: 0.045397750937109536, p95: 0, p99: 1, min: 0, max: 14 }

---

## 50 PRS

### CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：3.33%
CoAP IoT 在壓測期間平均記憶體使用量：29.19 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：7.60%
CoAP Gateway 在壓測期間平均記憶體使用量：41.14 MiB

**Latency**
- Gateway
{ count: 3000, avg: 0.9363333333333334, p95: 2, p99: 3, min: 0, max: 14 }
- IoT Server A
{ count: 3000, avg: 0.038, p95: 0, p99: 1, min: 0, max: 2 }


### CoAP Optimize 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：3.75%
CoAP IoT 在壓測期間平均記憶體使用量：44.60 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：6.59%
CoAP Gateway 在壓測期間平均記憶體使用量：59.42 MiB

**Latency**
- Gateway
{ count: 3001, avg: 0.8833722092635788, p95: 1, p99: 3, min: 0, max: 12 }
- IoT Server A
{ count: 3001, avg: 0.02865711429523492, p95: 0, p99: 1, min: 0, max: 1 }


### HTTP 版本

（Gateway 開始抵達上限 req fail 2% 3%）
**CPU**
HTTP IoT 在壓測期間平均 CPU 使用量：2.60%
HTTP IoT 在壓測期間平均記憶體使用量：21.75 MiB
HTTP Gateway 在壓測期間平均 CPU 使用量：4.75%
HTTP Gateway 在壓測期間平均記憶體使用量：28.70 MiB

**Latency**
- Gateway
{ count: 2877, avg: 1022.6166145290233, p95: 3595, p99: 6641, min: 0, max: 14345 }
- IoT Server A  
{ count: 2521, avg: 0.033716779055930186, p95: 0, p99: 1, min: 0, max: 4 }

---

## 60 RPS

### CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：4.37%
CoAP IoT 在壓測期間平均記憶體使用量：49.36 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：7.77%
CoAP Gateway 在壓測期間平均記憶體使用量：65.87 MiB

**Latency**
- Gateway
{ count: 3601, avg: 0.9855595667870036, p95: 2, p99: 3, min: 0, max: 63 }
- IoT Server A
{ count: 3601, avg: 0.04054429325187448, p95: 0, p99: 1, min: 0, max: 1 }


### Optimized CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：3.46%
CoAP IoT 在壓測期間平均記憶體使用量：53.41 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：6.86%
CoAP Gateway 在壓測期間平均記憶體使用量：66.29 MiB

**Latency**
- Gateway
{ count: 3601, avg: 0.8325465148569842, p95: 1, p99: 3, min: 0, max: 31 }
- IoT Server A
{ count: 3601, avg: 0.029991668980838656, p95: 0, p99: 1, min: 0, max: 1 }


## 70 RPS

### CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：4.89%
CoAP IoT 在壓測期間平均記憶體使用量：34.99 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：11.50%
CoAP Gateway 在壓測期間平均記憶體使用量：43.76 MiB

**Latency**
- Gateway
{ count: 4201, avg: 1.314686979290645, p95: 2, p99: 10, min: 0, max: 83 }
- IoT Server A
{ count: 4201, avg: 0.047607712449416806, p95: 0, p99: 1, min: 0, max: 8 }


### Optimized CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：3.68%
CoAP IoT 在壓測期間平均記憶體使用量：67.08 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：6.60%
CoAP Gateway 在壓測期間平均記憶體使用量：77.92 MiB
**Latency**
- Gateway
{ count: 4201, avg: 0.7700547488693168, p95: 1, p99: 2, min: 0, max: 23 }
- IoT Server A
{ count: 4201, avg: 0.02475601047369674, p95: 0, p99: 1, min: 0, max: 1 }


## 80 RPS

### CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：5.28%
CoAP IoT 在壓測期間平均記憶體使用量：59.86 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：9.54%
CoAP Gateway 在壓測期間平均記憶體使用量：59.53 MiB

**Latency**
- Gateway
{ count: 4800, avg: 3.0277083333333334, p95: 3, p99: 71, min: 0, max: 266 }
- IoT Server A
{ count: 4800, avg: 0.07104166666666667, p95: 0, p99: 1, min: 0, max: 61 }


### Optimized CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：4.80%
CoAP IoT 在壓測期間平均記憶體使用量：50.99 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：12.37%
CoAP Gateway 在壓測期間平均記憶體使用量：60.79 MiB

**Latency**
- Gateway
{ count: 4801, avg: 2.4530306186211206, p95: 3, p99: 30, min: 0, max: 267 }
- IoT server A
{ count: 4801, avg: 0.045823786711101856, p95: 0, p99: 1, min: 0, max: 4 }

---

## 90 RPS

### CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：5.40%
CoAP IoT 在壓測期間平均記憶體使用量：86.33 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：9.83%
CoAP Gateway 在壓測期間平均記憶體使用量：77.79 MiB

**Latency**
- Gateway
{ count: 5400, avg: 0.9642592592592593, p95: 1, p99: 4, min: 0, max: 80 }
- IoT Server A
{ count: 5400, avg: 0.03518518518518519, p95: 0, p99: 1, min: 0, max: 13 }


### Optimized CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：6.09%
CoAP IoT 在壓測期間平均記憶體使用量：71.66 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：9.71%
CoAP Gateway 在壓測期間平均記憶體使用量：83.70 MiB

**Latency**
- Gateway
{ count: 5401, avg: 4.994445473060544, p95: 3, p99: 165, min: 0, max: 259 }
- IoT server A
{ count: 5401, avg: 0.030735049064987967, p95: 0, p99: 1, min: 0, max: 7 }

---

## 100 RPS

### CoAP 版本 （96 RPS 左右可能為陡增點）

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：4.88%
CoAP IoT 在壓測期間平均記憶體使用量：90.53 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：9.88%
CoAP Gateway 在壓測期間平均記憶體使用量：83.89 MiB
**Latency**
- Gateway
{ count: 6001, avg: 453.4777537077154, p95: 523, p99: 529, min: 0, max: 7984 }
- IoT Server A
{ count: 5998, avg: 0.020840280093364454, p95: 0, p99: 1, min: 0, max: 5 }



### Optimized CoAP 版本

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：6.07%
CoAP IoT 在壓測期間平均記憶體使用量：40.03 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：13.50%
CoAP Gateway 在壓測期間平均記憶體使用量：55.85 MiB

**Latency**
- Gateway
{ count: 6001, avg: 14.955007498750208, p95: 137, p99: 223, min: 0, max: 244 }
- IoT Server A
{ count: 6001, avg: 0.039826695550741545, p95: 0, p99: 1, min: 0, max: 3 }


---

## 110 RPS

### CoAP 版本

**CPU**

**Latency**


### Optimized CoAP 版本 （104 PRS 為陡增點

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：7.39%
CoAP IoT 在壓測期間平均記憶體使用量：77.81 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：17.55%
CoAP Gateway 在壓測期間平均記憶體使用量：85.96 MiB

**Latency**
- Gateway
{ count: 6591, avg: 500.6182673342437, p95: 528, p99: 660, min: 1, max: 7101 }
- IoT Server A
{ count: 6547, avg: 0.05468153352680617, p95: 0, p99: 1, min: 0, max: 39 }


---

## 細部檢測陡增點

### 105 RPS Opt
- Gateway 有時候會爆掉有時不會（

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：9.83%
CoAP IoT 在壓測期間平均記憶體使用量：80.43 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：13.17%
CoAP Gateway 在壓測期間平均記憶體使用量：89.46 MiB
**Latency**
- Gateway
{ count: 6300, avg: 248.30190476190475, p95: 520, p99: 523, min: 0, max: 654 }
- IoT Server A
{ count: 6300, avg: 0.03142857142857143, p95: 0, p99: 1, min: 0, max: 4 }

### 104 RPS Opt

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：7.24%
CoAP IoT 在壓測期間平均記憶體使用量：113.01 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：13.88%
CoAP Gateway 在壓測期間平均記憶體使用量：125.24 MiB

CoAP IoT 在壓測期間平均 CPU 使用量：6.56%
CoAP IoT 在壓測期間平均記憶體使用量：129.37 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：19.63%
CoAP Gateway 在壓測期間平均記憶體使用量：140.53 MiB

**Latency**
- Gateway (first)
{ count: 6241, avg: 13.917641403621214, p95: 50, p99: 54, min: 0, max: 90 }
- Gateway (second)
{ count: 6241, avg: 80.09597820862041, p95: 519, p99: 522, min: 0, max: 675 }

- IoT Server A (first)
{ count: 6241, avg: 0.03172568498638039, p95: 0, p99: 1, min: 0, max: 2 }
- IoT Server A (second)
{ count: 6241, avg: 0.0400576830636116, p95: 0, p99: 1, min: 0, max: 6 }


### 103 RPS Opt

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：4.34%
CoAP IoT 在壓測期間平均記憶體使用量：84.95 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：10.31%
CoAP Gateway 在壓測期間平均記憶體使用量：96.86 MiB

**Latency**
- Gateway
{ count: 6181, avg: 0.9119883513994499, p95: 1, p99: 3, min: 0, max: 42 }
- IoT Server A
{ count: 6181, avg: 0.022002912150137516, p95: 0, p99: 1, min: 0, max: 1 }

---

### 97 RPS CoAP
- 壓測兩次結果相似
**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：6.22%
CoAP IoT 在壓測期間平均記憶體使用量：75.37 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：10.75%
CoAP Gateway 在壓測期間平均記憶體使用量：82.26 MiB

**Latency**
- Gateway
{ count: 5821, avg: 194.95636488575846, p95: 435, p99: 456, min: 0, max: 468 }
- IoT Server A
{ count: 5821, avg: 0.036248067342381035, p95: 0, p99: 1, min: 0, max: 18 }

### 96 RPS CoAP

- 有時候會爆掉，有時候不會
**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：4.08%
CoAP IoT 在壓測期間平均記憶體使用量：82.99 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：9.21%
CoAP Gateway 在壓測期間平均記憶體使用量：89.30 MiB

**Latency**
- Gateway
{ count: 5761, avg: 0.9847248741537927, p95: 1, p99: 5, min: 0, max: 71 }
- IoT Server A
{ count: 5761, avg: 0.027252213157437945, p95: 0, p99: 1, min: 0, max: 7 }

---

### 44 RPS HTTP
- 穩定 但45時大多時候都會導致 gateway 端 span 數與 IoT device 端 span 數不同 -> 故推斷 44 為陡增點

**CPU**
HTTP IoT 在壓測期間平均 CPU 使用量：1.18%
HTTP IoT 在壓測期間平均記憶體使用量：19.46 MiB
HTTP Gateway 在壓測期間平均 CPU 使用量：2.66%
HTTP Gateway 在壓測期間平均記憶體使用量：31.01 MiB
**Latency**
- Gateway
{ count: 2640, avg: 0.37916666666666665, p95: 1, p99: 2, min: 0, max: 37 }
- IoT Server A
{ count: 2640, avg: 0.04242424242424243, p95: 0, p99: 1, min: 0, max: 21 }

### 44 RPS optimized CoAP

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：3.06%
CoAP IoT 在壓測期間平均記憶體使用量：55.44 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：5.76%
CoAP Gateway 在壓測期間平均記憶體使用量：66.00 MiB
**Latency**
- gateway
{ count: 2641, avg: 0.9840969329799318, p95: 2, p99: 4, min: 0, max: 42 }
- IoT Server A
{ count: 2641, avg: 0.03369935630443014, p95: 0, p99: 1, min: 0, max: 1 }


### 44 RPS CoAP

**CPU**
CoAP IoT 在壓測期間平均 CPU 使用量：2.59%
CoAP IoT 在壓測期間平均記憶體使用量：40.76 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：6.41%
CoAP Gateway 在壓測期間平均記憶體使用量：56.08 MiB

**Latency**
- gateway
{ count: 2641, avg: 0.9469897765997728, p95: 2, p99: 3, min: 0, max: 38 }
- IoT Server A
{ count: 2641, avg: 0.03862173419159409, p95: 0, p99: 1, min: 0, max: 2 }


