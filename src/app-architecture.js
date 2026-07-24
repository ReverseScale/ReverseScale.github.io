import { profile } from "./site-data.js";

const DIAGRAM_WIDTH = 1000;
const DIAGRAM_HEIGHT = 620;
const MAX_GROUP_SLOTS = 4;
const MAX_NODE_SLOTS = 7;
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";
const INITIAL_PIPELINE_STAGE_ID = "app-runtime";

// Group labels occupy the top band of each boundary. Child nodes start below
// that band so the diagram remains readable across font metrics and browsers.
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
      { id: "slot-4", label: "UI 组件库", detail: "跨业务复用的视觉能力", badge: "无业务逻辑", x: 24, y: 74, w: 23, h: 17, tone: "shared" },
      { id: "slot-5", label: "功能组件库", detail: "跨业务复用的平台能力", badge: "无业务逻辑", x: 53, y: 74, w: 23, h: 17, tone: "platform" },
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
      { id: "slot-4", label: "通用组件层", detail: "UI 组件库 · 功能组件库", x: 34, y: 84, w: 32, h: 10, tone: "shared" },
      { id: "slot-5", label: "Router", detail: "模块间路由与参数协议", badge: "模块通信", x: 38, y: 26, w: 24, h: 13, tone: "domain" },
      { id: "slot-6", label: "App 壳", detail: "启动、发现并注册业务模块", badge: "模块注册中心", x: 38, y: 11, w: 24, h: 13, tone: "shell" },
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
      { id: "slot-2", label: "动态交付 Runtime", detail: "检查 · 下载 · 验签 · 原子激活 · 回滚", x: 52, y: 50, w: 43, h: 10, tone: "platform" },
      { id: "slot-3", label: "资源系统", detail: "内置资源 + i18n / 图片 / 主题热修复", x: 52, y: 62, w: 43, h: 10, tone: "shared" },
      { id: "slot-4", label: "配置与实验", detail: "动态配置 · Feature Flag · A/B Test", x: 52, y: 74, w: 43, h: 10, tone: "domain" },
      { id: "slot-5", label: "动态路由表", detail: "由 Module Manifest 自动生成", badge: "路由注册中心", x: 35, y: 25, w: 30, h: 13, tone: "domain" },
      { id: "slot-6", label: "App 壳", detail: "校验并加载兼容产物", badge: "组合与加载入口", x: 38, y: 9, w: 24, h: 14, tone: "shell" },
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
    tags: ["运行激活", "设备内装配"],
    tone: "app",
    icon: "app",
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

