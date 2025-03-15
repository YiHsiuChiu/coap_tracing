FROM node:20.4-alpine

WORKDIR /app

COPY . .
RUN apk add --no-cache iproute2 \
    && apk add --no-cache iperf3

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]