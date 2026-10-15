"""Settings, all overridable with environment variables (see .env.example)."""
from __future__ import annotations

import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")

# A relative DATA_DIR always resolves against the project root, never the folder
# the server happens to be started from.
_data_dir = Path(os.getenv("DATA_DIR") or "data")
DATA_DIR = _data_dir if _data_dir.is_absolute() else (ROOT / _data_dir).resolve()
DB_FILE = DATA_DIR / "satarksetu.db"
SCRIPTS_DIR = ROOT / "scripts"
_dist = Path(os.getenv("FRONTEND_DIST") or ROOT / "frontend" / "dist")
FRONTEND_DIST = _dist if _dist.is_absolute() else (ROOT / _dist).resolve()

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
FLAG_THRESHOLD = int(os.getenv("FLAG_THRESHOLD", "5"))
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")
TRUST_PROXY = os.getenv("TRUST_PROXY", "").strip() not in ("", "0", "false")
SEED_SAMPLES = os.getenv("SEED_SAMPLES", "").lower() == "true"
CORS_ORIGINS = [o for o in os.getenv("CORS_ORIGINS", "").split(",") if o]

# Used to hash voter IPs. Set VOTE_SECRET in production so it survives redeploys;
# otherwise one is generated once and kept in the database.
VOTE_SECRET = os.getenv("VOTE_SECRET", "")


def generated_secret() -> str:
    return secrets.token_hex(32)
