"""SatarkSetu API — FastAPI + SQLite.

Run locally:  uvicorn app.main:app --reload --port 8000   (from the backend/ folder)
Interactive API docs: http://localhost:8000/api/docs
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from . import config, database
from .routes_admin import router as admin_router
from .routes_auth import router as auth_router
from .routes_public import router as public_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    database.init_db()
    print(f"SatarkSetu API ready · database: {config.DB_FILE}")
    if not config.ADMIN_TOKEN:
        print("Moderation disabled (set ADMIN_TOKEN to enable /admin).")
    yield


app = FastAPI(
    title="SatarkSetu API",
    description="Community scam alert portal: phishing emails, fake websites, scam numbers, fake UPI requests and anonymous stories.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url=None,
    openapi_url="/api/openapi.json",
)

if config.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGINS,
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["Content-Type", "Authorization"],
    )


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.update({
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "X-Frame-Options": "DENY",
    })
    return response


# The browser expects {"error": "...", "details": {...}} for every failure.
@app.exception_handler(StarletteHTTPException)
async def http_error(_request: Request, exc: StarletteHTTPException):
    detail = exc.detail
    body = detail if isinstance(detail, dict) and "error" in detail else {"error": detail if isinstance(detail, str) else "Request failed."}
    return JSONResponse(status_code=exc.status_code, content=body)


@app.exception_handler(RequestValidationError)
async def validation_error(_request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=400, content={"error": "Invalid request.", "details": {str(e["loc"][-1]): e["msg"] for e in exc.errors()}})


app.include_router(public_router, prefix="/api", tags=["public"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/admin", tags=["moderation"])


@app.get("/api/{path:path}", include_in_schema=False)
def api_not_found(path: str):
    return JSONResponse(status_code=404, content={"error": "Not found."})


# In production the built React app is served from the same origin.
if config.FRONTEND_DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=config.FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        candidate = (config.FRONTEND_DIST / full_path).resolve()
        if full_path and candidate.is_file() and candidate.is_relative_to(config.FRONTEND_DIST.resolve()):
            return FileResponse(candidate)
        return FileResponse(config.FRONTEND_DIST / "index.html", headers={"Cache-Control": "no-cache"})
