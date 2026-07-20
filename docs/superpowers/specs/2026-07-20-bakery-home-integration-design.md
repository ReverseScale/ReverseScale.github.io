# Bakery 首页项目接入设计

## 背景

ReverseScale 首页当前把 Roost 和 Babel 展示为核心项目。Bakery 已有独立产品官网，并已发布到 `https://reversescale.github.io/bakery-site/`，但首页尚未提供入口，也没有在整体产品叙事中说明 Bakery 的职责。

本次变更将 Bakery 作为与 Roost、Babel 同级的一等项目接入 ReverseScale 首页，不改动 Bakery 产品官网本身。

## 目标

- 在首页导航、首屏、项目卡片和产品能力说明中明确展示 Bakery。
- 将 Bakery 链接统一指向站内 GitHub Pages 路径 `/bakery-site/`。
- 保持当前首页的轻量静态架构、视觉语言和响应式行为。
- 通过自动化测试防止项目入口或核心叙事在后续修改中丢失。

## 非目标

- 不修改 `/Users/tim/Workspace/bakery/site` 的内容、构建或部署流程。
- 不引入跨仓库项目数据同步、构建时远程请求或新的前端框架。
- 不重新设计 ReverseScale 首页，也不重构与本次接入无关的旧页面。

## 方案选择

采用“聚焦的一等项目接入”：沿用现有 `projectLinks` 数据模型和静态 Web Component 渲染方式，在所有核心产品触点中加入 Bakery。

没有选择仅新增卡片，因为那会造成导航、首屏和产品叙事与项目列表不一致。也不建立跨仓库元数据自动同步，因为三个项目的低频品牌信息暂不值得增加构建依赖和故障面。

## 信息架构与内容

### 导航与首屏

- 顶部导航在 Roost、Babel 之后加入 Bakery。
- 首屏说明改为覆盖三项能力：Roost 负责 Flutter 补丁交付，Babel 负责本地化工作流，Bakery 负责移动应用构建、产物管理与分发。
- 首屏操作区加入 `Explore Bakery`，链接到 `/bakery-site/`。
- 项目地图增加 Bakery 所代表的 Build/Artifacts 能力，同时保留“自托管、可审查、可操作”的整体定位。

### 项目卡片

在 `projectLinks` 中新增 Bakery 项目：

- 名称：`Bakery`
- 标签：`Mobile build and delivery`
- 状态：`Build & distribution`
- 链接：`/bakery-site/`
- 核心能力：CI integration、Pipeline visibility、Artifact distribution
- 视觉强调：新增暖色 tone，与 Roost 的绿色和 Babel 的蓝色区分

桌面端项目区由两列调整为三列；在现有移动断点下继续折叠为单列。卡片沿用相同结构、交互和无障碍语义。

### 全站叙事

- 更新首页 meta description 和 Open Graph description，使其包含移动构建与分发能力。
- 更新无 JavaScript 的项目导航，确保 Bakery 在脚本不可用时仍可访问。
- 更新 proof points、operating principles 和 current focus 中与移动交付、产物和流水线相关的文案，让三项产品共同支撑首页定位。
- 保留 Research 外链和现有页脚结构。

## 组件与数据流

`src/site-data.js` 继续作为项目和首页内容的唯一数据来源，`src/app.js` 读取静态数据并生成页面。Bakery 不增加新的组件类型，也不发起运行时网络请求。

数据流保持为：

1. `src/site-data.js` 声明 Bakery 项目数据和更新后的站点文案。
2. `src/app.js` 通过现有 `projectCard` 渲染器生成第三张项目卡片，并在静态首屏与导航模板中加入入口。
3. `src/styles.css` 为三列布局和 Bakery 暖色 tone 提供样式。
4. `index.html` 提供更新后的 SEO 元数据与无 JavaScript 兜底入口。

## 错误处理与兼容性

Bakery 使用站内绝对路径 `/bakery-site/`，与现有 Roost、Babel 链接约定一致。该页面当前返回 HTTP 200。首页不依赖 Bakery 服务的运行时响应，因此 Bakery 暂时不可用也不会影响首页渲染。

保持现有响应式断点和浏览器原生 Web Component/ES Module 实现，不新增兼容性依赖。

## 测试与验证

扩展 `tests/test_site_smoke.py`，至少覆盖：

- `index.html` 的无 JavaScript 导航包含 `/bakery-site/`。
- `src/app.js` 的顶部导航和首屏操作包含 Bakery。
- `src/site-data.js` 包含 Bakery 项目、正确路径与核心能力文案。
- 首页 SEO 描述覆盖 Bakery 的移动构建与分发定位。
- 现有 Roost、Babel、Research 和 404 页面断言继续通过。

实施完成后运行完整 smoke test、`git diff --check`，并通过 HTTP 请求确认 `/bakery-site/` 仍返回成功状态。该变更仅增加静态入口，不引入新的用户行为或业务状态，因此不新增埋点、监控看板或 A/B 实验。

## 完成标准

- Bakery 在桌面和移动首页上都与 Roost、Babel 同级可见。
- 所有 Bakery 入口统一跳转到 `/bakery-site/`。
- 首页的 SEO、首屏、项目地图和产品说明不再遗漏 Bakery。
- 自动化测试和静态检查全部通过，线上 Bakery 目标可访问。
