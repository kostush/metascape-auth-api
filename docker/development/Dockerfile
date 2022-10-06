FROM node:16.16-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache openssh
RUN apk add --no-cache git
RUN apk add --no-cache protoc
RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh
RUN ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

COPY . .
