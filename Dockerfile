FROM mhart/alpine-node:12.22.1

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build:tsc

RUN yarn start