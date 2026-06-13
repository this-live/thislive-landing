#!/usr/bin/env bash
# Regression test for SCRUTINY Tier-3 #17 — the no-slash 522.
#
# Symptom (pre-fix): a request to /<pillar> (no trailing slash) on the
# nginx :8080 origin returned 301 with Location: http://this.live:8080/<pillar>/
# (absolute, leaking the internal :8080 listen port). When Cloudflare followed
# that redirect, it tried to reach this.live:8080 (NOT publicly exposed) and
# returned 522. Apex / and /<pillar>/ worked fine.
#
# Fix: nginx.conf now has `absolute_redirect off; port_in_redirect off;`,
# so the 301 Location is the RELATIVE /<pillar>/, which the Cloudflare proxy
# resolves against the public https://this.live host.
#
# This script:
#   1. Builds the Docker image (same Dockerfile as production)
#   2. Spins two containers: `pre` (baseline before fix) and `fix` (current HEAD)
#   3. Curls /cortex, /maestro, /cortex/, / on each
#   4. Asserts:
#        - pre: Location header is absolute (contains :8080)
#        - fix: Location header is relative (does NOT contain :8080)
#        - fix: following the redirect lands on 200 (not 522)
#   5. Tears down both containers
#
# Run from the repo root:  ./scripts/test_no_slash_redirect.sh
# Exits non-zero on any failure. Uses `docker` (assumed on PATH).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Pick two free ports.
PRE_PORT=18101
FIX_PORT=18102

# Pre-fix baseline nginx config (no absolute_redirect / port_in_redirect knobs).
# Same shape as nginx.conf minus the two new directives.
PRE_CONF="$REPO_ROOT/scripts/_pre-fix-baseline.conf"
PRE_DOCKERFILE="$REPO_ROOT/scripts/_Dockerfile.pre-fix-baseline"
GITIGNORE="$REPO_ROOT/scripts/.gitignore"
GITIGNORE_CREATED=0

cleanup () {
  docker rm -f tllanding-pre tllanding-fix >/dev/null 2>&1 || true
  rm -f "$PRE_CONF" "$PRE_DOCKERFILE"
  # If scripts/.gitignore did not exist before this run, leave no trace.
  if [[ "${GITIGNORE_CREATED:-0}" == "1" ]]; then
    rm -f "$GITIGNORE"
  fi
}
# Register the trap BEFORE we create any test artifacts.
trap cleanup EXIT

cat > "$PRE_CONF" <<'NGX'
map $host $pillar_home {
    default                 "/index.html";
    cortex.this.live        "/cortex/index.html";
    maestro.this.live       "/maestro/index.html";
    mnemos.this.live        "/mnemos/index.html";
    fabric.this.live        "/fabric/index.html";
    surfaces.this.live      "/surfaces/index.html";
    forge.this.live         "/forge/index.html";
}
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    location = / {
        try_files $pillar_home /index.html =404;
    }
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGX

echo "== Build pre-fix baseline image =="
cat > "$PRE_DOCKERFILE" <<DOCKERFILE
FROM nginx:alpine
COPY . /usr/share/nginx/html
RUN chmod -R a+rX /usr/share/nginx/html
COPY scripts/_pre-fix-baseline.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
DOCKERFILE
docker build -t tllanding-pre:test -f "$PRE_DOCKERFILE" . >/dev/null

echo "== Build fix image (current HEAD) =="
docker build -t tllanding-fix:test . >/dev/null

# Belt-and-braces: the test artifacts are real filenames in scripts/, so a
# future `git add -A scripts/` would sweep them. scripts/.gitignore keeps
# them out for the duration of this run, and the cleanup trap removes the
# .gitignore if it didn't exist beforehand (so we don't accidentally commit
# a one-line scripts/.gitignore just because a test ran once).
if [[ ! -f "$GITIGNORE" ]]; then
  GITIGNORE_CREATED=1
  printf "_pre-fix-baseline.conf\n_Dockerfile.pre-fix-baseline\n" > "$GITIGNORE"
elif ! grep -q "^_pre-fix-baseline\.conf$" "$GITIGNORE"; then
  printf "_pre-fix-baseline.conf\n_Dockerfile.pre-fix-baseline\n" >> "$GITIGNORE"
fi

echo "== Start both containers =="
docker run --rm -d --name tllanding-pre -p ${PRE_PORT}:8080 tllanding-pre:test >/dev/null
docker run --rm -d --name tllanding-fix -p ${FIX_PORT}:8080 tllanding-fix:test >/dev/null
sleep 2

PASS=0
FAIL=0
assert () {
  local name="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    echo "  PASS  $name  (got: $actual)"
    PASS=$((PASS+1))
  else
    echo "  FAIL  $name  (expected: $expected, got: $actual)"
    FAIL=$((FAIL+1))
  fi
}

# --- 1) Pre-fix: Location header IS absolute (regression) ---
echo "== pre-fix: /cortex Location header =="
PRE_LOC=$(curl -sI "http://127.0.0.1:${PRE_PORT}/cortex" | tr -d '\r' | awk '/^Location:/ {print $2}')
assert "pre: Location contains :8080 (regression marker)"  "yes"  "$(echo "$PRE_LOC" | grep -q ':8080' && echo yes || echo no)"

# --- 2) Fix: Location header is RELATIVE ---
echo "== fix: /cortex Location header =="
FIX_LOC=$(curl -sI "http://127.0.0.1:${FIX_PORT}/cortex" | tr -d '\r' | awk '/^Location:/ {print $2}')
assert "fix: Location does NOT contain :8080"  "no"  "$(echo "$FIX_LOC" | grep -q ':8080' && echo yes || echo no)"
assert "fix: Location is exactly /cortex/"  "/cortex/"  "$FIX_LOC"

# --- 3) Fix: same for every pillar ---
for p in cortex maestro mnemos fabric surfaces forge; do
  LOC=$(curl -sI "http://127.0.0.1:${FIX_PORT}/${p}" | tr -d '\r' | awk '/^Location:/ {print $2}')
  assert "fix: /${p} → Location: /${p}/"  "/${p}/"  "$LOC"
done

# --- 4) Fix: following the redirect with -L lands on 200, not 522/404 ---
for p in cortex maestro; do
  FINAL=$(curl -sL -o /dev/null -w "%{http_code}" "http://127.0.0.1:${FIX_PORT}/${p}")
  assert "fix: /${p} -L final code is 200"  "200"  "$FINAL"
done

# --- 5) Fix: pillar Host on / serves the pillar page (200) ---
PILLAR_ROOT=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: cortex.this.live" "http://127.0.0.1:${FIX_PORT}/")
assert "fix: Host cortex.this.live on / → 200"  "200"  "$PILLAR_ROOT"

# --- 6) Fix: apex / still 200 (no regression) ---
APEX=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${FIX_PORT}/")
assert "fix: apex / still 200"  "200"  "$APEX"

echo
echo "== Result =="
echo "  PASS: $PASS"
echo "  FAIL: $FAIL"

if [[ "$FAIL" -ne 0 ]]; then
  echo "REGRESSION: SCRUTINY Tier-3 #17 fix has regressed."
  exit 1
fi
echo "OK: SCRUTINY Tier-3 #17 no-slash 522 fix holds."
