# Babel Base Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 Babel Web 在 `/babel` 下运行，并通过同源 `/babel/api` 访问 API，同时保留本地端口和旧公网端口。

**Architecture:** Next.js 使用原生 `basePath`；Web 的 API URL 解析集中到 `api-session.ts`。Express 在入口挂载可选 API base path，tRPC 路由内部不改名。

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

### Task 2: Mount the API at a Configurable Public Prefix

**Files:**
- Modify: `/Users/tim/Workspace/babel/apps/api/src/config.ts`
- Modify: `/Users/tim/Workspace/babel/apps/api/src/app.ts`
- Modify: `/Users/tim/Workspace/babel/apps/api/tests/health.test.ts`
- Modify: `/Users/tim/Workspace/babel/apps/api/.env.example`
- Modify: `/Users/tim/Workspace/babel/apps/api/README.md`

**Interfaces:**
- Consumes: `BABEL_API_BASE_PATH` env, normalized as `"" | "/babel/api"`.
- Produces: Express app mounted under the prefix while `/healthz` remains available in both configured and legacy modes.

- [ ] **Step 1: Write failing Supertest coverage**

```ts
it('mounts API routes under the configured public prefix', async () => {
  const app = createApp(testLog, { publicBasePath: '/babel/api' });
  await request(app).get('/babel/api/healthz').expect(200);
  await request(app).get('/healthz').expect(404);
});
```

Also assert invalid values (`babel`, `/babel/api/`) fail configuration parsing and empty value keeps `/healthz`.

- [ ] **Step 2: Run the focused API test and verify failure**

Run: `pnpm --filter @babel/api test -- health.test.ts`

Expected: FAIL because `createApp` does not accept `publicBasePath`.

- [ ] **Step 3: Implement one mount boundary**

```ts
const router = express.Router();
// existing middleware and routes attach to router
app.use(config.publicBasePath || '/', router);
```

Normalize once in config; do not prefix every tRPC/router definition. Configure public CORS origin as `https://tims.tail5d10b9.ts.net`.

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
