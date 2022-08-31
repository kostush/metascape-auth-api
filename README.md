# Auth microservice
User microservice is GRPC server implemented by using [Nest](https://github.com/nestjs/nest) framework.
The goal of microservice to manage user's data and actions.

## Installation
```bash
$ npm install
```

## Running the app

### Development
1. Create .env file and copy content of .env.dist
2. Run local postgres database by command
(you must have `docker` and `docker-compose` installed on you machine):
```bash
$ npm run database:dev:up
```
3. Run migration by command
```bash
$ npm run migration:run
```
4. Run application in dev mode by command:
```bash
$ npm run start:dev
```
5. (optional) Run adminer for managing database by command
```bash
$ docker-compose -f docker-compose.dev.yml up -d
```
after that adminer will be available for you by url: http://localhost:8080/

### Production
1. Create .env file with env variables according to the environment or setup real env variables
2. Run migration by command
```bash
$ npm run migration:run
```
3. Build application by command:
```bash
$ npm run build
```
4. Run application by command:
```bash
$ npm run start
```

## Tests
For running all tests (units and functional) use command:
```bash
$ npm run test:total
```
This command include couple of actions:
1. start database by running docker
2. rum all migrations
3. run tests
4. stop docker with database
For running test coverage use command:
```bash
$ npm run test:cov:total
```

## Migration
### Create new migration
Ideally new migration should be creating by generation it from the sources.
Instance of database needs to be up, for that local version can be used which can be run by:
```bash
$ npm run database:dev:up
```
We have to be sure all existing migrations are run by using command:
```bash
$ npm run migration:run
```
Now actually we can generate migration according to changes in TypeORM schemas run command:
```bash
$ npm run migration:generate
```
that will create new file in `migration` folder.
In case migration should include some changes of the database tha is not possible detect automatically use command:
```bash
$ npm run migration:create
```
which will crate file in `migration` with empty methods `up` and `down` where query should be written manually.

### Run migrations
Migration can be run with command:
```bash
$ npm run migration:run
```
connection to the database will be according to the environment variables

### Revert migrations
Migration can reverted run with command:
```bash
$ npm run migration:revert
```
connection to the database will be according to the environment variables

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
File `src/users/user.pb.ts` should never be changed manually.
This file has been generated from protofile `resources/proto/user.proto`.
In case of any changes in `resources/proto/user.proto` the command needed to be run to update `src/users/user.pb.ts`:
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
