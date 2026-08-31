# Mobile Lab Quality Story Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**状态：** 已实现。本文档保留原始实施步骤和检查项，用于解释设计决策与交付过程，不再作为实时任务清单。

**Goal:** 把 AI App 状态探索、测试计划与任务、App × IoT 联动、报告同步回放接入 Mobile Lab 项目页，用同一条脱敏摄像头质量场景形成从发现到 CI Gate 的完整故事。

**Architecture:** 新增一个纯数据与状态模型 `mobile-lab-story.mjs`，以及一个只负责四个故事视图的渲染/交互模块 `mobile-lab-story-view.mjs`。既有 `mobile-lab.js` 只负责页面编排和挂载，新增样式放入独立 `mobile-lab-story.css`；四个视图共享不可变场景数据，但各自创建独立 cursor，避免跨区块隐式联动。

**Tech Stack:** 原生 HTML、CSS、ES Modules、Custom Elements、Python `unittest`、Node.js ESM、Chrome DevTools 浏览器验收。

**Spec:** `docs/superpowers/specs/2026-08-25-mobile-lab-quality-story-expansion-design.md`

## Global Constraints

- 保持现有无构建静态站，不新增 npm、CDN、字体、图标或运行时依赖。
- 公开项目名只能使用 `Mobile Lab`；禁止出现真实仓库名、公司名、内部域名、设备标识、账号、Job ID、IP 或凭据。
- App UI 使用抽象合成界面；设备素材只复用 `assets/mobile-lab/*.webp`。
- 所有演示数字仅描述当前 walkthrough，不暗示生产规模或真实通过率。
- AI 只能产生候选 Scenario；确定性执行、质量策略和人工边界仍决定回归与 Gate。
- `terminal` 与 `qualityDecision` 必须保持独立字段和独立视觉结论。
- 四个视图各自维护播放 cursor；禁止一个视图的点击修改另一个视图的选择状态。
- 自动播放间隔统一为 1400ms，点击播放后立即推进一步；手动选择、页面隐藏或 reduced motion 时停止播放。
- 500px 视口不得出现页面级横向溢出；核心状态不得依赖横向滚动才能读取。
- 当前工作区已有用户修改；每个任务完成后检查目标 diff，不执行 commit、push、MR 或部署，除非用户另行明确授权。

## File Structure

- Create `src/mobile-lab-story.mjs`：共享场景、探索状态、任务、能力、跨设备 Moment、回放 Marker 和纯 cursor。
- Create `src/mobile-lab-story-view.mjs`：四个 section renderer、局部播放控制器、DOM 状态更新与 `mobilelab:story-step` 事件。
- Create `src/mobile-lab-story.css`：新章节布局、状态语法、动画、响应式与 reduced-motion 降级。
- Modify `src/mobile-lab.js`：插入新章节、扩展导航、挂载/卸载 Story Views、移除旧 Evidence renderer。
- Modify `mobile-lab/index.html`：加载新增样式表。
- Modify `tests/test_site_smoke.py`：模型、结构、交互契约、脱敏和响应式测试。

---

### Task 1: 共享场景模型与独立 Cursor

**Files:**
- Create: `src/mobile-lab-story.mjs`
- Modify: `tests/test_site_smoke.py`

**Interfaces:**
- Produces: `showcaseScenario: Readonly<object>`
- Produces: `explorationStates: ReadonlyArray<ExplorationState>`
- Produces: `storyCapabilities: ReadonlyArray<StoryCapability>`
- Produces: `planTasks: ReadonlyArray<PlanTask>`
- Produces: `interactionMoments: ReadonlyArray<InteractionMoment>`
- Produces: `replayMarkers: ReadonlyArray<ReplayMarker>`
- Produces: `createStoryCursor(items, initialId?): { currentId, current, select(id), next(), reset() }`
- Produces: `getStoryItem(items, itemId)`，找不到时回退第一项。

- [ ] **Step 1: 写失败的模型契约测试**

在 `SiteSmokeTest` 增加：

