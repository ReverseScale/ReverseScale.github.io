import { profile } from "./site-data.js";

const DIAGRAM_WIDTH = 1000;
const DIAGRAM_HEIGHT = 620;
const MAX_GROUP_SLOTS = 4;
const MAX_NODE_SLOTS = 7;
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";
const INITIAL_PIPELINE_STAGE_ID = "app-runtime";

const architectureStages = Object.freeze([
  {
    id: "monolith",
    shortLabel: "单体应用",
    sequence: "01",
    eyebrow: "第一阶段 · 单一 Target",
    title: "所有代码，都住在同一个房间。",
    summary:
      "页面、业务逻辑、网络请求、存储和埋点一起编译、一起发布。它启动快、协作直接，但任何模块都可能越过边界访问其他实现。",
    insight: "目录分开不等于架构解耦",
    tradeoff: "改动成本会随团队与功能数量一起增长",
    frameLabel: "单体：所有职责共享一个构建边界",
    accent: "cyan",
    groups: [
      { label: "单体边界 · 所有职责一起编译", x: 3, y: 7, w: 94, h: 84, tone: "monolith" },
    ],
    nodes: [
      { id: "slot-1", label: "页面与导航", detail: "UI 状态、路由、交互", badge: "同一 Target", x: 8, y: 22, w: 24, h: 18, tone: "feature" },
      { id: "slot-2", label: "业务逻辑", detail: "规则与流程编排混在一起", badge: "同一 Target", x: 38, y: 22, w: 24, h: 18, tone: "domain" },
      { id: "slot-3", label: "API Client", detail: "直接访问远端服务", badge: "同一 Target", x: 68, y: 22, w: 24, h: 18, tone: "platform" },
      { id: "slot-4", label: "本地存储", detail: "数据库与偏好设置", badge: "同一 Target", x: 23, y: 62, w: 24, h: 18, tone: "platform" },
      { id: "slot-5", label: "Analytics", detail: "任何位置都可以上报", badge: "同一 Target", x: 53, y: 62, w: 24, h: 18, tone: "shared" },
      { id: "slot-6", label: "App Target", detail: "所有代码共享发布命运", x: 38, y: 5, w: 24, h: 12, tone: "shell", visible: false },
    ],
    links: [
      { from: "slot-1", to: "slot-2" },
      { from: "slot-2", to: "slot-3" },
      { from: "slot-2", to: "slot-4" },
      { from: "slot-1", to: "slot-5" },
      { from: "slot-5", to: "slot-4", warning: true },
      { from: "slot-3", to: "slot-1", warning: true },
    ],
  },
  {
    id: "components",
    shortLabel: "通用组件",
    sequence: "02",
    eyebrow: "第二阶段 · 无业务逻辑的复用能力",
    title: "组件提供能力，但不拥有业务。",
    summary:
      "把 Button、Card 等视觉能力沉淀为 UI 组件库，把权限、图片选择和分享等能力沉淀为功能组件库。它们可以被任何业务使用，但不判断业务规则。",
    insight: "组件只提供通用能力，不拥有业务规则",
    tradeoff: "抽出组件后，业务代码仍然不是独立模块",
    frameLabel: "组件化：抽离无业务逻辑的通用能力",
    accent: "violet",
    groups: [
      { label: "业务代码 · 消费通用能力", x: 3, y: 9, w: 45, h: 79, tone: "application" },
      { label: "通用组件 · 无业务逻辑", x: 52, y: 9, w: 45, h: 79, tone: "components" },
    ],
    nodes: [
      { id: "slot-1", label: "业务页面", detail: "首页、目录、结算的界面", badge: "包含业务语义", parts: ["页面", "状态", "流程"], x: 7, y: 21, w: 37, h: 25, tone: "feature" },
      { id: "slot-2", label: "UI 组件库", detail: "跨业务复用的视觉能力", badge: "通用组件 · 无业务逻辑", parts: ["Button", "Card", "Dialog"], x: 57, y: 21, w: 35, h: 25, tone: "shared" },
      { id: "slot-3", label: "功能组件库", detail: "跨业务复用的平台能力", badge: "通用组件 · 无业务逻辑", parts: ["权限", "图片选择", "分享"], x: 57, y: 57, w: 35, h: 25, tone: "platform" },
      { id: "slot-4", label: "通用能力", detail: "不包含业务规则", x: 57, y: 57, w: 35, h: 25, tone: "shared", visible: false },
      { id: "slot-5", label: "业务实现", detail: "等待形成业务边界", x: 7, y: 57, w: 37, h: 25, tone: "domain", visible: false },
      { id: "slot-6", label: "业务逻辑", detail: "规则与业务流程仍在主工程", badge: "包含业务语义", parts: ["用例", "规则", "流程"], x: 7, y: 57, w: 37, h: 25, tone: "domain" },
    ],
    links: [
      { from: "slot-1", to: "slot-2", kind: "dependency" },
      { from: "slot-1", to: "slot-3", kind: "dependency" },
      { from: "slot-6", to: "slot-2", kind: "dependency" },
      { from: "slot-6", to: "slot-3", kind: "dependency" },
    ],
  },
  {
    id: "modules",
    shortLabel: "业务模块",
    sequence: "03",
    eyebrow: "第三阶段 · 组件加上业务",
    title: "组件加上业务，才成为模块。",
    summary:
      "首页、目录和结算各自封装业务 UI、业务逻辑以及对通用组件的依赖。模块以一项完整业务为边界，可以独立演进和测试。",
    insight: "业务模块是完整业务能力，不是更大的组件",
    tradeoff: "模块需要明确自己的入口与对外协议",
    frameLabel: "模块化：业务逻辑与组件组成独立模块",
    accent: "green",
    groups: [
      { label: "业务模块 · 业务 UI 与业务逻辑", x: 2, y: 7, w: 96, h: 56, tone: "modules" },
      { label: "通用组件 · 被各业务模块复用", x: 20, y: 68, w: 60, h: 25, tone: "components" },
    ],
    nodes: [
      { id: "slot-1", label: "首页模块", detail: "首页业务完整归属", badge: "业务模块", parts: ["业务 UI", "业务逻辑", "组件依赖"], x: 5, y: 17, w: 27, h: 38, tone: "feature" },
      { id: "slot-2", label: "目录模块", detail: "搜索与商品业务归属", badge: "业务模块", parts: ["业务 UI", "业务逻辑", "组件依赖"], x: 36.5, y: 17, w: 27, h: 38, tone: "feature" },
      { id: "slot-3", label: "结算模块", detail: "支付与订单业务归属", badge: "业务模块", parts: ["业务 UI", "业务逻辑", "组件依赖"], x: 68, y: 17, w: 27, h: 38, tone: "feature" },
      { id: "slot-4", label: "UI 组件库", detail: "跨业务复用的视觉能力", badge: "无业务逻辑", x: 24, y: 74, w: 23, h: 13, tone: "shared" },
      { id: "slot-5", label: "功能组件库", detail: "跨业务复用的平台能力", badge: "无业务逻辑", x: 53, y: 74, w: 23, h: 13, tone: "platform" },
      { id: "slot-6", label: "模块入口", detail: "由 App 壳在下一阶段注册", x: 38, y: 4, w: 24, h: 10, tone: "shell", visible: false },
    ],
    links: [
      { from: "slot-1", to: "slot-4", kind: "dependency" },
      { from: "slot-1", to: "slot-5", kind: "dependency" },
      { from: "slot-2", to: "slot-4", kind: "dependency" },
      { from: "slot-2", to: "slot-5", kind: "dependency" },
      { from: "slot-3", to: "slot-4", kind: "dependency" },
      { from: "slot-3", to: "slot-5", kind: "dependency" },
    ],
  },
  {
    id: "assembly",
    shortLabel: "App 组装",
    sequence: "04",
    eyebrow: "第四阶段 · 注册与路由通信",
    title: "壳负责组装，Router 负责让模块相遇。",
    summary:
      "App 壳发现并注册首页、目录和结算模块，提供启动与顶层容器。业务模块不直接依赖彼此，而是通过 Router 的路由协议发起跳转与参数传递。",
    insight: "模块注册进 App，并通过 Router 通信",
    tradeoff: "Router 只传路由协议，不承载业务逻辑",
    frameLabel: "App 组装：壳注册模块，Router 连接业务",
    accent: "amber",
    groups: [
      { label: "完整 App · 壳、Router、业务模块与通用组件", x: 1, y: 2, w: 98, h: 96, tone: "boundary" },
      { label: "App 壳 + Router · 只负责组装与通信", x: 27, y: 5, w: 46, h: 35, tone: "shell" },
      { label: "已注册业务模块 · 彼此不直接依赖", x: 2, y: 43, w: 96, h: 32, tone: "modules" },
      { label: "通用组件 · 无业务逻辑", x: 30, y: 79, w: 40, h: 16, tone: "components" },
    ],
    nodes: [
      { id: "slot-1", label: "首页模块", detail: "完整首页业务能力", badge: "已注册业务模块", x: 5, y: 50, w: 27, h: 18, tone: "feature" },
      { id: "slot-2", label: "目录模块", detail: "完整搜索与商品业务", badge: "已注册业务模块", x: 36.5, y: 50, w: 27, h: 18, tone: "feature" },
      { id: "slot-3", label: "结算模块", detail: "完整支付与订单业务", badge: "已注册业务模块", x: 68, y: 50, w: 27, h: 18, tone: "feature" },
      { id: "slot-4", label: "通用组件层", detail: "UI 组件库 · 功能组件库", x: 34, y: 81, w: 32, h: 12, tone: "shared" },
      { id: "slot-5", label: "Router", detail: "模块间路由与参数协议", badge: "模块通信", x: 38, y: 24, w: 24, h: 13, tone: "domain" },
      { id: "slot-6", label: "App 壳", detail: "启动、发现并注册业务模块", badge: "模块注册中心", x: 38, y: 8, w: 24, h: 13, tone: "shell" },
    ],
    links: [
      { from: "slot-6", to: "slot-1", kind: "registration" },
      { from: "slot-6", to: "slot-2", kind: "registration" },
      { from: "slot-6", to: "slot-3", kind: "registration" },
      { from: "slot-1", to: "slot-5", kind: "route" },
      { from: "slot-2", to: "slot-5", kind: "route" },
      { from: "slot-3", to: "slot-5", kind: "route" },
      { from: "slot-1", to: "slot-4", kind: "dependency" },
      { from: "slot-2", to: "slot-4", kind: "dependency" },
      { from: "slot-3", to: "slot-4", kind: "dependency" },
    ],
  },
  {
    id: "scale",
    shortLabel: "大型 App",
    sequence: "05",
    eyebrow: "第五阶段 · 运行时承接变化",
    title: "模块独立交付，运行时安全加载。",
    summary:
      "Native、Flutter 与 React Native 模块以产物和 Module Manifest 接入。App 壳按动态路由表组装业务；资源、配置实验和 Telemetry 各自承担独立职责，动态交付 Runtime 统一完成验签、原子激活与回滚。",
    insight: "模块边界让技术栈与交付节奏解耦",
    tradeoff: "动态能力必须有内置基线、版本审计与失败回退",
    frameLabel: "大型 App 运行时：模块、资源与动态交付",
    accent: "cyan",
    groups: [
      { label: "大型 App · 设备内运行时拓扑", x: 1, y: 2, w: 98, h: 96, tone: "boundary" },
      { label: "壳 + 动态路由", x: 31, y: 3, w: 38, h: 36, tone: "shell" },
      { label: "多技术栈业务模块", x: 2, y: 43, w: 42, h: 54, tone: "modules" },
      { label: "平台 Runtime", x: 47, y: 43, w: 51, h: 54, tone: "components" },
    ],
    nodes: [
      { id: "slot-1", label: "多技术栈业务模块", detail: "产物 + Module Manifest", badge: "独立业务边界", parts: ["Native", "Flutter", "React Native"], x: 5, y: 52, w: 36, h: 34, tone: "feature" },
      { id: "slot-2", label: "动态交付 Runtime", detail: "检查 · 下载 · 验签 · 原子激活 · 回滚", x: 52, y: 46, w: 43, h: 12, tone: "platform" },
      { id: "slot-3", label: "资源系统", detail: "内置资源 + i18n / 图片 / 主题热修复", x: 52, y: 60, w: 43, h: 11, tone: "shared" },
      { id: "slot-4", label: "配置与实验", detail: "动态配置 · Feature Flag · A/B Test", x: 52, y: 73, w: 43, h: 11, tone: "domain" },
      { id: "slot-5", label: "动态路由表", detail: "由 Module Manifest 自动生成", badge: "路由注册中心", x: 35, y: 23, w: 30, h: 13, tone: "domain" },
      { id: "slot-6", label: "App 壳", detail: "校验并加载兼容产物", badge: "组合与加载入口", x: 38, y: 5, w: 24, h: 14, tone: "shell" },
      { id: "slot-7", label: "Telemetry Runtime", detail: "Log · 埋点 · 指标上报", x: 52, y: 86, w: 43, h: 10, tone: "shared" },
    ],
    links: [
      { from: "slot-6", to: "slot-5", kind: "registration" },
      { from: "slot-1", to: "slot-5", kind: "registration" },
      { from: "slot-2", to: "slot-1", kind: "delivery" },
      { from: "slot-2", to: "slot-3", kind: "delivery" },
      { from: "slot-2", to: "slot-6", kind: "delivery" },
      { from: "slot-1", to: "slot-3", kind: "dependency" },
      { from: "slot-1", to: "slot-4", kind: "dependency" },
      { from: "slot-1", to: "slot-7", kind: "telemetry" },
      { from: "slot-4", to: "slot-7", kind: "telemetry" },
    ],
  },
]);

