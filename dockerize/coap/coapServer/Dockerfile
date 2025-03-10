FROM node:20.4-alpine

WORKDIR /app

COPY . .
RUN apk add --no-cache iproute2 \
    && npm install --production

COPY entrypoint.sh /usr/src/app/entrypoint.sh

RUN chmod +x /usr/src/app/entrypoint.sh

CMD ["/usr/src/app/entrypoint.sh", "node", "coapServerA.js"]