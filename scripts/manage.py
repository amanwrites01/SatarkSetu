#!/usr/bin/env python3
"""SatarkSetu database tool. Run from anywhere:

    python3 scripts/manage.py init            # create/upgrade the database and load advisories
    python3 scripts/manage.py samples         # add illustrative demo reports (optional)
    python3 scripts/manage.py stats           # what's in the database right now
    python3 scripts/manage.py backup [file]   # consistent snapshot copy
    python3 scripts/manage.py export [dir]    # dump reports to JSON + CSV
    python3 scripts/manage.py reset --yes     # DELETE everything and start fresh
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent
ROOT = SCRIPTS_DIR.parent
SCHEMA = SCRIPTS_DIR / "001_schema.sql"
ADVISORIES = SCRIPTS_DIR / "002_advisories.sql"
SAMPLES = SCRIPTS_DIR / "003_sample_reports.sql"


def db_path() -> Path:
    configured = Path(os.environ.get("DATA_DIR") or "data")
    data_dir = configured if configured.is_absolute() else (ROOT / configured).resolve()
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir / "satarksetu.db"


def connect(path: Path | None = None) -> sqlite3.Connection:
    conn = sqlite3.connect(path or db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def run_sql(conn: sqlite3.Connection, sql_file: Path) -> None:
    conn.executescript(sql_file.read_text(encoding="utf-8"))
    conn.commit()
    print(f"applied {sql_file.name}")


def cmd_init(_args) -> None:
    path = db_path()
    with connect(path) as conn:
        run_sql(conn, SCHEMA)
        run_sql(conn, ADVISORIES)
    print(f"database ready at {path}")


def cmd_samples(_args) -> None:
    with connect() as conn:
        run_sql(conn, SAMPLES)
    print("sample reports added (they show as 'Sample' in the app)")


def cmd_stats(_args) -> None:
    with connect() as conn:
        rows = conn.execute(
            "SELECT type, status, COUNT(*) n, COALESCE(SUM(confirmations), 0) c FROM reports GROUP BY type, status ORDER BY type"
        ).fetchall()
        print(f"database: {db_path()}")
        if not rows:
            print("no community reports yet")
        for r in rows:
            print(f"  {r['type']:<9} {r['status']:<10} {r['n']:>5} reports  {r['c']:>6} confirmations")
        for table in ("votes", "advisories", "national_stats"):
            n = conn.execute(f"SELECT COUNT(*) n FROM {table}").fetchone()["n"]
            print(f"  {table:<15} {n:>5} rows")


def cmd_backup(args) -> None:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    dest = Path(args.dest) if args.dest else db_path().parent / "backups" / f"satarksetu-{stamp}.db"
    dest.parent.mkdir(parents=True, exist_ok=True)
    with connect() as src, sqlite3.connect(dest) as out:
        src.backup(out)  # consistent even while the server is running
    print(f"backup written to {dest}")


def cmd_export(args) -> None:
    out_dir = Path(args.dest) if args.dest else db_path().parent / "exports"
    out_dir.mkdir(parents=True, exist_ok=True)
    with connect() as conn:
        reports = [dict(r) for r in conn.execute("SELECT * FROM reports ORDER BY created_at DESC")]
    for r in reports:
        r["details"] = json.loads(r["details"])
    (out_dir / "reports.json").write_text(json.dumps(reports, indent=2, ensure_ascii=False), encoding="utf-8")
    if reports:
        flat = [{**r, "details": json.dumps(r["details"], ensure_ascii=False)} for r in reports]
        with (out_dir / "reports.csv").open("w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=list(flat[0]))
            writer.writeheader()
            writer.writerows(flat)
    print(f"exported {len(reports)} reports to {out_dir}")


def cmd_reset(args) -> None:
    if not args.yes:
        sys.exit("refusing to wipe the database without --yes")
    path = db_path()
    for suffix in ("", "-wal", "-shm"):
        Path(str(path) + suffix).unlink(missing_ok=True)
    print(f"deleted {path}")
    cmd_init(args)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("init", help="create/upgrade the database and load official advisories").set_defaults(func=cmd_init)
    sub.add_parser("samples", help="add illustrative demo reports").set_defaults(func=cmd_samples)
    sub.add_parser("stats", help="show what is stored").set_defaults(func=cmd_stats)
    p = sub.add_parser("backup", help="write a snapshot copy"); p.add_argument("dest", nargs="?"); p.set_defaults(func=cmd_backup)
    p = sub.add_parser("export", help="dump reports to JSON + CSV"); p.add_argument("dest", nargs="?"); p.set_defaults(func=cmd_export)
    p = sub.add_parser("reset", help="delete the database and recreate it"); p.add_argument("--yes", action="store_true"); p.set_defaults(func=cmd_reset)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
