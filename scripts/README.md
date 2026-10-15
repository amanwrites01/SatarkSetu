# Database scripts

Everything needed to recreate the SatarkSetu database from scratch. Share this folder and anyone can stand up an identical database.

The database is **SQLite** — a single file, `data/satarksetu.db`. No database server to install.

| File | What it does |
|---|---|
| `001_schema.sql` | All tables, indexes and views. Safe to re-run |
| `002_advisories.sql` | Official government advisories + national fraud-report figures. Safe to re-run; replaces existing rows |
| `003_sample_reports.sql` | **Optional** demo reports using placeholder identifiers. Skip for a real deployment |
| `manage.py` | Command-line tool for the tasks below |

## Usage

```bash
python3 scripts/manage.py init            # create the database + load advisories
python3 scripts/manage.py samples         # optional: add demo reports
python3 scripts/manage.py stats           # what's stored right now
python3 scripts/manage.py backup [file]   # consistent snapshot, safe while running
python3 scripts/manage.py export [dir]    # dump reports to JSON + CSV
python3 scripts/manage.py reset --yes     # delete everything and start over
```

`manage.py` needs only the Python standard library. Set `DATA_DIR` to use a different folder:

```bash
DATA_DIR=/var/data python3 scripts/manage.py init
```

Or use plain SQLite, without Python:

```bash
sqlite3 data/satarksetu.db < scripts/001_schema.sql
sqlite3 data/satarksetu.db < scripts/002_advisories.sql
```

## Tables

- **`reports`** — community reports and anonymous stories. `status` is `published`, `hidden` (auto-hidden after `FLAG_THRESHOLD` flags) or `removed`. Type-specific extras (brand, channel, city, subject, link, claim, app, pretext, category, lesson) live in the `details` JSON column.
- **`votes`** — one confirm/flag per person per report. `voter` is `HMAC-SHA256(VOTE_SECRET, ip|report_id)`, so **raw IP addresses are never stored**.
- **`advisories`** — official advisories, reloaded from `002_advisories.sql` every time the backend starts. Edit that file to add one.
- **`national_stats`** — suspected fraud communications reported on DoT's Chakshu facility, by category and year.
- **`meta`** — schema version and the generated vote secret.
- Views: **`v_public_reports`** (published reports only) and **`v_report_counts`**.

## Where the advisory data comes from

Each row in `002_advisories.sql` carries its `source_url`. Sources: PIB press releases from MHA/I4C, TRAI, DoT, RBI and India Post, plus Chakshu figures from a Rajya Sabha reply (PIB, 5 Feb 2026).

## Poking around

```bash
sqlite3 data/satarksetu.db "SELECT type, identifier, confirmations FROM v_public_reports;"
sqlite3 data/satarksetu.db "SELECT issuer, title FROM advisories ORDER BY published DESC;"
```
