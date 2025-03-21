#!/bin/sh
set -e
# 刪除 Docker 預設路由
# ip route del 172.31.0.0/24 dev eth0 || true

# 2) 加入 host route，讓系統知道要怎麼抵達 172.31.0.2 這個 IP
# ip route add 172.31.0.2 dev eth0

# 3) 再來才能指定 default gateway 為 172.31.0.2
ip route add default via 172.50.0.2 dev eth0

# egress TBF for 雙向
tc qdisc del dev eth0 root 2>/dev/null || true
tc qdisc add dev eth0 root tbf rate 250kbit burst 32kbit latency 400ms

# 2) 執行原本的 coapServerA
exec node coapServerA.js

