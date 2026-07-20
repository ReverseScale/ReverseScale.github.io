# Tim 个人作品站改造实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ReverseScale 产品门户改造成以 Tim 为主身份的个人作品站，并用三套不变形的项目微缩视觉、独立 About 页面、Notion Research 和 GitHub 入口建立可信的个人作品展示。

**Architecture:** 保持无构建静态站与 `<rs-home>` Custom Element。`src/site-data.js` 提供个人资料、项目和工作原则，`src/app.js` 根据 `page` 属性渲染 home/about/404，`src/styles.css` 提供编辑式布局和三套项目视觉；所有页面继续由 GitHub Pages 直接提供。

**Tech Stack:** HTML5、CSS Grid/Flexbox、原生 JavaScript ES Modules、Custom Elements、Python `unittest`

## Global Constraints

- 首页主身份使用 `Tim`，黑色字标使用 `T`，ReverseScale 不作为首页主叙事。
- 专业身份使用 `Independent software developer focused on mobile engineering, delivery workflows, and developer tools.`
- 首页主标题使用 `I build tools for mobile teams.`
- 主站不展示文章列表，不读取 `content.json`，Research 继续指向既有 Notion 页面。
- 公开联系方式仅使用 `https://github.com/ReverseScale`，不公开邮箱和头像。
- 项目站点保持 `/roost-site/`、`/babel-site/`、`/bakery-site/`；不展示当前公开访问为 404 的项目源码链接。
- 首屏视觉类型固定为 Roost=`package`、Babel=`strings`、Bakery=`pipeline`。
- `max-width: 860px` 后首屏和项目布局折叠为单列，微缩卡片不得依赖绝对定位完成主要布局。
- 不修改 Roost、Babel、Bakery 仓库，不引入框架、构建步骤、远程运行时请求或生成图片。
- 保留工作区内其他任务的未跟踪计划文件，不批量暂存。

---

## 文件结构

- `src/site-data.js`：Tim 个人资料、三个项目、视觉类型和工作原则的单一内容来源。
- `src/app.js`：共享导航、页脚、项目卡片、三种微缩视觉以及 home/about/404 页面渲染。
- `src/styles.css`：个人站编辑式视觉、首屏作品堆叠、项目区、About、Research、页脚和响应式规则。
- `index.html`：个人首页 SEO 与无 JavaScript 导航。
- `about/index.html`：独立 About 页入口和 SEO。
- `404.html`：Tim 个人站 404 入口。
- `tests/test_site_smoke.py`：个人身份、项目视觉、About、外链、文章边界和响应式契约。
- `.gitignore`：忽略视觉伴侣生成的 `.superpowers/` 临时目录。

### Task 1: 建立 Tim 个人资料与项目视觉数据契约

**Files:**
- Modify: `tests/test_site_smoke.py:12-100`
- Modify: `src/site-data.js:1-86`

**Interfaces:**
- Consumes: 现有 `projectLinks` 中的 `name`、`href`、`tone`、`summary`、`points`。
- Produces: `profile` 对象；`projectLinks[*].visual` 的 `package | strings | pipeline` 枚举；`workingPrinciples` 数组。

- [ ] **Step 1: 写入失败的数据契约测试**

在 `SiteSmokeTest` 中新增：

```python
def test_personal_profile_and_project_visual_contract(self) -> None:
    data_source = read("src/site-data.js")

    self.assertIn("export const profile", data_source)
    self.assertIn('name: "Tim"', data_source)
    self.assertIn('mark: "T"', data_source)
    self.assertIn('role: "Independent software developer"', data_source)
    self.assertIn("mobile engineering, delivery workflows, and developer tools", data_source)
    self.assertIn("https://github.com/ReverseScale", data_source)
    self.assertIn('visual: "package"', data_source)
    self.assertIn('visual: "strings"', data_source)
    self.assertIn('visual: "pipeline"', data_source)
    self.assertIn("export const workingPrinciples", data_source)

def test_project_data_does_not_expose_private_source_links(self) -> None:
    data_source = read("src/site-data.js")

    self.assertNotIn("https://github.com/ReverseScale/roost", data_source)
    self.assertNotIn("https://github.com/ReverseScale/label", data_source)
    self.assertNotIn("https://github.com/ReverseScale/bakery", data_source)
```

