# Buscar el archivo de docker-compose
DOCKER_COMPOSE := $(firstword $(wildcard docker-compose.yaml docker-compose.yml))

.PHONY: recreate-db check-docker-compose

recreate-db: check-docker-compose
	sudo docker compose down -v
	@sudo rm -rf db
	sudo docker compose up -d

check-docker-compose:
ifeq ($(DOCKER_COMPOSE),)
	@echo "Error: No se encontró docker-compose.yaml ni docker-compose.yml"
	@exit 1
else
	@echo "Usando archivo: $(DOCKER_COMPOSE)"
endif