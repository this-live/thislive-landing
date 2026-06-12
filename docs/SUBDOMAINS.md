# Per-pillar subdomains — `x.this.live`

Wire each Cortex-suite pillar to its own subdomain so the standalone product page
served at `/<pillar>/` is reachable at `https://<pillar>.this.live`:

| Subdomain               | Serves the page         | Pillar             |
| ----------------------- | ----------------------- | ------------------ |
| `cortex.this.live`      | `/cortex/index.html`    | Cortex             |
| `maestro.this.live`     | `/maestro/index.html`   | Maestro            |
| `mnemos.this.live`      | `/mnemos/index.html`    | Mnemos             |
| `fabric.this.live`      | `/fabric/index.html`    | Agent Fabric       |
| `surfaces.this.live`    | `/surfaces/index.html`  | Surfaces           |
| `forge.this.live`       | `/forge/index.html`     | Forge              |

Status: **serving model implemented + verified in-repo. Live DNS/Railway custom
domains NOT yet configured** — those require console/CLI access (see "Blocked",
bottom). Once the 12 records below exist, every subdomain serves its pillar page
with zero code changes.

---

## 1. Serving model — one service, Host-routed (chosen)

**Decision: Option (a) — a single Railway service (nginx static), all six
subdomains attached as custom domains on that one service, with a tiny Host-based
nginx rule that serves the right pillar page at `/` per `Host` header.**

Why this over per-pillar Railway services (option b):

- The six pillar pages **already exist** as `/<pillar>/index.html` in this one
  static tree. There is nothing to split out.
- Every pillar page references its assets by **absolute root path**
  (`/design-system.css`, `/pillar.css`, `/fonts/…`, `/favicon.png`), so those
  resolve identically no matter which `Host` is serving — no per-host asset
  rewriting needed.
- One service = one deploy, one build, one cost line. Six services would
  duplicate the whole repo six times and sextuple the deploy surface for content
  that is already unified.
- Cloudflare already fronts the apex (`this.live`) and existing product
  subdomains (`maestro.this.live`, `beacon.this.live` resolve through Cloudflare
  today), so adding six more proxied CNAMEs is the established pattern.

> Note: `maestro.this.live` and `beacon.this.live` currently resolve to **separate
> live products**, not this landing repo. Pointing `maestro.this.live` at this
> landing service (per the table above) will move it to the Maestro **pillar
> landing page**. Confirm with Bryce before repointing `maestro` if the existing
> Maestro app must keep that host — otherwise use a different host (e.g.
> `maestro-pillar.this.live`) or leave `maestro` out of the batch. The other five
> (`cortex/mnemos/fabric/surfaces/forge`) are unused today and safe to add.

### The Host-routing rule (already in `nginx.conf`)

```nginx
map $host $pillar_home {
    default                 "/index.html";   # apex / www / unknown -> umbrella
    cortex.this.live        "/cortex/index.html";
    maestro.this.live       "/maestro/index.html";
    mnemos.this.live        "/mnemos/index.html";
    fabric.this.live        "/fabric/index.html";
    surfaces.this.live      "/surfaces/index.html";
    forge.this.live         "/forge/index.html";
}

server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;

    location = / {                       # ONLY the bare "/" request
        try_files $pillar_home /index.html =404;
    }
    location / {                         # assets, /blog/, /maestro/, deep pages
        try_files $uri $uri/ /index.html;
    }
}
```

Behavior:

- `https://cortex.this.live/` → serves `/cortex/index.html` at a clean URL.
- `https://this.live/` and `https://www.this.live/` → the umbrella, unchanged.
- Assets and deep paths (`/design-system.css`, `/blog/`, `/resume.html`, and
  cross-pillar nav like `/maestro/`) fall through the catch-all `location /` and
  serve normally from any Host.

Also shipped in this change: `Dockerfile` now runs `chmod -R a+rX
/usr/share/nginx/html`. The source `index.html` is mode `0600` on disk; the
unprivileged nginx worker could not read it, so the apex was returning **403**
(a pre-existing bug, independent of subdomains). Normalizing read perms at build
time fixes the apex and makes serving robust to any host-side file mode.

### Verification (done locally against the Docker image)

Built the image and curled with spoofed `Host` headers:

- All six `*.this.live/` → **200**, each returning its own `<title>` (Cortex,
  Maestro, Mnemos, Agent Fabric, Surfaces, Forge).
- `this.live/` and `www.this.live/` → **200**, the umbrella (the 403 is fixed).
- Assets on a pillar host (`/design-system.css`, `/pillar.css`, `/favicon.png`,
  `/fonts/inter-400.woff2`) → **200**.
- Cross-pillar nav (`/maestro/` on the cortex host), deep pages (`/blog/`,
  `/resume.html`), and the SPA fallback → **200**.

---

## 2. Exact records to create

Two systems, two records per subdomain (a Railway custom domain + a Cloudflare
CNAME). Do all six.

### 2a. Railway — add custom domains to the existing service