- [ ] **Step 2: 运行数据契约测试并确认失败**

Run:

```bash
python3 -m unittest \
  tests.test_site_smoke.SiteSmokeTest.test_personal_profile_and_project_visual_contract \
  tests.test_site_smoke.SiteSmokeTest.test_project_data_does_not_expose_private_source_links -v
```

Expected: 第一个测试因缺少 `profile` 和 `visual` 字段失败；第二个测试通过，证明现有数据没有私有源码链接。

- [ ] **Step 3: 在 `src/site-data.js` 增加个人资料**

在文件顶部加入：

```javascript
export const profile = Object.freeze({
  name: "Tim",
  mark: "T",
  role: "Independent software developer",
  focus: "Mobile engineering, delivery workflows, and developer tools.",
  description:
    "I’m Tim, an independent software developer focused on mobile engineering, delivery workflows, and developer tools.",
  story:
    "I build practical, self-hosted software around the work between code and release. These projects grow from real engineering problems: shipping mobile changes, keeping product strings reviewable, and making build artifacts easier to understand and deliver.",
  github: {
    label: "GitHub",
    href: "https://github.com/ReverseScale",
  },
  research: {
    label: "Research",
    href: "https://app.notion.com/p/timsappworkspace/Research-and-Insight-5fda3475a090427da9ac9b5c59964381?source=copy_link",
    summary: "Notes and research live in Notion.",
  },
});
```

- [ ] **Step 4: 为三个项目声明视觉类型和个人作品语气**

分别在三个项目对象的 `tone` 后增加：

```javascript
visual: "package",
```

```javascript
visual: "strings",
```

```javascript
visual: "pipeline",
```

将三个项目的 `status`、`label` 和 `summary` 保持为当前真实内容，不加入源码 URL 或虚构指标。

- [ ] **Step 5: 增加工作原则数据**

在 `projectLinks` 后加入：

```javascript
export const workingPrinciples = [
  {
    title: "Make state visible",
    body: "Delivery work should expose its inputs, progress, and outcomes instead of hiding them in scripts or chat history.",
  },
  {
    title: "Keep changes reviewable",
    body: "Strings, release context, and automation should remain close to source control and human review.",
  },
  {
    title: "Prefer practical control",
    body: "Self-hosting is useful when it keeps infrastructure understandable, operable, and close to the team using it.",
  },
];
```

保留旧 `researchLink`、`proofPoints`、`operatingPrinciples`、`currentFocus` 导出到 Task 2，避免当前 `src/app.js` 在本任务提交时导入失败。

- [ ] **Step 6: 重新运行数据契约与完整基线**

Run:

```bash
python3 -m unittest discover -s tests -v
node --check src/site-data.js
git diff --check
```

Expected: 所有现有测试与 2 个新测试通过；JavaScript 语法检查退出码为 0；`git diff --check` 无输出。

- [ ] **Step 7: 提交内容数据契约**

```bash
git add src/site-data.js tests/test_site_smoke.py
git commit -m "feat: define Tim portfolio content model"
```

Expected: 提交只包含 `src/site-data.js` 和 `tests/test_site_smoke.py`。

### Task 2: 重做个人首页与三种项目微缩视觉

**Files:**
- Modify: `tests/test_site_smoke.py`
- Modify: `src/site-data.js`
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: Task 1 的 `profile`、`projectLinks[*].visual`、`workingPrinciples`。
- Produces: `renderHome()`、`projectMicroVisual(visual)`、`heroProjectCard(project)`、共享 `siteHeader()` 与 `siteFooter()`；首页 `#work`、`#about`、`#research` 区域。

