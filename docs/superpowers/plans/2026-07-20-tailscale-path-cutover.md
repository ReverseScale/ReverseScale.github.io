# Tailscale Path Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留旧入口和可恢复配置的前提下，将三个已验证产品增量发布到 Tailscale Funnel `443` 的规范路径。

**Architecture:** 先保存状态并用临时 echo origin 验证路径/头语义，再逐项增加最具体的路径处理器。根路径最后切换；每一步后立即进行公网条件检查。

**Tech Stack:** Tailscale CLI 1.98.9、curl、Django/React browser smoke、shell read-only checks。

## Global Constraints

- 使用 `/Applications/Tailscale.app/Contents/MacOS/Tailscale`。
- 变更前后都保存 `serve status --json` 与 `funnel status --json`。
- 不执行 `serve reset` 或 `funnel reset`。
- 不删除 `8443`、`10000` 处理器。
- 每次只增加或调整一个路径；失败立即停止，不继续叠加变更。

---

### Task 1: Capture a Recoverable Baseline

**Files:**
- Create: the directory printed by `mktemp -d /private/tmp/reversescale-unified-paths.XXXXXX`
- Create: `$BASELINE_DIR/serve-config.json`
- Create: `$BASELINE_DIR/serve-status.json`
- Create: `$BASELINE_DIR/funnel-status.json`
- Create: `$BASELINE_DIR/health.txt`

**Interfaces:**
- Produces: `BASELINE_DIR` containing parseable snapshots and endpoint evidence.

- [ ] **Step 1: Create an explicit temporary baseline directory**

Run: `BASELINE_DIR="$(mktemp -d /private/tmp/reversescale-unified-paths.XXXXXX)" && printf '%s\n' "$BASELINE_DIR"`

Expected: a narrow temporary directory path, never a workspace or home directory.

- [ ] **Step 2: Save and validate JSON snapshots**

```bash
/Applications/Tailscale.app/Contents/MacOS/Tailscale serve get-config "$BASELINE_DIR/serve-config.json"
/Applications/Tailscale.app/Contents/MacOS/Tailscale serve status --json > "$BASELINE_DIR/serve-status.json"
/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel status --json > "$BASELINE_DIR/funnel-status.json"
python3 -m json.tool "$BASELINE_DIR/serve-config.json" >/dev/null
python3 -m json.tool "$BASELINE_DIR/serve-status.json" >/dev/null
python3 -m json.tool "$BASELINE_DIR/funnel-status.json" >/dev/null
```

Expected: both JSON validation commands exit `0`; snapshot shows existing `443`, `8443`, `10000` handlers.

- [ ] **Step 3: Record local and legacy health**

Run:

```bash
{
  curl --silent --show-error --output /dev/null --write-out 'roost_local=%{http_code}\n' http://127.0.0.1:8080/
  curl --silent --show-error --output /dev/null --write-out 'babel_web_local=%{http_code}\n' http://127.0.0.1:3000/
  curl --silent --show-error --output /dev/null --write-out 'babel_api_local=%{http_code}\n' http://127.0.0.1:4000/healthz
  curl --silent --show-error --output /dev/null --write-out 'bakery_local=%{http_code}\n' http://127.0.0.1:60006/healthz
  curl --silent --show-error --output /dev/null --write-out 'public_root=%{http_code}\n' https://tims.tail5d10b9.ts.net/
  curl --silent --show-error --output /dev/null --write-out 'babel_web_legacy=%{http_code}\n' https://tims.tail5d10b9.ts.net:8443/
  curl --silent --show-error --output /dev/null --write-out 'babel_api_legacy=%{http_code}\n' https://tims.tail5d10b9.ts.net:10000/healthz
} | tee "$BASELINE_DIR/health.txt"
```

Expected: every service required for the next phase is healthy; otherwise restart only that service using its repository runbook.

### Task 2: Verify Tailscale Mount Semantics Before Cutover

**Files:**
- Create temporarily: `$BASELINE_DIR/probe/` and a loopback-only echo service.

**Interfaces:**
- Produces: observed JSON containing backend path, Host, `X-Forwarded-Proto` and forwarding headers for a `--set-path` request.

- [ ] **Step 1: Start a loopback-only probe on an unused local port**

First assert `lsof -nP -iTCP:18081 -sTCP:LISTEN` returns no listener. Create `$BASELINE_DIR/probe.py` with this exact loopback-only handler, then run `python3 "$BASELINE_DIR/probe.py"` in a dedicated terminal:

