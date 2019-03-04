FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    gcc \
    g++ \
    zlib-dev \
    && npm install

RUN npm install forever -g

#USER node

RUN npm install -f --unsafe-perm

RUN npm install scrypt

RUN ls