- [ ] **Step 1: 写入失败的个人首页测试**

新增或替换首页断言：

```python
def test_home_presents_tim_personal_identity_and_navigation(self) -> None:
    html = read("index.html")
    app_source = read("src/app.js")

    self.assertIn("Tim — Mobile engineering & developer tools", html)
    self.assertIn("I build tools for mobile teams.", app_source)
    self.assertIn('href="/#work">Work</a>', app_source)
    self.assertIn('href="/about/">About</a>', app_source)
    self.assertIn("https://github.com/ReverseScale", app_source)
    self.assertIn("Independent software developer", app_source)
    self.assertNotIn("Self-hosted tools for shipping mobile products", app_source)

def test_home_renders_distinct_project_micro_visuals(self) -> None:
    source = read("src/app.js") + read("src/styles.css")

    self.assertIn("projectMicroVisual", source)
    self.assertIn('visual === "package"', source)
    self.assertIn('visual === "strings"', source)
    self.assertIn('visual === "pipeline"', source)
    self.assertIn("hero-work-stack", source)
    self.assertNotIn('class="flow"', source)
    self.assertNotIn(".flow {", source)

def test_home_keeps_work_research_and_about_without_article_feed(self) -> None:
    source = read("src/app.js")

    self.assertIn('id="work"', source)
    self.assertIn('id="about"', source)
    self.assertIn('id="research"', source)
    self.assertIn("Notes and research live in Notion.", read("src/site-data.js"))
    self.assertNotIn("content.json", source)
    self.assertNotIn("renderArticleLibrary", source)
```

更新旧测试，使首页入口仍断言 `/roost-site/`、`/babel-site/`、`/bakery-site/`，但不再要求顶部导航直接包含三个项目名；将旧 `ReverseScale` 品牌断言改为 `Tim`。

- [ ] **Step 2: 运行首页定向测试并确认失败**

Run:

```bash
python3 -m unittest \
  tests.test_site_smoke.SiteSmokeTest.test_home_presents_tim_personal_identity_and_navigation \
  tests.test_site_smoke.SiteSmokeTest.test_home_renders_distinct_project_micro_visuals \
  tests.test_site_smoke.SiteSmokeTest.test_home_keeps_work_research_and_about_without_article_feed -v
```

Expected: 3 个测试失败，分别指出旧 SEO/身份、旧 `.flow` 视觉和缺少 About/Research 区域。

- [ ] **Step 3: 重写 `src/app.js` 的共享组件和首页**

将导入改为：

```javascript
import { profile, projectLinks, workingPrinciples } from "./site-data.js";
```

保留当前 `escapeHtml`、`projectCard` 和 `principleCard`；删除不再使用的 `proofCard` 与 `focusCard`。新增固定视觉选择函数：

```javascript
const projectMicroVisual = (visual) => {
  if (visual === "package") {
    return `
      <span class="micro-visual micro-visual--package" aria-hidden="true">
        <span class="package-box"><i></i><b>PATCH</b></span>
        <span class="package-state"><i></i><i></i><i></i></span>
      </span>
    `;
  }

  if (visual === "strings") {
    return `
      <span class="micro-visual micro-visual--strings" aria-hidden="true">
        <i>home.title</i><i>Welcome</i><i>Willkommen</i><i>欢迎</i>
      </span>
    `;
  }

  return `
    <span class="micro-visual micro-visual--pipeline" aria-hidden="true">
      <i class="is-complete"></i><b></b><i class="is-complete"></i><b></b><i></i>
    </span>
  `;
};
```

新增首屏作品卡：

