"""Input cleaning, identifier normalisation and report validation.

`normalize_identifier` produces the canonical form used to match repeat reports of the
same scammer, so '+91 98765 43210' and '098765 43210' are recognised as one number.
"""
from __future__ import annotations

import re
from urllib.parse import urlsplit

TYPES = ("phishing", "website", "phone", "upi", "story")
REPORT_TYPES = ("phishing", "website", "phone", "upi")

CONTROL_CHARS = re.compile(r"[\x00-\x1f\x7f]")
EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
UPI = re.compile(r"^[a-z0-9._-]{2,256}@[a-z0-9]{2,64}$", re.I)
PHONE_LIKE = re.compile(r"^\+?[\d\s()-]{7,20}$")
SITE_LIKE = re.compile(r"^(https?://)?[^\s/]+\.[a-z]{2,}", re.I)

FIELD_LIMITS = {
    "brand": 80, "channel": 40, "city": 60, "subject": 200, "link": 500,
    "claim": 120, "app": 40, "pretext": 120, "category": 40, "lesson": 600,
}

IDENTIFIER_ERRORS = {
    "phishing": "Enter a valid sender email address.",
    "website": "Enter a valid website address.",
    "phone": "Enter a valid phone number (7–15 digits).",
    "upi": "Enter a valid UPI ID, e.g. name@bank.",
}


def clean(value, max_length: int = 500) -> str:
    if not isinstance(value, str):
        return ""
    return CONTROL_CHARS.sub("", value).strip()[:max_length]


def normalize_identifier(kind: str, raw) -> str | None:
    value = clean(raw, 500)
    if not value:
        return None
    if kind == "phishing":
        return value.lower() if EMAIL.match(value) else None
    if kind == "website":
        candidate = value if re.match(r"^https?://", value, re.I) else f"https://{value}"
        host = (urlsplit(candidate).hostname or "").lower()
        host = re.sub(r"^www\.", "", host)
        return host if "." in host else None
    if kind == "phone":
        digits = re.sub(r"\D", "", value)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        elif len(digits) == 11 and digits.startswith("0"):
            digits = digits[1:]
        return digits if 7 <= len(digits) <= 15 else None
    if kind == "upi":
        return value.lower() if UPI.match(value) else None
    return None


def detect_type(value) -> str | None:
    """Best guess at what someone pasted into the scam checker."""
    v = clean(value, 500)
    if EMAIL.match(v):
        return "phishing"
    if UPI.match(v):
        return "upi"
    if PHONE_LIKE.match(v):
        return "phone"
    if SITE_LIKE.match(v):
        return "website"
    return None


def redact(text: str) -> str:
    """Stories are anonymous: strip anything that looks like contact details."""
    text = re.sub(r"[^\s@]+@[^\s@]+\.[^\s@]+", "[email hidden]", text)
    return re.sub(r"\+?\d[\d\s-]{8,}\d", "[number hidden]", text)


def validate_report(body: dict) -> tuple[dict | None, dict | None]:
    """Returns (report, errors). `report` is ready to store; `errors` maps field -> message."""
    errors: dict[str, str] = {}
    kind = clean(body.get("type"), 20)
    if kind not in TYPES:
        return None, {"type": "Unknown report type."}

    report: dict = {"type": kind, "details": {}}
    for field, limit in FIELD_LIMITS.items():
        value = clean(body.get(field), limit)
        if value:
            report["details"][field] = value

    description = clean(body.get("description"), 5000)
    min_length = 40 if kind == "story" else 15
    if len(description) < min_length:
        errors["description"] = f"Please write at least {min_length} characters."
    report["description"] = description

    amount = body.get("amount")
    if amount not in (None, "", []):
        try:
            number = float(amount)
            if number < 0 or number > 1e10:
                raise ValueError
            report["amount"] = round(number)
        except (TypeError, ValueError):
            errors["amount"] = "Enter a valid amount."

    if kind == "story":
        title = clean(body.get("title"), 120)
        if len(title) < 5:
            errors["title"] = "Give your story a short title (5+ characters)."
        report["title"] = redact(title)
        report["description"] = redact(report["description"])
        if "lesson" in report["details"]:
            report["details"]["lesson"] = redact(report["details"]["lesson"])
    else:
        identifier = clean(body.get("identifier"), 500)
        normalized = normalize_identifier(kind, identifier)
        if not normalized:
            errors["identifier"] = IDENTIFIER_ERRORS[kind]
        report["identifier"] = identifier
        report["normalized"] = normalized

    return (None, errors) if errors else (report, None)
