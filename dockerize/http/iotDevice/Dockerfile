FROM node:20.4-alpine

WORKDIR /app

COPY . .

RUN npm install --production

CMD ["node", "iotServerA.js"]