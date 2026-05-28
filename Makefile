.PHONY: dev-backend dev-frontend docker-up docker-down docker-prod

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

docker-up:
	docker compose up --build

docker-down:
	docker compose down

docker-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile postgres up -d --build
