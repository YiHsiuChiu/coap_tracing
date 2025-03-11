FROM node:20.4-alpine

WORKDIR /app

COPY . .
RUN apk add --no-cache iproute2 \
    && npm install --production

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
# CMD ["node", "coapServerA.js"]
# CMD ["/usr/src/app/entrypoint.sh", "node", "coapServerA.js"]