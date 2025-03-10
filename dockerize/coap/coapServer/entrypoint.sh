#!/bin/sh
# 1. 確保 ifb 模組可用 (若 kernel 已經內建，可能不需要這步)
modprobe ifb 2>/dev/null || true

# 2. 建立 ifb0 並啟動
ip link add ifb0 type ifb 2>/dev/null || true
ip link set ifb0 up

tc qdisc del dev eth0 ingress 2>/dev/null || true
tc qdisc del dev ifb0 root 2>/dev/null || true

# eth0 上新增 egress TBF (限制上傳)
tc qdisc replace dev eth0 root tbf rate 250kbit burst 4kbit latency 400ms

# 5. eth0 上新增 ingress qdisc
tc qdisc add dev eth0 handle ffff: ingress

tc filter add dev eth0 parent ffff: protocol ip u32 match ip src 0.0.0.0/0 flowid 1:1 \
    action mirred egress redirect dev ifb0

# 7. 在 ifb0 上加 TBF，限制 inbound
tc qdisc add dev ifb0 root tbf rate 250kbit burst 4kbit latency 400ms


echo "Applied Inbound+Outbound 250kbps limit on eth0 (via ifb0) and eth0 root"

# 執行容器的主要程式
exec "$@"