# Bakery 首页项目接入实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Bakery 作为与 Roost、Babel 同级的一等项目加入 ReverseScale 首页，并用自动化测试锁定入口、内容和响应式样式。

**Architecture:** 保持现有静态 Web Component 架构，继续由 `src/site-data.js` 承载项目数据，由 `src/app.js` 渲染导航、首屏和项目卡片。`index.html` 提供 SEO 与无 JavaScript 兜底，`src/styles.css` 负责三列布局和 Bakery 的暖色视觉标识，不增加运行时请求或跨仓库依赖。

**Tech Stack:** HTML5、CSS Grid、原生 JavaScript ES Modules、Custom Elements、Python `unittest`

## Global Constraints

- Bakery 的所有首页入口统一使用 `/bakery-site/`。
- Bakery 定位为移动应用构建、流水线可视化、产物管理与分发平台。
- 不修改 `/Users/tim/Workspace/bakery/site` 的内容、构建或部署流程。
- 不引入跨仓库元数据同步、构建时远程请求或新的前端框架。
- 桌面端项目区展示三列，`max-width: 860px` 断点下保持单列。
- 保留 Roost、Babel、Research、404 页面和旧资源隔离的现有行为。

---

## 文件结构

- `tests/test_site_smoke.py`：声明首页项目入口、Bakery 内容、SEO 和视觉契约。
- `src/site-data.js`：提供 Roost、Babel、Bakery 三个项目的数据及全站产品叙事。
- `src/app.js`：渲染 Bakery 导航、首屏入口和四节点产品地图。
- `src/styles.css`：提供三列项目布局、Bakery 暖色卡片和四节点产品地图布局。
- `index.html`：提供包含 Bakery 的 SEO 元数据和无 JavaScript 导航。

### Task 1: 将 Bakery 接入首页全部产品触点

**Files:**
- Modify: `tests/test_site_smoke.py:21-48`
- Modify: `src/site-data.js:1-76`
- Modify: `src/app.js:49-139`
- Modify: `src/styles.css:1-12, 190-240, 334-416, 510-560`
- Modify: `index.html:6-25`

**Interfaces:**
- Consumes: 现有 `projectLinks` 数组，以及 `projectCard(project)` 对 `name`、`label`、`href`、`status`、`tone`、`summary`、`points` 字段的读取约定。
- Produces: `projectLinks` 中 `tone: "amber"` 的 Bakery 项目；首页 `/bakery-site/` 导航与 CTA；`.project-card--amber` 样式；三列 `.project-grid`。

- [ ] **Step 1: 先写失败的首页契约测试**

将 `test_home_links_current_project_sites` 扩展为三个项目，并新增 Bakery 内容与样式测试：

```python
def test_home_links_current_project_sites(self) -> None:
    html = read("index.html")
    self.assertIn("/roost-site/", html)
    self.assertIn("/babel-site/", html)
    self.assertIn("/bakery-site/", html)

def test_bakery_is_a_first_class_home_project(self) -> None:
    app_source = read("src/app.js")
    data_source = read("src/site-data.js")

    self.assertIn('<a href="/bakery-site/">Bakery</a>', app_source)
    self.assertIn('href="/bakery-site/">Explore Bakery</a>', app_source)
    self.assertIn('name: "Bakery"', data_source)
    self.assertIn('label: "Mobile build and delivery"', data_source)
    self.assertIn('status: "Build & distribution"', data_source)
    self.assertIn('tone: "amber"', data_source)
    self.assertIn("CI integration", data_source)
    self.assertIn("Pipeline visibility", data_source)
    self.assertIn("Artifact distribution", data_source)

def test_bakery_project_uses_three_column_responsive_layout(self) -> None:
    styles = read("src/styles.css")

    self.assertIn("grid-template-columns: repeat(3, minmax(0, 1fr));", styles)
    self.assertIn(".project-card--amber", styles)
    self.assertIn("border-top: 4px solid var(--amber);", styles)

def test_home_metadata_covers_mobile_build_and_distribution(self) -> None:
    html = read("index.html")

    self.assertIn("mobile build", html)
    self.assertIn("app distribution", html)
```

- [ ] **Step 2: 运行定向测试并确认失败原因**

Run:

```bash
python3 -m unittest \
  tests.test_site_smoke.SiteSmokeTest.test_home_links_current_project_sites \
  tests.test_site_smoke.SiteSmokeTest.test_bakery_is_a_first_class_home_project \
  tests.test_site_smoke.SiteSmokeTest.test_bakery_project_uses_three_column_responsive_layout \
  tests.test_site_smoke.SiteSmokeTest.test_home_metadata_covers_mobile_build_and_distribution -v
```

Expected: `FAILED (failures=4)`；失败信息分别指出 `/bakery-site/`、Bakery 导航/数据、三列/amber 样式和 SEO 文案尚不存在。

- [ ] **Step 3: 在项目数据中新增 Bakery 并同步产品叙事**

在 `src/site-data.js` 的 Babel 项目之后加入：

```javascript
  {
    name: "Bakery",
    label: "Mobile build and delivery",
    href: "/bakery-site/",
    status: "Build & distribution",
    tone: "amber",
    summary:
      "Self-hosted mobile delivery that connects CI triggers, live pipeline visibility, versioned artifacts, and app distribution in one workspace.",
    points: ["CI integration", "Pipeline visibility", "Artifact distribution"],
  },
```

