"""Moderator API. Enabled only when ADMIN_TOKEN is set on the server."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from . import database
from .schemas import StatusIn
from .security import require_admin
from .validation import clean

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/reports", summary="List reports awaiting review")
def list_reports(
    status: str = Query("hidden", pattern="^(published|hidden|removed|all)$"),
    q: str = Query("", max_length=100),
    sort: str = Query("flagged", pattern="^(flagged|recent)$"),
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    return {
        **database.list_reports(None, clean(q, 100), sort, limit, offset, status=status),
        "counts": database.moderation_counts(),
    }


@router.post("/reports/{report_id}/status", summary="Publish, hide or remove a report")
def set_status(report_id: str, body: StatusIn):
    if not database.set_status(report_id, body.status):
        raise HTTPException(status_code=404, detail="Report not found.")
    return {"ok": True}


@router.delete("/reports/{report_id}", summary="Permanently delete a report")
def delete_report(report_id: str):
    if not database.delete_report(report_id):
        raise HTTPException(status_code=404, detail="Report not found.")
    return {"ok": True}
