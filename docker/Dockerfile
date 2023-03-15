FROM node:16.16-alpine As development

WORKDIR /usr/src/app

RUN apk add --no-cache openssh
RUN apk add --no-cache git
RUN apk add --no-cache protoc
RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh
COPY ssh/id_rsa /root/.ssh/id_rsa
#COPY ~/.ssh/id_rsa /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa
RUN ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

COPY . .

RUN yarn install

RUN yarn build

FROM node:16.16-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

RUN apk add --no-cache openssh
RUN apk add --no-cache git
COPY --from=development /root/.ssh /root/.ssh

COPY . .

RUN yarn install --production

COPY --from=development /usr/src/app/dist ./dist

CMD yarn migration:run ; node dist/main