In the Railway project for this service (`thislive-landing`, the service that
already serves `this.live`):

**Service → Settings → Networking → Custom Domain → + Add Domain**, once per host:

```
cortex.this.live
maestro.this.live      # see the maestro caveat in §1 before adding
mnemos.this.live
fabric.this.live
surfaces.this.live
forge.this.live
```

Railway will display a **CNAME target** for each (the same value the apex already
uses — typically `<id>.up.railway.app`, or a shared edge host). **Copy the exact
target Railway shows** — it is the `<TARGET>` for the Cloudflare records below. Do
not invent it; read it from Railway, because it is masked behind Cloudflare's
proxy and cannot be discovered by DNS lookup.

Equivalent CLI (once `railway login` is done and the project is linked):

```bash
railway link            # select the thislive-landing project + service
for h in cortex maestro mnemos fabric surfaces forge; do
  railway domain "$h.this.live"
done
railway domain          # prints each domain + its CNAME target
```

### 2b. Cloudflare — one CNAME per subdomain

DNS for `this.live` is on Cloudflare (nameservers `robert.ns.cloudflare.com`,
`rosa.ns.cloudflare.com`). In **Cloudflare → this.live → DNS → Records → + Add
record**, create six CNAMEs using the `<TARGET>` Railway gave you in §2a:

| Type  | Name (host)   | Target                | Proxy        | TTL  |
| ----- | ------------- | --------------------- | ------------ | ---- |
| CNAME | `cortex`      | `<TARGET>` from §2a   | Proxied (🟠) | Auto |
| CNAME | `maestro`     | `<TARGET>` from §2a   | Proxied (🟠) | Auto |
| CNAME | `mnemos`      | `<TARGET>` from §2a   | Proxied (🟠) | Auto |
| CNAME | `fabric`      | `<TARGET>` from §2a   | Proxied (🟠) | Auto |
| CNAME | `surfaces`    | `<TARGET>` from §2a   | Proxied (🟠) | Auto |
| CNAME | `forge`       | `<TARGET>` from §2a   | Proxied (🟠) | Auto |

Notes:

- **Proxied (orange cloud)** matches the apex and existing subdomains, which all
  resolve to Cloudflare proxy IPs (`104.21.76.65`, `172.67.190.238`) today.
- Cloudflare SSL/TLS mode must stay **Full** (or Full strict) so the
  Cloudflare→Railway hop uses HTTPS — same as the working apex.
- If Railway shows a TXT/ACME verification record per domain, add those TXT
  records too (Cloudflare DNS) so Railway can issue the cert.

Equivalent CLI (Cloudflare API; needs a token with `Zone:DNS:Edit` on this zone):

```bash
ZONE_ID="<this.live zone id>"          # Cloudflare → this.live → Overview
TARGET="<TARGET from Railway §2a>"
for h in cortex maestro mnemos fabric surfaces forge; do
  curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"CNAME\",\"name\":\"$h\",\"content\":\"$TARGET\",\"proxied\":true,\"ttl\":1}"
done
```

---

## 3. Order of operations + verification

1. Add the six custom domains in Railway first (§2a) and copy each CNAME target
   (they will share one target for one service).
2. Create the six Cloudflare CNAMEs (§2b) pointing at that target.
3. Wait for Railway to show each domain as **issued/verified** (cert provisioned).
4. Verify each host serves its pillar page:

```bash
for h in cortex maestro mnemos fabric surfaces forge; do
  echo "== $h.this.live =="
  curl -sS -o /dev/null -w '  HTTP %{http_code}\n' "https://$h.this.live/"
  curl -sS "https://$h.this.live/" | grep -oE '<title>[^<]*</title>' | head -1
done
# expect 200 + the matching pillar <title> for each
```

Because the routing rule is already deployed in `nginx.conf`, **no code change or
redeploy is needed when the DNS lands** — the page appears the moment the cert is
issued and the CNAME resolves.

---

## Blocked — needs Bryce (console/CLI access not available to the agent)

The agent attempted auto-config but the credentials were not present:

- **Railway CLI: not authenticated** (`railway whoami` → "Unauthorized. Please
  login"; no `~/.railway/config.json`). Cannot add custom domains or read the
  CNAME target.
- **Cloudflare: no credentials** — `wrangler`/`cloudflared` not installed and no
  `CF_API_TOKEN`/`CLOUDFLARE_API_TOKEN` in the environment. Cannot create DNS
  records.

Per the deploy rules, the agent did **not** guess at live DNS. Bryce (or a node
with creds) needs to:

1. `railway login` (or use the Railway dashboard) → add the six custom domains to
   the `thislive-landing` service and read the CNAME target.
2. In Cloudflare → `this.live` → DNS, add the six proxied CNAMEs to that target
   (plus any Railway ACME TXT records).
3. Decide the **`maestro.this.live` caveat** (§1): repoint it to this landing's
   Maestro pillar page, or keep the existing live Maestro app on that host and use
   an alternate host for the pillar page.
