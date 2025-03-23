#!/bin/bash

# 要監控的容器名稱
IOT_CONTAINER_NAME="coap-iot-server-a"
GATEWAY_CONTAINER_NAME="coap-gateway"
# 儲存統計數據的檔案
IOT_OUTPUT_FILE="iot-stats.csv"
GATEWAY_OUTPUT_FILE="gateway-stats.csv"
# 設定抽樣間隔（秒）與總持續時間（秒）
INTERVAL=1
DURATION=70

# 初始化結果檔案（加上 header）
echo "timestamp,cpu_percent,mem_usage_mib" > "$IOT_OUTPUT_FILE"
echo "timestamp,cpu_percent,mem_usage_mib" > "$GATEWAY_OUTPUT_FILE"

END_TIME=$((SECONDS + DURATION))
while [ $SECONDS -lt $END_TIME ]; do
  # 取得當前時間戳
  TIMESTAMP=$(date +%s)
  
  # 取得 docker stats 資料，並格式化輸出 (例如 "0.15%,20.14MiB / 3.842GiB")
  IOT_STATS=$(docker stats "$IOT_CONTAINER_NAME" --no-stream --format "{{.CPUPerc}},{{.MemUsage}}")
  GATEWAY_STATS=$(docker stats "$GATEWAY_CONTAINER_NAME" --no-stream --format "{{.CPUPerc}},{{.MemUsage}}")
  
  # 分離 CPU 與記憶體數值
  IOT_CPU_RAW=$(echo "$IOT_STATS" | cut -d',' -f1)
  IOT_MEM_RAW=$(echo "$IOT_STATS" | cut -d',' -f2)
  GATEWAY_CPU_RAW=$(echo "$GATEWAY_STATS" | cut -d',' -f1)
  GATEWAY_MEM_RAW=$(echo "$GATEWAY_STATS" | cut -d',' -f2)

  # 移除百分號並轉為浮點數
  IOT_CPU=$(echo "$IOT_CPU_RAW" | tr -d '%' | awk '{printf "%.2f", $1}')
  GATEWAY_CPU=$(echo "$GATEWAY_CPU_RAW" | tr -d '%' | awk '{printf "%.2f", $1}')

  # 取出記憶體使用部分（格式通常為 "20.14MiB"）
  IOT_MEM_USAGE=$(echo "$IOT_MEM_RAW" | awk '{print $1}')
  GATEWAY_MEM_USAGE=$(echo "$GATEWAY_MEM_RAW" | awk '{print $1}')
  
  # 將記憶體數值轉為 MiB
  if [[ "$IOT_MEM_USAGE" == *"GiB"* ]]; then
    IOT_MEM=$(echo "$IOT_MEM_USAGE" | sed 's/GiB//' | awk '{printf "%.2f", $1 * 1024}')
  elif [[ "$IOT_MEM_USAGE" == *"MiB"* ]]; then
    IOT_MEM=$(echo "$IOT_MEM_USAGE" | sed 's/MiB//' | awk '{printf "%.2f", $1}')
  elif [[ "$IOT_MEM_USAGE" == *"kB"* ]]; then
    IOT_MEM=$(echo "$IOT_MEM_USAGE" | sed 's/kB//' | awk '{printf "%.2f", $1 / 1024}')
  else
    IOT_MEM=$IOT_MEM_USAGE
  fi

  if [[ "$GATEWAY_MEM_USAGE" == *"GiB"* ]]; then
    GATEWAY_MEM=$(echo "$GATEWAY_MEM_USAGE" | sed 's/GiB//' | awk '{printf "%.2f", $1 * 1024}')
  elif [[ "$GATEWAY_MEM_USAGE" == *"MiB"* ]]; then
    GATEWAY_MEM=$(echo "$GATEWAY_MEM_USAGE" | sed 's/MiB//' | awk '{printf "%.2f", $1}')
  elif [[ "$GATEWAY_MEM_USAGE" == *"kB"* ]]; then
    GATEWAY_MEM=$(echo "$GATEWAY_MEM_USAGE" | sed 's/kB//' | awk '{printf "%.2f", $1 / 1024}')
  else
    GATEWAY_MEM=$GATEWAY_MEM_USAGE
  fi
  
  # 將數據寫入 CSV 檔案
  echo "$TIMESTAMP,$IOT_CPU,$IOT_MEM" >> "$IOT_OUTPUT_FILE"
  echo "$TIMESTAMP,$GATEWAY_CPU,$GATEWAY_MEM" >> "$GATEWAY_OUTPUT_FILE"
  
  sleep $INTERVAL
done

# 使用 awk 計算平均 CPU 與記憶體使用量
IOT_AVG_CPU=$(awk -F, 'NR>1 {sum+=$2; count++} END {if(count>0) printf "%.2f", sum/count}' "$IOT_OUTPUT_FILE")
IOT_AVG_MEM=$(awk -F, 'NR>1 {sum+=$3; count++} END {if(count>0) printf "%.2f", sum/count}' "$IOT_OUTPUT_FILE")

GATEWAY_AVG_CPU=$(awk -F, 'NR>1 {sum+=$2; count++} END {if(count>0) printf "%.2f", sum/count}' "$GATEWAY_OUTPUT_FILE")
GATEWAY_AVG_MEM=$(awk -F, 'NR>1 {sum+=$3; count++} END {if(count>0) printf "%.2f", sum/count}' "$GATEWAY_OUTPUT_FILE")

echo "CoAP IoT 在壓測期間平均 CPU 使用量：$IOT_AVG_CPU%"
echo "CoAP IoT 在壓測期間平均記憶體使用量：$IOT_AVG_MEM MiB"

echo "CoAP Gateway 在壓測期間平均 CPU 使用量：$GATEWAY_AVG_CPU%"
echo "CoAP Gateway 在壓測期間平均記憶體使用量：$GATEWAY_AVG_MEM MiB"
