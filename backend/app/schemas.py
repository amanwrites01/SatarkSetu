"""Request bodies. Report fields are validated in validation.py so the browser gets
field-by-field messages, which is why this model accepts loose input."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ReportIn(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=False)

    type: str = ""
    identifier: str | None = None
    title: str | None = None
    description: str | None = None
    amount: float | str | None = None
    brand: str | None = None
    channel: str | None = None
    city: str | None = None
    subject: str | None = None
    link: str | None = None
    claim: str | None = None
    app: str | None = None
    pretext: str | None = None
    category: str | None = None
    lesson: str | None = None


class StatusIn(BaseModel):
    status: Literal["published", "hidden", "removed"] = Field(description="New moderation status")


class RegisterIn(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    email: str = Field(min_length=3, max_length=254, description="User email address")
    password: str = Field(min_length=6, max_length=128, description="User password (min 6 characters)")
    name: str | None = Field(default="", max_length=100, description="Display name or alias")


class LoginIn(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    email: str = Field(min_length=3, max_length=254, description="User email address")
    password: str = Field(min_length=1, max_length=128, description="User password")