```python
def test_mobilelab_story_model_connects_exploration_plan_run_and_replay(self) -> None:
    script = """
      import {
        showcaseScenario,
        explorationStates,
        storyCapabilities,
        planTasks,
        interactionMoments,
        replayMarkers,
        createStoryCursor,
      } from './src/mobile-lab-story.mjs';

      const firstCursor = createStoryCursor(explorationStates);
      const secondCursor = createStoryCursor(explorationStates);
      firstCursor.next();

      const capabilityIds = new Set(storyCapabilities.map((item) => item.id));
      const missingCapabilities = planTasks.flatMap((task) =>
        task.capabilityIds.filter((id) => !capabilityIds.has(id))
      );

      console.log(JSON.stringify({
        explorationIds: explorationStates.map((item) => item.id),
        taskIds: planTasks.map((item) => item.id),
        momentIds: interactionMoments.map((item) => item.id),
        markerKinds: [...new Set(replayMarkers.map((item) => item.kind))],
        missingCapabilities,
        cursorsAreIndependent: firstCursor.currentId !== secondCursor.currentId,
        everyMomentHasFourBeats: interactionMoments.every((moment) => moment.beats.length === 4),
        terminal: showcaseScenario.terminal,
        qualityDecision: showcaseScenario.qualityDecision,
      }));
    """
    result = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)

    self.assertEqual(payload["explorationIds"], [
        "state-home", "state-add", "state-choice",
        "state-pairing", "state-live", "state-alert",
    ])
    self.assertEqual(payload["taskIds"], [
        "task-explore", "task-pair", "task-stream",
        "task-alert", "task-evidence",
    ])
    self.assertEqual(payload["momentIds"], ["pair", "live", "alert"])
    self.assertEqual(
        payload["markerKinds"],
        ["Step", "Action", "IoT Event", "Log", "Decision"],
    )
    self.assertEqual(payload["missingCapabilities"], [])
    self.assertTrue(payload["cursorsAreIndependent"])
    self.assertTrue(payload["everyMomentHasFourBeats"])
    self.assertNotEqual(payload["terminal"], payload["qualityDecision"])
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_story_model_connects_exploration_plan_run_and_replay -v
```

Expected: FAIL，Node 报告 `ERR_MODULE_NOT_FOUND`，因为 `src/mobile-lab-story.mjs` 尚不存在。

- [ ] **Step 3: 实现场景模型**

创建 `src/mobile-lab-story.mjs`。对象字段固定如下：

```js
export const showcaseScenario = Object.freeze({
  id: "camera-confidence-run",
  title: "Camera onboarding confidence run",
  goal: "Pair a camera, verify live view, and trace an alert back to evidence.",
  terminal: "completed",
  qualityDecision: "review-ready",
});

export const explorationStates = Object.freeze([
  { id: "state-home", index: "01", label: "Home", status: "Known", action: "Scan visible entry points", evidence: "Screenshot + UI hierarchy", nextId: "state-add" },
  { id: "state-add", index: "02", label: "Add device", status: "Covered", action: "Tap Add device", evidence: "Semantic control match", nextId: "state-choice" },
  { id: "state-choice", index: "03", label: "Device choice", status: "New", action: "Choose camera", evidence: "Visual state change", nextId: "state-pairing" },
  { id: "state-pairing", index: "04", label: "Pairing", status: "Candidate", action: "Submit local network", evidence: "UI + device log", nextId: "state-live" },
  { id: "state-live", index: "05", label: "Live view", status: "Covered", action: "Open live view", evidence: "First frame + stream state", nextId: "state-alert" },
  { id: "state-alert", index: "06", label: "Alert detail", status: "Candidate", action: "Open alert", evidence: "Notification + target screen", nextId: null },
]);

export const storyCapabilities = Object.freeze([
  { id: "mobile", label: "Mobile runtime" },
  { id: "camera", label: "Camera control" },
  { id: "local-network", label: "Local network" },
  { id: "recording", label: "Synchronized evidence" },
]);

export const planTasks = Object.freeze([
  { id: "task-explore", index: "01", label: "Explore", status: "Queued", owner: "AI planner", capabilityIds: ["mobile"], completion: "Candidate path found" },
  { id: "task-pair", index: "02", label: "Pair", status: "Matched", owner: "Mobile + IoT hosts", capabilityIds: ["mobile", "camera", "local-network"], completion: "Device reports online" },
  { id: "task-stream", index: "03", label: "Stream", status: "Leased", owner: "Session runner", capabilityIds: ["mobile", "camera", "recording"], completion: "First frame verified" },
  { id: "task-alert", index: "04", label: "Alert", status: "Running", owner: "Event adapter", capabilityIds: ["mobile", "camera", "recording"], completion: "Alert opens target state" },
  { id: "task-evidence", index: "05", label: "Evidence", status: "Evidence ready", owner: "Quality reporter", capabilityIds: ["recording"], completion: "Decision context complete" },
]);

export const interactionMoments = Object.freeze([
  { id: "pair", index: "01", label: "Pair", support: "Supported", appAction: "Submit local network", deviceAction: "Pairing → Online", evidence: "UI state · device log · network result", outcome: "Camera available to the account", beats: ["App command", "Host adapter", "Device state", "Evidence"] },
  { id: "live", index: "02", label: "Live", support: "Supported", appAction: "Open live view", deviceAction: "Idle → Streaming", evidence: "First frame · stream state · player UI", outcome: "Live path is observable", beats: ["App command", "Host adapter", "Device state", "Evidence"] },
  { id: "alert", index: "03", label: "Alert", support: "Assisted", appAction: "Open received alert", deviceAction: "Event emitted → Alert available", evidence: "Event time · notification · target screen", outcome: "Alert path returns correlated evidence", beats: ["App command", "Host adapter", "Device state", "Evidence"] },
]);

export const replayMarkers = Object.freeze([
  { id: "marker-step", timeSeconds: 0, kind: "Step", label: "Scenario begins", source: "Regression contract", result: "Running" },
  { id: "marker-action", timeSeconds: 12, kind: "Action", label: "Pairing submitted", source: "Mobile automation", result: "Accepted" },
  { id: "marker-event", timeSeconds: 24, kind: "IoT Event", label: "Camera online", source: "Device adapter", result: "Observed" },
  { id: "marker-log", timeSeconds: 36, kind: "Log", label: "Live stream ready", source: "Host evidence", result: "Correlated" },
  { id: "marker-decision", timeSeconds: 49, kind: "Decision", label: "Review package ready", source: "Quality reporter", result: "Review-ready" },
]);
```

