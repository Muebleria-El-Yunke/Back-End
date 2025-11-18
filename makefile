# Buscar el archivo de docker-compose
DOCKER_COMPOSE := $(firstword $(wildcard docker-compose.yaml docker-compose.yml))

.PHONY: reset-db create-db check-docker-compose

create-db: check-docker-compose
	@sudo docker compose up -d

reset-db: check-docker-compose
	@sudo docker compose down -v
	@sudo rm -rf db
	$(MAKE) create-db


check-docker-compose:
ifeq ($(DOCKER_COMPOSE),)
	@echo "Error: No se encontró docker-compose.yaml ni docker-compose.yml"
	@exit 1