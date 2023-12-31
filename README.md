# Auth microservice
User microservice is GRPC server implemented by using [Nest](https://github.com/nestjs/nest) framework.
The goal of microservice to manage authentication of the user

## Running the app

### Development
All development work is commented to do through the docker.
Requirements:
 - docker
 - docker-compose 
 - make ([Windows](https://gnuwin32.sourceforge.net/packages/make.htm))
1. Create .env file and copy content of .env.dist
2. Create ssh folder and copy your `id_rsa` ssh key
3. Build and start dockers for development with command:
```bash
 make dockers-start
```
or in background mode:
```bash
 make dockers-start-d
```
you can check list and status of dockers by command:
```bash
 make dockers-status
```
4. Run application in dev mode by command:
```bash
 make npm-start-dev
```
Or in debug mode (don't forget to enable 9229 port):
```bash
 make npm-start-debug
```

### Production
1. Create .env file with env variables according to the environment or setup real env variables
2. Mode your ssh key in `ssh` folder in root path of the project
3. Run command
```bash
 make dockers-start-d-prod
```
you can check list and status of dockers by command:
```bash
 make dockers-status-prod
```
In case of new code run:
```bash
 make dockers-rebuild-prod
```
The command will rebuild and restart your containers.

## Tests
For running all tests (units and functional) use command:
```bash
 make npm-test
```
For running test coverage use command:
```bash
 make npm-test-cov
```
For running test in debug mode (don't forget to enable 9229 port):
```bash
 make npm-test-debug
```

## Code style
For checking code style run command:
```bash
 make npm-lint
```
for automatically fixing style:
```bash
 make npm-lint-fix
```

## Generate protobuf file
File `src/auth/auth.pb.ts` should never be changed manually.
This file has been generated from protofile `resources/proto/auth.proto`.
In case of any changes in `resources/proto/auth.proto` the command needed to be run to update `src/auth/auth.pb.ts`:
```bash
 make npm-proto
```

## Generate Publik, Private key  for JWT
run this commands 
````
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
````
copy tokens from files and insert in to variable JWT_PUBLIC_KEY, JWT_PRIVATE_KEY in the  .env.dist  and .env.test
```
cat jwtRS256.key
cat jwtRS256.key.pub
```
remove spaces in the begining of each line in JWT_PUBLIC_KEY, JWT_PRIVATE_KEY