实现 `getStoryItem` 和 `createStoryCursor`；`next()` 在最后一项停住，`reset()` 回到传入的 `initialId`，每次调用 `createStoryCursor` 都返回独立闭包状态。

- [ ] **Step 4: 运行模型测试确认 GREEN**

Run:

```bash
node --check src/mobile-lab-story.mjs
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_story_model_connects_exploration_plan_run_and_replay -v
```

Expected: 两个命令 exit 0，单测 PASS。

- [ ] **Step 5: 检查本任务 diff**

Run:

```bash
git diff --check -- src/mobile-lab-story.mjs tests/test_site_smoke.py
git diff -- src/mobile-lab-story.mjs tests/test_site_smoke.py
```

Expected: 无 whitespace error；diff 只包含模型和对应测试。

---

### Task 2: Visual Exploration Map

**Files:**
- Create: `src/mobile-lab-story-view.mjs`
- Create: `src/mobile-lab-story.css`
- Modify: `src/mobile-lab.js`
- Modify: `mobile-lab/index.html`
- Modify: `tests/test_site_smoke.py`

**Interfaces:**
- Consumes: `explorationStates`, `createStoryCursor` from `mobile-lab-story.mjs`。
- Produces: `renderExplorationSection(): string`。
- Produces: `mountExplorationView(root: Element, options?): () => void`，返回 cleanup。
- Produces: 初始版 `mountMobileLabStoryViews(root)`，本任务只组合 Explore cleanup，后续任务逐项追加。
- Emits: `mobilelab:story-step` with `{ view: "exploration", stateId, source }`。

- [ ] **Step 1: 写失败的 Explore 结构测试**

```python
def test_mobilelab_exploration_map_is_visual_manual_and_bounded(self) -> None:
    source = read("src/mobile-lab.js") + read("src/mobile-lab-story-view.mjs")
    styles = read("src/mobile-lab-story.css")

    self.assertIn('id="explore"', source)
    self.assertIn("renderExplorationSection", source)
    self.assertIn('aria-label="App exploration states"', source)
    self.assertIn('data-exploration-state="${state.id}"', source)
    self.assertIn("Play exploration", source)
    self.assertIn("data-exploration-phone", source)
    self.assertIn("data-exploration-inspector", source)
    self.assertIn("exploration-map__edges", source)
    self.assertIn(".exploration-workbench", styles)
    self.assertIn(".exploration-phone", styles)
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_exploration_map_is_visual_manual_and_bounded -v
```

Expected: FAIL，`src/mobile-lab-story-view.mjs` 或 `src/mobile-lab-story.css` 不存在。

- [ ] **Step 3: 实现 Explore renderer 与控制器**

在 `src/mobile-lab-story-view.mjs` 导入模型并输出：