```python
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json

class ProbeHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        payload = {
            "method": self.command,
            "path": self.path,
            "host": self.headers.get("Host"),
            "forwarded": self.headers.get("Forwarded"),
            "x_forwarded_for": self.headers.get("X-Forwarded-For"),
            "x_forwarded_proto": self.headers.get("X-Forwarded-Proto"),
        }
        body = json.dumps(payload).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

ThreadingHTTPServer(("127.0.0.1", 18081), ProbeHandler).serve_forever()
```

- [ ] **Step 2: Add one temporary non-conflicting path handler**

Run: `/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --bg --https=443 --set-path=/__path_probe http://127.0.0.1:18081`

Expected: current root, `8443` and `10000` handlers remain present.

- [ ] **Step 3: Request the public probe and record exact semantics**

Run: `curl --fail --silent --show-error https://tims.tail5d10b9.ts.net/__path_probe/child`

Expected: response path is `/__path_probe/child` and forwarding data is sufficient for the applications' HTTPS/origin handling. If the mount prefix is stripped, Host/scheme are unusable, or the result differs from this contract, remove the probe and stop for design review exactly as required by the approved design; do not add product handlers.

- [ ] **Step 4: Remove only the probe handler and verify cleanup**

Run: `/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --https=443 --set-path=/__path_probe off`

Expected: probe disappears; all pre-existing handlers are byte-for-byte equivalent after normalizing JSON key order.

### Task 3: Add Product Paths Incrementally

**Files:** Tailscale state only.

**Interfaces:**
- Consumes: probe semantics and passing product builds.
- Produces: `/roost`, `/babel/api`, `/babel`, `/bakery` handlers.

- [ ] **Step 1: Add `/roost` and run Roost acceptance**

After Task 2 proves that the incoming path is retained, run: `/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --bg --https=443 --set-path=/roost http://127.0.0.1:8080`. Verify Console login, health/ready, admin API, patch check and signed CDN Range download.

- [ ] **Step 2: Add `/babel/api` before `/babel`**

Run: `/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --bg --https=443 --set-path=/babel/api http://127.0.0.1:4000`. Verify public API health, CORS preflight, auth session and tRPC request before adding Web.

- [ ] **Step 3: Add `/babel` and run Babel acceptance**

Run: `/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --bg --https=443 --set-path=/babel http://127.0.0.1:3000`. Verify login/project pages, SSR, static chunks and image routes; confirm no browser request targets root or `:4000`.

- [ ] **Step 4: Add `/bakery` and run Bakery acceptance**

Run: `/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --bg --https=443 --set-path=/bakery http://127.0.0.1:60006`. Verify login as the existing local administrator, dashboard, package types, static resources, share flow and Range download. Never print the password in logs.

- [ ] **Step 5: Save the pre-root-switch Funnel JSON**

Expected: new paths coexist with the original root, `8443` and `10000`.

### Task 4: Switch Root, Verify Compatibility, and Hand Off

**Files:**
- Modify documentation in each repository's existing deployment/runbook file.
- Create final evidence under the baseline temp directory.

**Interfaces:**
- Produces: root redirect to `/roost/`, complete verification report and exact rollback command/config.

- [ ] **Step 1: Change root only after all prefixed checks pass**

Keep the existing root handler on Roost. Make Roost's exact root route return `308 Location: /roost/`, then verify `curl -I https://tims.tail5d10b9.ts.net/` reports that location. If any cutover check fails, restore the complete pre-change state with `/Applications/Tailscale.app/Contents/MacOS/Tailscale serve set-config "$BASELINE_DIR/serve-config.json"` and re-run the legacy health matrix.

- [ ] **Step 2: Run final public matrix**

Expected: `/roost/`, `/babel/`, `/babel/api/healthz`, `/bakery/healthz`, `:8443`, and `:10000/healthz` return expected statuses; authenticated UI smoke passes.

- [ ] **Step 3: Verify all website CTAs from a deployed or local HTTP server**

Expected: every CTA resolves to the canonical public URL and returns a successful page/redirect.

- [ ] **Step 4: Verify repository state and data preservation**

Run Git status for all four repos, Roost readiness/storage checks, Babel DB connection check and Bakery migration check.

Expected: original user changes remain, no unexpected files are staged, and no migration/data operation occurred during cutover.

- [ ] **Step 5: Document rollback and final URLs**

Add exact verified URLs, health paths, snapshot location pattern and restoration procedure to each owning runbook. Do not embed credentials or temporary absolute snapshot names in committed docs.
