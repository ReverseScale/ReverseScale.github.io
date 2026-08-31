# Mobile Lab 质量自动化故事扩展设计

日期：2026-08-25

状态：已实现并纳入公开项目页

## 背景

实施前的 Mobile Lab 项目页已经说明了质量与设备利用率的双循环、CI/CD 到质量门禁的七阶段链路、LangGraph 状态机、App + IoT 设备农场和基础证据时间线，但尚未把几项最能体现项目深度的能力连成完整故事：AI 自动探索 App 并生成视觉状态图、测试计划与任务编排、手机操作和物联网设备联动，以及报告与同步回放。

这次扩展不是增加四块独立功能卡，而是用一个脱敏场景贯穿“理解、计划、分配、执行、证明”五个阶段，让访客能看懂系统如何把一次质量意图变成可回放的真机证据。

## 目标

- 用一个连续场景展示 AI、CI/CD、设备农场和质量证据如何协同。
- 让 App 自动探索从抽象文案变成可交互的页面状态 Map。
- 让 Test Plan、Task、设备能力匹配和独占租约形成可读的控制平面。
- 让配网、直播、告警三个跨设备阶段同时呈现手机动作、设备状态与验证结果。
- 将现有证据时间线升级为报告与同步回放，使视频、Step、Action、日志、IoT 事件和 CI Gate 共用一个播放头。
- 在不暴露真实项目名、内部域名、设备标识、账号、Job ID 或业务数据的前提下，准确表达现有工程能力。

## 贯穿场景

公开页面使用匿名场景 `Camera onboarding confidence run`：

1. AI 从 App 首页开始探索，发现添加设备入口。
2. AI 选择智能摄像头路径并生成候选 Scenario。
3. 测试计划将 Scenario 拆成探索、配网、直播、告警和证据归档任务。
4. 调度器为任务匹配一台手机、一台摄像头、本地网络和相邻 Host Agent，并建立独占租约。
5. 手机执行配网操作，物理摄像头进入在线状态。
6. 手机打开直播，系统验证画面和设备连接状态。
7. 测试触发一个匿名事件，手机收到告警并打开对应页面。
8. 报告页同步回放录屏、步骤、动作、日志和 IoT 事件，最后向 CI/CD 返回带证据的质量结论。

场景只说明能力关系，不还原任何真实产品页面、文案、设备型号或账号数据。所有手机界面均为抽象合成 UI，设备图继续复用已经脱敏的 Mobile Lab WebP 素材。

## 方案选择

采用“一个场景、四个视图、一个证据结论”的连续叙事方案。四个视图读取同一份只读场景数据，但各自维护局部播放状态，避免用户在一个区块点击后导致屏幕外的其他区块悄悄变化。

未采用的方案：

1. 独立能力展柜：实现更简单，但 AI Map、任务、设备和报告之间仍然缺少因果关系。
2. 单一巨型控制室：视觉冲击强，但信息密度过高，移动端会退化成长而难读的仪表盘。
3. 全页统一自动播放：叙事连续，但用户滚动时容易错过状态变化，也会重复当前设备农场“点击后不知道发生了什么”的问题。

## 页面信息架构

页面按以下顺序组织：

1. Hero：质量与设备农场效率定位。
2. Quality / efficiency loops：解释双目标。
3. End-to-end flow：概括 Change 到 Gate。
4. Visual Exploration Map：回答“AI 看到了什么、探索了什么”。
5. LangGraph state machine：回答“AI 如何在边界内决定下一步”。
6. Test Plan & Task Control Plane：回答“测试意图如何变成可调度任务”。
7. Device Farm：回答“任务如何获得真实硬件所有权”。
8. App × IoT Interaction Theatre：回答“手机动作如何改变物理设备状态”。
9. Report & Synchronized Replay：回答“执行结果如何变成可审查证据”。
10. Engineering decisions 与结语。

桌面端顶部项目导航增加 `Explore`、`Plan`、`Run`、`Replay` 四个语义锚点；移动端保留紧凑导航，不新增横向溢出的全量标签。

## 共享场景数据模型

新增只读模块 `src/mobile-lab-story.mjs`，输出：

- `showcaseScenario`：公开标题、目标、目标能力和最终 Gate 结果。
- `explorationStates`：页面节点、状态类别、覆盖状态和转移动作。
- `planTasks`：任务 ID、任务目的、所需能力、执行阶段和状态。
- `interactionMoments`：配网、直播、告警三个 Moment 的 App 动作、设备动作、证据和结果。
- `replayMarkers`：统一时间轴上的 Step、Action、IoT Event、Log 和 Decision 标记。
- `advanceStoryState(currentId, orderedStates)`：纯函数状态推进，不包含 DOM 查询或定时器。

公开 ID 使用 `task-01`、`state-home`、`event-03` 等合成值。数据中不得包含真实仓库名、服务地址、设备序列号、账号、业务包名、Job ID 或内部组织名称。

各视图拥有独立控制器，控制器只读取共享数据，并在状态变化时：

