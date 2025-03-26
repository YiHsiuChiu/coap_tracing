## 硬體環境：

**Server**: 
* ARM64 ubuntu 24.04.2 iso
* 4GB memory
* 4 CPUs
* 共 50 GB 硬碟

**Server Network**:
* 家中 Wifi 速度平均大概 50Mbps


## 實驗方式：

### summary

以 Docker 建置環境來模擬 IoT constrained env，將基於 HTTP 跟基於 CoAP 兩者的 Docker 環境隔離（port, network），兩者 Docker 環境容器化方式、網路頻寬限制相同。

### 模擬 IoT constrained env

#### sub summary

將 `http-iot-network`,`coap-iot-network` 兩者設為 `internal network` 模擬出 IoT 裝置沒有對外交互能力的部分，以及對兩者中的容器們透過 Linux TC 進行 egress 網路頻寬限制來達到在 iot-network 下無論是 inbound / outbound 都被限速在 250Kbits 以下。而在 iot-network 外能以正常速率進行交互。

#### 為啥只做 egress 網路頻寬限制就能做到 inbound / outbound 都被限速？

首先如果是針對 Docker bridge (例如 br-xxxx) 進行 egress TBF 時會有個問題：
**在此 Docker network 下的容器間通信並不會成功被限制頻寬**，因為這個 TBF 是貼在此 bridge 上的，他限制的是任何封包離開此網路（bridge）的行為（去往「外部」ex: host 或其他 bridge），而對於位在同個網路（bridge）下的容器來說，他們的交互不會離開當前 bridge，也就是不會經過 egress queue，所以才無法成功限速。

> [!NOTE] 
> 可以使用 iperf 簡單壓測就能發現是否成功限速

上方的問題，目前我研究到三種解法：
1. 最簡單直觀的方式：
**不要直接對 Docker bridge 做 TBF，改為對此 bridge 下的容器們做 TBF，但！需要手動設定 Docker network(default route, subnet, container ip)**

    **原理**：當此 bridge 下的 a 容器要與 b 容器交互時，a 會得先繞到 Gateway，再轉發給 B；流量必經 Gateway egress → TBF 生效。而 a 容器 -> Gateway 則被 a 容器本身的 TBF 限制住。

    一些關鍵設定過程:
    - 對 Gateway 外的容器設定 IP (也可以直接在 docker-compose.yaml 裡設定好)，以及將 default route 改為 Gateway IP，讓 Gateway 做此 bridge 下的 proxy 角色。還有設定 egress TBF
        ```sh
        ip addr add 172.30.0.10/24 dev eth0
        ip link set eth0 up
        ip route add default via 172.30.0.1 dev eth0
        ```
        ```sh
        tc qdisc del dev eth0 root 2>/dev/null || true
        tc qdisc add dev eth0 root tbf rate 250kbit burst 32kbit latency 400ms
        ```
    - 對 Gateway 設定路由轉發能力, 以及 egress TBF
        ```sh
        echo 1 > /proc/sys/net/ipv4/ip_forward

        tc qdisc del dev eth1 root 2>/dev/null || true
        tc qdisc add dev eth1 root tbf rate 250kbit burst 32kbit latency 400ms
        ```

        > [!NOTE]
        > 當容器只位於一個自定義網路時，預設網卡名稱就是`eth0`，但當多網路時，就需要在容器啟動後 exec 進去`ip link` 或 `ifconfig -a` 得知各個網卡 IP，在 inspect 一下目標網路名稱，就可以對應出正確的網卡了

2. Ingress Shaping + ifb：
這個方式目前我只知道很麻煩，有空再研究系列，大概做法：
- 對 Docker bridge 同時做 ingress + egress TBF，大概邏輯流程是：Container A → Container B，流量會先「進到 br-xxxxx (ingress)」→ 被 filter redirect 到 ifb0 → ifb0 egress => TBF => 250kbps。

- 對所有 IoT device 容器的網卡同時做 ingress + egress TBF


### 壓力測試

