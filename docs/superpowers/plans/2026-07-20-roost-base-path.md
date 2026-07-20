# Roost Base Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 Roost Console、管理 API、设备 API 和签名 CDN 在 `/roost` 下完整工作，同时保留本地根路径模式。

**Architecture:** 在 roostd HTTP 入口统一剥离可选 base path，业务 handler 保持现有路由；Console 复用已有 `publicBasePath` 工具。公开 URL 生成统一使用配置过的 `ROOST_BASE_URL`。

**Tech Stack:** Go `net/http`、React、Vite、Vitest、Docker Compose。

## Global Constraints

- 公开前缀固定为 `/roost`，空前缀仍是默认开发模式。
- `/api/v1`、`/admin/v1`、`/cdn`、`/healthz`、`/readyz` 必须全部覆盖。
- 不修改 signing key、SQLite、store 或现有 `examples/roost_hybrid` 状态。

---

### Task 1: Add a Server-Side Base-Path Boundary

**Files:**
- Modify: `/Users/tim/Workspace/roost/roostd/internal/api/api.go`
- Modify: `/Users/tim/Workspace/roost/roostd/internal/api/spa_test.go`
- Create: `/Users/tim/Workspace/roost/roostd/internal/api/basepath_test.go`
- Modify: `/Users/tim/Workspace/roost/roostd/cmd/roostd/main.go`

**Interfaces:**
- Consumes: `Server.Routes() http.Handler` and CLI/environment configuration.
- Produces: `WithBasePath(handler http.Handler, basePath string) (http.Handler, error)` and normalized `/roost` configuration.

- [ ] **Step 1: Write failing normalization and routing tests**

```go
func TestWithBasePathRoutesPrefixedRequest(t *testing.T) {
    inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.URL.Path != "/healthz" { t.Fatalf("path = %q", r.URL.Path) }
        w.WriteHeader(http.StatusNoContent)
    })
    handler, err := WithBasePath(inner, "/roost")
    if err != nil { t.Fatal(err) }
    rr := httptest.NewRecorder()
    handler.ServeHTTP(rr, httptest.NewRequest(http.MethodGet, "/roost/healthz", nil))
    if rr.Code != http.StatusNoContent { t.Fatalf("status = %d", rr.Code) }
}
```

Also assert `/rooster/healthz` returns 404, `/roost` redirects to `/roost/`, and empty base path preserves `/healthz`.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `go test ./roostd/internal/api -run 'TestWithBasePath|TestSP' -count=1`

Expected: FAIL because `WithBasePath` is undefined.

- [ ] **Step 3: Implement the minimal boundary**

```go
func WithBasePath(next http.Handler, value string) (http.Handler, error) {
    base := strings.TrimSpace(value)
    if base == "" || base == "/" { return next, nil }
    if !strings.HasPrefix(base, "/") || strings.HasSuffix(base, "/") || strings.Contains(base, "//") {
        return nil, fmt.Errorf("invalid public base path %q", value)
    }
    mounted := http.StripPrefix(base, next)
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.URL.Path == base { http.Redirect(w, r, base+"/", http.StatusPermanentRedirect); return }
        if !strings.HasPrefix(r.URL.Path, base+"/") { http.NotFound(w, r); return }
        mounted.ServeHTTP(w, r)
    }), nil
}
```

Add `--public-base-path` to `roostd serve`, defaulting to `os.Getenv("ROOST_PUBLIC_BASE_PATH")`, document it in `usage()`, and wrap the existing middleware stack once around `Server.Routes()`.

- [ ] **Step 4: Run focused and full Go tests**

Run: `go test ./roostd/internal/api -count=1 && go test ./roostd/... -count=1`

Expected: PASS.

- [ ] **Step 5: Commit the server boundary**

```bash
git add roostd/internal/api/api.go roostd/internal/api/basepath_test.go roostd/internal/api/spa_test.go roostd/cmd/roostd/main.go
git commit -m "feat: support a Roost public base path"
```

### Task 2: Complete Console and Public URL Coverage

**Files:**
- Modify: `/Users/tim/Workspace/roost/roostd/console/src/lib/publicConfig.ts`
- Modify: `/Users/tim/Workspace/roost/roostd/console/src/lib/publicConfig.test.ts`
- Modify: `/Users/tim/Workspace/roost/roostd/console/src/lib/api.ts`
- Modify: `/Users/tim/Workspace/roost/roostd/console/src/App.test.tsx`
- Modify: `/Users/tim/Workspace/roost/roostd/console/vite.config.ts`
- Modify: `/Users/tim/Workspace/roost/docker-compose.yml`
- Modify: `/Users/tim/Workspace/roost/docs/deployment.md`

**Interfaces:**
- Consumes: `publicBasePath`, `toPublicPath()` and `stripPublicBasePath()`.
- Produces: `toPublicApiPath(path: string): string` used by every same-origin API request.

- [ ] **Step 1: Add failing URL tests**

```ts
it("prefixes same-origin API paths", () => {
  vi.stubEnv("VITE_PUBLIC_BASE_PATH", "/roost");
  expect(toPublicApiPath("/admin/v1/me")).toBe("/roost/admin/v1/me");
  expect(toPublicPath("/login")).toBe("/roost/login");
});
```

- [ ] **Step 2: Run tests and verify the new assertion fails**

Run: `pnpm --dir roostd/console test -- publicConfig.test.ts App.test.tsx`

Expected: FAIL until API requests use the public prefix.

- [ ] **Step 3: Implement centralized API prefixing**

```ts
export function toPublicApiPath(path: string) {
  return toPublicPath(path);
}
```

Apply it once inside `RoostApi.req()` before `fetch`; do not change each API method separately. Configure production build with `VITE_PUBLIC_BASE_PATH=/roost/`, `VITE_PUBLIC_CONSOLE_URL=https://tims.tail5d10b9.ts.net/roost/`, and `ROOST_BASE_URL=https://tims.tail5d10b9.ts.net/roost`.

- [ ] **Step 4: Run Console tests and build**

Run: `pnpm --dir roostd/console test && pnpm --dir roostd/console build`

Expected: PASS; built asset URLs start with `/roost/`.

- [ ] **Step 5: Run protocol smoke against a local prefixed instance**

Run: `go test ./roostd/... -count=1` and the documented `scripts/roost-smoke-local.sh` against a test instance mounted at `/roost`.

Expected: health, admin API, patch check, event post and signed CDN download pass.

- [ ] **Step 6: Commit Console/config/docs changes**

```bash
git add roostd/console/src/lib/publicConfig.ts roostd/console/src/lib/publicConfig.test.ts roostd/console/src/lib/api.ts roostd/console/src/App.test.tsx roostd/console/vite.config.ts docker-compose.yml docs/deployment.md
git commit -m "feat: publish Roost under the roost path"
```