- 更新所属根节点的 `data-story-state`。
- 更新按钮的 `aria-pressed` 或播放按钮文案。
- 更新一个 `aria-live="polite"` 叙事说明。
- 派发 `mobilelab:story-step` 自定义事件，事件只包含公开的 `view`、`stateId` 和 `source`。

## Visual Exploration Map

### 目的

把 AI 自动探索具体化为“页面状态 + 用户动作 + 覆盖结果”，而不是再画一张泛化 Agent 流程图。

### 桌面布局

- 左侧为抽象手机视口，显示当前页面的合成 UI 和 AI 视觉焦点。
- 中间为六节点状态图：Home、Add device、Device choice、Pairing、Live view、Alert detail。
- 右侧为 Inspector，展示当前状态的识别依据、已尝试动作、下一条候选边和是否已沉淀为 Scenario。
- 状态图边使用统一坐标系的 SVG 路径层，路径端点固定在节点外缘，不允许穿过卡片。

### 交互

- 点击节点会同步切换手机视口和 Inspector。
- `Play exploration` 每 1.4 秒推进一个状态，点击后立即进入下一步；播放期间显示明确的动作句子，例如 `Tap “Add device”`。
- 状态节点区分 `Known`、`New`、`Candidate` 和 `Covered`，颜色与文字同时表达状态，不只依赖颜色。
- Map 顶部显示 `6 states / 5 transitions / 1 candidate scenario`，这些都是场景内部的演示数量，不描述真实生产规模。

### 移动端

手机视口、Inspector 和状态列表改为纵向排列；状态图降级为完整的编号步骤列表，不使用需要横向拖动才能看全的画布。

## Test Plan & Task Control Plane

### 目的

展示测试计划不是文档列表，而是把质量目标拆成任务、匹配资源并管理生命周期的控制平面。

### 布局

- 左侧为一张 Plan Brief：触发来源、风险、目标 Scenario 和发布门禁。
- 中间为五条 Task Lane：Explore、Pair、Stream、Alert、Evidence。
- 右侧为 Capacity Match：Mobile、Camera、Local network、Recording 四项能力及匹配状态。
- 底部用明确路径连接 `Plan → Tasks → Lease request`，最终进入现有 Device Farm 区块。

### 交互

- 用户可选择任一 Task 查看输入、所需能力、执行 Owner 和完成条件。
- `Run plan` 只播放任务编排，不伪装成真实后台执行；按钮辅助文案明确写 `Show orchestration`。
- 状态依次为 `Queued`、`Matched`、`Leased`、`Running`、`Evidence ready`，任务失败时显示 `Bounded failure`，不把 Job terminal 等同于测试通过。

## App × IoT Interaction Theatre

### 目的

用最少界面同时解释手机自动化和物理设备联动，突出 App 质量测试不是单端截图检查。

### 布局

- 左侧手机舞台：抽象 App UI、触点光标和当前自动化动作。
- 中间事件轨道：`App command → Host adapter → Device state → Evidence`。
- 右侧 IoT 舞台：复用摄像头、Hub、Sensor 与 Edge Gateway 素材，并用局部状态标签表达 Pairing、Online、Streaming、Alert emitted。
- 顶部提供 `Pair`、`Live`、`Alert` 三个 Moment 标签；底部显示四拍时间线与一句结果说明。

### 三个 Moment

- Pair：App 选择设备并提交网络配置；设备从 Pairing 变为 Online；证据为 UI 状态、设备日志和网络结果。
- Live：App 点击直播；Host 建立会话；设备输出视频；证据为首帧、流状态和 UI 播放态。
- Alert：测试触发匿名事件；设备产生事件；手机收到告警并打开详情；证据为事件时间、通知和目标页面。

所有触发均标记为 `Simulated walkthrough`，避免让访客误以为公开网页连接了真实设备。页面不声称所有平台完全对等；公开文案使用平台中立描述，能力边界在 Inspector 中以 `Supported`、`Assisted`、`Framework gap` 表达。

## Report & Synchronized Replay

### 目的

将现有静态 Evidence Timeline 升级为可理解的诊断与质量决策界面。

### 布局

- 左侧为录屏舞台，使用抽象手机画面与 IoT 画中画。
- 中间为统一播放头和五类 Marker：Step、Action、IoT Event、Log、Decision。
- 右侧为当前 Marker Inspector，展示发生了什么、证据来源、验证结果和信任状态。
- 顶部摘要显示 Scenario 结果、执行时长、证据完整性和 Gate 结论。
- 底部报告按 Feature / Scenario 聚合展示 Passed、Failed、Framework gap 与 Latest failure，不伪造生产通过率。

### 同步规则

- 点击 Step、Action 或 Marker 都移动到同一个时间点。
- 拖动播放头会更新当前 Step、视频画面、IoT 画中画和 Inspector。
- 自动播放每 1.4 秒前进一个 Marker；用户手动选择后停止自动播放。
- 最后一个 Marker 只表示执行已结束；Gate 是否通过由独立 Decision 数据决定。
- 缺少媒体或精确时间标记时显示静态证据与 `Timeline unavailable`，不伪造同步效果。

## 视觉语言