```js
export function renderExplorationSection() {
  return `
    <section class="lab-section exploration-section reveal" id="explore" aria-labelledby="explore-title">
      <div class="lab-section__heading lab-section__heading--row">
        <div>
          <p class="lab-eyebrow">Visual exploration map</p>
          <h2 id="explore-title">AI turns screens into a navigable product map.</h2>
        </div>
        <button class="story-play" type="button" data-exploration-play><i aria-hidden="true"></i><span>Play exploration</span></button>
      </div>
      <div class="exploration-workbench" data-story-state="state-home">
        <div class="exploration-phone" data-exploration-phone aria-label="Synthetic App state preview"></div>
        <div class="exploration-map" role="group" aria-label="App exploration states">
          <svg class="exploration-map__edges" viewBox="0 0 720 420" aria-hidden="true">
            <path d="M118 90 H250"></path><path d="M350 90 H482"></path>
            <path d="M582 90 V210 H118"></path><path d="M218 210 H350"></path>
            <path d="M450 210 H582"></path>
          </svg>
          ${explorationStates.map((state) => `
            <button type="button" data-exploration-state="${state.id}" aria-pressed="false">
              <i>${state.index}</i><strong>${state.label}</strong><span>${state.status}</span>
            </button>
          `).join("")}
        </div>
        <article class="exploration-inspector" data-exploration-inspector aria-live="polite">
          <span></span><h3></h3><p></p><dl><div><dt>Evidence</dt><dd></dd></div><div><dt>Coverage</dt><dd></dd></div></dl>
        </article>
      </div>
    </section>`;
}
```

`mountExplorationView` 必须创建自己的 cursor；`select(stateId, source)` 更新根 `data-story-state`、按钮 `aria-pressed`、手机合成 UI、Inspector 和可见动作句子，然后派发事件。播放按钮先调用一次 `cursor.next()`，再建立 1400ms interval；手动按钮、`document.visibilitychange` 和 cleanup 都清除 interval。

本任务先提供单视图组合入口：

```js
export function mountMobileLabStoryViews(root) {
  const cleanupExploration = mountExplorationView(root);
  return () => cleanupExploration();
}
```

- [ ] **Step 4: 接入页面与样式表**

在 `mobile-lab/index.html` 的现有 CSS 后增加：

```html
<link rel="stylesheet" href="../src/mobile-lab-story.css" />
```

在 `src/mobile-lab.js` 导入 `renderExplorationSection` 和 `mountMobileLabStoryViews`，将 `${renderExplorationSection()}` 插在 End-to-end flow 与 LangGraph section 之间；`connectedCallback` 将组合 cleanup 保存为 `this.storyViewsCleanup`，`disconnectedCallback` 调用并置空。

在 `src/mobile-lab-story.css` 建立三栏 workbench、抽象手机屏幕、六节点图、精确 SVG edge layer、Inspector 和激活态。节点坐标只由六个稳定的 modifier class 控制；SVG 路径端点必须落在卡片外缘。

- [ ] **Step 5: 运行 Explore 测试确认 GREEN**

Run:

```bash
node --check src/mobile-lab-story-view.mjs
node --check src/mobile-lab.js
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_exploration_map_is_visual_manual_and_bounded -v
```

Expected: 全部 exit 0，单测 PASS。

- [ ] **Step 6: 浏览器验收 Explore**

在 `http://127.0.0.1:4173/mobile-lab/#explore` 验证：六个节点可点击；播放后立即从 Home 进入 Add device；动作句子、手机 UI 和 Inspector 同步；路径不穿卡片；点击任意节点后自动播放停止；控制台无错误。

---

### Task 3: Test Plan & Task Control Plane

**Files:**
- Modify: `src/mobile-lab-story-view.mjs`
- Modify: `src/mobile-lab-story.css`
- Modify: `src/mobile-lab.js`
- Modify: `tests/test_site_smoke.py`

**Interfaces:**
- Consumes: `showcaseScenario`, `storyCapabilities`, `planTasks`, `createStoryCursor`。
- Produces: `renderPlanSection(): string`。
- Produces: `mountPlanView(root: Element): () => void`。
- Emits: `mobilelab:story-step` with `{ view: "plan", stateId, source }`。

- [ ] **Step 1: 写失败的 Plan/Task 测试**