const pipelineStages = Object.freeze([
  {
    id: "source-change",
    sequence: "01",
    title: "代码变更",
    detail: "把业务意图整理成可追踪、可验证的变更集合。",
    tags: ["Source", "Manifest", "Schema"],
    icon: "code",
    inputs: ["需求与验收标准", "代码 / 资源 / i18n", "Route、Config、Event Schema"],
    actions: ["生成 Change Manifest", "标记模块与资源所有者", "建立版本和依赖影响图"],
    outputs: ["不可变 Revision", "结构化变更清单", "后续阶段的追踪 ID"],
    gates: ["变更范围可解释", "Schema 版本明确", "敏感权限有 Owner"],
    failure: "缺少归属、版本或迁移说明时阻断合并，不让不完整语义流入流水线。",
    signals: ["变更前置时间", "返工率", "跨模块影响范围"],
  },
  {
    id: "preflight",
    sequence: "02",
    title: "变更预检",
    detail: "在昂贵构建前验证边界、契约、风险与测试范围。",
    tags: ["AI 辅助", "静态检查", "契约校验"],
    icon: "scan",
    inputs: ["Revision 与 Change Manifest", "架构规则", "历史缺陷与测试覆盖"],
    actions: ["Lint / SAST / 依赖扫描", "路由、Manifest、Schema 校验", "AI 生成影响证据与测试建议"],
    outputs: ["预检报告", "风险分级", "确定性的测试计划"],
    gates: ["规则检查必须通过", "高风险变更需要 Review", "AI 建议不替代断言"],
    failure: "带文件、规则和责任人的证据返回开发者；只对基础设施瞬态错误自动重试。",
    signals: ["预检命中率", "误报率", "缺陷前移比例"],
  },
  {
    id: "multi-stack-build",
    sequence: "03",
    title: "多技术栈构建",
    detail: "用锁定工具链并行生产 Native、跨平台与资源制品。",
    tags: ["可重复构建", "并行测试", "资源编译"],
    icon: "build",
    inputs: ["通过预检的 Revision", "锁文件与 Toolchain", "模块构建矩阵"],
    actions: ["Native / Flutter / RN 并行构建", "资源与 i18n 编译", "单元、集成和契约测试"],
    outputs: ["候选模块制品", "资源包", "Build Metadata 与测试报告"],
    gates: ["锁定依赖可复现", "测试矩阵完整", "产物与源码可追溯"],
    failure: "隔离失败技术栈；代码失败直接终止，Runner 或缓存故障才进入有界重试。",
    signals: ["构建时长", "缓存命中率", "Flaky Test 与队列等待"],
  },
  {
    id: "quality-gate",
    sequence: "04",
    title: "质量与包大小 Gate",
    detail: "以确定性预算决定候选制品是否具备晋级资格。",
    tags: ["总量预算", "模块增量", "热更增量", "趋势", "依赖与资源归因"],
    tone: "gate",
    icon: "gate",
    inputs: ["候选制品与测试报告", "性能基线", "安全与大小预算"],
    actions: ["E2E / 性能 / 安全验证", "SBOM 与供应链审计", "包体、模块、热更增量归因"],
    outputs: ["Admission Decision", "Size Diff 与归因报告", "带期限的例外记录"],
    gates: ["总包与模块增量预算", "启动 / 内存 / 稳定性基线", "高危漏洞为零"],
    failure: "默认拒绝晋级；例外必须有 Owner、业务原因、补偿措施和自动失效时间。",
    signals: ["Gate 失败分布", "包体增长趋势", "性能与安全债务"],
  },
  {
    id: "artifact-registry",
    sequence: "05",
    title: "签名与制品库",
    detail: "把通过门禁的候选物固化为可验证、不可变的发布制品。",
    tags: ["签名", "SBOM", "兼容矩阵"],
    icon: "artifact",
    inputs: ["通过 Gate 的候选制品", "签名身份与策略", "版本和兼容性元数据"],
    actions: ["签名 / Notarization", "生成 Checksum 与 Provenance", "登记 SBOM、兼容矩阵和渠道"],
    outputs: ["不可变已签名制品", "Artifact Manifest", "可审计供应链证据"],
    gates: ["签名身份有效", "版本单调且唯一", "元数据与二进制一致"],
    failure: "签名异常立即隔离制品并停止晋级；密钥风险触发吊销和重新签名流程。",
    signals: ["签名耗时", "制品完整性", "Registry 可用性"],
  },
  {
    id: "progressive-delivery",
    sequence: "06",
    title: "渐进式发布",
    detail: "只提升已签名制品，并按渠道与人群逐步扩大暴露。",
    tags: ["灰度", "Kill Switch", "原子激活"],
    icon: "delivery",
    inputs: ["已签名制品", "目标渠道与 Cohort", "放量策略和健康阈值"],
    actions: ["商店 / OTA / 资源 / 配置分通道投放", "分阶段扩大 Cohort", "持续评估健康和业务指标"],
    outputs: ["Release Ledger", "渠道与人群版本状态", "可回滚发布记录"],
    gates: ["人工授权与策略审批", "健康指标满足阈值", "Kill Switch 可用"],
    failure: "自动暂停继续放量，按制品类型执行回滚、熔断或回到 Last Known Good。",
    signals: ["采用率", "Crash / ANR", "核心业务指标与回滚耗时"],
  },
  {
    id: "app-runtime",
    sequence: "07",
    title: "App Runtime",
    detail: "在设备上验签、装配并运行模块、资源、路由与平台能力。",
    tags: ["运行激活", "展开纵轴"],
    tone: "app",
    icon: "app",
    axisId: "app-architecture",
    inputs: ["兼容的模块与资源制品", "内置稳定基线", "远端配置与用户 Locale"],
    actions: ["验签并原子激活", "App 壳注册模块与 Router", "初始化资源、配置和 Telemetry"],
    outputs: ["可运行 App", "已注册能力图", "Runtime 版本与状态快照"],
    gates: ["签名和兼容性校验", "启动关键路径有降级", "动态内容不越过业务边界"],
    failure: "加载失败回退到内置资源或 Last Known Good，单个动态模块不能拖垮 App 启动。",
    signals: ["冷启动", "模块加载成功率", "路由失败与资源回退"],
  },
  {
    id: "telemetry-feedback",
    sequence: "08",
    title: "Telemetry 反馈",
    detail: "把设备现场转成可行动证据，闭环下一次发布决策。",
    tags: ["健康度", "业务指标", "发布决策"],
    icon: "telemetry",
    inputs: ["Crash / ANR / Log", "埋点与性能指标", "版本、Cohort 与实验上下文"],
    actions: ["Schema 校验与隐私脱敏", "采样、聚合和跨信号关联", "告警与发布影响分析"],
    outputs: ["Dashboard 与 Alert", "发布健康结论", "下一轮变更证据"],
    gates: ["用户同意与最小采集", "事件 Schema 合法", "数据新鲜度与质量达标"],
    failure: "本地有界缓冲或丢弃非关键数据；观测链故障不能阻断核心业务运行。",
    signals: ["采集覆盖率", "数据延迟", "告警准确率与决策耗时"],
  },
]);