```javascript
const heroProjectCard = (project) => `
  <a class="hero-project hero-project--${project.tone}" href="${project.href}">
    <span class="hero-project__copy">
      <span class="hero-project__meta">
        <span>${escapeHtml(project.status)}</span>
        <span class="active-state">Active</span>
      </span>
      <strong>${escapeHtml(project.name)}</strong>
      <small>${escapeHtml(project.label)}</small>
      <span class="hero-project__link">View site <span aria-hidden="true">↗</span></span>
    </span>
    ${projectMicroVisual(project.visual)}
  </a>
`;
```

共享导航实现为：

```javascript
function siteHeader() {
  return `
    <header class="site-nav" aria-label="Primary">
      <a class="brand" href="/" aria-label="Tim home">
        <span class="brand-mark" aria-hidden="true">${escapeHtml(profile.mark)}</span>
        <span><strong>${escapeHtml(profile.name)}</strong><small>${escapeHtml(profile.role)}</small></span>
      </a>
      <nav>
        <a href="/#work">Work</a>
        <a href="${profile.research.href}" target="_blank" rel="noreferrer">Research</a>
        <a href="/about/">About</a>
        <a class="nav-external" href="${profile.github.href}" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </header>
  `;
}
```

首页包含以下明确结构：

```javascript
function renderHome() {
  return `
    ${siteHeader()}
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__copy">
        <p class="eyebrow">${escapeHtml(profile.role)}</p>
        <h1 id="hero-title">I build tools for mobile teams.</h1>
        <p class="hero__lede">I work across mobile engineering, delivery workflows, and developer tools—building practical systems that stay understandable and under your control.</p>
        <div class="hero__actions">
          <a class="button button--primary" href="#work">View selected work</a>
          <a class="button button--secondary" href="/about/">About Tim</a>
        </div>
      </div>
      <div class="hero-work-stack" aria-label="Selected work">
        ${projectLinks.map(heroProjectCard).join("")}
      </div>
    </section>
    <section class="section" id="work" aria-labelledby="work-title">
      <div class="section__intro"><p class="eyebrow">Selected work</p><h2 id="work-title">Projects shaped by real delivery problems.</h2><p>Three focused tools for the work between code, review, build, and release.</p></div>
      <div class="project-grid">${projectLinks.map(projectCard).join("")}</div>
    </section>
    <section class="section about-brief" id="about" aria-labelledby="about-title">
      <div><p class="eyebrow">About</p><h2 id="about-title">Independent software, built with practical control.</h2></div>
      <div><p>${escapeHtml(profile.description)}</p><p>${escapeHtml(profile.story)}</p><div class="inline-actions"><a href="/about/">More about Tim</a><a href="${profile.github.href}" target="_blank" rel="noreferrer">GitHub ↗</a></div></div>
    </section>
    <section class="section research-callout" id="research" aria-labelledby="research-title">
      <div><p class="eyebrow">Writing & research</p><h2 id="research-title">Notes stay close to the thinking.</h2><p>${escapeHtml(profile.research.summary)}</p></div>
      <a class="button button--secondary" href="${profile.research.href}" target="_blank" rel="noreferrer">Open Research ↗</a>
    </section>
  `;
}
```

共享页脚实现为：

```javascript
function siteFooter() {
  return `
    <footer class="site-footer">
      <span><strong>Tim</strong><small>Independent software developer</small></span>
      <nav aria-label="Footer"><a href="/about/">About</a><a href="${profile.research.href}" target="_blank" rel="noreferrer">Research</a><a href="${profile.github.href}" target="_blank" rel="noreferrer">GitHub</a></nav>
    </footer>
  `;
}
```

将 `connectedCallback()` 暂时改为以下实现，使 `page="about"` 回退到首页，同时保持 404 可用；Task 3 再提取正式的 `renderAbout()` 与 `renderNotFound()`：

