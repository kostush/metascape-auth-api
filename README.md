# Auth microservice
User microservice is GRPC server implemented by using [Nest](https://github.com/nestjs/nest) framework.
The goal of microservice to manage authentication of the user

## Installation
```bash
$ npm install
```

## Running the app

### Development
1. Create .env file and copy content of .env.dist
2. Run application in dev mode by command:
```bash
$ npm run start:dev
```

### Production
1. Create .env file with env variables according to the environment or setup real env variables
2. Build application by command:
```bash
$ npm run build
```
3. Run application by command:
```bash
$ npm run start
```

## Tests
For running all tests (units and functional) use command:
```bash
$ npm run test
```
For running test coverage use command:
```bash
$ npm run test:cov
```

## Code style
For checking code style run command:
```bash
$ npm run lint
```
for automatically fixing style:
```bash
$ npm run lint:fix
```

## Generate protobuf file
File `src/auth/auth.pb.ts` should never be changed manually.
This file has been generated from protofile `resources/proto/auth.proto`.
In case of any changes in `resources/proto/auth.proto` the command needed to be run to update `src/auth/auth.pb.ts`:
### Windows
```bash
$ npm run proto:win
```
### Mac
```bash
$ npm run proto:mac
```
The command require to have [proto](https://github.com/protocolbuffers/protobuf) command installed locally.
### Install proto
For windows: https://www.geeksforgeeks.org/how-to-install-protocol-buffers-on-windows/

For mac: `$ brew install protobuf`
