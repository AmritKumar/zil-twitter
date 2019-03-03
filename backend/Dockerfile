FROM node:10-alpine

RUN mkdir -p /home/node/app/backend/node_modules && \
	mkdir -p /home/node/app/frontend/node_modules && \
	chown -R node:node /home/node/app

WORKDIR /home/node/app/backend

COPY package*.json ./

RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    && npm install \
    && apk del build-dependencies
 

USER node

RUN npm install

WORKDIR /home/node/app/frontend

COPY frontend ./

RUN npm install -f

RUN npm run build

WORKDIR /home/node/app/backend