const aiDeliveryCapabilities = Object.freeze([
  "变更影响分析",
  "测试建议",
  "体积归因",
  "失败诊断",
  "发布风险",
  "异常关联",
]);

const axisPanels = Object.freeze({
  "app-architecture": {
    axisLabel: "Y · App Architecture",
    title: "展开 App，观察内部边界如何演进。",
    summary: "纵轴只解释 App 内部结构；它从横向交付链的 App Runtime 节点向下展开，不改变 Pipeline 的生命周期语义。",
    anchorNodeId: "app-runtime",
    render: renderAppArchitectureAxis,
  },
});

const stageCountLabel = () => String(architectureStages.length).padStart(2, "0");

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const nodeById = (stage, nodeId) => stage.nodes.find((node) => node.id === nodeId);

const nodesForStage = (stage) => Array.from({ length: MAX_NODE_SLOTS }, (_, index) =>
  stage.nodes[index] ?? {
    id: `slot-${index + 1}`,
    label: "",
    detail: "",
    x: 50,
    y: 50,
    w: 0,
    h: 0,
    tone: "shared",
    visible: false,
  });

const nodeCenter = (node) => ({
  x: ((node.x + node.w / 2) / 100) * DIAGRAM_WIDTH,
  y: ((node.y + node.h / 2) / 100) * DIAGRAM_HEIGHT,
});