将三个 proof point 的 `body` 更新为：

```javascript
body: "Roost controls Flutter patch rollout, Babel manages localization as code, and Bakery connects mobile builds to installable artifacts.",
```

```javascript
body: "The tools are shaped around infrastructure that can run close to the code, build systems, artifacts, reviewers, and operators.",
```

```javascript
body: "Release bases, build stages, artifacts, strings, reviews, and promotions should be inspectable instead of living in chat or terminal history.",
```

将 `operatingPrinciples` 的前两个 `body` 更新为：

```javascript
body: "The products are designed for repeated delivery work: clear states, review gates, explicit inputs, visible pipelines, and inspectable outcomes.",
```

```javascript
body: "Code, strings, build context, release artifacts, and docs should stay connected to the source of truth instead of becoming disconnected admin chores.",
```

将 `currentFocus` 的 `Mobile release operations` 文案更新为：

```javascript
body: "Build orchestration, pipeline visibility, patch generation, artifact distribution, promotion, rollback, and release evidence.",
```

- [ ] **Step 4: 在导航、首屏和产品地图中加入 Bakery**

在 `src/app.js` 顶部导航的 Babel 链接之后加入：

```html
<a href="/bakery-site/">Bakery</a>
```

将首屏说明替换为：

```html
<p class="hero__lede">
  ReverseScale builds practical systems for app delivery, localization, release operations, and engineering workflows.
  Roost handles Flutter patch delivery; Babel handles localization as code; Bakery connects mobile builds, artifacts, and distribution.
</p>
```

在 Babel 操作按钮之后加入：

```html
<a class="button button--secondary" href="/bakery-site/">Explore Bakery</a>
```

将 `.flow` 的节点内容替换为：

```html
<span class="node node--root">Team</span>
<span class="line"></span>
<span class="node node--green">Release</span>
<span class="line"></span>
<span class="node node--blue">Strings</span>
<span class="line"></span>
<span class="node node--amber">Builds</span>
```

将 principles 介绍文案更新为：

```html
<p>Roost, Babel, and Bakery solve different problems, but they follow the same operating model.</p>
```

- [ ] **Step 5: 增加三列项目布局和 Bakery 暖色标识**

在 `src/styles.css` 中把 `.project-grid` 的桌面列数改为：

```css
grid-template-columns: repeat(3, minmax(0, 1fr));
```

在 `.project-card--sky` 之后加入：

```css
.project-card--amber {
  border-top: 4px solid var(--amber);
}
```

将 `.flow` 的桌面网格改为支持四个节点和三条连接线：

```css
grid-template-columns: auto minmax(18px, 1fr) auto minmax(18px, 1fr) auto minmax(18px, 1fr) auto;
```

在现有 `.node--blue` 规则之后加入：

```css
.node--amber {
  border-color: rgba(180, 83, 9, 0.22);
  background: rgba(180, 83, 9, 0.08);
  color: var(--amber);
}
```

保留 `@media (max-width: 860px)` 中 `.project-grid { grid-template-columns: 1fr; }` 的现有折叠行为，并保留 `@media (max-width: 560px)` 中 `.flow { grid-template-columns: 1fr; }` 的竖向产品地图。

- [ ] **Step 6: 更新 SEO 与无 JavaScript 入口**

将 `index.html` 的 description 更新为：

```html
content="ReverseScale builds self-hosted product infrastructure for mobile build, Flutter patch delivery, localization workflow, and app distribution."
```

将 Open Graph description 更新为：

```html
<meta property="og:description" content="Self-hosted tools for mobile build, release operations, localization, and app distribution." />
```

在 `<noscript>` 的 Babel 链接之后加入：

```html
<a href="/bakery-site/">Bakery</a>
```

- [ ] **Step 7: 运行定向测试并确认通过**

Run:

```bash
python3 -m unittest \
  tests.test_site_smoke.SiteSmokeTest.test_home_links_current_project_sites \
  tests.test_site_smoke.SiteSmokeTest.test_bakery_is_a_first_class_home_project \
  tests.test_site_smoke.SiteSmokeTest.test_bakery_project_uses_three_column_responsive_layout \
  tests.test_site_smoke.SiteSmokeTest.test_home_metadata_covers_mobile_build_and_distribution -v
```

Expected: `Ran 4 tests` 和 `OK`。

- [ ] **Step 8: 运行完整回归和静态检查**

Run:

```bash
python3 -m unittest discover -s tests -v
git diff --check
```

Expected: 全部测试为 `ok`，测试总结为 `OK`，`git diff --check` 无输出。

- [ ] **Step 9: 验证 Bakery 线上目标可访问**

Run:

```bash
curl -L --max-time 20 -sS -o /dev/null -w '%{http_code} %{url_effective}\n' https://reversescale.github.io/bakery-site/
```

Expected:

```text
200 https://reversescale.github.io/bakery-site/
```

- [ ] **Step 10: 提交实现**

```bash
git add \
  docs/superpowers/plans/2026-07-20-bakery-home-integration.md \
  tests/test_site_smoke.py \
  src/site-data.js \
  src/app.js \
  src/styles.css \
  index.html
git commit -m "feat: add Bakery to ReverseScale homepage"
```

Expected: 提交包含实施计划、测试、项目数据、页面模板、样式和 SEO 变更，不包含 `bakery/site` 或其他无关文件。
