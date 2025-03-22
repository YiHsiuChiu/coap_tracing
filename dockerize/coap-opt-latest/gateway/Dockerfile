FROM node:20.4-alpine

WORKDIR /app

COPY . .

# 安裝 tc 相關指令
RUN apk add --no-cache iproute2 curl \
    && npm install --production

COPY entrypoint-opt.sh /entrypoint-opt.sh
RUN chmod +x /entrypoint-opt.sh

# CMD ["node", "gateway.js"]
ENTRYPOINT ["/entrypoint-opt.sh"]