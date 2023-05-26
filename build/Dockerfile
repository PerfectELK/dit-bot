FROM node:20.2.0-buster

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
COPY nest-cli.json ./
COPY .prettierrc ./
COPY .eslintrc.js ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY webpack-hmr.config.js ./

RUN npm i
RUN npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack

COPY .env ./
COPY src ./src