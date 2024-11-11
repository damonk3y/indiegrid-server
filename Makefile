build:
	docker compose build

down:
	docker compose stop

remove: down
	docker compose rm

build-prod:
	docker compose -f docker-compose.prod.yml build

up: build
	docker compose up -d

up-prod: build-prod
	docker compose -f docker-compose.prod.yml up -d

down-prod:
	docker compose -f docker-compose.prod.yml down

remove-prod: down-prod
	docker compose -f docker-compose.prod.yml rm

bootstrap:
	yarn install
	yarn build
	npx prisma migrate deploy
	yarn start
