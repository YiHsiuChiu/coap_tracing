#!/bin/sh
set -e

# 1) 設定 IP (假設在 docker-compose 指定 iot-device-a IP=172.30.0.10)
ip route add default via 172.30.0.1 dev eth0

# egress TBF for 雙向
tc qdisc del dev eth0 root 2>/dev/null || true
tc qdisc add dev eth0 root tbf rate 250kbit burst 32kbit latency 400ms

# 2) 執行原本的 coapServerA
exec node coapServerA.js