const architectureGameLevels = Object.freeze([
  {
    id: "extract-shared-capabilities",
    sequence: "01",
    title: "抽出通用能力",
    brief: "先把不拥有业务规则、却被多个业务复用的能力从单体中识别出来。",
    principle: "组件提供能力，但不替业务做决定。",
    layout: "shared-capabilities",
    topologyLabel: "业务层依赖两类通用能力",
    zones: [
      { id: "business-code", role: "business", label: "业务代码", detail: "保留业务规则与流程", blueprint: ["业务 UI", "业务规则"] },
      { id: "ui-components", role: "shared-ui", label: "UI 组件库", detail: "跨业务复用的视觉能力", blueprint: ["Button", "Card", "Dialog"] },
      { id: "functional-components", role: "shared-platform", label: "功能组件库", detail: "跨业务复用的平台能力", blueprint: ["权限", "媒体", "分享"] },
    ],
    pieces: [
      { id: "checkout-discount", label: "结算优惠规则", detail: "决定订单如何计价", target: "business-code", reason: "它包含结算业务语义，不能下沉为通用组件。" },
      { id: "button-card-dialog", label: "Button / Card / Dialog", detail: "统一视觉与交互", target: "ui-components", reason: "它们只提供视觉能力，不判断具体业务流程。" },
      { id: "permission-picker-share", label: "权限 / 图片选择 / 分享", detail: "封装系统平台能力", target: "functional-components", reason: "它们封装跨业务平台能力，不拥有业务规则。" },
      { id: "catalog-ranking", label: "目录排序规则", detail: "决定商品展示顺序", target: "business-code", reason: "排序策略属于目录业务，不应进入通用组件。" },
    ],
  },
  {
    id: "form-business-modules",
    sequence: "02",
    title: "建立业务边界",
    brief: "把同一业务的 UI 与规则放回同一个变化单元，让模块拥有完整业务能力。",
    principle: "模块是一项完整业务，不是更大的 UI 组件。",
    layout: "business-modules",
    topologyLabel: "三个业务模块并列演进",
    zones: [
      { id: "home-module", role: "home", label: "首页模块", detail: "首页 UI + 首页规则", blueprint: ["业务 UI", "业务规则", "组件依赖"] },
      { id: "catalog-module", role: "catalog", label: "目录模块", detail: "搜索商品 UI + 目录规则", blueprint: ["业务 UI", "业务规则", "组件依赖"] },
      { id: "checkout-module", role: "checkout", label: "结算模块", detail: "支付订单 UI + 结算规则", blueprint: ["业务 UI", "业务规则", "组件依赖"] },
    ],
    pieces: [
      { id: "home-ui", label: "首页 UI", detail: "信息流与入口", target: "home-module", reason: "它与首页状态和规则共同变化。" },
      { id: "home-rules", label: "首页推荐规则", detail: "首页内容编排", target: "home-module", reason: "推荐编排属于首页业务边界。" },
      { id: "catalog-ui", label: "搜索与商品 UI", detail: "目录浏览体验", target: "catalog-module", reason: "它由目录模块完整拥有。" },
      { id: "catalog-rules", label: "搜索与筛选规则", detail: "目录查询逻辑", target: "catalog-module", reason: "查询规则与目录 UI 共同演进。" },
      { id: "checkout-ui", label: "支付与订单 UI", detail: "结算操作界面", target: "checkout-module", reason: "它属于结算的完整用户流程。" },
      { id: "checkout-rules", label: "支付与订单规则", detail: "金额、状态与流程", target: "checkout-module", reason: "订单规则必须由结算模块拥有。" },
    ],
  },
  {
    id: "own-module-data",
    sequence: "03",
    title: "收拢数据所有权",
    brief: "让业务数据跟随业务边界，避免多个模块绕过协议读写同一份实现。",
    principle: "数据可以共享结果，但必须有唯一、清晰的业务 Owner。",
    layout: "data-ownership",
    topologyLabel: "业务数据归模块，平台数据归平台",
    zones: [
      { id: "home-data", role: "home-data", label: "首页数据边界", detail: "首页状态、信息流与缓存", blueprint: ["Home API", "Feed Cache"] },
      { id: "catalog-data", role: "catalog-data", label: "目录数据边界", detail: "搜索索引与商品数据", blueprint: ["Search API", "Catalog Cache"] },
      { id: "checkout-data", role: "checkout-data", label: "结算数据边界", detail: "订单事务与支付状态", blueprint: ["Order API", "Transaction DB"] },
      { id: "platform-data", role: "platform-data", label: "平台数据边界", detail: "跨业务的身份与设备偏好", blueprint: ["Session", "Preferences"] },
    ],
    pieces: [
      { id: "home-feed-cache", label: "首页信息流缓存", detail: "首页内容与刷新状态", target: "home-data", reason: "信息流状态只随首页业务变化，应由首页模块拥有。" },
      { id: "catalog-search-index", label: "搜索索引与商品缓存", detail: "查询、筛选与商品快照", target: "catalog-data", reason: "搜索和商品数据属于目录业务边界。" },
      { id: "order-transaction-state", label: "订单事务与支付状态", detail: "金额、支付与订单状态机", target: "checkout-data", reason: "事务一致性必须由结算模块统一维护。" },
      { id: "session-preferences", label: "登录会话与设备偏好", detail: "身份令牌、Locale 与主题", target: "platform-data", reason: "身份和设备偏好是跨业务平台状态，不属于某个业务模块。" },
    ],
  },
  {
    id: "control-dependency-direction",
    sequence: "04",
    title: "控制依赖方向",
    brief: "让高层业务依赖稳定契约，让平台实现契约，并识别破坏边界的反向引用。",
    principle: "依赖指向稳定抽象；Domain 与 Shared 不反向依赖 Feature。",
    layout: "dependency-direction",
    topologyLabel: "Feature 使用 Domain，Adapter 实现 Contract",
    zones: [
      { id: "feature-to-domain", role: "feature-domain", label: "Feature → Domain", detail: "界面编排调用业务用例", blueprint: ["ViewModel", "Use Case"] },
      { id: "domain-contract", role: "domain-contract", label: "Domain Contract", detail: "稳定的实体、规则与端口", blueprint: ["Entity", "Policy", "Port"] },
      { id: "platform-adapter", role: "adapter", label: "Platform Adapter", detail: "API 与 Storage 实现端口", blueprint: ["API", "Storage"] },
      { id: "dependency-violation", role: "violation", label: "反向依赖待修复", detail: "底层能力引用上层业务实现", blueprint: ["禁止反向 import"] },
    ],
    pieces: [
      { id: "viewmodel-use-case", label: "首页 ViewModel 调用推荐 Use Case", detail: "UI 发起业务意图", target: "feature-to-domain", reason: "Feature 可以依赖稳定的 Domain Use Case。" },
      { id: "order-policy-contract", label: "订单计价规则与实体协议", detail: "不依赖具体 UI 或网络", target: "domain-contract", reason: "核心业务规则应留在稳定的 Domain Contract。" },
      { id: "repository-adapter", label: "API Client 实现 CatalogRepository", detail: "远端实现业务端口", target: "platform-adapter", reason: "平台实现依赖 Domain 声明的端口，而不是反向定义业务。" },
      { id: "shared-imports-feature", label: "UI 组件库 import 首页状态", detail: "共享层引用具体业务", target: "dependency-violation", reason: "Shared 反向依赖 Feature 会污染复用边界，必须拆除。" },
    ],
  },
  {
    id: "design-module-contracts",
    sequence: "05",
    title: "设计模块契约",
    brief: "只公开跨边界协作所需的协议，把实现细节保留在模块内部。",
    principle: "公开最小稳定协议；路由、事件和调用接口各自表达一种协作方式。",
    layout: "module-contracts",
    topologyLabel: "模块通过三类契约对外，内部实现保持隐藏",
    zones: [
      { id: "public-api", role: "public-api", label: "Public API", detail: "同步调用与能力入口", blueprint: ["Input", "Result"] },
      { id: "route-contract", role: "route-contract", label: "Route Contract", detail: "跨模块页面导航协议", blueprint: ["Path", "Parameters"] },
      { id: "domain-event", role: "domain-event", label: "Domain Event", detail: "已发生事实的异步通知", blueprint: ["Event", "Schema"] },
      { id: "module-internal", role: "internal", label: "Module Internal", detail: "不对外暴露的实现细节", blueprint: ["Coordinator", "State"] },
    ],
    pieces: [
      { id: "checkout-start-api", label: "Checkout.start(input)", detail: "启动结算并返回结果", target: "public-api", reason: "这是其他模块调用结算能力的最小同步入口。" },
      { id: "catalog-product-route", label: "/catalog/product/:id", detail: "商品详情导航协议", target: "route-contract", reason: "路径和参数属于 Router 可理解的跨模块导航契约。" },
      { id: "order-paid-event", label: "OrderPaid Event", detail: "订单已支付的业务事实", target: "domain-event", reason: "已发生事实适合通过版本化事件通知其他模块。" },
      { id: "payment-coordinator", label: "CheckoutPaymentCoordinator", detail: "结算模块内部流程编排", target: "module-internal", reason: "具体 Coordinator 是可替换实现，不应成为公共依赖。" },
    ],
  },
  {
    id: "assemble-the-app",
    sequence: "06",
    title: "组装 App",
    brief: "让壳负责注册，让 Router 负责通信，避免业务模块直接引用彼此。",
    principle: "壳组装模块，Router 传协议；两者都不接管业务。",
    layout: "app-assembly",
    topologyLabel: "App 壳组装、Router 通信、组件下沉",
    zones: [
      { id: "app-shell", role: "shell", label: "App 壳", detail: "启动、发现与模块注册", blueprint: ["Bootstrap", "Registry"] },
      { id: "router", role: "router", label: "Router", detail: "跨模块路由与参数协议", blueprint: ["Route", "Parameters"] },
      { id: "business-modules", role: "modules", label: "业务模块", detail: "独立拥有业务 UI 与规则", blueprint: ["首页", "目录", "结算"] },
      { id: "shared-components", role: "components", label: "通用组件", detail: "被所有业务按需复用", blueprint: ["UI", "功能能力"] },
    ],
    pieces: [
      { id: "module-registration", label: "模块注册表", detail: "发现首页、目录与结算", target: "app-shell", reason: "启动和注册是 App 壳的组合职责。" },
      { id: "cross-module-route", label: "跨模块跳转协议", detail: "Route + Parameters", target: "router", reason: "模块通信应依赖路由协议，而不是彼此实现。" },
      { id: "home-catalog-checkout", label: "首页 / 目录 / 结算", detail: "三个完整业务单元", target: "business-modules", reason: "这些模块保有各自业务能力。" },
      { id: "shared-libraries", label: "UI + 功能组件库", detail: "无业务逻辑的复用能力", target: "shared-components", reason: "共享库只提供跨业务能力。" },
    ],
  },
  {
    id: "govern-runtime-change",
    sequence: "07",
    title: "治理运行时变化",
    brief: "规模变大后，把交付、资源、配置实验和观测分别放进清晰的平台边界。",
    principle: "Runtime 可以横切模块，但不能重新拥有业务。",
    layout: "runtime-platform",
    topologyLabel: "四类平台能力横切业务模块",
    zones: [
      { id: "delivery-runtime", role: "delivery", label: "动态交付 Runtime", detail: "检查、下载、验签、激活与回滚", blueprint: ["验签", "激活", "回滚"] },
      { id: "resource-system", role: "resources", label: "资源系统", detail: "内置基线与版本化资源包", blueprint: ["i18n", "图片", "主题"] },
      { id: "config-experiment", role: "configuration", label: "配置与实验", detail: "参数、Feature Flag 与 A/B Test", blueprint: ["Config", "Flag", "A/B"] },
      { id: "telemetry-runtime", role: "telemetry", label: "Telemetry Runtime", detail: "Log、埋点与指标上报", blueprint: ["Log", "Event", "Metric"] },
    ],
    pieces: [
      { id: "signed-artifact", label: "已签名模块制品", detail: "需要安全激活与回滚", target: "delivery-runtime", reason: "动态制品必须经过验签、原子激活和失败回退。" },
      { id: "i18n-images-theme", label: "i18n / 图片 / 主题", detail: "随包基线 + 可选热修复", target: "resource-system", reason: "资源需要稳定内置基线与独立版本管理。" },
      { id: "flags-ab-test", label: "Feature Flag / A/B Test", detail: "运行时参数与实验分流", target: "config-experiment", reason: "配置和实验提供参数，不应混入资源或业务实现。" },
      { id: "logs-events-metrics", label: "Log / 埋点 / 指标", detail: "诊断与产品反馈", target: "telemetry-runtime", reason: "观测信号应统一治理，同时保持数据用途清晰。" },
    ],
  },
  {
    id: "design-failure-recovery",
    sequence: "08",
    title: "设计失败降级",
    brief: "为动态能力设计可验证的退路，让局部失败不会拖垮 App 启动与核心流程。",
    principle: "先有稳定基线，再谈动态变化；所有恢复路径都必须可观测。",
    layout: "resilience-layers",
    topologyLabel: "稳定基线承底，回退、熔断与观测形成恢复闭环",
    zones: [
      { id: "built-in-baseline", role: "baseline", label: "Built-in Baseline", detail: "随包发布的默认能力", blueprint: ["Default Config", "Bundled Resource"] },
      { id: "last-known-good", role: "last-known-good", label: "Last Known Good", detail: "最近一次验证成功的版本", blueprint: ["Verified", "Compatible"] },
      { id: "kill-switch", role: "kill-switch", label: "Kill Switch", detail: "远端停止异常动态能力", blueprint: ["Disable", "Contain"] },
      { id: "recovery-observability", role: "recovery-signal", label: "Recovery Signals", detail: "驱动暂停、回退与复盘", blueprint: ["Crash", "Route", "Rollback"] },
    ],
    pieces: [
      { id: "bundled-defaults", label: "随包默认配置与基础资源", detail: "离线也能启动的稳定内容", target: "built-in-baseline", reason: "动态内容不可用时，App 必须能退回随包稳定基线。" },
      { id: "verified-module-version", label: "最近一次验签成功的模块版本", detail: "兼容且已实际运行", target: "last-known-good", reason: "激活失败应回到最近一次验证成功的兼容版本。" },
      { id: "disable-broken-module", label: "远端停用异常动态模块", detail: "阻止继续加载故障能力", target: "kill-switch", reason: "Kill Switch 用于快速隔离故障，不修改业务数据。" },
      { id: "rollback-evidence", label: "Crash / 路由失败 / 回退结果", detail: "恢复决策与效果证据", target: "recovery-observability", reason: "恢复动作必须有信号证明触发原因和最终效果。" },
    ],
  },
]);

