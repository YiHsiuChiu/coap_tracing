#!/bin/sh
set -e

ip route add default via 172.40.0.2 dev eth0

# egress TBF for 雙向
tc qdisc del dev eth0 root 2>/dev/null || true
tc qdisc add dev eth0 root tbf rate 250kbit burst 32kbit latency 400ms

exec node iotServerA.js