const connectionPath = (source, target) => {
  const start = nodeCenter(source);
  const end = nodeCenter(target);
  const horizontalDistance = end.x - start.x;
  const verticalDistance = end.y - start.y;

  if (Math.abs(horizontalDistance) >= Math.abs(verticalDistance)) {
    const direction = horizontalDistance >= 0 ? 1 : -1;
    const sourceEdge = start.x + direction * (source.w / 200) * DIAGRAM_WIDTH;
    const targetEdge = end.x - direction * (target.w / 200) * DIAGRAM_WIDTH;
    const curve = Math.max(54, Math.abs(targetEdge - sourceEdge) * 0.42);
    return `M ${sourceEdge} ${start.y} C ${sourceEdge + curve * direction} ${start.y}, ${targetEdge - curve * direction} ${end.y}, ${targetEdge} ${end.y}`;
  }

  const direction = verticalDistance >= 0 ? 1 : -1;
  const sourceEdge = start.y + direction * (source.h / 200) * DIAGRAM_HEIGHT;
  const targetEdge = end.y - direction * (target.h / 200) * DIAGRAM_HEIGHT;
  const curve = Math.max(54, Math.abs(targetEdge - sourceEdge) * 0.42);
  return `M ${start.x} ${sourceEdge} C ${start.x} ${sourceEdge + curve * direction}, ${end.x} ${targetEdge - curve * direction}, ${end.x} ${targetEdge}`;
};

const renderFlowEdges = (stage) => stage.links.map((link, index) => {
  const source = nodeById(stage, link.from);
  const target = nodeById(stage, link.to);
  const path = connectionPath(source, target);
  const delay = (index * 0.31).toFixed(2);
  const duration = (2.8 + (index % 3) * 0.55).toFixed(2);
  const linkClasses = [
    link.warning ? "is-warning" : "",
    link.kind ? `architecture-flow--${link.kind}` : "",
  ].filter(Boolean).join(" ");
  return `
    <g class="${linkClasses}">
      <path class="architecture-flow-base" d="${path}"></path>
      <path class="architecture-flow-pulse" d="${path}"></path>
      <circle class="architecture-particle" r="${link.warning ? "4" : "5"}">
        <animateMotion dur="${duration}s" begin="-${delay}s" repeatCount="indefinite" path="${path}"></animateMotion>
      </circle>
    </g>
  `;
}).join("");

const nodeContent = (node) => `
  ${node.badge ? `<em class="architecture-node__badge">${escapeHtml(node.badge)}</em>` : ""}
  <span>${escapeHtml(node.label)}</span>
  <small>${escapeHtml(node.detail)}</small>
  ${node.parts ? `
    <span class="architecture-node__parts" aria-hidden="true">
      ${node.parts.map((part) => `<i>${escapeHtml(part)}</i>`).join("")}
    </span>
  ` : ""}
`;

const renderNodeSlots = (stage) => nodesForStage(stage).map((node) => {
  const visible = node.visible !== false;
  return `
    <button
      class="architecture-node architecture-node--${escapeHtml(node.tone)}${node.parts ? " has-parts" : ""}${visible ? "" : " is-hidden"}"
      type="button"
      data-node-id="${escapeHtml(node.id)}"
      ${visible ? `aria-label="${escapeHtml(node.label)}：${escapeHtml(node.detail)}"` : 'aria-hidden="true" tabindex="-1" disabled'}
    >
      ${nodeContent(node)}
    </button>
  `;
}).join("");

const groupsForStage = (stage) => Array.from({ length: MAX_GROUP_SLOTS }, (_, index) =>
  stage.groups[index] ?? {
    label: "",
    x: 50,
    y: 50,
    w: 0,
    h: 0,
    tone: "empty",
    visible: false,
  });

const renderGroupSlots = (stage) => groupsForStage(stage).map((group) => `
  <div class="architecture-group architecture-group--${escapeHtml(group.tone)}${group.visible === false ? " is-hidden" : ""}">
    <span>${escapeHtml(group.label)}</span>
  </div>
`).join("");

const renderStageTabs = () => architectureStages.map((stage, index) => `
  <button
    type="button"
    role="tab"
    data-stage="${index}"
    aria-controls="architecture-stage-caption"
    aria-selected="${index === 0 ? "true" : "false"}"
  >
    <span>${stage.sequence}</span>
    <strong>${escapeHtml(stage.shortLabel)}</strong>
  </button>
`).join("");

