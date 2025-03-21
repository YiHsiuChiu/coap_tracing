#!/bin/sh
set -e

# 1) 開啟路由轉發 這樣 Gateway 容器才會把收到的封包進行 Layer 3 轉發。
echo 1 > /proc/sys/net/ipv4/ip_forward
# 為了讓 Gateway 容器可以對同一個 subnet 上的其他容器 IP 做 ARP 代理（避免 ARP 失敗）
# echo 1 > /proc/sys/net/ipv4/conf/all/proxy_arp


# 找到綁在 172.50.0.2 這個 IP 的介面名稱
IFACE=$(ip -o addr show | grep "172.50.0.2" | awk '{print $2}')
echo "Detected interface for 172.50.0.2 is: $IFACE"

# 2) 在 ethx (連到 iot-net) 介面做 TBF
tc qdisc del dev $IFACE root 2>/dev/null || true
tc qdisc add dev $IFACE root tbf rate 250kbit burst 32kbit latency 400ms

# 3) 執行原本 gateway 的程式邏輯
exec node gateway.js
