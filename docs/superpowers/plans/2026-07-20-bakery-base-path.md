# Bakery Base Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 Bakery 在 `/bakery` 下完成登录、业务 API、静态资源、分享和下载，同时保留无前缀本地模式。

**Architecture:** Django 配置提供唯一 `BAKERY_PUBLIC_BASE_PATH`；React 使用一个纯函数 URL 模块生成和剥离前缀。前端 API 请求只在 `api.ts` 的边界加前缀，导航组件复用同一工具。

**Tech Stack:** Django 4.2、React 19、Vite 8、Vitest、Django TestCase。

## Global Constraints

- `/bakery` 仅在公开运行配置中启用，默认空路径。
- `127.0.0.1:60006` 根入口必须继续工作。
- 不修改或重建 `db.sqlite3`。
- 不用全局字符串替换、代理正文改写或重复的组件级常量。

---

### Task 1: Define and Test the Public Path Contract

**Files:**
- Create: `/Users/tim/Workspace/bakery/frontend/src/public-path.ts`
- Create: `/Users/tim/Workspace/bakery/frontend/src/public-path.test.ts`
- Modify: `/Users/tim/Workspace/bakery/frontend/vite.config.ts`
- Modify: `/Users/tim/Workspace/bakery/frontend/src/routes.ts`
- Modify: `/Users/tim/Workspace/bakery/frontend/src/routes.test.ts`

**Interfaces:**
- Produces: `normalizePublicBasePath(value: string): string`, `withPublicBasePath(path: string): string`, `stripPublicBasePath(path: string): string`.

- [ ] **Step 1: Write failing helper tests**

```ts
it("adds and strips the Bakery public base path", () => {
  expect(normalizePublicBasePath("/bakery/")).toBe("/bakery");
  expect(withPublicBasePath("/login/signin")).toBe("/bakery/login/signin");
  expect(stripPublicBasePath("/bakery/package/manage")).toBe("/package/manage");
});

it("does not prefix absolute or fragment URLs", () => {
  expect(withPublicBasePath("https://example.com/x")).toBe("https://example.com/x");
  expect(withPublicBasePath("#section")).toBe("#section");
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- --run src/public-path.test.ts src/routes.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the pure helper**

```ts
export const publicBasePath = normalizePublicBasePath(import.meta.env.VITE_PUBLIC_BASE_PATH || "");

export function normalizePublicBasePath(value: string) {
  const path = value.trim().replace(/\/+$/, "");
  if (!path) return "";
  if (!path.startsWith("/") || path.includes("//")) throw new Error(`Invalid public base path: ${value}`);
  return path;
}