const architectureIcon = (name) => {
  const iconPaths = {
    code: `
      <path d="m9 8-4 4 4 4"></path>
      <path d="m15 8 4 4-4 4"></path>
      <path d="m13 5-2 14"></path>
    `,
    scan: `
      <circle cx="10.5" cy="10.5" r="5.5"></circle>
      <path d="m15 15 4 4"></path>
      <path class="architecture-icon__signal" d="m8 10 1.6 1.6L13 8.4"></path>
    `,
    build: `
      <path d="m4.5 8 7.5-4 7.5 4-7.5 4-7.5-4Z"></path>
      <path d="m4.5 12 7.5 4 7.5-4"></path>
      <path class="architecture-icon__signal" d="m4.5 16 7.5 4 7.5-4"></path>
    `,
    gate: `
      <path d="M12 3.5 19 6v5.2c0 4.2-2.8 7.6-7 9.3-4.2-1.7-7-5.1-7-9.3V6l7-2.5Z"></path>
      <path class="architecture-icon__signal" d="m8.7 12 2.1 2.1 4.7-5"></path>
    `,
    artifact: `
      <path d="m4 7 8-4 8 4-8 4-8-4Z"></path>
      <path d="M4 7v10l8 4 8-4V7"></path>
      <path class="architecture-icon__signal" d="M12 11v10"></path>
    `,
    delivery: `
      <path d="M5 12h12"></path>
      <path class="architecture-icon__signal" d="m13 7 5 5-5 5"></path>
      <path d="M5 7H3v10h2"></path>
    `,
    app: `
      <rect x="6" y="2.5" width="12" height="19" rx="3"></rect>
      <path d="M9 6h6"></path>
      <circle class="architecture-icon__signal" cx="12" cy="17.5" r="1"></circle>
    `,
    telemetry: `
      <path d="M4 18V6"></path>
      <path d="M4 18h16"></path>
      <path class="architecture-icon__signal" d="m6.5 15 3.2-3.5 3 2 4.8-6"></path>
      <circle cx="17.5" cy="7.5" r="1.3"></circle>
    `,
    spark: `
      <path class="architecture-icon__signal" d="M12 3.5 13.5 9l5.5 1.5-5.5 1.5-1.5 5.5-1.5-5.5L5 10.5 10.5 9 12 3.5Z"></path>
      <path d="m18 3 .5 2 .5-2 2-.5-2-.5-.5-2-.5 2-2 .5 2 .5Z"></path>
    `,
    modules: `
      <rect x="3.5" y="5" width="7" height="6" rx="1.5"></rect>
      <rect x="13.5" y="5" width="7" height="6" rx="1.5"></rect>
      <rect class="architecture-icon__signal" x="8.5" y="14" width="7" height="6" rx="1.5"></rect>
    `,
    resources: `
      <path d="M4 5.5h6l2 2h8v11H4v-13Z"></path>
      <path class="architecture-icon__signal" d="M8 12h8M8 15h5"></path>
    `,
    experiment: `
      <path d="M9 3v6l-4.5 8a2.3 2.3 0 0 0 2 3.5h11a2.3 2.3 0 0 0 2-3.5L15 9V3"></path>
      <path class="architecture-icon__signal" d="M8 14h8"></path>
      <path d="M8 3h8"></path>
    `,
  };

  return `
    <svg class="architecture-icon architecture-icon--${escapeHtml(name)}" viewBox="0 0 24 24" aria-hidden="true">
      ${iconPaths[name] ?? iconPaths.code}
    </svg>
  `;
};

const renderPipelineStages = () => pipelineStages.map((stage, index) => {
  const isSelected = stage.id === INITIAL_PIPELINE_STAGE_ID;
  const axisAttributes = stage.axisId
    ? `data-axis-trigger="${escapeHtml(stage.axisId)}" aria-expanded="true" aria-controls="pipeline-detail axis-panel-${escapeHtml(stage.axisId)}"`
    : 'aria-controls="pipeline-detail"';
  const visibleTags = stage.tags.slice(0, 2);
  const remainingTagCount = Math.max(stage.tags.length - visibleTags.length, 0);

  return `
    <li
      data-pipeline-node="${escapeHtml(stage.id)}"
      data-tone="${escapeHtml(stage.tone ?? "default")}"
      style="--pipeline-order: ${index}"
    >
      <button
        class="pipeline-node${stage.axisId ? " pipeline-node--expandable" : ""}"
        type="button"
        role="tab"
        id="pipeline-tab-${escapeHtml(stage.id)}"
        data-pipeline-select="${escapeHtml(stage.id)}"
        aria-selected="${String(isSelected)}"
        tabindex="${isSelected ? "0" : "-1"}"
        ${axisAttributes}
      >
        <span class="pipeline-node__icon">${architectureIcon(stage.icon)}</span>
        <span class="pipeline-node__content">
          <span class="pipeline-node__sequence">${escapeHtml(stage.sequence)}</span>
          <strong>${escapeHtml(stage.title)}</strong>
          <small>${escapeHtml(stage.detail)}</small>
          <span class="pipeline-node__tags">
            ${visibleTags.map((tag) => `<i>${escapeHtml(tag)}</i>`).join("")}
            ${remainingTagCount ? `<i>+${remainingTagCount}</i>` : ""}
          </span>
        </span>
        ${stage.axisId ? `<span class="pipeline-node__expand"><i></i><span>收起纵轴</span></span>` : ""}
      </button>
    </li>
  `;
}).join("");

const renderDetailList = (items) => `
  <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
`;

const renderPipelineDetail = (stage) => `
  <header class="pipeline-detail__header">
    <span class="pipeline-detail__icon">${architectureIcon(stage.icon)}</span>
    <div>
      <p>${escapeHtml(stage.sequence)} · Pipeline Node</p>
      <h3>${escapeHtml(stage.title)}</h3>
      <span>${escapeHtml(stage.detail)}</span>
    </div>
    <span class="pipeline-detail__state">已选择</span>
  </header>
  <div class="pipeline-detail__flow" aria-label="${escapeHtml(stage.title)} 主处理链">
    <article data-detail-kind="input">
      <span>${architectureIcon("code")} 输入</span>
      ${renderDetailList(stage.inputs)}
    </article>
    <span class="pipeline-detail__arrow" aria-hidden="true">→</span>
    <article data-detail-kind="action">
      <span>${architectureIcon("build")} 关键动作</span>
      ${renderDetailList(stage.actions)}
    </article>
    <span class="pipeline-detail__arrow" aria-hidden="true">→</span>
    <article data-detail-kind="output">
      <span>${architectureIcon("artifact")} 输出</span>
      ${renderDetailList(stage.outputs)}
    </article>
  </div>
  <div class="pipeline-detail__safety" aria-label="${escapeHtml(stage.title)} 安全与反馈">
    <article data-detail-kind="gate">
      <span>${architectureIcon("gate")} 确定性门禁</span>
      ${renderDetailList(stage.gates)}
    </article>
    <article data-detail-kind="failure">
      <span>${architectureIcon("scan")} 失败策略</span>
      <p>${escapeHtml(stage.failure)}</p>
    </article>
    <article data-detail-kind="signal">
      <span>${architectureIcon("telemetry")} 可观测信号</span>
      ${renderDetailList(stage.signals)}
    </article>
  </div>
  <aside class="pipeline-detail__ai">
    <span class="pipeline-ai-note__icon">${architectureIcon("spark")}</span>
    <p><strong>AI 提供证据，不接管门禁。</strong>${aiDeliveryCapabilities.join(" · ")}；测试、预算、策略、签名与人工授权保留最终决定权。</p>
  </aside>
`;

