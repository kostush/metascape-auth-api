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

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:16.16-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

RUN apk add --no-cache openssh
RUN apk add --no-cache git
COPY --from=development /root/.ssh /root/.ssh

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD node dist/main
