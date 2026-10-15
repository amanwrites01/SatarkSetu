"""SQLite access layer. The schema and reference data live in /scripts as plain SQL."""
from __future__ import annotations

import json
import sqlite3
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path

from . import config
from .validation import TYPES

_local = threading.local()
_write_lock = threading.Lock()

DETAIL_KEYS = ("brand", "channel", "city", "subject", "link", "claim", "app", "pretext", "category", "lesson")


def connect() -> sqlite3.Connection:
    """One connection per thread; SQLite handles concurrent readers itself."""
    conn = getattr(_local, "conn", None)
    if conn is None:
        config.DATA_DIR.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(config.DB_FILE, timeout=10, isolation_level=None)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode = WAL")
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("PRAGMA busy_timeout = 5000")
        _local.conn = conn
    return conn


def _run_script(conn: sqlite3.Connection, name: str) -> None:
    path = config.SCRIPTS_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"missing database script: {path}")
    conn.executescript(path.read_text(encoding="utf-8"))


def init_db() -> None:
    """Applies scripts/001_schema.sql and reloads the official advisories on every start."""
    conn = connect()
    with _write_lock:
        _run_script(conn, "001_schema.sql")
        _run_script(conn, "002_advisories.sql")
        if config.SEED_SAMPLES:
            _run_script(conn, "003_sample_reports.sql")


def get_secret(key: str, default_factory) -> str:
    conn = connect()
    with _write_lock:
        row = conn.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
        if row:
            return row["value"]
        value = default_factory()
        conn.execute("INSERT INTO meta (key, value) VALUES (?, ?)", (key, value))
        return value


# ---------- row <-> API shapes ----------

def to_public(row: sqlite3.Row, admin: bool = False) -> dict:
    data = {
        "id": row["id"],
        "type": row["type"],
        **json.loads(row["details"] or "{}"),
        "description": row["description"],
        "alias": row["alias"],
        "confirmations": row["confirmations"],
        "demo": bool(row["demo"]),
        "createdAt": row["created_at"],
    }
    for key in ("identifier", "normalized", "title", "amount"):
        if row[key] is not None:
            data[key] = row[key]
    if admin:
        data["flags"] = row["flags"]
        data["status"] = row["status"]
    return data


def insert_report(report: dict, alias: str, report_id: str) -> dict:
    conn = connect()
    with _write_lock:
        conn.execute(
            """INSERT INTO reports (id, type, identifier, normalized, title, description, details, amount,
                                    alias, confirmations, flags, status, demo, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'published', 0, ?)""",
            (
                report_id, report["type"], report.get("identifier"), report.get("normalized"), report.get("title"),
                report["description"], json.dumps(report.get("details", {}), ensure_ascii=False), report.get("amount"),
                alias, datetime.now(timezone.utc).isoformat(),
            ),
        )
    return get_report(report_id)


def get_report(report_id: str) -> dict | None:
    row = connect().execute("SELECT * FROM reports WHERE id = ? AND status = 'published'", (report_id,)).fetchone()
    return to_public(row) if row else None


def related_reports(report: dict) -> list[dict]:
    if not report.get("normalized"):
        return []
    rows = connect().execute(
        """SELECT * FROM reports WHERE type = ? AND normalized = ? AND id != ? AND status = 'published'
           ORDER BY created_at DESC LIMIT 12""",
        (report["type"], report["normalized"], report["id"]),
    ).fetchall()
    return [to_public(r) for r in rows]


def list_reports(kind: str | None, query: str, sort: str, limit: int, offset: int, status: str = "published") -> dict:
    where, params = [], []
    if status != "all":
        where.append("status = ?")
        params.append(status)
    if kind == "alerts":
        where.append("type != 'story'")
    elif kind in TYPES:
        where.append("type = ?")
        params.append(kind)
    if query:
        where.append(
            "(identifier LIKE ? ESCAPE '\\' OR normalized LIKE ? ESCAPE '\\' OR title LIKE ? ESCAPE '\\' "
            "OR description LIKE ? ESCAPE '\\' OR details LIKE ? ESCAPE '\\')"
        )
        pattern = "%" + query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
        params.extend([pattern] * 5)
    clause = f"WHERE {' AND '.join(where)}" if where else ""
    order = {
        "confirmed": "confirmations DESC, created_at DESC",
        "flagged": "flags DESC, created_at DESC",
    }.get(sort, "created_at DESC")

    conn = connect()
    total = conn.execute(f"SELECT COUNT(*) AS n FROM reports {clause}", params).fetchone()["n"]
    rows = conn.execute(
        f"SELECT * FROM reports {clause} ORDER BY {order} LIMIT ? OFFSET ?", [*params, limit, offset]
    ).fetchall()
    return {"total": total, "items": [to_public(r, admin=status != "published") for r in rows]}


def lookup(kind: str, normalized: str) -> list[dict]:
    rows = connect().execute(
        "SELECT * FROM reports WHERE type = ? AND normalized = ? AND status = 'published' ORDER BY confirmations DESC",
        (kind, normalized),
    ).fetchall()
    return [to_public(r) for r in rows]