function renderAppArchitectureAxis(initialStage) {
  return `
    <div class="architecture-axis-panel__body">
      <div class="architecture-stage-tabs" role="tablist" aria-label="架构演进阶段">
        ${renderStageTabs()}
      </div>
      <div class="architecture-visual" data-accent="${initialStage.accent}">
        <div class="architecture-visual__header">
          <span class="architecture-visual__sequence">${initialStage.sequence} / ${stageCountLabel()}</span>
          <span class="architecture-visual__frame">${escapeHtml(initialStage.frameLabel)}</span>
          <span class="architecture-visual__status"><i></i> 动态关系</span>
        </div>

        <div class="architecture-canvas" data-stage-id="${initialStage.id}" aria-label="架构依赖关系动态图">
          <div class="architecture-canvas__orb" aria-hidden="true"></div>
          <div class="architecture-group-layer" aria-hidden="true">
            ${renderGroupSlots(initialStage)}
          </div>
          <svg class="architecture-links" viewBox="0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <filter id="particle-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="5" result="blur"></feGaussianBlur>
                <feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>
              </filter>
            </defs>
            <g class="architecture-links__content">${renderFlowEdges(initialStage)}</g>
          </svg>
          <div class="architecture-node-layer">
            ${renderNodeSlots(initialStage)}
          </div>
        </div>

        <div class="architecture-caption" id="architecture-stage-caption" aria-live="polite">
          <div>
            <p class="architecture-caption__eyebrow">${escapeHtml(initialStage.eyebrow)}</p>
            <h2>${escapeHtml(initialStage.title)}</h2>
            <p class="architecture-caption__summary">${escapeHtml(initialStage.summary)}</p>
          </div>
          <dl>
            <div><dt>设计变化</dt><dd data-field="insight">${escapeHtml(initialStage.insight)}</dd></div>
            <div><dt>真实代价</dt><dd data-field="tradeoff">${escapeHtml(initialStage.tradeoff)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  `;
}

const renderAxisPanel = (axisId, initialStage) => {
  const panel = axisPanels[axisId];
  const anchorIndex = pipelineStages.findIndex((stage) => stage.id === panel.anchorNodeId);

  return `
    <section
      class="architecture-axis-panel is-active"
      id="axis-panel-${escapeHtml(axisId)}"
      data-axis-panel="${escapeHtml(axisId)}"
      data-axis-anchor-index="${Math.max(anchorIndex, 0)}"
      aria-labelledby="axis-title-${escapeHtml(axisId)}"
    >
      <span class="architecture-axis-panel__connector" aria-hidden="true"><i></i></span>
      <header class="architecture-axis-panel__header">
        <div>
          <p>${escapeHtml(panel.axisLabel)}</p>
          <h2 id="axis-title-${escapeHtml(axisId)}">${escapeHtml(panel.title)}</h2>
        </div>
        <p>${escapeHtml(panel.summary)}</p>
      </header>
      ${panel.render(initialStage)}
    </section>
  `;
};

class AppArchitectureExplainer extends HTMLElement {
  connectedCallback() {
    this.currentStageIndex = 0;
    this.transitionToken = 0;
    this.coordinateObserver = null;
    this.axisResizeObserver = null;
    this.selectedPipelineStageId = INITIAL_PIPELINE_STAGE_ID;
    this.expandedAxisId = "app-architecture";
    this.prefersReducedMotion = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;

    const initialStage = architectureStages[0];
    this.innerHTML = `
      <main class="architecture-page">
        <header class="site-nav" aria-label="主导航">
          <a class="brand" href="/" aria-label="Tim 首页">
            <span class="brand-mark" aria-hidden="true">${escapeHtml(profile.mark)}</span>
            <span>
              <strong>${escapeHtml(profile.name)}</strong>
              <small>${escapeHtml(profile.role)}</small>
            </span>
          </a>
          <nav>
            <a href="/#work">作品</a>
            <a aria-current="page" href="/app-architecture/">架构</a>
            <a class="nav-research" href="${profile.research.href}" target="_blank" rel="noreferrer">研究</a>
            <a href="/about/">关于</a>
            <a class="nav-github nav-external" href="${profile.github.href}" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          </nav>
        </header>

        <section class="architecture-hero" aria-labelledby="architecture-page-title">
          <p class="eyebrow">App 架构 · 动态解说</p>
          <h1 id="architecture-page-title">一个 App，如何从混乱走向秩序。</h1>
          <div class="architecture-hero__footer">
            <p>沿横轴追踪一次变更如何抵达设备；在 App Runtime 节点向下展开纵轴，进入组件、业务模块、壳、Router 与动态运行时。</p>
            <div class="architecture-hero__meta" aria-label="解说信息">
              <span>2 个维度</span><span>${pipelineStages.length} 个交付节点</span><span>${architectureStages.length} 个 App 阶段</span>
            </div>
          </div>
          <a class="architecture-scroll-cue" href="#architecture-system">
            <span>进入二维架构</span><i aria-hidden="true"></i>
          </a>
          <div class="architecture-hero__glow" aria-hidden="true"></div>
        </section>

        <section class="architecture-system" id="architecture-system" aria-labelledby="architecture-system-title">
          <header class="architecture-system__header">
            <div>
              <p class="eyebrow">一张图 · 两个正交维度</p>
              <h2 id="architecture-system-title">Pipeline 向右流动，App 向下展开。</h2>
            </div>
            <p>横轴描述交付生命周期，纵轴描述 App 内部结构。每个节点都可查看完整输入、动作、输出与失败策略；节点与纵轴通过通用 <code>axisId</code> 契约关联。</p>
          </header>

          <div class="architecture-coordinate has-expanded-axis" data-expanded-axis="app-architecture">
            <section class="pipeline-axis" aria-labelledby="pipeline-axis-title">
              <div class="pipeline-axis__heading">
                <span>X</span>
                <div>
                  <p id="pipeline-axis-title">X · Delivery Pipeline</p>
                  <small>从左到右 · 选择节点查看完整职责</small>
                </div>
                <span class="pipeline-axis__hint">← 横向浏览 →</span>
              </div>

              <div class="pipeline-axis__viewport">
                <div class="pipeline-axis__track" aria-hidden="true">
                  <span></span><i></i>
                </div>
                <ol class="pipeline-axis__nodes" role="tablist" aria-label="Delivery Pipeline 节点">
                  ${renderPipelineStages()}
                </ol>
              </div>

            </section>

            <div class="pipeline-workspace">
              <span class="pipeline-workspace__connector" aria-hidden="true"><i></i></span>
              <section
                class="pipeline-detail"
                id="pipeline-detail"
                role="tabpanel"
                aria-live="polite"
                aria-labelledby="pipeline-tab-${INITIAL_PIPELINE_STAGE_ID}"
              >
                ${renderPipelineDetail(pipelineStages.find((stage) => stage.id === INITIAL_PIPELINE_STAGE_ID))}
              </section>

              <div class="architecture-axis-stack">
                ${Object.keys(axisPanels).map((axisId) => renderAxisPanel(axisId, initialStage)).join("")}
              </div>
            </div>
          </div>
        </section>

        <section class="architecture-capabilities" aria-labelledby="capabilities-title">
          <header class="architecture-capabilities__header">
            <div>
              <p class="eyebrow">横轴补充 · 大型 App Runtime</p>
              <h2 id="capabilities-title">模块负责业务，Runtime 负责安全地加载变化。</h2>
            </div>
            <p>运行时能力可以横切模块，但不能重新拥有业务。资源、配置实验、交付和 Telemetry 各守边界，失败时都能回到随包发布的稳定基线。</p>
          </header>
          <div class="architecture-capabilities__grid">
            <article>
              <div class="architecture-capability__meta">${architectureIcon("modules")}<span>01 · 模块与路由</span></div>
              <h3>多技术栈，以制品接入</h3>
              <p>Native、Flutter、React Native 模块独立构建，通过签名产物与 Module Manifest 接入；App 壳根据清单生成注册信息和动态路由表。</p>
              <ul><li>独立构建产物</li><li>Module Manifest</li><li>动态路由表</li></ul>
            </article>
            <article>
              <div class="architecture-capability__meta">${architectureIcon("resources")}<span>02 · 动态交付与资源</span></div>
              <h3>内置资源是基线，热修复是增量</h3>
              <p>i18n、图片和主题首先随 App 或模块构建。动态交付 Runtime 只下发版本化、已签名的模块或资源包，并通过原子激活与回滚保护启动路径。</p>
              <ul><li>内置资源</li><li>资源热修复</li><li>验签与回滚</li></ul>
            </article>
            <article>
              <div class="architecture-capability__meta">${architectureIcon("experiment")}<span>03 · 配置与实验</span></div>
              <h3>远端给参数，模块保有规则</h3>
              <p>动态配置、Feature Flag 与 A/B Test 提供参数、开关和分流；模块随包携带 Schema、默认值与降级逻辑，远端配置不能绕过业务边界。</p>
              <ul><li>动态配置</li><li>Feature Flag</li><li>A/B Test</li></ul>
            </article>
            <article>
              <div class="architecture-capability__meta">${architectureIcon("telemetry")}<span>04 · Telemetry 与数据</span></div>
              <h3>统一采集，不混淆数据用途</h3>
              <p>Log 服务诊断，埋点描述行为，指标衡量健康度与产品结果。Telemetry Runtime 统一采样和上报，但事件 Schema、隐私和数据所有权保持清晰。</p>
              <ul><li>Log</li><li>埋点</li><li>指标与统计</li></ul>
            </article>
          </div>
        </section>

        <section class="architecture-principles" aria-labelledby="principles-title">
          <div>
            <p class="eyebrow">读图原则</p>
            <h2 id="principles-title">先区分通用能力，再划分业务边界。</h2>
          </div>
          <div class="architecture-principles__list">
            <article><span>01</span><h3>组件保持通用</h3><p>UI 与功能组件提供复用能力，不判断某项业务应该如何运转。</p></article>
            <article><span>02</span><h3>模块承载业务</h3><p>业务 UI、业务逻辑和组件依赖共同构成一项完整业务能力。</p></article>
            <article><span>03</span><h3>壳组装，路由通信</h3><p>App 壳注册模块；Router 传递路由协议，但不接管模块的业务逻辑。</p></article>
          </div>
        </section>

        <aside class="architecture-note" aria-label="架构适用范围">
          <span>边界提醒</span>
          <p>这是一套参考模型，不是模块越多越好。团队规模、构建时间、发布节奏与产品边界，决定了一个 App 应该拆到什么程度。</p>
        </aside>

        <footer class="site-footer">
          <span>© ${new Date().getFullYear()} ${escapeHtml(profile.name)}</span>
          <a href="/">返回全部作品 <span aria-hidden="true">↗</span></a>
        </footer>
      </main>
    `;

    this.cacheElements();
    this.bindEvents();
    this.updateGroupSlots(initialStage);
    this.updateNodeSlots(initialStage, { immediate: true });
    this.setupCoordinateObserver();
    this.setupAxisAlignment();
  }