```python
def test_mobilelab_plan_turns_quality_intent_into_schedulable_tasks(self) -> None:
    source = read("src/mobile-lab.js") + read("src/mobile-lab-story-view.mjs")
    styles = read("src/mobile-lab-story.css")

    self.assertIn('id="plan"', source)
    self.assertIn("renderPlanSection", source)
    self.assertIn("Camera onboarding confidence run", source)
    self.assertIn('data-plan-task="${task.id}"', source)
    self.assertIn('aria-label="Quality plan tasks"', source)
    self.assertIn("Show orchestration", source)
    self.assertIn("Plan", source)
    self.assertIn("Tasks", source)
    self.assertIn("Lease request", source)
    self.assertIn(".plan-control-plane", styles)
    self.assertIn(".plan-capacity", styles)
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_plan_turns_quality_intent_into_schedulable_tasks -v
```

Expected: FAIL，尚无 `renderPlanSection` 和 `#plan`。

- [ ] **Step 3: 实现 Plan renderer 与局部播放**

`renderPlanSection` 输出：Plan Brief、五个 `data-plan-task` 按钮、四个 capacity chip、`Plan → Tasks → Lease request` 结果带和 `aria-live` Task Inspector。按钮显示 `index / label / status`，Inspector 显示 `owner / capabilityIds / completion`。

`mountPlanView` 创建独立 cursor，`Show orchestration` 立即推进一个 Task 后每 1400ms 前进；状态到 `task-evidence` 后停止并把按钮文案恢复为 `Show orchestration`。每次选择只更新 `.plan-control-plane` 内部状态和 capacity chip，不访问 Explore、Farm、Interaction 或 Replay DOM。

将 `mountPlanView(root)` 的 cleanup 追加到 `mountMobileLabStoryViews`，保持 `mobile-lab.js` 只调用一个组合挂载入口。

- [ ] **Step 4: 插入页面顺序与样式**

将 `${renderPlanSection()}` 插在 LangGraph section 与 Device Farm section 之间。桌面使用 `minmax(220px, .8fr) minmax(420px, 1.5fr) minmax(220px, .8fr)` 三栏；1024px 以下 Plan Brief 与 Capacity 分居上下，Task Lane 保持完整；680px 以下全部单列，不使用横向滚动。

- [ ] **Step 5: 运行 Plan 测试确认 GREEN**

Run:

```bash
node --check src/mobile-lab-story-view.mjs
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_plan_turns_quality_intent_into_schedulable_tasks -v
```

Expected: exit 0，单测 PASS。

- [ ] **Step 6: 浏览器验收 Plan → Farm 边界**

验证选择 `Pair` 时 Mobile、Camera、Local network 高亮且 Recording 保持未选；选择 `Evidence` 时只高亮 Recording；播放不会改变 Device Farm 当前 Lease 状态；结果带明确指向下方 Device Farm，而不是伪造后台执行。

---

### Task 4: App × IoT Interaction Theatre

**Files:**
- Modify: `src/mobile-lab-story-view.mjs`
- Modify: `src/mobile-lab-story.css`
- Modify: `src/mobile-lab.js`
- Modify: `tests/test_site_smoke.py`

**Interfaces:**
- Consumes: `interactionMoments`, `createStoryCursor`。
- Produces: `renderInteractionSection(): string`。
- Produces: `mountInteractionView(root: Element): () => void`。
- Emits: `mobilelab:story-step` with `{ view: "interaction", stateId, source }`。

- [ ] **Step 1: 写失败的跨设备联动测试**

```python
def test_mobilelab_interaction_theatre_explains_pair_live_and_alert(self) -> None:
    source = read("src/mobile-lab.js") + read("src/mobile-lab-story-view.mjs")
    styles = read("src/mobile-lab-story.css")

    self.assertIn('id="run"', source)
    self.assertIn("renderInteractionSection", source)
    self.assertIn('data-interaction-moment="${moment.id}"', source)
    self.assertIn("App command", source)
    self.assertIn("Host adapter", source)
    self.assertIn("Device state", source)
    self.assertIn("Evidence", source)
    self.assertIn("Simulated walkthrough", source)
    self.assertIn("Supported", source)
    self.assertIn("Assisted", source)
    self.assertIn("iot-bench.webp", source)
    self.assertIn(".interaction-theatre", styles)
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_interaction_theatre_explains_pair_live_and_alert -v
```

Expected: FAIL，尚无 Interaction Theatre。

- [ ] **Step 3: 实现 Interaction renderer 与三段 Moment**

`renderInteractionSection` 输出 `Pair / Live / Alert` 三个原生按钮、左侧抽象手机、中央四拍事件轨道、右侧使用 `../assets/mobile-lab/iot-bench.webp` 的设备舞台、底部结果说明。根节点为 `data-story-state="pair"`，Inspector 显示 `support / appAction / deviceAction / evidence / outcome`。

