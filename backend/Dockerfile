FROM node:10-alpine

RUN mkdir -p /home/node/app/backend/node_modules && chown -R node:node /home/node/app

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

# COPY --chown=node:node . /home/node/app/
