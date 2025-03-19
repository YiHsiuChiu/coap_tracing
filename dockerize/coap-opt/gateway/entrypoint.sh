#!/bin/sh
set -e

# 1) 開啟路由轉發
echo 1 > /proc/sys/net/ipv4/ip_forward

# 找到綁在 172.31.0.2 這個 IP 的介面名稱
IFACE=$(ip -o addr show | grep "172.31.0.2" | awk '{print $2}')
echo "Detected interface for 172.31.0.2 is: $IFACE"

# 2) 在 ethx (連到 iot-net) 介面做 TBF
tc qdisc del dev $IFACE root 2>/dev/null || true
tc qdisc add dev $IFACE root tbf rate 250kbit burst 32kbit latency 400ms

# 3) 執行原本 gateway 的程式邏輯
exec node gateway.js