`mountInteractionView` 使用独立 Moment cursor；Moment 按钮只切换本 section。每个 Moment 另建一个只在当前 section 内使用的 `beatIndex`：点击播放后立即进入 `App command`，之后每 1400ms 依次进入 `Host adapter`、`Device state`、`Evidence`，最后停止。根节点用 `data-interaction-beat="0|1|2|3"` 驱动轨道高亮；手动选择 Moment 会停止 timer 并把 beat 重置为 0。播放按钮文案为 `Run pairing walkthrough`、`Run live walkthrough`、`Run alert walkthrough`；选择 Moment 时立刻更新文案和可见结果。

将 `mountInteractionView(root)` 的 cleanup 追加到 `mountMobileLabStoryViews`。

- [ ] **Step 4: 插入页面与视觉状态**

将 `${renderInteractionSection()}` 插在 Device Farm 与 Replay 之间。桌面三栏保持手机、事件轨道、设备舞台的视觉权重约 `0.8 / 0.7 / 1.2`；设备素材使用统一暗底与青色状态标签，不新增图库图片。移动端按 App → event rail → IoT → result 顺序纵向排列。

- [ ] **Step 5: 运行 Interaction 测试确认 GREEN**

Run:

```bash
node --check src/mobile-lab-story-view.mjs
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_interaction_theatre_explains_pair_live_and_alert -v
```

Expected: exit 0，单测 PASS。

- [ ] **Step 6: 浏览器验收三个 Moment**

验证 Pair 显示 `Pairing → Online`，Live 显示 `Idle → Streaming`，Alert 显示 `Event emitted → Alert available`；每次切换 App 动作、IoT 状态、证据和结果同时变化；舞台持续显示 `Simulated walkthrough`，不暗示真实设备在线。

---

### Task 5: Report & Synchronized Replay

**Files:**
- Modify: `src/mobile-lab-story-view.mjs`
- Modify: `src/mobile-lab-story.css`
- Modify: `src/mobile-lab.js`
- Modify: `tests/test_site_smoke.py`

**Interfaces:**
- Consumes: `showcaseScenario`, `replayMarkers`, `createStoryCursor`。
- Produces: `renderReplaySection(): string`。
- Produces: `mountReplayView(root: Element): () => void`。
- Emits: `mobilelab:story-step` with `{ view: "replay", stateId, source }`。

- [ ] **Step 1: 写失败的统一时间轴测试**

```python
def test_mobilelab_replay_uses_one_playhead_for_all_evidence_kinds(self) -> None:
    source = read("src/mobile-lab.js") + read("src/mobile-lab-story-view.mjs")
    styles = read("src/mobile-lab-story.css")

    self.assertIn('id="replay"', source)
    self.assertIn("renderReplaySection", source)
    self.assertIn('data-replay-marker="${marker.id}"', source)
    self.assertIn('data-replay-playhead', source)
    self.assertIn("Step", source)
    self.assertIn("Action", source)
    self.assertIn("IoT Event", source)
    self.assertIn("Log", source)
    self.assertIn("Decision", source)
    self.assertIn("review-ready", source)
    self.assertIn("Timeline unavailable", source)
    self.assertIn(".replay-workbench", styles)
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_replay_uses_one_playhead_for_all_evidence_kinds -v
```

Expected: FAIL，尚无 Replay section。

- [ ] **Step 3: 实现 Replay renderer 和单一播放头**

`renderReplaySection` 输出四部分：顶部 Scenario/terminal/qualityDecision 摘要；左侧抽象录屏和 IoT 画中画；中部由 `replayMarkers` 生成的 marker buttons 与单一 `data-replay-playhead`；右侧 `aria-live` Inspector。报告摘要只显示 walkthrough 的 Scenario 分布，不输出百分比。

`mountReplayView` 通过 marker 的 `timeSeconds / 49 * 100` 更新 CSS custom property `--replay-progress`；点击 marker、播放推进和播放头范围输入都调用同一 `selectMarker(markerId, source)`。最后一个 Decision Marker 显示 `terminal: completed` 与 `qualityDecision: review-ready` 两条独立结论。若 Marker 缺少有限数值 `timeSeconds`，禁用播放并显示 `Timeline unavailable`。

将 `mountReplayView(root)` 的 cleanup 追加到 `mountMobileLabStoryViews`。

- [ ] **Step 4: 替换旧 Evidence section**

