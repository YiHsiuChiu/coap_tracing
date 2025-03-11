FROM node:20.4-alpine

WORKDIR /app

COPY . .

# 安裝 tc 相關指令
RUN apk add --no-cache iproute2 \
    && npm install --production

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# CMD ["node", "gateway.js"]
ENTRYPOINT ["/entrypoint.sh"]