const assertArchitectureGameContract = (levels) => {
  const levelIds = new Set();
  levels.forEach((level) => {
    if (levelIds.has(level.id)) {
      throw new Error(`Duplicate architecture game level: ${level.id}`);
    }
    levelIds.add(level.id);

    if (!level.layout || !level.topologyLabel) {
      throw new Error(`Missing architecture topology metadata for level "${level.id}"`);
    }

    const zoneIds = new Set(level.zones.map((zone) => zone.id));
    const zoneRoles = new Set();
    level.zones.forEach((zone) => {
      if (!zone.role || zoneRoles.has(zone.role)) {
        throw new Error(`Invalid architecture zone role for "${zone.id}"`);
      }
      if (!Array.isArray(zone.blueprint) || zone.blueprint.length === 0) {
        throw new Error(`Missing architecture blueprint for zone "${zone.id}"`);
      }
      zoneRoles.add(zone.role);
    });
    const pieceIds = new Set();
    level.pieces.forEach((piece) => {
      if (pieceIds.has(piece.id)) {
        throw new Error(`Duplicate architecture game piece: ${piece.id}`);
      }
      if (!zoneIds.has(piece.target)) {
        throw new Error(`Unknown target "${piece.target}" for architecture game piece "${piece.id}"`);
      }
      pieceIds.add(piece.id);
    });
  });
};

