FROM node:20.4-alpine

WORKDIR /app

COPY . .

# 安裝 tc 相關指令
RUN apk add --no-cache iproute2 curl

COPY entrypoint-http.sh /entrypoint-http.sh
RUN chmod +x /entrypoint-http.sh

# CMD ["node", "gateway.js"]
ENTRYPOINT ["/entrypoint-http.sh"]