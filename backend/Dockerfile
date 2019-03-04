FROM node:10-alpine

RUN mkdir -p /home/node/app/backend/node_modules && \
	mkdir -p /home/node/app/backend/frontend/node_modules && \
	chown -R node:node /home/node/app

WORKDIR /home/node/app/backend

COPY package*.json ./

RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    gcc \
    g++ \
    zlib-dev \
    && npm install

USER node

RUN npm install

WORKDIR /home/node/app/backend/frontend

COPY frontend ./

#RUN cat src/SubmitTweet.js

# RUN chown -R node:node /home/node/app/frontend

RUN npm install -f

RUN ls

RUN npm run build

WORKDIR /home/node/app/backend