export function withPublicBasePath(path: string) {
  if (!path || /^(?:[a-z]+:|#)/i.test(path)) return path;
  return `${publicBasePath}${path.startsWith("/") ? path : `/${path}`}`;
}
```

Make `resolveFrontendRoute()` strip the prefix exactly once. Set Vite `base` from `VITE_PUBLIC_BASE_PATH` for production assets.

- [ ] **Step 4: Run frontend tests and build**

Run: `npm test && VITE_PUBLIC_BASE_PATH=/bakery npm run build`

Expected: PASS; production asset URLs use `/bakery/`.

- [ ] **Step 5: Commit the path contract**

```bash
git add frontend/src/public-path.ts frontend/src/public-path.test.ts frontend/src/routes.ts frontend/src/routes.test.ts frontend/vite.config.ts
git commit -m "feat: define Bakery public path helpers"
```

### Task 2: Apply the Prefix at Frontend Boundaries

**Files:**
- Modify: `/Users/tim/Workspace/bakery/frontend/src/api.ts`
- Modify: `/Users/tim/Workspace/bakery/frontend/src/main.tsx`
- Modify: `/Users/tim/Workspace/bakery/frontend/src/Navigation.tsx`
- Modify: all `frontend/src/*App.tsx` files returned by `rg 'href=|location\.(assign|href)|fetch\(|xhr\.open' frontend/src`.
- Test: corresponding `*.test.tsx` files.

**Interfaces:**
- Consumes: `withPublicBasePath()` and `stripPublicBasePath()`.
- Produces: no browser request or navigation that escapes `/bakery` when the public prefix is enabled.

- [ ] **Step 1: Add failing API and navigation assertions**

```ts
expect(fetchMock).toHaveBeenCalledWith(
  "/bakery/package/manage/api",
  expect.objectContaining({ credentials: "same-origin" }),
);
expect(screen.getByRole("link", { name: "应用管理" })).toHaveAttribute(
  "href",
  "/bakery/package/manage",
);
```

Add equivalent assertions for login expiry redirect, dashboard, build, share and static favicon.

- [ ] **Step 2: Run focused tests and verify failures**

Run: `npm test -- --run src/Navigation.test.tsx src/LoginApp.test.tsx src/DashboardApp.test.tsx src/ShareApp.test.tsx`

Expected: FAIL with unprefixed URL differences.

- [ ] **Step 3: Prefix requests centrally**

```ts
async function request(input: RequestInfo | URL, init: RequestInit = {}) {
  const target = typeof input === "string" ? withPublicBasePath(input) : input;
  return window.fetch(target, { ...init, headers });
}
```

Apply the same boundary to `post()` and XHR creation. Use `withPublicBasePath()` for link props and `window.location.assign`; do not concatenate `"/bakery"` in components.

- [ ] **Step 4: Prove no root escapes remain**

Run: `rg -n 'href="/|fetch\("/|fetch\(`/|location\.(assign|href).*"/|xhr\.open\([^,]+,\s*"/' frontend/src`

Expected: only tests for empty-base compatibility or explicitly documented public external paths remain.

- [ ] **Step 5: Run full frontend verification and commit**

Run: `npm test && VITE_PUBLIC_BASE_PATH=/bakery npm run build`

```bash
git add frontend/src
git commit -m "feat: keep Bakery navigation inside its public path"
```

### Task 3: Configure Django and Verify End-to-End Behavior

**Files:**
- Modify: `/Users/tim/Workspace/bakery/bakery/settings.py`
- Modify: `/Users/tim/Workspace/bakery/bakery/urls.py`
- Modify: `/Users/tim/Workspace/bakery/bakery_site/views/login.py`
- Modify: `/Users/tim/Workspace/bakery/bakery_site/tests.py`
- Modify: `/Users/tim/Workspace/bakery/.env.example`
- Modify: `/Users/tim/Workspace/bakery/README.md`

**Interfaces:**
- Consumes: `BAKERY_PUBLIC_BASE_PATH`.
- Produces: normalized Django `FORCE_SCRIPT_NAME`, `STATIC_URL`, `SESSION_COOKIE_PATH`, `CSRF_COOKIE_PATH`, allowed host and trusted HTTPS origin.

- [ ] **Step 1: Write failing Django override tests**

```python
@override_settings(
    FORCE_SCRIPT_NAME="/bakery",
    STATIC_URL="/bakery/static/",
    SESSION_COOKIE_PATH="/bakery",
)
def test_prefixed_login_and_static_urls(self):
    response = self.client.get("/login/signin", SCRIPT_NAME="/bakery")
    self.assertContains(response, "/bakery/static/modern/app.js")
    self.assertEqual(response.status_code, 200)
```

Add assertions for login redirect, dashboard, share manifest/download and OAuth callback URLs.

- [ ] **Step 2: Run focused Django tests and verify failure**

Run: `.venv/bin/python manage.py test bakery_site.tests.ModernFrontendCutoverTest bakery_site.tests.FeishuOAuthLoginTest`

Expected: FAIL on unprefixed static/redirect URLs.

- [ ] **Step 3: Implement normalized settings**

```python
BAKERY_PUBLIC_BASE_PATH = os.environ.get("BAKERY_PUBLIC_BASE_PATH", "").rstrip("/")
if BAKERY_PUBLIC_BASE_PATH and not BAKERY_PUBLIC_BASE_PATH.startswith("/"):
    raise ValueError("BAKERY_PUBLIC_BASE_PATH must start with /")
FORCE_SCRIPT_NAME = BAKERY_PUBLIC_BASE_PATH or None
STATIC_URL = f"{BAKERY_PUBLIC_BASE_PATH}/static/"
SESSION_COOKIE_PATH = BAKERY_PUBLIC_BASE_PATH or "/"
CSRF_COOKIE_PATH = BAKERY_PUBLIC_BASE_PATH or "/"
```

Use Django `reverse()` or a single server-side prefix helper for redirects and callback URLs.

- [ ] **Step 4: Run all Bakery verification**

Run: `.venv/bin/python manage.py check && .venv/bin/python manage.py test && npm --prefix frontend test && VITE_PUBLIC_BASE_PATH=/bakery npm --prefix frontend run build`

Expected: PASS.

- [ ] **Step 5: Run authenticated local prefixed smoke**

Start a test instance with `BAKERY_PUBLIC_BASE_PATH=/bakery`, then verify login, dashboard, application management, package types, public share and Range download. Also verify the default empty-base instance at `127.0.0.1:60006`.

- [ ] **Step 6: Commit Django/docs changes**

```bash
git add bakery/settings.py bakery/urls.py bakery_site/views/login.py bakery_site/tests.py .env.example README.md
git commit -m "feat: publish Bakery under the bakery path"
```
