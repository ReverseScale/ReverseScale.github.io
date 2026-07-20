# Tim Portfolio Experience Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 缩短移动端首页、恢复手机 GitHub 入口、消除含义模糊的年份，并补齐个人站基础 SEO。

**Architecture:** 保持现有 Web Component 与静态站点结构，只为导航链接增加职责明确的 class，并通过现有 `max-width: 680px` 媒体查询裁剪移动端内容。动态版权年份在 `app.js` 渲染阶段生成；canonical 与 `Person` JSON-LD 直接写入静态首页 head。

**Tech Stack:** 原生 HTML、CSS、JavaScript Web Components、Python `unittest`、GitHub Pages

## Global Constraints

- 桌面导航保持 `Work / Research / About / GitHub`。
- `max-width: 680px` 下显示 GitHub，隐藏 Research 与 `.hero-work`。
- 320px 宽度不得出现横向滚动或导航重叠。
- 手机 section 纵向 padding 为 `56px`。
- 首屏项目标签使用 `3 projects`，不得使用含义模糊的 `2026`。
- 版权年份必须通过 `new Date().getFullYear()` 生成。
- 首页 canonical 必须是 `https://reversescale.github.io/`。
- JSON-LD 类型必须是 `Person`，并包含 GitHub `sameAs`。
- 不修改三个项目站点，不虚构个人经历和项目状态，不恢复主站文章列表。

---

### Task 1: 移动端导航、内容裁剪与动态年份

**Files:**
- Modify: `tests/test_site_smoke.py`
- Modify: `src/app.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `profile.github.href`、`profile.research.href` 与现有 `.hero-work` 结构。
- Produces: `.nav-research`、`.nav-github` 响应式控制点，以及 `currentYear: number` 渲染值。

- [ ] **Step 1: 写入失败测试**

在 `SiteSmokeTest` 中新增：

```python
def test_mobile_navigation_keeps_github_and_removes_duplicate_project_preview(self) -> None:
    app_source = read("src/app.js")
    styles = read("src/styles.css")

    self.assertIn('class="nav-research"', app_source)
    self.assertIn('class="nav-github nav-external"', app_source)
    self.assertIn(".nav-research", styles)
    self.assertIn(".nav-github", styles)
    self.assertIn(".hero-work", styles)
    self.assertIn("display: none;", styles)
    self.assertIn("padding: 56px 0;", styles)

def test_project_label_and_footer_year_do_not_go_stale(self) -> None:
    app_source = read("src/app.js")

    self.assertIn("3 projects", app_source)
    self.assertIn("new Date().getFullYear()", app_source)
    self.assertNotIn("© 2026", app_source)
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
python3 -m unittest \
  tests.test_site_smoke.SiteSmokeTest.test_mobile_navigation_keeps_github_and_removes_duplicate_project_preview \
  tests.test_site_smoke.SiteSmokeTest.test_project_label_and_footer_year_do_not_go_stale -v
```

Expected: 两个测试均 FAIL，分别缺少导航 class、`3 projects` 与动态年份。

- [ ] **Step 3: 写入最小实现**

在 `src/app.js` 中将导航与年份改为：

```js
<a class="nav-research" href="${profile.research.href}" target="_blank" rel="noreferrer">Research</a>
<a class="nav-github nav-external" href="${profile.github.href}" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
```

```js
<p><span>Selected work</span><span>3 projects</span></p>
```

```js
const currentYear = new Date().getFullYear();
```

```js
<span>© ${currentYear} ${escapeHtml(profile.name)}</span>
```

在 `src/styles.css` 的 `@media (max-width: 680px)` 中替换原 `.nav-external` 隐藏规则，并压缩纵向空间：

```css
.site-nav .nav-research {
  display: none;
}

.site-nav .nav-github {
  display: block;
  border: 0;
  background: transparent;
}

.hero-work {
  display: none;
}

.section {
  padding: 56px 0;
}

.principle-card,
.principle-card + .principle-card {
  padding: 16px 0 24px;
}

.principle-card h3 {
  margin-top: 24px;
}
```

- [ ] **Step 4: 运行目标测试与完整测试**

Run:

```bash
python3 -m unittest \
  tests.test_site_smoke.SiteSmokeTest.test_mobile_navigation_keeps_github_and_removes_duplicate_project_preview \
  tests.test_site_smoke.SiteSmokeTest.test_project_label_and_footer_year_do_not_go_stale -v
python3 -m unittest discover -s tests -v
node --check src/app.js
git diff --check
```

Expected: 目标测试 PASS，完整测试无失败，JavaScript 与 diff 检查退出码为 0。

- [ ] **Step 5: 提交**

```bash
git add src/app.js src/styles.css tests/test_site_smoke.py
git commit -m "fix: streamline Tim portfolio on mobile"
```

---

### Task 2: 首页 canonical 与 Person 结构化数据

**Files:**
- Modify: `tests/test_site_smoke.py`
- Modify: `index.html`

**Interfaces:**
- Consumes: 已确认的站点 URL `https://reversescale.github.io/` 与 GitHub URL `https://github.com/ReverseScale`。
- Produces: 搜索引擎可读取的 canonical link 与 `application/ld+json` Person 对象。

- [ ] **Step 1: 写入失败测试**

在 `SiteSmokeTest` 中新增：

```python
def test_home_declares_canonical_person_metadata(self) -> None:
    html = read("index.html")

    self.assertIn('<link rel="canonical" href="https://reversescale.github.io/" />', html)
    self.assertIn('type="application/ld+json"', html)
    self.assertIn('"@type": "Person"', html)
    self.assertIn('"name": "Tim"', html)
    self.assertIn('"url": "https://reversescale.github.io/"', html)
    self.assertIn('"https://github.com/ReverseScale"', html)
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_home_declares_canonical_person_metadata -v
```

Expected: FAIL，首页尚未声明 canonical。

- [ ] **Step 3: 写入最小 SEO 实现**

在 `index.html` 的 favicon 之前加入：

```html
<link rel="canonical" href="https://reversescale.github.io/" />
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Tim",
    "url": "https://reversescale.github.io/",
    "jobTitle": "Independent software developer",
    "sameAs": ["https://github.com/ReverseScale"],
    "knowsAbout": ["Mobile engineering", "Delivery workflows", "Developer tools"]
  }
</script>
```

- [ ] **Step 4: 运行目标测试与完整验证**

Run:

```bash
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_home_declares_canonical_person_metadata -v
python3 -m unittest discover -s tests -v
node --check src/app.js
node --check src/site-data.js
git diff --check
```

Expected: 全部测试 PASS，语法与 diff 检查退出码为 0。

- [ ] **Step 5: 浏览器验收**

使用本地静态服务器和 Browser：

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

验收：

- 1440×900：首页顶部显示四个导航项与首屏三项目预览。
- 390×844：首页顶部显示 `Work / About / GitHub`，不显示 Research 与首屏三项目预览。
- 320×700：`document.documentElement.scrollWidth === 320`，导航不重叠。
- 三个尺寸均无 console error 或 warning。

- [ ] **Step 6: 提交并发布**

```bash
git add index.html tests/test_site_smoke.py docs/superpowers/plans/2026-07-20-tim-portfolio-experience-polish.md
git commit -m "feat: add personal site search metadata"
git push origin master
```

推送后验证：

```bash
curl -L -s https://reversescale.github.io/ | rg 'canonical|application/ld\+json|3 projects'
```

Expected: 公网页面包含 canonical 与 JSON-LD，公网 `src/app.js` 包含 `3 projects`。