目前是直接把 K6 作為 HTTP Client 打入 Gateway `GET /iot-test`，分開去打基於 CoAP 以及基於 HTTP 的環境。然後額外寫了個紀錄平均 CPU, memory 使用量腳本（`coap-record.bash`, `http-record.bash`）.
**K6 腳本設定:**
```js
stages: [
      { duration: '10s', target: 20 }, 
      { duration: '30s', target: 20 },
      { duration: '10s', target: 0 }, 
],
```
壓測結果：
- 平均 CPU, memory 使用量兩者差異(CoAP CPU 使用量較低, Memory 使用量較高)：
```
CoAP IoT 在壓測期間平均 CPU 使用量：2.16%
CoAP IoT 在壓測期間平均記憶體使用量：18.12 MiB
CoAP Gateway 在壓測期間平均 CPU 使用量：4.84%
CoAP Gateway 在壓測期間平均記憶體使用量：23.62 MiB
---
HTTP IoT 在壓測期間平均 CPU 使用量：3.23%
HTTP IoT 在壓測期間平均記憶體使用量：11.17 MiB
HTTP Gateway 在壓測期間平均 CPU 使用量：7.87%
HTTP Gateway 在壓測期間平均記憶體使用量：17.18 MiB
```
- 基於 CoAP 的 K6 dashboard 結果：
```
checks.........................: 100.00% 495 out of 495
     data_received..................: 103 kB  2.0 kB/s
     data_sent......................: 92 kB   1.8 kB/s
     http_req_blocked...............: avg=35.73µs  min=2.87µs   med=6.7µs    max=2.53ms   p(90)=14.06µs  p(95)=34.42µs
     http_req_connecting............: avg=19.36µs  min=0s       med=0s       max=1.07ms   p(90)=0s       p(95)=0s
     http_req_duration..............: avg=656.32ms min=302.64ms med=657.03ms max=998.69ms p(90)=931.14ms p(95)=971.88ms
       { expected_response:true }...: avg=656.32ms min=302.64ms med=657.03ms max=998.69ms p(90)=931.14ms p(95)=971.88ms
     http_req_failed................: 0.00%   0 out of 495
     http_req_receiving.............: avg=122.53µs min=22µs     med=96.79µs  max=2.68ms   p(90)=190.84µs p(95)=253.21µs
     http_req_sending...............: avg=39.83µs  min=6.58µs   med=29µs     max=1.29ms   p(90)=65.35µs  p(95)=96.83µs
     http_req_tls_handshaking.......: avg=0s       min=0s       med=0s       max=0s       p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=656.15ms min=302.54ms med=656.88ms max=998.58ms p(90)=930.96ms p(95)=971.76ms
     http_reqs......................: 495     9.735626/s
     iteration_duration.............: avg=1.65s    min=1.3s     med=1.65s    max=1.99s    p(90)=1.93s    p(95)=1.97s
     iterations.....................: 495     9.735626/s
     vus............................: 3       min=2          max=20
     vus_max........................: 20      min=20         max=20


running (0m50.8s), 00/20 VUs, 495 complete and 0 interrupted iterations
default ✓ [ 100% ] 00/20 VUs  50s
```
- 基於 HTTP 的 K6 dashboard 結果：
```
checks.........................: 100.00% 810 out of 810
     data_received..................: 153 kB  3.0 kB/s
     data_sent......................: 150 kB  3.0 kB/s
     http_req_blocked...............: avg=24.1µs   min=2.41µs  med=6.31µs  max=1.44ms   p(90)=13.56µs  p(95)=36.75µs
     http_req_connecting............: avg=8.71µs   min=0s      med=0s      max=883.86µs p(90)=0s       p(95)=0s
     http_req_duration..............: avg=8.42ms   min=1.37ms  med=2.15ms  max=583.55ms p(90)=5.13ms   p(95)=8.78ms
       { expected_response:true }...: avg=8.42ms   min=1.37ms  med=2.15ms  max=583.55ms p(90)=5.13ms   p(95)=8.78ms
     http_req_failed................: 0.00%   0 out of 810
     http_req_receiving.............: avg=112.53µs min=10.87µs med=66.56µs max=3.61ms   p(90)=163.65µs p(95)=236.73µs
     http_req_sending...............: avg=43.1µs   min=5.58µs  med=27.39µs max=3.4ms    p(90)=62.72µs  p(95)=89.99µs
     http_req_tls_handshaking.......: avg=0s       min=0s      med=0s      max=0s       p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=8.27ms   min=1.33ms  med=2.05ms  max=583.26ms p(90)=4.87ms   p(95)=8.25ms
     http_reqs......................: 810     16.038182/s
     iteration_duration.............: avg=1.01s    min=1s      med=1s      max=1.61s    p(90)=1s       p(95)=1.01s
     iterations.....................: 810     16.038182/s
     vus............................: 2       min=2          max=20
     vus_max........................: 20      min=20         max=20


running (0m50.5s), 00/20 VUs, 810 complete and 0 interrupted iterations
default ✓ [ 100% ] 00/20 VUs  50s
```
#### Conculsion: 

目前的 code 我有反覆壓測 2~3 次都是類似的結果：
**Throughput**
* HTTP: 16.038182 req/s
* CoAP: 9.735626 req/s

**Latency**
* HTTP: 平均 656.32ms
* CoAP: 平均 8.42ms

---

## 一些其他紀錄：

* 當要對容器網路進行操作時，會需要透過 cap_add 賦予 NET_ADMIN
* 在手動定義一個 bridge 子網 (例如 172.30.0.0/24)時，Docker 會自動挑選該段第一個可用 IP (172.30.0.1) 作為 bridge interface (Host 端網卡) 的 IP / gateway，當為容器分配 IP 時，要從 172.30.0.2 開始～
* 當容器被賦予多個網路時，網卡編號(比如：eth0, eth1)並沒有固定規則，若需要針對某個網卡進行操作，要手動檢查該網路對應到哪個網卡