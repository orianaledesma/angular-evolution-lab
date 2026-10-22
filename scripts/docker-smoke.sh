#!/usr/bin/env sh
# Builds the image, runs it and checks the SPA fallback, static data and health endpoint.
set -eu
IMAGE="${IMAGE:-angular-evolution-lab:local}"
PORT="${PORT:-8080}"
docker build -t "$IMAGE" .
CID=$(docker run -d -p "$PORT:8080" "$IMAGE")
trap 'docker rm -f "$CID" >/dev/null' EXIT
for i in $(seq 1 20); do curl -fsS "http://localhost:$PORT/healthz" >/dev/null 2>&1 && break; sleep 1; done
check() { code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$1"); [ "$code" = "200" ] || { echo "✖ $1 → $code"; exit 1; }; echo "✔ $1 → 200"; }
check /healthz
check /
check /v22                       # client route → index.html fallback
check /mock-api/vehicles.json
check /i18n/de.json
check /i18n/lt.json
curl -fsS "http://localhost:$PORT/v19" | grep -q '<app-root' && echo '✔ fallback serves the app shell'
curl -fsSI "http://localhost:$PORT/" | grep -qi 'content-security-policy' && echo '✔ security headers present'