- 延续当前深色编辑部式系统、细网格、低饱和紫色和青色信号，不引入新的品牌色。
- App 状态使用抽象合成 UI，不截图真实产品，也不加载外部 UI 素材。
- 设备舞台继续复用当前统一视角的透明感 WebP，不增加来源和年代不一致的图库照片。
- 控制器使用动作导向文案：`Play exploration`、`Show orchestration`、`Run pairing walkthrough`、`Replay evidence`。
- 动画只表达状态转移、事件传播和播放头同步，不做无语义漂浮、闪烁或循环装饰。
- `prefers-reduced-motion: reduce` 下取消自动位移和流光，所有信息仍可通过手动选择读取。

## 技术结构

- 保持现有无构建静态站和原生 ES Modules，不新增运行时依赖。
- 新建 `src/mobile-lab-story.mjs`：场景数据和纯状态推进函数。
- 新建 `src/mobile-lab-story-view.mjs`：四个视图的渲染、局部控制器和可观测事件。
- 新建 `src/mobile-lab-story.css`：新视图样式、响应式布局和降级规则。
- 修改 `src/mobile-lab.js`：只负责将新视图插入既有页面顺序并调用初始化入口。
- 修改 `mobile-lab/index.html`：加载新增样式模块，不增加第三方脚本。
- 修改 `tests/test_site_smoke.py`：验证公开文案、页面结构、脱敏约束和模块接线。
- 新增或扩展 Node 级模型测试：验证场景顺序、任务到能力的映射、播放推进和 Gate 与 terminal 分离。

新模块与已有 `mobile-lab-flow.mjs` 保持职责分离：Flow 模型负责七阶段系统总览，Story 模型负责贯穿场景，不让两个状态机互相修改。

## 无障碍、响应式与失败降级

- 所有可选节点使用原生 `button`，支持键盘 Tab、Enter、Space；序列组件支持左右方向键。
- 状态切换同时更新 `aria-pressed`、可见标题和 `aria-live`，不能只依赖颜色或动画。
- 1024px 以下减少并列列数；680px 以下全部转为单列，任何核心状态不得藏在横向滚动区。
- JavaScript 不可用时，四个区块仍按默认状态显示完整标题、概要和静态顺序。
- 图片加载失败时保留语义化 `alt` 与设备状态文字，不影响场景理解。
- 自动播放在页面失去可见性、用户手动选择或 `prefers-reduced-motion` 启用时停止。

## 脱敏与事实边界

- 公开项目名使用 `Mobile Lab`，不出现源仓库名、AI 子项目名或公司名称。
- 不出现真实 Git 地址、域名、环境名、Token、内部账号、设备 ID、Job ID、IP 地址或组织结构。
- 不展示真实 App 截图、真实业务文案或真实客户数据。
- 所有规模数字均限定为当前合成 walkthrough 的节点与任务数量，不暗示生产规模。
- 不将 AI 生成步骤描述为无需审核的回归事实；候选 Scenario 必须经过确定性执行和人工边界后才能成为回归契约。
- 不将终态、资源释放或 Job 完成等同于质量通过。

## 可观测性

首版不接外部分析平台。四个视图通过 `data-story-state` 和 `mobilelab:story-step` 暴露本地事件，事件负载只包含：

```js
{
  view: "exploration" | "plan" | "interaction" | "replay",
  stateId: string,
  source: "manual" | "playback"
}
```

浏览器验收读取这些状态，未来如接入站内统计，只能由独立适配器订阅，不允许视图控制器直接发送网络请求。

## 测试与验收

自动化测试覆盖：

- 页面按既定顺序包含 Explore、Plan、Farm、Run、Replay。
- 六个探索状态和五条任务均来自共享数据，而不是散落在 DOM 分支里。
- 每个 Task 的能力要求都能映射到公开 Capacity Match。
- 配网、直播、告警均包含 App 动作、设备状态、证据和结果。
- Replay 的 Step、Action、IoT Event、Log、Decision 使用同一时间轴。
- `terminal` 与 `qualityDecision` 是两个独立字段。
- 四个局部播放控制器不会修改其他视图的选择状态。
- 所有公开表面通过脱敏关键词扫描。
- JavaScript 语法检查、完整站点测试和 `git diff --check` 通过。

浏览器验收覆盖：

- 1536×1050：四个视图的结构、连接线、节点状态和说明无重叠。
- 1024×900：控制平面和 Interaction Theatre 正确降列。
- 500×950：无页面横向溢出，所有状态可通过纵向阅读与按钮访问。
- 手动点击和播放分别验证 Explore、Plan、Pair/Live/Alert、Replay 的状态变化。
- 页面控制台无 error / warning，所有本地资源返回 200。
- `prefers-reduced-motion` 下没有自动播放或持续位移动画。

## 非目标

- 不连接真实设备、真实 CI/CD、真实报告服务或远端 API。
- 不在公开页创建、修改或执行真实测试计划和任务。
- 不新增登录、数据持久化、外部分析、上传或分享功能。
- 不复刻内部管理后台或真实 App UI。
- 不承诺尚未跨平台验证的自动化能力。
- 不在本轮修改首页之外的其他项目介绍页。
