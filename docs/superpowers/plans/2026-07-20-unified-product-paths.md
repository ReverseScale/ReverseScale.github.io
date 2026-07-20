# ReverseScale Unified Product Paths Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Roost、Babel、Bakery 统一发布到 `https://tims.tail5d10b9.ts.net/{roost,babel,bakery}/`，同时保持本地入口和 Babel 旧公网端口可用，并更新全部官网 CTA。

**Architecture:** 各产品先原生支持自己的 base path，再通过 Tailscale Funnel `443` 的多个 `--set-path` 处理器增量切换。代码、数据和网络切换分层提交；任何验收失败都恢复 Funnel 快照，不回滚数据库。

**Tech Stack:** Tailscale Funnel 1.98.9、Go、React/Vite、Next.js 15、Express/tRPC、Django 4.2、Vitest、Playwright、Python unittest。

## Global Constraints

- 规范地址固定为 `/roost/`、`/babel/`、`/bakery/`。
- 根地址最终跳转到 `/roost/`。
- Babel `:8443` 和 `:10000` 兼容入口不得删除。
- 不引入 Caddy、Nginx、Cloudflare Tunnel 或新的公网域名。
- 不修改数据库内容、Roost signing key、Docker volume、Git remote 或 Tailscale 设备名。
- 保留 Babel 与 Roost 的现存未提交内容；每次改动前重新检查四个仓库状态。
- 所有功能改动必须先写失败测试，再写最小实现。
- 各仓库独立提交；Tailscale 切换只在全部仓库测试通过后执行。

## Plan Suite

1. [Roost base path](/Users/tim/Workspace/ReverseScale.github.io/docs/superpowers/plans/2026-07-20-roost-base-path.md)
2. [Babel base path](/Users/tim/Workspace/ReverseScale.github.io/docs/superpowers/plans/2026-07-20-babel-base-path.md)
3. [Bakery base path](/Users/tim/Workspace/ReverseScale.github.io/docs/superpowers/plans/2026-07-20-bakery-base-path.md)
4. [Product-site links](/Users/tim/Workspace/ReverseScale.github.io/docs/superpowers/plans/2026-07-20-product-runtime-links.md)
5. [Tailscale cutover](/Users/tim/Workspace/ReverseScale.github.io/docs/superpowers/plans/2026-07-20-tailscale-path-cutover.md)

---

### Task 1: Freeze Safety Baseline

**Files:**
- Create: the directory printed by `mktemp -d /private/tmp/reversescale-unified-paths.XXXXXX`
- Reference: `docs/superpowers/specs/2026-07-20-unified-product-paths-design.md`

**Interfaces:**
- Consumes: current Git status, process ports, Tailscale Serve/Funnel state.
- Produces: immutable baseline directory containing status, config and health evidence.

- [ ] **Step 1: Record repository state without changing it**

Run: `for repo in babel roost bakery ReverseScale.github.io; do git -C "/Users/tim/Workspace/$repo" status --short --branch; done`

Expected: Babel's known two modified files and Roost's known submodule state are visible; no unexpected overlap with planned files is ignored.

- [ ] **Step 2: Save network and health evidence**

Run:

```bash
BASELINE_DIR="$(mktemp -d /private/tmp/reversescale-unified-paths.XXXXXX)"
/Applications/Tailscale.app/Contents/MacOS/Tailscale serve get-config "$BASELINE_DIR/serve-config.json"
/Applications/Tailscale.app/Contents/MacOS/Tailscale serve status --json > "$BASELINE_DIR/serve-status.json"
/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel status --json > "$BASELINE_DIR/funnel-status.json"
curl --silent --show-error --output /dev/null --write-out 'roost_local=%{http_code}\n' http://127.0.0.1:8080/
curl --silent --show-error --output /dev/null --write-out 'bakery_local=%{http_code}\n' http://127.0.0.1:60006/healthz
```

Expected: both JSON status files parse successfully; Roost and Bakery report successful local status codes. If Babel `3000`/`4000` are still stopped, restart them with the Babel runbook before their implementation tests, without touching Postgres data.

- [ ] **Step 3: Do not commit baseline artifacts**

Expected: baseline remains under `/private/tmp`; all four repository statuses are unchanged.

### Task 2: Implement Product Base Paths

**Files:** See Roost, Babel and Bakery child plans.

**Interfaces:**
- Consumes: fixed path contract from Global Constraints.
- Produces: three independently tested services that work both at their prefixed public path and existing local/legacy entrypoints.

- [ ] **Step 1: Execute every checkbox in `2026-07-20-roost-base-path.md` and review its two commits**
- [ ] **Step 2: Execute every checkbox in `2026-07-20-babel-base-path.md` and review its two commits**
- [ ] **Step 3: Execute every checkbox in `2026-07-20-bakery-base-path.md` and review its three commits**
- [ ] **Step 4: Re-run `go test ./roostd/... -count=1`, `pnpm test && pnpm typecheck && pnpm build` in Babel, and `.venv/bin/python manage.py test && npm --prefix frontend test && VITE_PUBLIC_BASE_PATH=/bakery npm --prefix frontend run build` in Bakery**

Expected: all commands exit `0`; no Funnel config has changed.

### Task 3: Update Public Product Links

**Files:** See product-runtime-links child plan.

**Interfaces:**
- Consumes: canonical runtime URL map exported in that plan.
- Produces: tested website links pointing to the new runtime paths.

- [ ] **Step 1: Execute every checkbox in `2026-07-20-product-runtime-links.md`**
- [ ] **Step 2: Run `pnpm --filter @babel/site build`, `pnpm --dir roostd/console build:pages`, and `npm --prefix site run build`; inspect generated links without hand-editing outputs**

Expected: source tests pass and no generated HTML is hand-edited without a source change.

### Task 4: Cut Over and Verify

**Files:** See Tailscale cutover child plan.

**Interfaces:**
- Consumes: passing product builds and baseline Funnel JSON.
- Produces: incremental Funnel handlers plus public acceptance evidence.

- [ ] **Step 1: Execute preflight and add paths one at a time**
- [ ] **Step 2: Run authenticated browser and protocol smoke checks**
- [ ] **Step 3: Switch root only after every product passes**
- [ ] **Step 4: Recheck Babel legacy ports and repository dirt**

Expected: all canonical URLs pass, legacy URLs pass, and original user changes remain intact.