  disconnectedCallback() {
    this.coordinateObserver?.disconnect();
    this.axisResizeObserver?.disconnect();
    this.pipelineViewport?.removeEventListener("scroll", this.handlePipelineScroll);
  }

  cacheElements() {
    this.stageTabs = [...this.querySelectorAll("[data-stage]")];
    this.coordinate = this.querySelector(".architecture-coordinate");
    this.axisTriggers = [...this.querySelectorAll("[data-axis-trigger]")];
    this.axisPanelElements = [...this.querySelectorAll("[data-axis-panel]")];
    this.pipelineNodeElements = [...this.querySelectorAll("[data-pipeline-node]")];
    this.pipelineTabs = [...this.querySelectorAll("[data-pipeline-select]")];
    this.pipelineAxis = this.querySelector(".pipeline-axis");
    this.pipelineViewport = this.querySelector(".pipeline-axis__viewport");
    this.pipelineWorkspace = this.querySelector(".pipeline-workspace");
    this.pipelineDetail = this.querySelector(".pipeline-detail");
    this.visual = this.querySelector(".architecture-visual");
    this.canvas = this.querySelector(".architecture-canvas");
    this.groupSlots = [...this.querySelectorAll(".architecture-group")];
    this.nodeSlots = [...this.querySelectorAll(".architecture-node")];
    this.linksContent = this.querySelector(".architecture-links__content");
    this.caption = this.querySelector(".architecture-caption");
    this.sequence = this.querySelector(".architecture-visual__sequence");
    this.frame = this.querySelector(".architecture-visual__frame");
  }