```javascript
connectedCallback() {
  const page = this.getAttribute("page") || "home";
  const content = page === "404"
    ? `${siteHeader()}<section class="not-found" aria-labelledby="not-found-title"><p class="eyebrow">404</p><h1 id="not-found-title">This page isn’t here.</h1><p>The project may have moved, or the route may no longer be part of this site.</p><div class="hero__actions"><a class="button button--primary" href="/">Back home</a><a class="button button--secondary" href="/#work">View work</a></div></section>`
    : renderHome();

  this.innerHTML = `<main class="site-shell">${content}${siteFooter()}</main>`;
}
```

- [ ] **Step 4: 删除不再使用的公司语气数据**

从 `src/site-data.js` 删除 `researchLink`、`proofPoints`、`operatingPrinciples`、`currentFocus`。确认 `src/app.js` 只导入 `profile`、`projectLinks`、`workingPrinciples`。

- [ ] **Step 5: 重写首页核心样式**

在 `src/styles.css` 保留全局变量、reset、按钮、导航和项目卡基础规则，删除 `.visual-panel`、`.flow`、`.node`、`.line`、`.metric-grid`、`.proof-strip`、`.proof-card`、`.focus-grid`、`.focus-card`。加入：

```css
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(390px, 0.75fr);
  gap: 64px;
  align-items: center;
  min-height: calc(100svh - 104px);
  padding: 54px 0 80px;
}

h1 {
  max-width: 720px;
  margin-bottom: 24px;
  font-size: clamp(52px, 6.4vw, 82px);
  line-height: 0.96;
  letter-spacing: -0.055em;
}

.hero-work-stack { display: grid; gap: 12px; min-width: 0; }
.hero-project { display: grid; grid-template-columns: minmax(0, 1fr) 132px; min-height: 138px; overflow: hidden; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.88); box-shadow: 0 12px 34px rgba(24,24,27,.07); }
.hero-project__copy { display: flex; min-width: 0; flex-direction: column; padding: 18px; }
.hero-project__meta { display: flex; justify-content: space-between; gap: 8px; color: var(--muted); font-size: 11px; font-weight: 750; }
.active-state { display: inline-flex; align-items: center; gap: 5px; }
.active-state::before { width: 6px; height: 6px; border-radius: 50%; background: var(--green); content: ""; }
.hero-project strong { margin-top: 13px; font-size: 24px; }
.hero-project small { margin-top: 3px; color: var(--muted); font-size: 13px; }
.hero-project__link { margin-top: auto; padding-top: 10px; font-size: 12px; font-weight: 800; }
.micro-visual { display: flex; align-items: center; justify-content: center; border-left: 1px solid var(--soft); background: #fafaf8; padding: 16px; }
.micro-visual--package { flex-direction: column; gap: 10px; }
.package-box { display: grid; width: 66px; height: 48px; place-items: center; border: 1px solid rgba(4,120,87,.25); border-radius: 8px; background: #ecfdf5; color: #065f46; font-size: 10px; }
.package-state { display: flex; gap: 5px; }
.package-state i { width: 15px; height: 5px; border-radius: 999px; background: #b7ddcf; }
.micro-visual--strings { display: grid; align-content: center; justify-content: stretch; gap: 6px; }
.micro-visual--strings i { overflow: hidden; border-radius: 4px; background: #eff6ff; padding: 5px 7px; color: #075985; font-size: 9px; font-style: normal; white-space: nowrap; }
.micro-visual--strings i:nth-child(2n) { margin-left: 12px; background: #dbeafe; }
.micro-visual--pipeline { gap: 5px; }
.micro-visual--pipeline i { width: 22px; height: 22px; border: 5px solid #f0ddcf; border-radius: 50%; }
.micro-visual--pipeline i.is-complete { border-color: #d7a47e; background: #fff7ed; }
.micro-visual--pipeline b { width: 13px; height: 2px; background: #dfc5b2; }
.about-brief { display: grid; grid-template-columns: minmax(0,.8fr) minmax(0,1fr); gap: 64px; border-top: 1px solid var(--line); }
.about-brief p { color: var(--muted); font-size: 16px; line-height: 1.75; }
.inline-actions { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 26px; font-weight: 800; }
.research-callout { display: flex; align-items: end; justify-content: space-between; gap: 32px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.78); padding: 34px; }
```