删除 `src/mobile-lab.js` 内 `evidenceItems`、`renderEvidenceItem` 和旧 `.evidence-section` 模板，改为 `${renderReplaySection()}`。保留“Evidence before diagnosis”工程原则，不删除其决策卡。

- [ ] **Step 5: 运行 Replay 与回归测试确认 GREEN**

Run:

```bash
node --check src/mobile-lab-story-view.mjs
node --check src/mobile-lab.js
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_replay_uses_one_playhead_for_all_evidence_kinds -v
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_public_surface_is_structured_and_redacted -v
```

Expected: 两个单测 PASS；旧 public-surface 测试若仍依赖旧 Evidence 文案，应更新为 Replay 的稳定公开契约后再次通过。

- [ ] **Step 6: 浏览器验收同步回放**

验证点击 Step、Action、IoT Event、Log、Decision 都移动同一播放头；Inspector、手机画面和 IoT 画中画同步；手动选择停止自动播放；最后状态显示 Completed 与 Review-ready，而不是 Passed。

---

### Task 6: 页面编排、导航、响应式、降级与可观测性

**Files:**
- Modify: `src/mobile-lab-story-view.mjs`
- Modify: `src/mobile-lab-story.css`
- Modify: `src/mobile-lab.js`
- Modify: `mobile-lab/index.html`
- Modify: `tests/test_site_smoke.py`

**Interfaces:**
- Produces: `mountMobileLabStoryViews(root: Element): () => void`，组合四个局部 cleanup。
- Produces DOM states: `[data-story-state]` on Explore、Plan、Interaction、Replay roots。
- Emits one event schema: `{ view, stateId, source }`。

- [ ] **Step 1: 写失败的集成与无障碍测试**

```python
def test_mobilelab_story_views_are_isolated_responsive_and_observable(self) -> None:
    source = read("src/mobile-lab.js") + read("src/mobile-lab-story-view.mjs")
    styles = read("src/mobile-lab-story.css")
    html = read("mobile-lab/index.html")

    expected_order = [
        source.index('id="explore"'),
        source.index('id="ai"'),
        source.index('id="plan"'),
        source.index('id="fleet"'),
        source.index('id="run"'),
        source.index('id="replay"'),
    ]
    self.assertEqual(expected_order, sorted(expected_order))
    self.assertIn("mountMobileLabStoryViews", source)
    self.assertIn('new CustomEvent("mobilelab:story-step"', source)
    self.assertIn('view: "exploration"', source)
    self.assertIn('view: "plan"', source)
    self.assertIn('view: "interaction"', source)
    self.assertIn('view: "replay"', source)
    self.assertIn('aria-live="polite"', source)
    self.assertIn("visibilitychange", source)
    self.assertIn("prefers-reduced-motion: reduce", styles)
    self.assertIn("@media (max-width: 1024px)", styles)
    self.assertIn("@media (max-width: 680px)", styles)
    self.assertIn("mobile-lab-story.css", html)
```

- [ ] **Step 2: 运行测试确认 RED**

Run:

```bash
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_story_views_are_isolated_responsive_and_observable -v
```

Expected: FAIL，组合挂载、事件或完整响应式契约尚未齐备。

- [ ] **Step 3: 完成组合挂载与生命周期清理**

实现：

```js
export function mountMobileLabStoryViews(root) {
  const cleanups = [
    mountExplorationView(root),
    mountPlanView(root),
    mountInteractionView(root),
    mountReplayView(root),
  ];
  return () => cleanups.forEach((cleanup) => cleanup());
}
```

`mobile-lab.js` 的 `connectedCallback` 在 `render()` 后调用一次，并将 cleanup 存为 `this.storyViewsCleanup`；`disconnectedCallback` 调用并置空。所有 controller 的 cleanup 必须移除 `visibilitychange` listener、按钮 listener 和 interval。

- [ ] **Step 4: 完成导航与静态降级**

桌面导航改为：

```html
<a href="#explore">Explore</a>
<a href="#plan">Plan</a>
<a href="#run">Run</a>
<a href="#replay">Replay</a>
```

保留 `All work`。在 `noscript` 中加入一条完整静态顺序：`Explore App states → Plan tasks → Lease devices → Run App + IoT interactions → Replay evidence → Review the gate`。

- [ ] **Step 5: 完成响应式与 reduced-motion**

