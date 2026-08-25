# AI Designer 项目介绍页设计

## 目标

将 `ai-designer` 作为 ReverseScale 首页中的一等项目，并提供独立介绍页，准确说明其真实定位：以 Penpot 用户快照为发布边界，将可确定转换的 Foundations、机器可读组件契约、Flutter 生产组件、Widgetbook 和 Golden Review 连接成可审查的设计系统工作流。

## 为什么采用独立介绍页

AI Designer 的价值不只是一个项目卡片名称，而是多个边界共同形成的端到端系统。首页卡片负责建立项目身份和入口；独立页面负责解释以下容易被误解的差异：

- Foundations 可以确定性同步，但生产组件不能从 Penpot 图层树直接生成。
- Token、Icon、Asset 三个 package 独立发布，组件通过稳定公共 API 组合使用。
- Component contract 描述 variants、states、slots、a11y 和 evidence，是设计意图与 Flutter API 之间的长期契约。
- Widgetbook、行为测试和 Golden Review 分别验证交互、语义和视觉结果，不能互相替代。

## 页面结构

1. Hero：用简化系统图展示 `Penpot snapshot → Foundations → Contract → Flutter → Review`。
2. Workflow：五阶段可交互流程，点击阶段更新对应边界说明。
3. Architecture：三条 Foundations lane 汇聚到 Component contract，再进入生产组件与两类审查面。
4. Component Lab：切换 Default、Loading、Disabled、Approved，组件预览、语义和说明同步变化。
5. Evidence：区分契约、自动化和人工视觉审查，并展示可追踪 manifest 的职责。

## 实现边界

- 继续使用现有无构建静态站和 Web Component 架构。
- `src/ai-designer-model.mjs` 保存可测试的流程与状态模型；`src/ai-designer.js` 只负责渲染和交互挂载；`src/ai-designer.css` 负责独立视觉与响应式。
- 首页继续以 `src/site-data.js` 为项目数据单一来源，通过现有 `projectLinks` 渲染两种卡片。
- 页面不读取 `ai-designer` 仓库、不发起运行时请求，也不公开内部路径、凭据、私有域名或一次执行产生的标识。

## 页面自身的设计系统约束

介绍页不能只“谈论设计系统”，自身也必须按设计系统方式实现：

- `src/ai-designer-tokens.css` 集中定义 primitive、semantic、alpha、spacing、radius、typography、elevation 和 motion token；表现层 CSS 不出现散落的原始颜色值。
- `src/ai-designer-components.mjs` 提供可复用、可测试的纯渲染组件，包括 Section Heading、Workflow Stage、Foundation Lane、Capability Card、Preview Control 和 Review Artifact。
- `src/ai-designer.js` 只负责页面组合和交互状态挂载，不重复转义、卡片或控制器模板。
- 页面字体使用项目中已审计的 Work Sans Variable 本地资产，并保留 OFL 原文。

## 真实素材与能力叙事

高质量素材优先使用项目自产、可以追溯到固定渲染器的 Flutter Golden 基线，不用通用图库冒充产品能力。页面展示 `DesignButton`、`DesignTextField`、`DesignStatusBadge` 和 `DesignEmptyState` 的真实 Use Case，并明确它们是静态审查制品，不把图片描述成可交互 Widgetbook。

能力介绍必须覆盖完整运行闭环：

1. Cookbook / Widgetbook 运行真实组件，提供 Interactive、State Matrix、knobs、Light/Dark、文字缩放、响应式视口、可访问性与 Inspector。
2. 设计师发布 `createdBy=user` 快照，受保护同步任务以该不可变版本作为导入边界，并校验 identity、hash、引用与许可。
3. Token、Icon、Asset 分别生成类型化 Flutter package；组件模块只消费公共 API，组合验收层记录四包 BOM。
4. Widgetbook Catalog 自动发现的 Component Use Case 进入固定 Golden 矩阵和 Visual Review，产出 Expected、Actual、Diff 与显式批准证据。

“设计平台发布后自动导入”必须准确表达为发布事件进入受保护 sync lane；普通生产 App 构建只消费已提交、已锁定版本的 package，绝不实时读取设计师工作区。

不提供虚构的在线产品入口、性能指标或“自动生成生产 Widget”承诺。

## 验证标准

- 首页数据、项目数量、无 JavaScript 导航和独立页面入口一致。
- 模型测试确认五阶段顺序与组件状态循环。
- 页面包含 canonical、语义导航、按钮状态、`aria-live` 更新、移动端布局和 reduced-motion 降级。
- Python smoke suite、JavaScript 语法检查、页面 HTTP 检查及敏感信息扫描通过。