将响应式规则设置为：

```css
@media (max-width: 860px) {
  .site-nav { align-items: flex-start; flex-direction: column; }
  .site-nav nav { justify-content: flex-start; }
  .hero, .project-grid, .about-brief { grid-template-columns: 1fr; }
  .hero { min-height: auto; gap: 42px; padding-top: 34px; }
}

@media (max-width: 560px) {
  .site-nav, .hero, .section, .site-footer { width: min(100% - 24px, 1180px); }
  h1 { font-size: 48px; }
  .hero__lede { font-size: 16px; }
  .hero-project { grid-template-columns: minmax(0,1fr) 104px; min-height: 128px; }
  .micro-visual { padding: 10px; }
  .research-callout, .site-footer { align-items: flex-start; flex-direction: column; }
}
```

- [ ] **Step 6: 更新首页 SEO 与无 JavaScript 导航**

在 `index.html` 使用：

```html
<meta name="description" content="Tim is an independent software developer focused on mobile engineering, delivery workflows, and developer tools." />
<meta property="og:title" content="Tim — Mobile engineering & developer tools" />
<meta property="og:description" content="Selected work across mobile release operations, localization workflows, and developer infrastructure." />
<title>Tim — Mobile engineering & developer tools</title>
```

将 `<noscript>` 导航替换为 Work、三个项目、Research、About、GitHub 的真实链接。

- [ ] **Step 7: 运行首页定向测试与完整回归**

Run:

```bash
python3 -m unittest \
  tests.test_site_smoke.SiteSmokeTest.test_home_presents_tim_personal_identity_and_navigation \
  tests.test_site_smoke.SiteSmokeTest.test_home_renders_distinct_project_micro_visuals \
  tests.test_site_smoke.SiteSmokeTest.test_home_keeps_work_research_and_about_without_article_feed -v
python3 -m unittest discover -s tests -v
node --check src/app.js
node --check src/site-data.js
git diff --check
```

Expected: 所有测试通过；两个 JavaScript 语法检查退出码为 0；静态检查无输出。

- [ ] **Step 8: 提交个人首页**

```bash
git add index.html src/app.js src/site-data.js src/styles.css tests/test_site_smoke.py
git commit -m "feat: redesign homepage around Tim's work"
```

Expected: 提交不包含 `.superpowers/` 和其他任务的计划文件。

### Task 3: 增加独立 About、完善 404 并完成视觉验证

**Files:**
- Create: `.gitignore`
- Modify: `tests/test_site_smoke.py`
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `about/index.html`
- Modify: `404.html`
- Add to commit: `docs/superpowers/plans/2026-07-20-tim-personal-site-redesign.md`

**Interfaces:**
- Consumes: Task 1 的 `profile`、`projectLinks`、`workingPrinciples`，Task 2 的共享导航、页脚和项目卡片。
- Produces: `renderAbout()`、`renderNotFound()` 与 `page` 分派；独立 `/about/` SEO；完整个人站 shell。

- [ ] **Step 1: 写入失败的 About 与 404 测试**

新增或更新：