assertArchitectureGameContract(architectureGameLevels);

const totalArchitectureGamePieces = architectureGameLevels.reduce(
  (total, level) => total + level.pieces.length,
  0,
);

const shuffleArchitectureGamePieces = (pieces, previousPieceIds = []) => {
  const shuffledPieceIds = pieces.map((piece) => piece.id);
  for (let index = shuffledPieceIds.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledPieceIds[index], shuffledPieceIds[swapIndex]] = [
      shuffledPieceIds[swapIndex],
      shuffledPieceIds[index],
    ];
  }

  const disallowedOrders = new Set([
    pieces.map((piece) => piece.id).join(","),
    previousPieceIds.join(","),
  ]);
  let rotationCount = 0;
  while (
    shuffledPieceIds.length > 1
    && disallowedOrders.has(shuffledPieceIds.join(","))
    && rotationCount < shuffledPieceIds.length
  ) {
    shuffledPieceIds.push(shuffledPieceIds.shift());
    rotationCount += 1;
  }
  return shuffledPieceIds;
};

const createArchitectureGamePieceOrder = () => new Map(
  architectureGameLevels.map((level) => [
    level.id,
    shuffleArchitectureGamePieces(level.pieces),
  ]),
);

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
  const visibleTags = stage.tags.slice(0, 2);
  const remainingTagCount = Math.max(stage.tags.length - visibleTags.length, 0);

  return `
    <li
      data-pipeline-node="${escapeHtml(stage.id)}"
      data-tone="${escapeHtml(stage.tone ?? "default")}"
      style="--pipeline-order: ${index}"
    >
      <button
        class="pipeline-node"
        type="button"
        role="tab"
        id="pipeline-tab-${escapeHtml(stage.id)}"
        data-pipeline-select="${escapeHtml(stage.id)}"
        aria-selected="${String(isSelected)}"
        tabindex="${isSelected ? "0" : "-1"}"
        aria-controls="pipeline-detail"
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

const renderArchitectureGameLevelTabs = (
  activeLevelIndex,
  unlockedLevelIndex,
  completedLevelIds,
) =>
  architectureGameLevels.map((level, index) => `
    <button
      type="button"
      data-game-level="${index}"
      aria-current="${index === activeLevelIndex ? "step" : "false"}"
      ${index > unlockedLevelIndex ? "disabled" : ""}
    >
      <span>${escapeHtml(level.sequence)}</span>
      <strong>${escapeHtml(level.title)}</strong>
      <small>${completedLevelIds.has(level.id)
        ? "已完成"
        : index === activeLevelIndex
          ? "进行中"
          : index <= unlockedLevelIndex
            ? "已解锁"
            : "待解锁"}</small>
    </button>
  `).join("");

const renderArchitectureGamePiece = (piece, index) => `
  <button
    class="architecture-game__piece"
    type="button"
    draggable="true"
    data-game-piece="${escapeHtml(piece.id)}"
    style="--piece-index: ${index}"
    aria-pressed="false"
  >
    <strong>${escapeHtml(piece.label)}</strong>
    <small>${escapeHtml(piece.detail)}</small>
  </button>
