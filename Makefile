.PHONY: dev-backend dev-frontend docker-up docker-down docker-prod docker-prod-logs nginx-render smoke-https qa-api qa

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

docker-prod-logs:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile postgres logs -f

nginx-render:
	@test -n "$(APP_DOMAIN)" || (echo "Define APP_DOMAIN=..." && exit 1)
	./deploy/scripts/render-nginx-config.sh

smoke-https:
	@test -n "$(APP_BASE_URL)" || (echo "Define APP_BASE_URL=https://..." && exit 1)
	./deploy/scripts/smoke-https.sh

qa-api:
	python3 scripts/qa_api_smoke.py

qa-e2e:
	cd frontend && npm run test:e2e

qa: qa-api qa-e2e
	@echo "QA API + E2E OK. Opcional: UXM-01 cronómetro manual; PWA Add to Home en móvil físico."
