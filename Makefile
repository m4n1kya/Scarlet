.PHONY: help install dev-api dev-web test lint docker-up docker-down clean

help: ## Display available developer commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Install Python backend and Next.js frontend dependencies
	pip install -r requirements.txt
	cd frontend && npm install

dev-api: ## Start the FastAPI inference server on port 8000
	uvicorn backend_app:app --reload --host 0.0.0.0 --port 8000

dev-web: ## Start the Next.js development server on port 3000
	cd frontend && npm run dev

test: ## Run the Pytest suite for detection, heuristic, storage, and analytics
	pytest tests/ -v

lint: ## Run ESLint on frontend and Ruff on Python modules
	cd frontend && npm run lint

docker-up: ## Build and start full-stack containers via Docker Compose
	docker compose up --build -d

docker-down: ## Stop and remove running Docker Compose containers
	docker compose down

clean: ## Remove build caches and temporary artifacts
	rm -rf __pycache__ .pytest_cache .ruff_cache frontend/.next