def vote(report_id: str, kind: str, voter: str, flag_threshold: int):
    """Returns None if the report is missing, False if this voter already voted, else the new state."""
    conn = connect()
    with _write_lock:
        conn.execute("BEGIN IMMEDIATE")
        try:
            row = conn.execute("SELECT id FROM reports WHERE id = ? AND status = 'published'", (report_id,)).fetchone()
            if row is None:
                conn.execute("ROLLBACK")
                return None
            inserted = conn.execute(
                "INSERT OR IGNORE INTO votes (report_id, kind, voter, created_at) VALUES (?, ?, ?, ?)",
                (report_id, kind, voter, datetime.now(timezone.utc).isoformat()),
            ).rowcount
            if not inserted:
                conn.execute("ROLLBACK")
                return False
            if kind == "confirm":
                conn.execute("UPDATE reports SET confirmations = confirmations + 1 WHERE id = ?", (report_id,))
                count = conn.execute("SELECT confirmations FROM reports WHERE id = ?", (report_id,)).fetchone()["confirmations"]
                result = {"confirmations": count}
            else:
                conn.execute(
                    """UPDATE reports SET flags = flags + 1,
                       status = CASE WHEN flags + 1 >= ? THEN 'hidden' ELSE status END WHERE id = ?""",
                    (flag_threshold, report_id),
                )
                result = {"ok": True}
            conn.execute("COMMIT")
            return result
        except Exception:
            conn.execute("ROLLBACK")
            raise


def set_status(report_id: str, status: str) -> bool:
    conn = connect()
    with _write_lock:
        return conn.execute("UPDATE reports SET status = ? WHERE id = ?", (status, report_id)).rowcount > 0


def delete_report(report_id: str) -> bool:
    conn = connect()
    with _write_lock:
        return conn.execute("DELETE FROM reports WHERE id = ?", (report_id,)).rowcount > 0


def stats() -> dict:
    conn = connect()
    by_type = {t: 0 for t in TYPES}
    for row in conn.execute("SELECT type, COUNT(*) AS n FROM reports WHERE status = 'published' GROUP BY type"):
        by_type[row["type"]] = row["n"]
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    agg = conn.execute(
        """SELECT COUNT(*) AS total, COALESCE(SUM(confirmations), 0) AS confirmations,
                  COALESCE(SUM(created_at >= ?), 0) AS last_week FROM reports WHERE status = 'published'""",
        (week_ago,),
    ).fetchone()
    return {"total": agg["total"], "byType": by_type, "confirmations": agg["confirmations"], "lastWeek": agg["last_week"]}


def moderation_counts() -> dict:
    return {r["status"]: r["n"] for r in connect().execute("SELECT status, COUNT(*) AS n FROM reports GROUP BY status")}


def advisories(kind: str | None = None) -> list[dict]:
    conn = connect()
    rows = (
        conn.execute("SELECT * FROM advisories WHERE type = ? ORDER BY published DESC", (kind,)).fetchall()
        if kind else conn.execute("SELECT * FROM advisories ORDER BY published DESC").fetchall()
    )
    return [
        {
            "id": r["id"], "type": r["type"], "title": r["title"], "issuer": r["issuer"], "published": r["published"],
            "summary": r["summary"], "tips": json.loads(r["tips"]), "sourceUrl": r["source_url"], "reportUrl": r["report_url"],
        }
        for r in rows
    ]


NATIONAL_SOURCE = {
    "source": "Department of Telecommunications, Chakshu (Sanchar Saathi)",
    "sourceUrl": "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2223779",
    "published": "2026-02-05",
    "note": "2026 figures are partial (reported in early February 2026).",
}


def national_stats() -> dict:
    categories: dict[str, dict[int, int]] = {}
    for row in connect().execute("SELECT category, year, count FROM national_stats ORDER BY category, year"):
        categories.setdefault(row["category"], {})[row["year"]] = row["count"]
    return {**NATIONAL_SOURCE, "categories": categories}


def ping() -> bool:
    return connect().execute("SELECT 1 AS ok").fetchone()["ok"] == 1


# --- User Authentication and Sessions ---

def create_user(user_id: str, email: str, name: str, password_hash: str) -> dict:
    conn = connect()
    now = datetime.now(timezone.utc).isoformat()
    clean_email = email.lower().strip()
    clean_name = name.strip()
    with _write_lock:
        conn.execute(
            "INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, clean_email, clean_name, password_hash, now),
        )
    return {"id": user_id, "email": clean_email, "name": clean_name, "createdAt": now}


def get_user_by_email(email: str) -> dict | None:
    conn = connect()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),)).fetchone()
    if not row:
        return None
    return dict(row)


def get_user_by_id(user_id: str) -> dict | None:
    conn = connect()
    row = conn.execute(
        "SELECT id, email, name, created_at, last_login_at FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()
    if not row:
        return None
    return {
        "id": row["id"],
        "email": row["email"],
        "name": row["name"],
        "createdAt": row["created_at"],
        "lastLoginAt": row["last_login_at"],
    }


def update_last_login(user_id: str) -> None:
    conn = connect()
    now = datetime.now(timezone.utc).isoformat()
    with _write_lock:
        conn.execute("UPDATE users SET last_login_at = ? WHERE id = ?", (now, user_id))


def create_session(user_id: str, token: str, days: int = 30) -> dict:
    conn = connect()
    now = datetime.now(timezone.utc)
    expires = (now + timedelta(days=days)).isoformat()
    with _write_lock:
        conn.execute(
            "INSERT INTO user_sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
            (token, user_id, now.isoformat(), expires),
        )
    return {"token": token, "expiresAt": expires}


def get_user_by_session(token: str) -> dict | None:
    conn = connect()
    now = datetime.now(timezone.utc).isoformat()
    row = conn.execute(
        """SELECT u.id, u.email, u.name, u.created_at, u.last_login_at
           FROM user_sessions s
           JOIN users u ON u.id = s.user_id
           WHERE s.token = ? AND s.expires_at > ?""",
        (token, now),
    ).fetchone()
    if not row:
        return None
    return {
        "id": row["id"],
        "email": row["email"],
        "name": row["name"],
        "createdAt": row["created_at"],
        "lastLoginAt": row["last_login_at"],
    }


def delete_session(token: str) -> bool:
    conn = connect()
    with _write_lock:
        return conn.execute("DELETE FROM user_sessions WHERE token = ?", (token,)).rowcount > 0

