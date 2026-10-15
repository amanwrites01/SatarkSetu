# 1) Build the React frontend
FROM node:24-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2) Python backend serving the built frontend
FROM python:3.13-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 PORT=8080 DATA_DIR=/data FRONTEND_DIST=/app/frontend/dist

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY scripts/ ./scripts/
COPY --from=web /web/dist ./frontend/dist

RUN mkdir -p /data && useradd -m app && chown -R app /data /app
USER app
VOLUME /data
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8080/api/health').status==200 else 1)"

WORKDIR /app/backend
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