`src/mobile-lab-story.css` 的 1024px breakpoint 将所有三栏布局降为两栏或上下结构；680px breakpoint 将 Explore Map、Task Lane、Interaction Theatre、Replay 全部改为单列，并设置 `min-width: 0`、`max-width: 100%`。reduced-motion 中设置所有 story animation 为 `none !important`，控制器通过 `matchMedia("(prefers-reduced-motion: reduce)")` 禁止启动 interval，但保留手动按钮。

- [ ] **Step 6: 运行集成测试确认 GREEN**

Run:

```bash
node --check src/mobile-lab-story.mjs
node --check src/mobile-lab-story-view.mjs
node --check src/mobile-lab.js
python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_mobilelab_story_views_are_isolated_responsive_and_observable -v
```

Expected: 全部 exit 0，单测 PASS。

- [ ] **Step 7: 检查公开表面脱敏**

Run:

```bash
rg -n -i '(device[-_ ]?cloud|devium|addx|gitlab\.addx|/Users/tim|udid|serial|token|secret|password|api[-_ ]?key|access[-_ ]?key|private[-_ ]?key|\b(?:10|172|192)\.(?:[0-9]{1,3}\.){2}[0-9]{1,3}\b)' mobile-lab/index.html src/mobile-lab.js src/mobile-lab-flow.mjs src/mobile-lab-story.mjs src/mobile-lab-story-view.mjs src/mobile-lab.css src/mobile-lab-story.css
```

Expected: 无输出。测试文件中允许出现用于断言禁止项的关键词，但公开文件不得出现。

---

### Task 7: 完整自动化与浏览器验收

**Files:**
- Modify only if verification finds an in-scope defect: `src/mobile-lab-story.mjs`, `src/mobile-lab-story-view.mjs`, `src/mobile-lab-story.css`, `src/mobile-lab.js`, `mobile-lab/index.html`, `tests/test_site_smoke.py`

**Interfaces:**
- Consumes: all previous task outputs。
- Produces: verified local preview at `http://127.0.0.1:4173/mobile-lab/`。

- [ ] **Step 1: 运行完整自动化测试**

Run:

```bash
git diff --check
node --check src/mobile-lab-flow.mjs
node --check src/mobile-lab-story.mjs
node --check src/mobile-lab-story-view.mjs
node --check src/mobile-lab.js
python3 -m unittest discover -s tests -v
```

Expected: 所有命令 exit 0，完整测试 0 failure / 0 error。

- [ ] **Step 2: 验证本地资源与控制台**

打开 `http://127.0.0.1:4173/mobile-lab/`，确认 document、两张 CSS、三个 JS module、三个 WebP 和 icon 全部返回 200；Chrome console 的 error、warning、issue 均为空。

- [ ] **Step 3: 验证 1536×1050 桌面端**

逐区块截图检查：Explore 的路径不穿节点；Plan → Tasks → Lease request 方向明确；Farm 保持现有精确布局；Pair/Live/Alert 三个 Moment 的连接线不重叠；Replay 单一播放头与 Inspector 对齐；Engineering Decisions 的紧凑间距未回退。

- [ ] **Step 4: 验证 1024×900 中间尺寸**

确认 Explore、Plan、Interaction、Replay 按设计降列；文字不截断；按钮可点击；页面无横向溢出。

- [ ] **Step 5: 验证 500×950 移动端**

读取：

```js
({
  viewport: document.documentElement.clientWidth,
  documentWidth: document.documentElement.scrollWidth,
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  storySections: document.querySelectorAll('[data-story-state]').length,
})
```

Expected: `viewport === 500`、`documentWidth === 500`、`overflow === false`、`storySections === 4`。

- [ ] **Step 6: 验证交互与隔离**

分别记录四个 section 的 `data-story-state`；在 Explore 点下一节点，只允许 Explore 值变化；在 Plan 播放，只允许 Plan 值变化；切换 Alert 只允许 Interaction 值变化；点击 Replay marker 只允许 Replay 值变化。每个播放按钮点击后立即推进，1400ms 后继续，手动选择后停止。

- [ ] **Step 7: 验证 reduced motion**

启用 `prefers-reduced-motion: reduce`，点击四个播放按钮均不得启动自动 interval；手动选择节点仍能更新标题、说明、`aria-pressed` 和 `data-story-state`。

- [ ] **Step 8: 最终检查工作区与预览**

Run:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4173/mobile-lab/
git status --short
git diff --stat
git diff --check
```

Expected: HTTP 200；状态只包含本项目页和既有首页接入文件；无临时截图、缓存、凭据或生成日志；不执行 commit、push、MR 或部署。
