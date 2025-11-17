recreate-db: docker-compose.yml
	sudo docker compose down -v;
	sudo rm -rf db;
	sudo docker compose up -d;
	yarn install;

