FROM node:22-alpine

RUN apk add --update openssl python3 make g++ && rm -rf /var/cache/apk/*

WORKDIR /home/node/app
COPY . .

RUN mkdir -p keys cannon_uploads
RUN openssl genrsa -out keys/token.key 1024
RUN openssl rsa -in keys/token.key -pubout -out keys/token.pub

RUN npm ci

ENTRYPOINT [ "npm", "start" ]
