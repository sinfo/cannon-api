FROM node:6.12-alpine

WORKDIR /home/node/app
COPY . .

RUN apk add --update openssl python make g++ && rm -rf /var/cache/apk/*
RUN mkdir keys cannon_upload
RUN openssl genrsa -out keys/token.key 1024
RUN openssl rsa -in keys/token.key -pubout -out keys/token.pub

RUN npm install -g eslint --loglevel=error
RUN npm install --loglevel=error

ENTRYPOINT [ "npm", "start" ]