```python
def test_about_page_uses_dedicated_tim_content(self) -> None:
    html = read("about/index.html")
    app_source = read("src/app.js")

    self.assertIn('<rs-home page="about"></rs-home>', html)
    self.assertIn("About Tim", html)
    self.assertIn("renderAbout", app_source)
    self.assertIn("Mobile engineering", app_source)
    self.assertIn("Delivery workflows", app_source)
    self.assertIn("Developer tools", app_source)
    self.assertIn("Practical self-hosting", app_source)

def test_404_uses_tim_personal_shell(self) -> None:
    html = read("404.html")
    app_source = read("src/app.js")

    self.assertIn("Not found | Tim", html)
    self.assertIn('<rs-home page="404"></rs-home>', html)
    self.assertIn("renderNotFound", app_source)
    self.assertIn("Back home", app_source)
    self.assertIn("View work", app_source)

def test_personal_site_does_not_publish_avatar_or_email(self) -> None:
    source = read("src/app.js") + read("src/site-data.js") + read("about/index.html")

    self.assertNotIn("avatar.jpg", source)
    self.assertNotIn("mailto:", source)
    self.assertNotIn("ReverseScale@iCloud.com", source)
```

- [ ] **Step 2: 运行 About/404 测试并确认失败**

Run:

```bash
python3 -m unittest \
  tests.test_site_smoke.SiteSmokeTest.test_about_page_uses_dedicated_tim_content \
  tests.test_site_smoke.SiteSmokeTest.test_404_uses_tim_personal_shell \
  tests.test_site_smoke.SiteSmokeTest.test_personal_site_does_not_publish_avatar_or_email -v
```

Expected: About 与 404 测试失败；隐私边界测试通过。

- [ ] **Step 3: 在 `src/app.js` 增加 About 与 404 渲染**

增加：

```javascript
function renderAbout() {
  return `
    ${siteHeader()}
    <section class="about-hero" aria-labelledby="about-page-title">
      <p class="eyebrow">About</p>
      <h1 id="about-page-title">About Tim</h1>
      <p class="about-hero__lede">${escapeHtml(profile.description)}</p>
      <p>${escapeHtml(profile.story)}</p>
    </section>
    <section class="section" aria-labelledby="focus-areas-title">
      <div class="section__intro"><p class="eyebrow">Focus areas</p><h2 id="focus-areas-title">The work I keep returning to.</h2></div>
      <div class="focus-area-grid">
        <article><h3>Mobile engineering</h3><p>Shipping mobile changes with clear release context and practical operational control.</p></article>
        <article><h3>Delivery workflows</h3><p>Making build progress, artifacts, promotion, and rollout easier to inspect.</p></article>
        <article><h3>Developer tools</h3><p>Reducing repetitive work while keeping inputs and outcomes understandable.</p></article>
        <article><h3>Practical self-hosting</h3><p>Keeping important infrastructure close to the code and the people operating it.</p></article>
      </div>
    </section>
    <section class="section section--split" aria-labelledby="principles-title">
      <div class="section__intro"><p class="eyebrow">How I work</p><h2 id="principles-title">Clear systems leave useful evidence.</h2></div>
      <div class="principle-grid">${workingPrinciples.map(principleCard).join("")}</div>
    </section>
    <section class="section" aria-labelledby="about-work-title">
      <div class="section__intro"><p class="eyebrow">Selected work</p><h2 id="about-work-title">Projects</h2></div>
      <div class="project-grid">${projectLinks.map(projectCard).join("")}</div>
    </section>
  `;
}

function renderNotFound() {
  return `
    ${siteHeader()}
    <section class="not-found" aria-labelledby="not-found-title">
      <p class="eyebrow">404</p><h1 id="not-found-title">This page isn’t here.</h1>
      <p>The project may have moved, or the route may no longer be part of this site.</p>
      <div class="hero__actions"><a class="button button--primary" href="/">Back home</a><a class="button button--secondary" href="/#work">View work</a></div>
    </section>
  `;
}
```

将 `connectedCallback()` 的页面分派改为：

```javascript
const content = page === "about" ? renderAbout() : page === "404" ? renderNotFound() : renderHome();
this.innerHTML = `<main class="site-shell">${content}${siteFooter()}</main>`;
```

- [ ] **Step 4: 增加 About 与 404 样式**

在 `src/styles.css` 增加：

