"""Public API: reports, stories, the scam checker, stats and official advisories."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from . import config, database
from .aliases import random_alias
from .schemas import ReportIn
from .security import submit_limit, vote_limit, voter_id
from .validation import REPORT_TYPES, TYPES, clean, detect_type, normalize_identifier, validate_report

router = APIRouter()


@router.get("/health", summary="Health check for hosting platforms")
def health():
    return {"ok": database.ping()}


@router.get("/reports", summary="List community reports")
def list_reports(
    type: str = Query("", description="alerts | phishing | website | phone | upi | story"),
    q: str = Query("", max_length=100),
    sort: str = Query("recent", pattern="^(recent|confirmed)$"),
    limit: int = Query(12, ge=1, le=50),
    offset: int = Query(0, ge=0),
):
    kind = clean(type, 20)
    return database.list_reports(kind if kind == "alerts" or kind in TYPES else None, clean(q, 100), sort, limit, offset)


@router.get("/reports/{report_id}", summary="One report, with other reports of the same identifier")
def get_report(report_id: str):
    report = database.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return {"report": report, "related": database.related_reports(report)}


@router.post("/reports", status_code=201, summary="Submit a report or an anonymous story")
def create_report(body: ReportIn, _: None = Depends(submit_limit)):
    report, errors = validate_report(body.model_dump())
    if errors:
        raise HTTPException(status_code=400, detail={"error": "Please fix the highlighted fields.", "details": errors})
    saved = database.insert_report(report, random_alias(), str(uuid.uuid4()))
    return {"report": saved}


def _vote(request: Request, report_id: str, kind: str):
    result = database.vote(report_id, kind, voter_id(request, report_id), config.FLAG_THRESHOLD)
    if result is None:
        raise HTTPException(status_code=404, detail="Report not found.")
    if result is False:
        raise HTTPException(status_code=409, detail=f"You already {'confirmed' if kind == 'confirm' else 'flagged'} this report.")
    return result


@router.post("/reports/{report_id}/confirm", summary="I got this scam too")
def confirm(request: Request, report_id: str, _: None = Depends(vote_limit)):
    return _vote(request, report_id, "confirm")


@router.post("/reports/{report_id}/flag", summary="Flag a wrong or abusive report")
def flag(request: Request, report_id: str, _: None = Depends(vote_limit)):
    return _vote(request, report_id, "flag")


@router.get("/lookup", summary="Check a number, UPI ID, website or email against reports")
def lookup(value: str = Query("", max_length=500)):
    value = clean(value, 500)
    if not value:
        raise HTTPException(status_code=400, detail="Enter something to check.")

    detected = detect_type(value)
    candidates = [detected] if detected else list(REPORT_TYPES)
    kind = normalized = None
    matches: list[dict] = []
    for candidate in candidates:
        canonical = normalize_identifier(candidate, value)
        if not canonical:
            continue
        kind = kind or candidate
        normalized = normalized or canonical
        found = database.lookup(candidate, canonical)
        if found:
            kind, normalized, matches = candidate, canonical, found
            break

    signal = sum(1 + m["confirmations"] for m in matches)
    risk = "unknown" if signal == 0 else "high" if signal >= 5 else "caution"
    return {"value": value, "type": kind, "normalized": normalized, "risk": risk, "signal": signal, "matches": matches}


@router.get("/stats", summary="Community totals")
def stats():
    return database.stats()


@router.get("/advisories", summary="Official government advisories and national figures")
def advisories(type: str = Query("", description="Filter by report type")):
    kind = clean(type, 20)
    return {"items": database.advisories(kind if kind in TYPES else None), "national": database.national_stats()}
