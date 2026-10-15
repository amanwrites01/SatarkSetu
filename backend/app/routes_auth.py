"""User Authentication API — Email & Password (no third party or Google account required)."""
from __future__ import annotations

import re
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Request

from . import database
from .schemas import LoginIn, RegisterIn
from .security import (
    auth_limit,
    generate_session_token,
    hash_password,
    require_user,
    verify_password,
)

router = APIRouter()

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_email(email: str) -> str:
    cleaned = email.strip().lower()
    if not EMAIL_REGEX.match(cleaned):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    return cleaned


@router.post("/register", status_code=201, summary="Register with email and password")
def register(body: RegisterIn, _: None = Depends(auth_limit)):
    email = validate_email(body.email)
    password = body.password.strip()
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    existing = database.get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    display_name = (body.name or "").strip() or email.split("@")[0].capitalize()
    pwd_hash = hash_password(password)
    user_id = str(uuid.uuid4())
    user = database.create_user(user_id, email, display_name, pwd_hash)

    token = generate_session_token()
    session = database.create_session(user_id, token)

    return {
        "ok": True,
        "token": session["token"],
        "user": user,
    }


@router.post("/login", summary="Sign in with email and password")
def login(body: LoginIn, _: None = Depends(auth_limit)):
    email = validate_email(body.email)
    password = body.password

    user = database.get_user_by_email(email)
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    database.update_last_login(user["id"])
    token = generate_session_token()
    session = database.create_session(user["id"], token)

    return {
        "ok": True,
        "token": session["token"],
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "createdAt": user["created_at"],
            "lastLoginAt": user["last_login_at"],
        },
    }


@router.get("/me", summary="Current user profile")
def me(current_user: dict = Depends(require_user)):
    return {"user": current_user}


@router.post("/logout", summary="Sign out current session")
def logout(authorization: str = Header(default="")):
    token = authorization.removeprefix("Bearer ").removeprefix("bearer ").strip()
    if token:
        database.delete_session(token)
    return {"ok": True}
