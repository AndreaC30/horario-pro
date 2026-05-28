.PHONY: dev-backend dev-frontend docker-up docker-down docker-prod

BACKEND_PORT ?= 8000

dev-backend:
	@test -x backend/.venv/bin/uvicorn || (echo "Crea el venv: cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt" && exit 1)
	@if lsof -ti:$(BACKEND_PORT) >/dev/null 2>&1; then \
		echo "Puerto $(BACKEND_PORT) en uso. Si es Docker: docker compose down"; \
		echo "Si es otro proceso: kill \$$(lsof -ti:$(BACKEND_PORT))"; \
		exit 1; \
	fi
	cd backend && .venv/bin/alembic upgrade head && .venv/bin/uvicorn app.main:app --reload --port $(BACKEND_PORT)

dev-frontend:
	cd frontend && npm run dev

docker-up:
	docker compose up -d --build

docker-logs:
	docker compose logs -f

docker-down:
	docker compose down

docker-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile postgres up -d --build
