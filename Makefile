DOCKER_COMPOSE_DEV ?= docker-compose -f docker-compose.dev.yml -f docker-compose.db.yml -f docker-compose.db-test.yml
DOCKER_COMPOSE_PROD ?= docker-compose -f docker-compose.yml  -f docker-compose.db.yml
DOCKER_COMPOSE_PROTOC_GEN_DOC ?= docker-compose -f docker-compose.protoc-gen-doc.yml
DOCKER_COMPOSE_SCHEMASPY ?= docker-compose -f docker-compose.schemaspy.yml
DOCKER_COMPOSE_ADMINER ?= docker-compose -f docker-compose.adminer.yml
EXEC_SERVICE ?= docker exec -ti auth

env: ## Create env file
	copy .env.dist .env

##
## NPM
## -----------------
##
npm-install: ## Update vendors
	$(EXEC_SERVICE) npm install

npm-migration-run: ## Run migration
	$(EXEC_SERVICE) npm run migration:run

npm-migration-revert: ## Revert migration
	$(EXEC_SERVICE) npm run migration:revert

npm-migration-generate: ## Generate migration
	$(EXEC_SERVICE) npm run migration:generate

npm-migration-create: ## Create migration
	$(EXEC_SERVICE) npm run migration:create

npm-start: ## Run prod server
	$(EXEC_SERVICE) npm run start

npm-start-dev: ## Run dev server
	$(EXEC_SERVICE) npm run start:dev

npm-start-debug: ##  Run debug server
	$(EXEC_SERVICE) npm run start:debug

npm-build: ## Build app
	$(EXEC_SERVICE) npm run build

npm-lint: ## Check code style
	$(EXEC_SERVICE) npm run lint

npm-lint-fix: ## Fix code style
	$(EXEC_SERVICE) npm run lint:fix

npm-proto: ## Generate pb file based on proto
	$(EXEC_SERVICE) npm run proto

npm-test: ## Run test
	$(EXEC_SERVICE) npm run migration:run:test
	$(EXEC_SERVICE) npm run test

npm-test-cov: ## Run test coverage
	$(EXEC_SERVICE) npm run migration:run:test
	$(EXEC_SERVICE) npm run test:cov

npm-test-debug: ## Run test
	$(EXEC_SERVICE) npm run migration:run:test
	$(EXEC_SERVICE) npm run test:debug
##
## Docker compose dev
## -----------------
##
dockers-build: ## Build project containers
	$(DOCKER_COMPOSE_DEV) build

dockers-start: ## Create and start project containers
	$(DOCKER_COMPOSE_DEV) up

dockers-start-d: ## Create and start project containers in background
	$(DOCKER_COMPOSE_DEV) up -d

dockers-status: ## Check status of project containers
	$(DOCKER_COMPOSE_DEV) ps

dockers-stop: ## Stop project containers
	$(DOCKER_COMPOSE_DEV) stop

dockers-restart: ## Restart project containers
	$(DOCKER_COMPOSE_DEV) restart

dockers-down: ## Stop and remove project containers, networks, images
	$(DOCKER_COMPOSE_DEV) down

dockers-logs: ## View output from project containers
	$(DOCKER_COMPOSE_DEV) logs

dockers-bash: ## Enter in container with the terminal
	${EXEC_SERVICE} sh

protoc-gen-doc-start: ##  Run protoc-gen-doc to generate doc of endpoints from proto
	$(DOCKER_COMPOSE_PROTOC_GEN_DOC) up

adminer-start-d: ## Create and start adminer for database management
	$(DOCKER_COMPOSE_ADMINER) up -d

adminer-down: ## Stop and remove adminer
	$(DOCKER_COMPOSE_ADMINER) down

schemaspy-start: ## Run schemaspy to generate doc of database
	$(DOCKER_COMPOSE_SCHEMASPY) up
##
## Docker compose production
## -----------------
##
dockers-down-prod: ## Stop and remove project containers, networks, images
	$(DOCKER_COMPOSE_PROD) down

dockers-stop-prod: ## Stop project containers
	$(DOCKER_COMPOSE_PROD) stop

dockers-start-d-prod: ## Create and start project containers in background
	$(DOCKER_COMPOSE_PROD) up -d

dockers-rebuild-prod: ## Restart and rebuild project services
	$(DOCKER_COMPOSE_PROD) up -d --build

dockers-logs-prod: ## View output from project containers
	$(DOCKER_COMPOSE_PROD) logs

dockers-status-prod: ## Check status of project containers
	$(DOCKER_COMPOSE_PROD) ps
