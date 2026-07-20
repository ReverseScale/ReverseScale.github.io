# Product Runtime Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ReverseScale 主站及三个产品官网的运行 CTA 指向统一公网路径，同时保留 GitHub Pages 产品介绍页。

**Architecture:** 每个可维护源码只定义一次 runtime URL；组件从数据模块读取。生成站点通过原发布脚本产生，不直接批量改写生成 HTML。

**Tech Stack:** Static ES modules、Next.js static export、React/Vite、Python unittest、Vitest。

## Global Constraints

- Runtime URLs 固定为 `https://tims.tail5d10b9.ts.net/{roost,babel,bakery}/`。
- 产品介绍页路径 `/roost-site/`、`/babel-site/`、`/bakery-site/` 保留。
- 外部链接使用 `target="_blank" rel="noreferrer"` 或项目现有安全约定。

---

### Task 1: Update ReverseScale Main Site

**Files:**
- Modify: `/Users/tim/Workspace/ReverseScale.github.io/src/site-data.js`
- Modify: `/Users/tim/Workspace/ReverseScale.github.io/src/app.js`
- Modify: `/Users/tim/Workspace/ReverseScale.github.io/index.html`
- Modify: `/Users/tim/Workspace/ReverseScale.github.io/tests/test_site_smoke.py`

**Interfaces:**
- Produces: `runtimeBaseURL` and `project.href` values for all rendered runtime CTAs; retains a separate `siteHref` for Learn more links.

- [ ] **Step 1: Replace old test expectations with failing canonical URL assertions**

```python
RUNTIME_URLS = {
    "Roost": "https://tims.tail5d10b9.ts.net/roost/",
    "Babel": "https://tims.tail5d10b9.ts.net/babel/",
    "Bakery": "https://tims.tail5d10b9.ts.net/bakery/",
}

def test_home_links_runtime_products(self):
    source = read("src/site-data.js") + read("src/app.js") + read("index.html")
    for url in RUNTIME_URLS.values():
        self.assertIn(url, source)
```

- [ ] **Step 2: Run and verify failure**

Run: `python3 -m unittest tests.test_site_smoke -v`

Expected: FAIL because current CTAs use GitHub Pages paths.

- [ ] **Step 3: Add explicit runtime and product-site fields**

```js
const runtimeOrigin = "https://tims.tail5d10b9.ts.net";
// Each project: href: `${runtimeOrigin}/roost/`, siteHref: "/roost-site/"
```

Render cards/navigation/hero from `href`; render optional Learn more from `siteHref`. Update no-JS fallback in `index.html`.

- [ ] **Step 4: Run smoke and commit**

Run: `python3 -m unittest tests.test_site_smoke -v && git diff --check`

```bash
git add src/site-data.js src/app.js index.html tests/test_site_smoke.py
git commit -m "feat: link products to unified runtime paths"
```

### Task 2: Update Three Product-Site Sources

**Files:**
- Modify/Test: `/Users/tim/Workspace/babel/apps/site/app/page.tsx` and `/Users/tim/Workspace/babel/apps/site/tests/site-assets.test.ts`
- Modify/Test: `/Users/tim/Workspace/roost/roostd/console/src/components/LandingPage.tsx` and `/Users/tim/Workspace/roost/roostd/console/src/App.test.tsx`
- Modify/Test: `/Users/tim/Workspace/bakery/site/src/LandingApp.tsx` and `/Users/tim/Workspace/bakery/site/src/LandingApp.test.tsx`

**Interfaces:**
- Produces: one runtime CTA per site using its product's canonical URL.

- [ ] **Step 1: Add failing CTA tests**

Assert exact URLs, for example:

```ts
expect(screen.getByRole("link", { name: /open bakery/i })).toHaveAttribute(
  "href",
  "https://tims.tail5d10b9.ts.net/bakery/",
);
```

- [ ] **Step 2: Run each focused test and verify failure**

Run:

```bash
pnpm --dir /Users/tim/Workspace/babel --filter @babel/site test -- site-assets.test.ts
pnpm --dir /Users/tim/Workspace/roost/roostd/console test -- App.test.tsx
npm --prefix /Users/tim/Workspace/bakery/site test -- --run src/LandingApp.test.tsx
```

Expected: each old CTA assertion fails before implementation.

- [ ] **Step 3: Update source constants, not generated HTML**

Use exact constants named `PUBLIC_RUNTIME_URL` in each site source. Do not edit `site/*-site/*.html` or `site/dist` directly.

- [ ] **Step 4: Run site tests and builds**

Run:

```bash
pnpm --dir /Users/tim/Workspace/babel --filter @babel/site test && pnpm --dir /Users/tim/Workspace/babel --filter @babel/site build
pnpm --dir /Users/tim/Workspace/roost/roostd/console test && pnpm --dir /Users/tim/Workspace/roost/roostd/console build:pages
npm --prefix /Users/tim/Workspace/bakery/site test && npm --prefix /Users/tim/Workspace/bakery/site run build
```

Expected: all commands pass and generated output contains the canonical URL for its product.

- [ ] **Step 5: Commit each product-site source and test separately**

```bash
git -C /Users/tim/Workspace/babel add apps/site/app/page.tsx apps/site/tests/site-assets.test.ts
git -C /Users/tim/Workspace/babel commit -m "feat: link Babel site to unified runtime"
git -C /Users/tim/Workspace/roost add roostd/console/src/components/LandingPage.tsx roostd/console/src/App.test.tsx
git -C /Users/tim/Workspace/roost commit -m "feat: link Roost site to unified runtime"
git -C /Users/tim/Workspace/bakery add site/src/LandingApp.tsx site/src/LandingApp.test.tsx
git -C /Users/tim/Workspace/bakery commit -m "feat: link Bakery site to unified runtime"
```
