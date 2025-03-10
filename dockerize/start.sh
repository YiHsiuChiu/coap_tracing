#!/usr/bin/env bash
set -e

PROJECT_NAME="coap"  # 依你 docker-compose 的 project name 或自訂
NETWORK_NAME="coap-iot-network"  # 與 docker-compose.yml 裡保持一致
RATE="250kbit"
BURST="32kbit"
LAT="400ms"

echo "1) Starting Docker Compose..."
docker-compose up -d

echo "2) Finding Bridge Interface for $NETWORK_NAME..."
# 取得 Network ID
NET_ID=$(docker network ls --filter name=${PROJECT_NAME}_${NETWORK_NAME} --format '{{.ID}}')

# 某些情況 Docker 會在 Net ID 前12碼加到 bridge 名稱
BR_IF="br-$(echo $NET_ID | cut -c 1-12)"

# 也可以 docker network inspect ${PROJECT_NAME}_${NETWORK_NAME} 看 "Id" 完整字串
# 並檢查宿主機的 `ip link show` 來確定 br-xxxxxx 名稱

if [ -z "$NET_ID" ]; then
  echo "Error: Cannot find network ID for ${PROJECT_NAME}_${NETWORK_NAME}"
  exit 1
fi

echo "   Found network ID: $NET_ID"
echo "   Potential bridge interface: $BR_IF"

# 檢查宿主機上是否存在該介面
if ! ip link show "$BR_IF" >/dev/null 2>&1; then
  echo "Error: Bridge interface $BR_IF not found on host!"
  echo "Check 'ip link show' to confirm actual name."
  exit 1
fi

echo "3) Applying TBF to $BR_IF..."
# 先刪除舊的 qdisc
sudo tc qdisc del dev "$BR_IF" root 2>/dev/null || true

# 新增 TBF
sudo tc qdisc add dev "$BR_IF" root tbf rate $RATE burst $BURST latency $LAT

echo "4) Verification: 'tc -s qdisc show dev $BR_IF'"
sudo tc -s qdisc show dev "$BR_IF"

echo "All done! $NETWORK_NAME now limited to $RATE"
