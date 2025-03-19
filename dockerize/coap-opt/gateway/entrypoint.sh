#!/bin/sh
set -e

# 1) 開啟路由轉發
echo 1 > /proc/sys/net/ipv4/ip_forward

# 2) 在 ethx (連到 iot-net) 介面做 TBF
tc qdisc del dev eth1 root 2>/dev/null || true
tc qdisc add dev eth1 root tbf rate 250kbit burst 32kbit latency 400ms

# 3) 執行原本 gateway 的程式邏輯
exec node gateway.js