`;

const renderArchitectureGame = () => `
  <section class="architecture-game" id="app-architecture-game" aria-labelledby="architecture-game-title">
    <header class="architecture-game__header">
      <div>
        <p class="eyebrow">App Architecture · Refactor Game</p>
        <h2 id="architecture-game-title">亲手把一个 App，从混乱重构到有序。</h2>
      </div>
      <div class="architecture-game__guide" aria-label="游戏操作说明">
        <p>把混乱区的职责送回正确边界。可拖拽卡片，也可先点卡片再点边界；判断越准确，架构状态越有序。</p>
        <ol>
          <li><span>01</span>选择或拖动职责卡</li>
          <li><span>02</span>放入目标架构边界</li>
          <li><span>03</span>完成任务并解锁下一关</li>
        </ol>
      </div>
    </header>
    <div class="architecture-game__shell">
      <nav class="architecture-game__levels" aria-label="架构重构关卡"></nav>
      <div class="architecture-game__workspace">
        <div class="architecture-game__hud" aria-label="模拟架构状态">
          <span>架构状态</span>
          <div><small>耦合度</small><i data-game-metric="coupling"></i></div>
          <div><small>边界清晰度</small><i data-game-metric="clarity"></i></div>
          <div><small>发布隔离度</small><i data-game-metric="isolation"></i></div>
          <div class="architecture-game__counter"><small>行动</small><b data-game-moves>0</b></div>
          <div class="architecture-game__counter"><small>连击</small><b data-game-streak>×0</b></div>
          <strong><small>秩序值</small><span data-game-progress>0%</span></strong>
        </div>
        <section class="architecture-game__mission" aria-live="polite"></section>
        <div class="architecture-game__feedback" role="status" aria-live="polite"></div>
        <div class="architecture-game__board"></div>
      </div>
    </div>
  </section>
