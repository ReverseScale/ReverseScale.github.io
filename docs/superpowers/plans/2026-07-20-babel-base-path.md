# Babel Base Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 Babel Web 在 `/babel` 下运行，并通过同源 `/babel/api` 访问 API，同时保留本地端口和旧公网端口。

**Architecture:** Next.js 使用原生 `basePath`，公开构建独立监听 3002；Web 的 API URL 解析集中到 `api-session.ts`。Tailscale 剥离 `/babel/api` 后转发到原有 4000 根路由，因此 API 无需改变挂载点，旧 10000 入口天然保持兼容。

**Tech Stack:** Next.js 15、Express、tRPC、TypeScript、Vitest、Playwright。

## Global Constraints

- Web public base path 固定 `/babel`，API public base path 固定 `/babel/api`。
- SSR 本地调用仍可直连 `http://127.0.0.1:4000`。
- 不覆盖 `TopBar.tsx` 和 `apps/web/e2e/home.spec.ts` 的现存修改。
- `:8443` 与 `:10000` 行为保持兼容。

---

### Task 1: Add the Web Base Path and Same-Origin API Resolver

**Files:**
- Modify: `/Users/tim/Workspace/babel/apps/web/next.config.ts`
- Modify: `/Users/tim/Workspace/babel/apps/web/app/lib/auth/api-session.ts`
- Create: `/Users/tim/Workspace/babel/apps/web/tests/public-paths.test.ts`
- Create: `/Users/tim/Workspace/babel/apps/web/e2e/public-base-path.spec.ts`
- Modify: `/Users/tim/Workspace/babel/apps/web/playwright.config.ts`

**Interfaces:**
- Produces: `BABEL_WEB_BASE_PATH`, `browserApiUrl(location: Pick<Location, "origin">): string`, and server fallback behavior.

- [ ] **Step 1: Write the failing resolver tests**

```ts
it("uses the unified same-origin API path in the browser", () => {
  expect(browserApiUrl({ origin: "https://tims.tail5d10b9.ts.net" })).toBe(
    "https://tims.tail5d10b9.ts.net/babel/api",
  );
});

it("preserves an explicit API override", () => {
  expect(resolveApiUrl({ override: "http://127.0.0.1:4000", origin: "https://x" }))
    .toBe("http://127.0.0.1:4000");
});
```

- [ ] **Step 2: Run the focused test to verify failure**

Run: `pnpm --filter @babel/web test -- public-paths.test.ts`

Expected: FAIL because the exported resolver does not exist and current default uses port `4000`.

- [ ] **Step 3: Implement the minimal resolver and Next config**

```ts
export const BABEL_WEB_BASE_PATH = '/babel';
export const BABEL_API_BASE_PATH = '/babel/api';

export function browserApiUrl(location: Pick<Location, 'origin'>): string {
  return `${location.origin}${BABEL_API_BASE_PATH}`;
}
```

Set `basePath: process.env['BABEL_WEB_BASE_PATH'] || ''` in `next.config.ts`; use `/babel` in the public runtime and empty string for legacy/local mode. Preserve explicit `NEXT_PUBLIC_BABEL_API_URL` before same-origin fallback.

- [ ] **Step 4: Run unit tests, typecheck and build**

Run: `pnpm --filter @babel/web test && pnpm --filter @babel/web typecheck && BABEL_WEB_BASE_PATH=/babel pnpm --filter @babel/web build`

Expected: PASS; `.next` routes/assets include `/babel`.

- [ ] **Step 5: Add and run a prefixed Playwright smoke**

Add assertions that `/babel/`, `/babel/login` and a static chunk load without requests escaping to root. Run: `pnpm --filter @babel/web test:e2e -- --grep "public base path"`.

Expected: PASS.

- [ ] **Step 6: Commit Web changes without staging user files**

```bash
git add apps/web/next.config.ts apps/web/app/lib/auth/api-session.ts apps/web/tests/public-paths.test.ts apps/web/e2e/public-base-path.spec.ts apps/web/playwright.config.ts
git commit -m "feat: publish Babel Web under the babel path"
```

### Task 2: Preserve the API Root and Let Tailscale Strip the Prefix

**Files:**
- Modify: `/Users/tim/Workspace/babel/apps/api/src/config.ts`
- Modify: `/Users/tim/Workspace/babel/apps/api/src/app.ts`
- Modify: `/Users/tim/Workspace/babel/apps/api/tests/health.test.ts`
- Modify: `/Users/tim/Workspace/babel/apps/api/.env.example`
- Modify: `/Users/tim/Workspace/babel/apps/api/README.md`

**Interfaces:**
- Consumes: Tailscale `/babel/api` path handler.
- Produces: external `/babel/api/*` mapped to the unchanged local `:4000/*` routes.

- [ ] **Step 1: Preserve existing API tests and verify local health**

Run: `pnpm --filter @babel/api test && curl --fail http://127.0.0.1:4000/healthz`

- [ ] **Step 2: Configure the public path handler**

Run: `/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --bg --https=443 --set-path=/babel/api http://127.0.0.1:4000`

- [ ] **Step 3: Verify the public API without changing Express routes**

Run: `curl --fail https://tims.tail5d10b9.ts.net/babel/api/healthz`

- [ ] **Step 4: Run API and integration verification**

Run: `pnpm --filter @babel/api test && pnpm --filter @babel/api typecheck && pnpm --filter @babel/api build`

Expected: PASS.

- [ ] **Step 5: Run Babel combined verification**

Run: `pnpm test && pnpm typecheck && pnpm build`

Expected: PASS with no changes to the user's existing two modified files.

- [ ] **Step 6: Commit API/docs changes**

```bash
git add apps/api/src/config.ts apps/api/src/app.ts apps/api/tests/health.test.ts apps/api/.env.example apps/api/README.md
git commit -m "feat: mount Babel API under a public path"
```
