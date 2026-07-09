# Modern Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `ReverseScale.github.io` as a modern ReverseScale portfolio gateway that matches the newer Roost and Babel project sites.

**Architecture:** Replace the old Hexo-generated root shell with a no-build Web Components app that GitHub Pages can serve directly from `master`. Make the root experience a current product/project index rather than an old blog feed, and route research notes to the user's Notion workspace as an external entrypoint.

**Tech Stack:** Browser-native ES modules, custom elements, static HTML/CSS, Python unittest smoke tests.

## Global Constraints

- Default user-facing copy and documentation use Simplified Chinese unless product names or source labels are already English.
- No Node/Bun/Deno toolchain is available in the current environment, so the deployed site must not require a build step.
- Root page must link to `/roost-site/` and `/babel-site/`.
- Old Hexo archive content remains in the repository but is not exposed as a primary main-site module.
- New pages do not reuse the old Hexo theme visuals or `css/images` assets.
- Public copy positions ReverseScale around self-hosted mobile product infrastructure, not generic project indexing.
- Public navigation includes Roost, Babel, and an external Research entrypoint to Notion.
- The main site does not load `content.json` or render a local notes/articles module.
- GitHub Pages must be able to serve `index.html` and `404.html` directly.

---

### Task 1: Site Smoke Contract

**Files:**
- Create: `tests/test_site_smoke.py`

**Interfaces:**
- Consumes: root static files.
- Produces: test assertions that later tasks must satisfy.

- [x] **Step 1: Write the failing test**

```python
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")

def test_home_shell_uses_modern_reverse_scale_entrypoint():
    html = read("index.html")
    assert "ReverseScale" in html
    assert "src/app.js" in html
    assert "src/styles.css" in html
    assert "Hexo 3.8.0" not in html
    assert "Tim's Technology Blog" not in html

def test_home_links_current_project_sites():
    html = read("index.html")
    assert "/roost-site/" in html
    assert "/babel-site/" in html

def test_app_module_defines_componentized_site():
    source = read("src/app.js")
    assert "customElements.define(\"rs-home\"" in source
    assert "projectLinks" in source
    assert "self-hosted product infrastructure" in source + read("src/site-data.js")
    assert "Mobile release operations" in source + read("src/site-data.js")

def test_app_links_research_workspace_without_restoring_notes_module():
    source = read("src/app.js") + read("src/site-data.js")
    assert "Research" in source
    assert "https://app.notion.com/p/timsappworkspace/Research-and-Insight-5fda3475a090427da9ac9b5c59964381" in source
    assert "renderArticleLibrary" not in source

def test_404_uses_same_modern_shell():
    html = read("404.html")
    assert "ReverseScale" in html
    assert "src/app.js" in html
    assert "rs-home" in html
```

- [x] **Step 2: Run test to verify it fails**

Run: `python3 -m unittest discover -s tests -v`
Expected: FAIL because the old Hexo `index.html` still exists and `src/app.js` does not exist.

---

### Task 2: Modern Static App

**Files:**
- Create: `src/site-data.js`
- Create: `src/app.js`
- Create: `src/styles.css`
- Modify: `index.html`
- Modify: `404.html`

**Interfaces:**
- Consumes: `projectLinks`, `researchLink`, `currentFocus`, `operatingPrinciples`, and `proofPoints` exports from `src/site-data.js`.
- Produces: `<rs-home>` custom element rendered by `src/app.js`, including product sections and an external Research link to Notion.

- [x] **Step 1: Implement data module**

Create typed-by-shape data arrays for project links, the Notion research link, operating principles, current focus, and proof points.

- [x] **Step 2: Implement custom element**

Define `ReverseScaleHome extends HTMLElement`, render sections from `src/site-data.js`, and register `customElements.define("rs-home", ReverseScaleHome)`.

- [x] **Step 3: Implement modern responsive CSS**

Use a restrained product palette, stable layout constraints, responsive grid, accessible focus styles, and no decorative old theme assets.

- [x] **Step 4: Replace root shell**

Write a minimal `index.html` with metadata, `src/styles.css`, `src/app.js`, and `<rs-home></rs-home>`.

- [x] **Step 5: Replace 404 shell**

Use the same app shell and let it render a friendly "not found" state while preserving navigation.

---

### Task 3: Key Legacy Entrypoints

**Files:**
- Modify: `about/index.html`
- Modify: `archives/index.html`
- Modify: `categories/index.html`
- Modify: `tags/index.html`

**Interfaces:**
- Consumes: the same `src/app.js` and `src/styles.css` from Task 2.
- Produces: consistent modern pages for old top-level navigation paths.

- [x] **Step 1: Replace top-level legacy pages with the modern shell**

Use relative links to `../src/styles.css` and `../src/app.js`, and render `<rs-home></rs-home>`.

- [x] **Step 2: Keep deep historical posts untouched**

Do not rewrite individual old post pages in this task; the modern shell no longer presents a local article library.

---

### Task 4: Verification

**Files:**
- Modify only if verification exposes defects.

**Interfaces:**
- Consumes: all site files.
- Produces: test and static validation evidence.

- [x] **Step 1: Run smoke tests**

Run: `python3 -m unittest discover -s tests -v`
Expected: PASS.

- [x] **Step 2: Run git whitespace check**

Run: `git diff --check`
Expected: no output and exit 0.

- [x] **Step 3: Inspect changed file list**

Run: `git status --short`
Expected: only planned files are changed or added.