`;

class AppArchitectureExplainer extends HTMLElement {
  connectedCallback() {
    this.coordinateObserver = null;
    this.selectedPipelineStageId = INITIAL_PIPELINE_STAGE_ID;
    this.currentGameLevelIndex = 0;
    this.unlockedGameLevelIndex = 0;
    this.selectedGamePieceId = null;
    this.gameMoveCount = 0;
    this.gameMistakeCount = 0;
    this.gameStreak = 0;
    this.isPlacingGamePiece = false;
    this.completedGamePieces = new Map(
      architectureGameLevels.map((level) => [level.id, new Set()]),
    );
    this.gamePieceOrderByLevel = createArchitectureGamePieceOrder();
    this.gameFeedback = "先选择一张职责卡片，再把它放进正确的架构边界。";
    this.prefersReducedMotion = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;

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
          <p class="eyebrow">App Architecture · Refactor Game</p>
          <h1 id="architecture-page-title">一个 App，如何从混乱走向秩序。</h1>
          <div class="architecture-hero__footer">
            <p>先在八关重构游戏里整理组件、业务模块、数据所有权、依赖、契约与恢复路径，再沿独立的 Delivery Pipeline 追踪一次变更如何抵达设备。</p>
            <div class="architecture-hero__meta" aria-label="解说信息">
              <span>${architectureGameLevels.length} 个重构关卡</span><span>${totalArchitectureGamePieces} 个架构决策</span><span>${pipelineStages.length} 个交付节点</span>
            </div>
          </div>
          <button class="architecture-scroll-cue" type="button" data-game-start>
            <span>开始架构挑战</span><i aria-hidden="true">→</i>
          </button>
          <div class="architecture-hero__glow" aria-hidden="true"></div>
        </section>

        ${renderArchitectureGame()}

        <section class="architecture-system" id="delivery-pipeline" aria-labelledby="architecture-system-title">
          <header class="architecture-system__header">
            <div>
              <p class="eyebrow">Delivery Pipeline · 独立视角</p>
              <h2 id="architecture-system-title">一次变更，如何安全地抵达设备。</h2>
            </div>
            <p>Pipeline 只描述交付生命周期，不承担 App 内部结构的展示。选择任一节点，查看它的输入、关键动作、输出、门禁、失败策略与可观测信号。</p>
          </header>

          <div class="architecture-coordinate">
            <section class="pipeline-axis" aria-labelledby="pipeline-axis-title">
              <div class="pipeline-axis__heading">
                <span>→</span>
                <div>
                  <p id="pipeline-axis-title">Delivery Pipeline</p>
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
              <section
                class="pipeline-detail"
                id="pipeline-detail"
                role="tabpanel"
                aria-live="polite"
                aria-labelledby="pipeline-tab-${INITIAL_PIPELINE_STAGE_ID}"
              >
                ${renderPipelineDetail(pipelineStages.find((stage) => stage.id === INITIAL_PIPELINE_STAGE_ID))}
              </section>
            </div>
          </div>
        </section>

        <section class="architecture-capabilities" aria-labelledby="capabilities-title">
          <header class="architecture-capabilities__header">
            <div>
              <p class="eyebrow">架构补充 · 大型 App Runtime</p>
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
    this.renderGame();
    this.setupCoordinateObserver();
    this.setupPipelineViewport();
  }

  disconnectedCallback() {
    this.coordinateObserver?.disconnect();
  }

  cacheElements() {
    this.coordinate = this.querySelector(".architecture-coordinate");
    this.pipelineTabs = [...this.querySelectorAll("[data-pipeline-select]")];
    this.pipelineViewport = this.querySelector(".pipeline-axis__viewport");
    this.pipelineDetail = this.querySelector(".pipeline-detail");
    this.gameLevels = this.querySelector(".architecture-game__levels");
    this.gameMission = this.querySelector(".architecture-game__mission");
    this.gameBoard = this.querySelector(".architecture-game__board");
    this.gameFeedbackElement = this.querySelector(".architecture-game__feedback");
    this.gameShell = this.querySelector(".architecture-game__shell");
    this.gameProgress = this.querySelector("[data-game-progress]");
    this.gameMoves = this.querySelector("[data-game-moves]");
    this.gameStreakElement = this.querySelector("[data-game-streak]");
    this.gameMetrics = [...this.querySelectorAll("[data-game-metric]")];
  }

  bindEvents() {
    this.pipelineTabs.forEach((tab) => {
      tab.addEventListener("click", () => this.selectPipelineStage(tab.dataset.pipelineSelect));

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

    this.addEventListener("click", (event) => {
      if (event.target.closest("[data-game-start]")) {
        this.querySelector("#app-architecture-game")?.scrollIntoView({
          behavior: this.prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
        window.setTimeout(() => {
          this.querySelector("[data-game-piece]")?.focus({ preventScroll: true });
        }, this.prefersReducedMotion ? 0 : 520);
        return;
      }

      const piece = event.target.closest("[data-game-piece]");
      if (piece) {
        this.selectGamePiece(piece.dataset.gamePiece);
        return;
      }

      const zone = event.target.closest("[data-game-zone]");
      if (zone) {
        if (this.selectedGamePieceId) {
          this.placeGamePiece(this.selectedGamePieceId, zone.dataset.gameZone);
        } else {
          this.setGameFeedback("先从左侧待整理区选择一张职责卡片。", "notice");
        }
        return;
      }

      const levelButton = event.target.closest("[data-game-level]");
      if (levelButton && !levelButton.disabled) {
        this.currentGameLevelIndex = Number(levelButton.dataset.gameLevel);
        this.selectedGamePieceId = null;
        this.gameFeedback = "查看任务说明，然后继续整理职责卡片。";
        this.gameFeedbackTone = "notice";
        this.renderGame();
        return;
      }

      if (event.target.closest("[data-game-next]")) {
        this.currentGameLevelIndex = Math.min(
          this.currentGameLevelIndex + 1,
          architectureGameLevels.length - 1,
        );
        this.selectedGamePieceId = null;
        this.gameFeedback = "新关卡已解锁。先判断每张卡片真正拥有的职责。";
        this.gameFeedbackTone = "notice";
        this.renderGame();
        return;
      }

      if (event.target.closest("[data-game-restart]")) {
        this.currentGameLevelIndex = 0;
        this.unlockedGameLevelIndex = 0;
        this.selectedGamePieceId = null;
        this.gameMoveCount = 0;
        this.gameMistakeCount = 0;
        this.gameStreak = 0;
        this.completedGamePieces = new Map(
          architectureGameLevels.map((level) => [level.id, new Set()]),
        );
        this.gamePieceOrderByLevel = createArchitectureGamePieceOrder();
        this.gameFeedback = "游戏已重置。先从单体中识别通用能力。";
        this.gameFeedbackTone = "notice";
        this.renderGame();
        return;
      }

      if (event.target.closest("[data-game-reset-level]")) {
        const level = this.activeGameLevel();
        this.completedGamePieces.set(level.id, new Set());
        this.gamePieceOrderByLevel.set(
          level.id,
          shuffleArchitectureGamePieces(
            level.pieces,
            this.gamePieceOrderByLevel.get(level.id),
          ),
        );
        this.selectedGamePieceId = null;
        this.gameStreak = 0;
        this.gameFeedback = `任务 ${level.sequence} 已重置并重新打乱。判断每项职责的真正归属。`;
        this.gameFeedbackTone = "notice";
        this.emitGameEvent("level-reset", { levelId: level.id });
        this.renderGame();
      }
    });

    this.addEventListener("dragstart", (event) => {
      const piece = event.target.closest("[data-game-piece]");
      if (!piece) {
        return;
      }
      this.selectedGamePieceId = piece.dataset.gamePiece;
      piece.classList.add("is-dragging");
      this.syncGameSelectionState();
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", this.selectedGamePieceId);
    });

    this.addEventListener("dragend", (event) => {
      event.target.closest("[data-game-piece]")?.classList.remove("is-dragging");
      this.querySelectorAll(".architecture-game__zone.is-drag-over")
        .forEach((zone) => zone.classList.remove("is-drag-over"));
    });

    this.addEventListener("dragover", (event) => {
      const zone = event.target.closest("[data-game-zone]");
      if (!zone) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      zone.classList.add("is-drag-over");
    });

    this.addEventListener("dragleave", (event) => {
      const zone = event.target.closest("[data-game-zone]");
      if (zone && !zone.contains(event.relatedTarget)) {
        zone.classList.remove("is-drag-over");
      }
    });

    this.addEventListener("drop", (event) => {
      const zone = event.target.closest("[data-game-zone]");
      if (!zone) {
        return;
      }
      event.preventDefault();
      zone.classList.remove("is-drag-over");
      const pieceId = event.dataTransfer.getData("text/plain") || this.selectedGamePieceId;
      this.placeGamePiece(pieceId, zone.dataset.gameZone);
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

  setupPipelineViewport() {
    requestAnimationFrame(() => this.centerPipelineStage(INITIAL_PIPELINE_STAGE_ID, "auto"));
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
    this.pipelineDetail.animate([
      { opacity: 0.35, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], {
      duration: this.prefersReducedMotion ? 1 : 360,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
    this.centerPipelineStage(stageId, this.prefersReducedMotion ? "auto" : "smooth");
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

  activeGameLevel() {
    return architectureGameLevels[this.currentGameLevelIndex];
  }

  completedPiecesForActiveLevel() {
    return this.completedGamePieces.get(this.activeGameLevel().id);
  }

  isActiveGameLevelComplete() {
    return this.completedPiecesForActiveLevel().size === this.activeGameLevel().pieces.length;
  }

  orderedGamePiecesForActiveLevel() {
    const level = this.activeGameLevel();
    const pieceById = new Map(level.pieces.map((piece) => [piece.id, piece]));
    return this.gamePieceOrderByLevel.get(level.id).map((pieceId) => pieceById.get(pieceId));
  }

  renderGame() {
    const level = this.activeGameLevel();
    const completedPieces = this.completedPiecesForActiveLevel();
    const remainingPieces = this.orderedGamePiecesForActiveLevel()
      .filter((piece) => !completedPieces.has(piece.id));
    const isComplete = this.isActiveGameLevelComplete();
    const isFinalLevel = this.currentGameLevelIndex === architectureGameLevels.length - 1;

    this.gameLevels.innerHTML = renderArchitectureGameLevelTabs(
      this.currentGameLevelIndex,
      this.unlockedGameLevelIndex,
      new Set(
        architectureGameLevels
          .filter((gameLevel) =>
            this.completedGamePieces.get(gameLevel.id).size === gameLevel.pieces.length)
          .map((gameLevel) => gameLevel.id),
      ),
    );
    this.gameMission.innerHTML = `
      <div>
        <span>任务 ${escapeHtml(level.sequence)} / ${String(architectureGameLevels.length).padStart(2, "0")}</span>
        <h3>${escapeHtml(level.title)}</h3>
        <p>${escapeHtml(level.brief)}</p>
      </div>
      <aside>
        <strong>判断原则</strong>
        <p>${escapeHtml(level.principle)}</p>
        <button type="button" data-game-reset-level>重置并打乱</button>
      </aside>
    `;
    this.gameBoard.innerHTML = `
      <section
        class="architecture-game__tray"
        data-piece-order="${remainingPieces.map((piece) => escapeHtml(piece.id)).join(",")}"
        aria-label="待整理职责"
      >
        <header><span>混乱区 · 已随机打乱</span><strong>待整理职责</strong><small>${remainingPieces.length} 张</small></header>
        <div>
          ${remainingPieces.length
            ? remainingPieces.map(renderArchitectureGamePiece).join("")
            : '<p class="architecture-game__empty">本关职责已全部归位。</p>'}
        </div>
      </section>
      <section
        class="architecture-game__zones"
        data-architecture-layout="${escapeHtml(level.layout)}"
        aria-label="目标架构边界"
      >
        <header class="architecture-game__topology-header">
          <span>目标架构</span>
          <strong>${escapeHtml(level.topologyLabel)}</strong>
          <small>点击节点完成职责归位</small>
        </header>
        ${level.zones.map((zone) => {
          const placedPieces = level.pieces.filter(
            (piece) => piece.target === zone.id && completedPieces.has(piece.id),
          );
          const expectedPieceCount = level.pieces.filter(
            (piece) => piece.target === zone.id,
          ).length;
          return `
            <button
              class="architecture-game__zone${placedPieces.length ? " has-pieces" : ""}"
              type="button"
              data-game-zone="${escapeHtml(zone.id)}"
              data-zone-role="${escapeHtml(zone.role)}"
              aria-label="${escapeHtml(zone.label)}：${escapeHtml(zone.detail)}"
            >
              <span class="architecture-game__zone-type">架构节点</span>
              <span class="architecture-game__zone-capacity">${placedPieces.length} / ${expectedPieceCount}</span>
              <strong>${escapeHtml(zone.label)}</strong>
              <small>${escapeHtml(zone.detail)}</small>
              <span class="architecture-game__blueprint" aria-hidden="true">
                ${zone.blueprint.map((part) => `<i>${escapeHtml(part)}</i>`).join("")}
              </span>
              <span class="architecture-game__placed">
                ${placedPieces.map((piece) => `<i><span>✓</span>${escapeHtml(piece.label)}</i>`).join("")}
              </span>
            </button>
          `;
        }).join("")}
      </section>
      ${isComplete
        ? `<footer class="architecture-game__complete">
            <div><span>${isFinalLevel ? "重构完成" : "关卡完成"}</span><strong>${isFinalLevel ? "App 已形成清晰、可治理的边界。" : "这一层边界已经稳定，可以继续下一步。"}</strong></div>
            <button type="button" ${isFinalLevel ? "data-game-restart" : "data-game-next"}>
              ${isFinalLevel ? "重新挑战" : "进入下一关"} <span aria-hidden="true">→</span>
            </button>
          </footer>`
        : ""}
    `;
    this.gameShell.dataset.gameState = isComplete ? "complete" : "playing";
    this.gameShell.dataset.gameLevelId = level.id;
    this.renderGameFeedback();
    this.updateGameMetrics();
  }

  renderGameFeedback() {
    this.gameFeedbackElement.dataset.tone = this.gameFeedbackTone ?? "notice";
    this.gameFeedbackElement.textContent = this.gameFeedback;
  }

  selectGamePiece(pieceId) {
    const level = this.activeGameLevel();
    const piece = level.pieces.find((candidate) => candidate.id === pieceId);
    if (!piece || this.completedPiecesForActiveLevel().has(pieceId)) {
      return;
    }
    this.selectedGamePieceId = this.selectedGamePieceId === pieceId ? null : pieceId;
    this.querySelectorAll("[data-game-piece]").forEach((pieceElement) => {
      const isSelected = pieceElement.dataset.gamePiece === this.selectedGamePieceId;
      pieceElement.classList.toggle("is-selected", isSelected);
      pieceElement.setAttribute("aria-pressed", String(isSelected));
    });
    this.syncGameSelectionState();
    this.setGameFeedback(
      this.selectedGamePieceId
        ? `已选择“${piece.label}”。现在点击它所属的目标边界。`
        : "已取消选择。",
      "notice",
    );
  }

  placeGamePiece(pieceId, zoneId) {
    if (this.isPlacingGamePiece) {
      return;
    }
    const level = this.activeGameLevel();
    const piece = level.pieces.find((candidate) => candidate.id === pieceId);
    const zone = level.zones.find((candidate) => candidate.id === zoneId);
    if (!piece || !zone || this.completedPiecesForActiveLevel().has(pieceId)) {
      return;
    }

    if (piece.target !== zoneId) {
      const correctZone = level.zones.find((candidate) => candidate.id === piece.target);
      this.gameMoveCount += 1;
      this.gameMistakeCount += 1;
      this.gameStreak = 0;
      this.setGameFeedback(
        `“${piece.label}”不属于“${zone.label}”。${piece.reason}它应归入“${correctZone.label}”。`,
        "error",
      );
      this.updateGameMetrics();
      this.animateRejectedPlacement(pieceId, zoneId);
      this.emitGameEvent("piece-rejected", {
        levelId: level.id,
        pieceId,
        attemptedZoneId: zoneId,
        correctZoneId: piece.target,
      });
      return;
    }

    this.gameMoveCount += 1;
    this.gameStreak += 1;
    this.isPlacingGamePiece = true;
    this.querySelector(`[data-game-piece="${pieceId}"]`)?.classList.add("is-accepted");
    this.querySelector(`[data-game-zone="${zoneId}"]`)?.classList.add("is-accepting");

    window.setTimeout(() => {
      if (!this.isConnected) {
        return;
      }
      this.completedPiecesForActiveLevel().add(pieceId);
      this.selectedGamePieceId = null;
      this.isPlacingGamePiece = false;
      const isComplete = this.isActiveGameLevelComplete();
      if (isComplete) {
        this.unlockedGameLevelIndex = Math.max(
          this.unlockedGameLevelIndex,
          Math.min(this.currentGameLevelIndex + 1, architectureGameLevels.length - 1),
        );
      }
      this.gameFeedback = isComplete
        ? `“${piece.label}”已归位。本关完成。`
        : `“${piece.label}”已归入“${zone.label}”。${piece.reason}`;
      this.gameFeedbackTone = "success";
      this.emitGameEvent("piece-placed", {
        levelId: level.id,
        pieceId,
        zoneId,
        levelComplete: isComplete,
      });
      this.renderGame();
    }, this.prefersReducedMotion ? 0 : 180);
  }

  setGameFeedback(message, tone) {
    this.gameFeedback = message;
    this.gameFeedbackTone = tone;
    this.renderGameFeedback();
  }

  syncGameSelectionState() {
    const hasSelection = Boolean(this.selectedGamePieceId);
    this.gameShell.classList.toggle("has-selection", hasSelection);
    this.querySelectorAll("[data-game-zone]").forEach((zone) => {
      zone.classList.toggle("is-awaiting-piece", hasSelection);
    });
  }

  animateRejectedPlacement(pieceId, zoneId) {
    const piece = this.querySelector(`[data-game-piece="${pieceId}"]`);
    const zone = this.querySelector(`[data-game-zone="${zoneId}"]`);
    [piece, zone].forEach((element) => {
      if (!element) {
        return;
      }
      element.classList.remove("is-rejected");
      void element.offsetWidth;
      element.classList.add("is-rejected");
    });
  }

  emitGameEvent(name, detail) {
    this.dispatchEvent(new CustomEvent("architecture-game:event", {
      bubbles: true,
      detail: {
        name,
        moves: this.gameMoveCount,
        mistakes: this.gameMistakeCount,
        streak: this.gameStreak,
        ...detail,
      },
    }));
  }

  updateGameMetrics() {
    const completedCount = [...this.completedGamePieces.values()]
      .reduce((total, completedPieces) => total + completedPieces.size, 0);
    const progress = completedCount / totalArchitectureGamePieces;
    const metrics = {
      coupling: Math.round(88 - progress * 68),
      clarity: Math.round(18 + progress * 78),
      isolation: Math.round(12 + progress * 84),
    };
    this.gameProgress.textContent = `${Math.round(progress * 100)}%`;
    this.gameMoves.textContent = String(this.gameMoveCount);
    this.gameStreakElement.textContent = `×${this.gameStreak}`;
    this.gameShell.dataset.gameProgress = String(Math.round(progress * 100));
    this.gameShell.dataset.gameMoveCount = String(this.gameMoveCount);
    this.gameShell.dataset.gameMistakeCount = String(this.gameMistakeCount);
    this.gameMetrics.forEach((metric) => {
      const metricName = metric.dataset.gameMetric;
      metric.style.setProperty("--metric-value", `${metrics[metricName]}%`);
      metric.setAttribute("aria-label", `${metric.previousElementSibling.textContent} ${metrics[metricName]}%`);
    });
  }
}

customElements.define("app-architecture-explainer", AppArchitectureExplainer);
