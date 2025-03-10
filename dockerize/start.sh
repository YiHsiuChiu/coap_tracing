#!/usr/bin/env bash
set -e
COAP_IOT="coap_coap-iot-network"
HTTP_IOT="http_http-iot-network"

RATE="250kbit"
BURST="32kbit"
LAT="400ms"

echo "1) Starting Docker Compose..."
docker-compose up -d

echo "2) Finding Bridge Interface for $NETWORK_NAME..."
# 取得 Network ID
COAP_NET_ID=$(docker network ls --filter name=${COAP_IOT} --format '{{.ID}}')
HTTP_NET_ID=$(docker network ls --filter name=${HTTP_IOT} --format '{{.ID}}')

# 某些情況 Docker 會在 Net ID 前12碼加到 bridge 名稱
COAP_BR_IF="br-$(echo $COAP_NET_ID | cut -c 1-12)"
HTTP_BR_IF="br-$(echo $HTTP_NET_ID | cut -c 1-12)"


# 也可以 docker network inspect ${PROJECT_NAME}_${NETWORK_NAME} 看 "Id" 完整字串
# 並檢查宿主機的 `ip link show` 來確定 br-xxxxxx 名稱

if [ -z "$COAP_BR_IF" ]; then
  echo "Error: Cannot find network ID for ${COAP_NET_ID}"
  exit 1
fi
if [ -z "$HTTP_BR_IF" ]; then
  echo "Error: Cannot find network ID for ${HTTP_NET_ID}"
  exit 1
fi

echo "   Potential bridge interface COPA: $COAP_BR_IF"
echo "   Potential bridge interface HTTP: $HTTP_BR_IF"


# 檢查宿主機上是否存在該介面
if ! ip link show "$COAP_BR_IF" >/dev/null 2>&1; then
  echo "Error: Bridge interface $COAP_BR_IF not found on host!"
  echo "Check 'ip link show' to confirm actual name."
  exit 1
fi

if ! ip link show "$HTTP_BR_IF" >/dev/null 2>&1; then
  echo "Error: Bridge interface $HTTP_BR_IF not found on host!"
  echo "Check 'ip link show' to confirm actual name."
  exit 1
fi

echo "3) Applying TBF to network"
# 先刪除舊的 qdisc
sudo tc qdisc del dev "$COAP_BR_IF" root 2>/dev/null || true
sudo tc qdisc del dev "$HTTP_BR_IF" root 2>/dev/null || true

# 新增 TBF
sudo tc qdisc add dev "$COAP_BR_IF" root tbf rate $RATE burst $BURST latency $LAT
sudo tc qdisc add dev "$HTTP_BR_IF" root tbf rate $RATE burst $BURST latency $LAT


echo "4) Verification
sudo tc -s qdisc show dev "$COAP_BR_IF"

echo "All done! iot network now limited to $RATE"
