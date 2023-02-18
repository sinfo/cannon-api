FROM node:14-alpine

WORKDIR /home/node/app
COPY . .

RUN apk add --update openssl python3 make g++ && rm -rf /var/cache/apk/*
RUN mkdir -p keys cannon_upload
RUN openssl genrsa -out keys/token.key 1024
RUN openssl rsa -in keys/token.key -pubout -out keys/token.pub

RUN npm install -g eslint --loglevel=error
RUN npm install --loglevel=error

ENTRYPOINT [ "npm", "start" ]