```css
.about-hero, .not-found { width: min(900px, calc(100% - 32px)); margin-inline: auto; padding: 96px 0 76px; }
.about-hero h1, .not-found h1 { max-width: 820px; }
.about-hero__lede { max-width: 780px; color: var(--ink); font-size: clamp(24px,3vw,34px); line-height: 1.35; letter-spacing: -.025em; }
.about-hero > p:last-child, .not-found > p { max-width: 720px; color: var(--muted); font-size: 17px; line-height: 1.75; }
.focus-area-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; margin-top: 28px; }
.focus-area-grid article, .principle-card { border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.8); padding: 22px; }
.focus-area-grid h3, .principle-card h3 { margin: 0; font-size: 16px; }
.focus-area-grid p, .principle-card p { margin: 10px 0 0; color: var(--muted); font-size: 14px; line-height: 1.65; }
.not-found { min-height: calc(100svh - 180px); display: flex; flex-direction: column; justify-content: center; }
```

在 `max-width: 860px` 响应式规则中加入 `.focus-area-grid { grid-template-columns: 1fr; }`。

- [ ] **Step 5: 更新 About、404 HTML 与临时目录忽略规则**

`about/index.html` 使用：

```html
<meta name="description" content="About Tim, an independent software developer focused on mobile engineering, delivery workflows, and developer tools." />
<meta property="og:title" content="About Tim" />
<meta property="og:description" content="Independent software developer building practical tools for mobile teams." />
<title>About Tim</title>
...
<rs-home page="about"></rs-home>
```

将 `404.html` 标题改为：

```html
<title>Not found | Tim</title>
```

创建 `.gitignore`：

```gitignore
.superpowers/
```

- [ ] **Step 6: 运行定向测试、完整测试和静态检查**

Run:

```bash
python3 -m unittest \
  tests.test_site_smoke.SiteSmokeTest.test_about_page_uses_dedicated_tim_content \
  tests.test_site_smoke.SiteSmokeTest.test_404_uses_tim_personal_shell \
  tests.test_site_smoke.SiteSmokeTest.test_personal_site_does_not_publish_avatar_or_email -v
python3 -m unittest discover -s tests -v
node --check src/app.js
node --check src/site-data.js
git diff --check
```

Expected: 所有测试通过；JavaScript 与静态检查退出码为 0。

- [ ] **Step 7: 启动本地站点并完成桌面/移动视觉检查**

Run:

```bash
python3 -m http.server 4173
```

在浏览器检查：

- `http://localhost:4173/`，桌面视口 1440×900。
- `http://localhost:4173/`，移动视口 390×844。
- `http://localhost:4173/about/`，桌面和移动视口。
- `http://localhost:4173/404.html`，桌面视口。

Expected: 首屏三张卡片比例正常；Roost 离线包、Babel 字符串、Bakery Pipeline 视觉互相区分；移动端无水平滚动；About 不重复首页；控制台无 error/warn。

- [ ] **Step 8: 验证外部链接**

Run:

```bash
for url in \
  https://reversescale.github.io/roost-site/ \
  https://reversescale.github.io/babel-site/ \
  https://reversescale.github.io/bakery-site/ \
  https://github.com/ReverseScale; do
  curl -L --max-time 20 -sS -o /dev/null -w '%{http_code} %{url_effective}\n' "$url"
done
```

Expected: 四个目标均返回成功 HTTP 状态；Notion 外链只验证 URL 保留，不自动跟随登录态页面。

- [ ] **Step 9: 提交 About、视觉收尾与实施计划**

```bash
git add \
  .gitignore \
  404.html \
  about/index.html \
  docs/superpowers/plans/2026-07-20-tim-personal-site-redesign.md \
  src/app.js \
  src/styles.css \
  tests/test_site_smoke.py
git commit -m "feat: add Tim about page and portfolio visuals"
```

Expected: 提交不包含其他任务的未跟踪计划文件；`.superpowers/` 因 `.gitignore` 不再出现在状态中。
