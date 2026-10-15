"""Rate limiting, anonymous voter identity and moderator authentication."""
from __future__ import annotations

import hashlib
import hmac
import secrets
import threading
import time

from fastapi import Header, HTTPException, Request

from . import config, database

_VOTE_SECRET = ""


def vote_secret() -> str:
    global _VOTE_SECRET
    if not _VOTE_SECRET:
        _VOTE_SECRET = config.VOTE_SECRET or database.get_secret("vote_secret", config.generated_secret)
    return _VOTE_SECRET


def client_ip(request: Request) -> str:
    """Behind a hosting proxy set TRUST_PROXY=1 so each visitor's own IP is used."""
    if config.TRUST_PROXY:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def voter_id(request: Request, report_id: str) -> str:
    """Keyed hash per report: votes can't be linked across reports or turned back into an IP."""
    message = f"{client_ip(request)}|{report_id}".encode()
    return hmac.new(vote_secret().encode(), message, hashlib.sha256).hexdigest()


class RateLimiter:
    """Fixed window per IP, kept in memory only — raw IPs are never written to disk."""

    def __init__(self, window_seconds: int, max_requests: int, message: str):
        self.window = window_seconds
        self.max = max_requests
        self.message = message
        self._hits: dict[str, tuple[float, int]] = {}
        self._lock = threading.Lock()

    def __call__(self, request: Request) -> None:
        now = time.monotonic()
        key = client_ip(request)
        with self._lock:
            if len(self._hits) > 10_000:
                self._hits = {k: v for k, v in self._hits.items() if now - v[0] <= self.window}
            start, count = self._hits.get(key, (now, 0))
            if now - start > self.window:
                start, count = now, 0
            count += 1
            self._hits[key] = (start, count)
        if count > self.max:
            raise HTTPException(status_code=429, detail=self.message)


_submit_limiter = RateLimiter(10 * 60, 10, "Too many reports from your network. Please wait a few minutes.")
_vote_limiter = RateLimiter(60, 40, "Slow down a little and try again.")
_admin_limiter = RateLimiter(10 * 60, 100, "Too many attempts.")


# Plain functions, because FastAPI reads type hints off the dependency itself.
def submit_limit(request: Request) -> None:
    _submit_limiter(request)


def vote_limit(request: Request) -> None:
    _vote_limiter(request)


def require_admin(request: Request, authorization: str = Header(default="")) -> None:
    _admin_limiter(request)
    if not config.ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Moderation is disabled. Set ADMIN_TOKEN on the server to enable it.")
    given = authorization.removeprefix("Bearer ").removeprefix("bearer ").strip()
    if not secrets.compare_digest(given, config.ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid admin token.")


_auth_limiter = RateLimiter(60, 20, "Too many login attempts. Please wait a minute and try again.")


def auth_limit(request: Request) -> None:
    _auth_limiter(request)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100_000).hex()
    return f"{salt}${derived}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        if "$" not in stored_hash:
            return False
        salt, derived = stored_hash.split("$", 1)
        test_derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100_000).hex()
        return secrets.compare_digest(derived, test_derived)
    except Exception:
        return False


def generate_session_token() -> str:
    return secrets.token_urlsafe(32)


def require_user(request: Request, authorization: str = Header(default="")) -> dict:
    token = authorization.removeprefix("Bearer ").removeprefix("bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required.")
    user = database.get_user_by_session(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please sign in.")
    return user
