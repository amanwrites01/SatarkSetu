# SatarkSetu

A community portal against scams in India. People can report **phishing emails, fake websites, scam phone numbers and fake UPI payment requests**, **share scam experiences anonymously**, and check a number, UPI ID, link or email against what the community has already reported. It also carries **official government advisories**.

```
SatarkSetu/
├─ frontend/     React + Vite single-page app
├─ backend/      Python FastAPI API (app/) + requirements.txt
├─ scripts/      Database scripts: schema SQL, data SQL, manage.py  ← share this folder
├─ data/         The SQLite database lives here (not in git)
├─ Makefile      make install / db / dev / build / start / backup
├─ Dockerfile    Builds frontend + backend into one image
└─ render.yaml   One-click deploy on Render
```

**Stack:** React 19 + Vite · Python 3.11+ / FastAPI · SQLite (one file, no database server)

## Quick start

```bash
make install     # Python venv + npm install
make db          # create data/satarksetu.db and load official advisories
make dev         # API on :8000, site on http://localhost:5173
```

Without `make`:

```bash
python3 -m venv backend/.venv && backend/.venv/bin/pip install -r backend/requirements.txt
cd frontend && npm install && cd ..
python3 scripts/manage.py init
cd backend && .venv/bin/python -m uvicorn app.main:app --reload --port 8000   # terminal 1
cd frontend && npm run dev                                                    # terminal 2
```

Production mode on your machine (one server, built site included):

```bash
make start       # http://localhost:8000
```

Interactive API documentation: **http://localhost:8000/api/docs**

Copy `.env.example` to `.env` to configure things; set `ADMIN_TOKEN` there to enable the moderator page.

## Where the data is stored

One SQLite file: **`data/satarksetu.db`** (override the folder with `DATA_DIR`). Tables: `reports`, `votes`, `advisories`, `national_stats`, `meta`. Full details, table-by-table, are in **[`scripts/README.md`](scripts/README.md)**.

```bash
make stats                 # what's in the database
make backup                # snapshot to data/backups/ (safe while running)
make export                # reports as JSON + CSV in data/exports/
```

### The data it ships with

No invented community reports. The database starts with real, cited reference data only:

- **8 official advisories** from PIB press releases by **MHA/I4C, TRAI, DoT, RBI and India Post**, each linking to the original notice.
- **National figures** on suspected fraud communications reported to DoT's **Chakshu** facility (Rajya Sabha reply, PIB, 5 Feb 2026): 208,224 in 2024 and 519,662 in 2025, by category.

Add an advisory by editing `scripts/002_advisories.sql` and restarting. For a demo with illustrative reports: `python3 scripts/manage.py samples`.

## Features

- **Report** a phishing email, fake website, scam number or fake UPI request — no account, a random alias each time.
- **Anonymous stories**, with phone numbers and emails stripped out automatically.
- **Scam checker** that matches different spellings of the same thing (`+91 98765 43210` = `9876543210`, `www.site.com/x` = `site.com`).
- **Confirm or flag** any report, once per person. IP addresses are never stored; voters are a keyed hash.
- **Auto-moderation**: a report is hidden after `FLAG_THRESHOLD` flags (default 5) and waits for a moderator.
- **Moderator page** at `/admin` (needs `ADMIN_TOKEN`): publish, hide, remove or delete.
- **Official advisories** page with the national figures chart, plus links to report to 1930, cybercrime.gov.in, Chakshu and CERT-In.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/reports` | List reports (`type`, `q`, `sort`, `limit`, `offset`) |
| GET | `/api/reports/{id}` | One report + other reports of the same identifier |
| POST | `/api/reports` | Submit a report or story |
| POST | `/api/reports/{id}/confirm` | "I got this too" |
| POST | `/api/reports/{id}/flag` | Flag a wrong or abusive report |
| GET | `/api/lookup?value=` | Scam checker |
| GET | `/api/stats` | Community totals |
| GET | `/api/advisories` | Official advisories + national figures |
| GET/POST/DELETE | `/api/admin/reports…` | Moderation (needs `Authorization: Bearer <ADMIN_TOKEN>`) |

## Deploy

One Python process serving both the API and the built site. It needs **one persistent disk** for the database.

### Render (blueprint included)

1. Push this folder to a GitHub repository.
2. In Render: **New → Blueprint**, pick the repo. `render.yaml` sets the build, a 1 GB disk at `/var/data`, the health check, and generates `ADMIN_TOKEN` and `VOTE_SECRET`.
3. Copy `ADMIN_TOKEN` from the service's **Environment** tab to sign in at `/admin`.

A persistent disk needs Render's paid Starter plan; free instances lose their files.

### Docker (Railway, Fly.io, any VPS)

```bash
docker build -t satarksetu .
docker run -d -p 8080:8080 -v satarksetu-data:/data \
  -e ADMIN_TOKEN=$(python3 -c "import secrets;print(secrets.token_urlsafe(24))") \
  -e VOTE_SECRET=$(python3 -c "import secrets;print(secrets.token_urlsafe(32))") \
  -e TRUST_PROXY=1 satarksetu
```

Always mount a volume at `/data`, or reports vanish when the container is replaced.

### Plain server without Docker

```bash
pip install -r backend/requirements.txt
cd frontend && npm ci && npm run build && cd ..
DATA_DIR=/var/lib/satarksetu ADMIN_TOKEN=... TRUST_PROXY=1 PORT=8080 \
  python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8080
```

Run it under systemd or supervisor, behind Nginx or Caddy for HTTPS.

### Frontend and backend on different hosts

Build the frontend separately (Netlify, Vercel, S3) and set `CORS_ORIGINS=https://your-site.com` on the backend. Point the frontend's `/api` calls at the backend URL (`API_URL` in `frontend/vite.config.js` for local development).

## Settings

`PORT`, `DATA_DIR`, `ADMIN_TOKEN`, `VOTE_SECRET`, `TRUST_PROXY`, `FLAG_THRESHOLD`, `SEED_SAMPLES`, `CORS_ORIGINS`, `FRONTEND_DIST` — see `.env.example`.

> Community reports are unverified and shared for awareness. SatarkSetu is not a government or law-enforcement service. If you have lost money, call **1930** or report at **cybercrime.gov.in** as soon as possible.
