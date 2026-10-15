# SatarkSetu — common tasks. Run `make help` to see them.
SHELL := /bin/bash
VENV  := backend/.venv
PY    := $(VENV)/bin/python

.PHONY: help install db dev dev-api dev-web build start backup export stats clean

help:
	@grep -E '^[a-z-]+:.*?## .*$$' $(MAKEFILE_LIST) | sed 's/:.*## /|/' | column -t -s '|'

install: ## Install backend (Python) and frontend (npm) dependencies
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install -q -r backend/requirements.txt
	cd frontend && npm install

db: ## Create the database and load official advisories
	python3 scripts/manage.py init

dev: ## Run backend + frontend for development (Ctrl-C stops both)
	@$(MAKE) -j2 dev-api dev-web

dev-api: ## Backend only, with auto-reload, on http://localhost:8000
	cd backend && .venv/bin/python -m uvicorn app.main:app --reload --port $${PORT:-8000}

dev-web: ## Frontend only, on http://localhost:5173
	cd frontend && npm run dev

build: ## Build the React app into frontend/dist
	cd frontend && npm run build

start: build ## Production mode: one server on http://localhost:8000
	cd backend && .venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port $${PORT:-8000}

backup: ## Snapshot the database into data/backups/
	python3 scripts/manage.py backup

export: ## Dump reports to JSON + CSV in data/exports/
	python3 scripts/manage.py export

stats: ## Show what is stored in the database
	python3 scripts/manage.py stats

clean: ## Remove builds and caches (keeps the database)
	rm -rf frontend/dist frontend/node_modules backend/.venv
	find . -name __pycache__ -type d -prune -exec rm -rf {} +