  bindEvents() {
    this.pipelineTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const pipelineStageId = tab.dataset.pipelineSelect;
        const wasSelected = pipelineStageId === this.selectedPipelineStageId;
        const wasExpanded = tab.dataset.axisTrigger === this.expandedAxisId;
        this.selectPipelineStage(pipelineStageId);

        if (tab.dataset.axisTrigger && wasSelected && wasExpanded) {
          this.setExpandedAxis(null);
        }
      });

      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          return;
        }
        event.preventDefault();
        const currentIndex = this.pipelineTabs.indexOf(tab);
        const nextIndex = event.key === "Home"
          ? 0
          : event.key === "End"
            ? this.pipelineTabs.length - 1
            : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + this.pipelineTabs.length) % this.pipelineTabs.length;
        const nextTab = this.pipelineTabs[nextIndex];
        this.selectPipelineStage(nextTab.dataset.pipelineSelect);
        nextTab.focus();
      });
    });

    this.stageTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const stageIndex = Number(tab.dataset.stage);
        this.showStage(stageIndex);
      });

      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) {
          return;
        }
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (Number(tab.dataset.stage) + direction + architectureStages.length) % architectureStages.length;
        this.showStage(nextIndex);
        this.stageTabs[nextIndex].focus();
      });
    });

    this.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.expandedAxisId) {
        const collapsedAxisId = this.expandedAxisId;
        this.setExpandedAxis(null);
        this.axisTriggers.find((trigger) => trigger.dataset.axisTrigger === collapsedAxisId)?.focus();
      }
    });
  }

  setupCoordinateObserver() {
    this.coordinateObserver = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        this.coordinate.classList.add("is-in-view");
        this.coordinateObserver?.disconnect();
      }
    }, {
      rootMargin: "0px 0px -16% 0px",
      threshold: 0.08,
    });

    this.coordinateObserver.observe(this.coordinate);
  }

  setupAxisAlignment() {
    this.axisResizeObserver = new ResizeObserver(() => this.alignAxisPanels());
    this.axisResizeObserver.observe(this.pipelineAxis);
    this.axisResizeObserver.observe(this.coordinate);
    this.handlePipelineScroll = () => this.alignAxisPanels();
    this.pipelineViewport.addEventListener("scroll", this.handlePipelineScroll, { passive: true });
    requestAnimationFrame(() => {
      this.centerPipelineStage(INITIAL_PIPELINE_STAGE_ID, "auto");
      this.alignAxisPanels();
    });
  }

  alignAxisPanels() {
    const selectedNode = this.pipelineNodeElements.find(
      (nodeElement) => nodeElement.dataset.pipelineNode === this.selectedPipelineStageId,
    );
    if (!selectedNode || !this.pipelineWorkspace) {
      return;
    }

    const nodeRect = selectedNode.getBoundingClientRect();
    const workspaceRect = this.pipelineWorkspace.getBoundingClientRect();
    const anchorInline = nodeRect.left + nodeRect.width / 2 - workspaceRect.left;
    const connectorHeight = Math.max(workspaceRect.top - nodeRect.bottom, 0);
    this.pipelineWorkspace.style.setProperty(
      "--workspace-anchor-inline",
      `${Math.min(Math.max(anchorInline, 24), Math.max(workspaceRect.width - 24, 24))}px`,
    );
    this.pipelineWorkspace.style.setProperty("--workspace-connector-height", `${connectorHeight}px`);
  }

  selectPipelineStage(stageId) {
    const stage = pipelineStages.find((pipelineStage) => pipelineStage.id === stageId);
    if (!stage) {
      return;
    }

    this.selectedPipelineStageId = stageId;
    this.pipelineTabs.forEach((tab) => {
      const isSelected = tab.dataset.pipelineSelect === stageId;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    });
    this.pipelineDetail.setAttribute("aria-labelledby", `pipeline-tab-${stageId}`);
    this.pipelineDetail.innerHTML = renderPipelineDetail(stage);
    this.setExpandedAxis(stage.axisId ?? null);
    this.pipelineDetail.animate([
      { opacity: 0.35, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], {
      duration: this.prefersReducedMotion ? 1 : 360,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
    this.centerPipelineStage(stageId, this.prefersReducedMotion ? "auto" : "smooth");
    requestAnimationFrame(() => this.alignAxisPanels());
  }

  centerPipelineStage(stageId, behavior) {
    const tab = this.pipelineTabs.find((pipelineTab) => pipelineTab.dataset.pipelineSelect === stageId);
    if (!tab) {
      return;
    }
    const pipelineNode = tab.closest("[data-pipeline-node]");
    const targetScrollLeft = pipelineNode.offsetLeft
      - (this.pipelineViewport.clientWidth - pipelineNode.offsetWidth) / 2;
    this.pipelineViewport.scrollTo({ left: Math.max(targetScrollLeft, 0), behavior });
  }

  setExpandedAxis(axisId) {
    const nextAxisId = axisId && axisPanels[axisId] ? axisId : null;
    this.expandedAxisId = nextAxisId;
    this.coordinate.dataset.expandedAxis = nextAxisId ?? "";
    this.coordinate.classList.toggle("has-expanded-axis", Boolean(nextAxisId));

    this.axisTriggers.forEach((trigger) => {
      const isExpanded = trigger.dataset.axisTrigger === nextAxisId;
      trigger.setAttribute("aria-expanded", String(isExpanded));
      const actionLabel = trigger.querySelector(".pipeline-node__expand span");
      if (actionLabel) {
        actionLabel.textContent = isExpanded ? "收起纵轴" : "展开纵轴";
      }
    });

    this.axisPanelElements.forEach((panel) => {
      const isActive = panel.dataset.axisPanel === nextAxisId;
      panel.classList.toggle("is-active", isActive);
      panel.setAttribute("aria-hidden", String(!isActive));
      panel.inert = !isActive;
    });
  }

  showStage(index) {
    const normalizedIndex = (index + architectureStages.length) % architectureStages.length;
    if (normalizedIndex === this.currentStageIndex && this.canvas.dataset.ready === "true") {
      return;
    }

    const stage = architectureStages[normalizedIndex];
    this.currentStageIndex = normalizedIndex;
    this.transitionToken += 1;

    this.stageTabs.forEach((tab, tabIndex) => {
      const isCurrent = tabIndex === normalizedIndex;
      tab.setAttribute("aria-selected", String(isCurrent));
      tab.tabIndex = isCurrent ? 0 : -1;
    });
    this.visual.dataset.accent = stage.accent;
    this.canvas.dataset.stageId = stage.id;
    this.sequence.textContent = `${stage.sequence} / ${stageCountLabel()}`;
    this.frame.textContent = stage.frameLabel;
    this.caption.querySelector(".architecture-caption__eyebrow").textContent = stage.eyebrow;
    this.caption.querySelector("h2").textContent = stage.title;
    this.caption.querySelector(".architecture-caption__summary").textContent = stage.summary;
    this.caption.querySelector('[data-field="insight"]').textContent = stage.insight;
    this.caption.querySelector('[data-field="tradeoff"]').textContent = stage.tradeoff;

    this.updateNodeSlots(stage);
    this.updateGroupSlots(stage);
    this.linksContent.innerHTML = renderFlowEdges(stage);
    this.canvas.dataset.ready = "true";
  }

  updateNodeSlots(stage, { immediate = false } = {}) {
    const transitionToken = this.transitionToken;

    nodesForStage(stage).map((node, index) => {
      const slot = this.nodeSlots[index];
      const visible = node.visible !== false;
      slot.className = `architecture-node architecture-node--${node.tone}${node.parts ? " has-parts" : ""}${visible ? "" : " is-hidden"}`;
      slot.setAttribute("aria-hidden", String(!visible));
      slot.disabled = !visible;
      slot.tabIndex = visible ? 0 : -1;
      if (visible) {
        slot.setAttribute("aria-label", `${node.label}：${node.detail}`);
      } else {
        slot.removeAttribute("aria-label");
      }

      if (!immediate && !this.prefersReducedMotion) {
        slot.animate([
          { opacity: visible ? 1 : 0, filter: "blur(0px)" },
          { opacity: 0.18, filter: "blur(4px)", offset: 0.32 },
          { opacity: visible ? 1 : 0, filter: "blur(0px)" },
        ], {
          duration: 920,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        });
      }

      requestAnimationFrame(() => {
        if (transitionToken !== this.transitionToken) {
          return;
        }
        slot.style.setProperty("--node-x", `${node.x}%`);
        slot.style.setProperty("--node-y", `${node.y}%`);
        slot.style.setProperty("--node-w", `${node.w}%`);
        slot.style.setProperty("--node-h", `${node.h}%`);
        slot.innerHTML = nodeContent(node);
      });

      return slot;
    });
  }

  updateGroupSlots(stage) {
    groupsForStage(stage).forEach((group, index) => {
      const slot = this.groupSlots[index];
      const visible = group.visible !== false;
      slot.className = `architecture-group architecture-group--${group.tone}${visible ? "" : " is-hidden"}`;
      slot.style.setProperty("--group-x", `${group.x}%`);
      slot.style.setProperty("--group-y", `${group.y}%`);
      slot.style.setProperty("--group-w", `${group.w}%`);
      slot.style.setProperty("--group-h", `${group.h}%`);
      slot.querySelector("span").textContent = group.label;
    });
  }
}

customElements.define("app-architecture-explainer", AppArchitectureExplainer);
