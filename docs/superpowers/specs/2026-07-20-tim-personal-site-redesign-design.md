# Tim 个人作品站改造设计

## 背景

ReverseScale 首页目前以“自托管移动产品基础设施”作为品牌主体，整体观感接近产品工作室官网。用户希望主站更准确地表达其真实身份：这是 Tim 的个人网站，用于展示个人作品，并把写作入口统一指向 Notion。

现有首屏右侧不是图片，而是 HTML/CSS 流程组件。加入第四个节点后，多个节点被压缩在固定宽度中，造成狭长、变形和内容单调的问题。

## 目标

- 将首页主身份由 ReverseScale 调整为 Tim，弱化 ReverseScale 的品牌权重。
- 把网站定位为个人主页与作品索引，而不是公司官网或虚构团队站点。
- 重新设计首屏右侧视觉，以三项作品的独立微缩视觉替代变形流程图。
- 增加首页 About 摘要和独立 `/about/` 页面。
- 提供 GitHub 与 Notion Research 入口，不在主站复制或聚合文章。
- 保持现有静态站架构、快速加载、响应式布局和 GitHub Pages 直接部署方式。

## 非目标

- 不展示头像、邮箱、客户数量、用户量或未经确认的履历信息。
- 不把 ReverseScale 描述为公司、团队或产品工作室。
- 不从 Notion 拉取文章，也不恢复旧 `content.json` 文章列表。
- 不修改 Roost、Babel、Bakery 的独立站点。
- 不展示三个项目的 `Source` 链接：`ReverseScale/roost`、`ReverseScale/label`、`ReverseScale/bakery` 当前公开访问均返回 404。
- 不引入前端框架、构建步骤、远程数据请求或图片生成资产。

## 方案选择

### 首屏布局

采用“编辑式作品堆叠”，而不是产品窗口拼贴或纯文字首屏。该方案保留个人 Blog 的编辑感，同时用真实项目信息建立视觉记忆，不会再次制造虚假的产品仪表盘。

右侧卡片采用“独立微缩视觉”方案：三张横向项目卡拥有不同的代码原生视觉、项目状态、简短说明和站点入口。没有选择仅使用能力标签的同构卡片，因为视觉仍然单调；没有选择纯作品档案卡，因为首屏张力不足。

### 身份与内容

页面以 `Tim` 为主身份，专业描述为：

> Independent software developer focused on mobile engineering, delivery workflows, and developer tools.

ReverseScale 只保留在域名、GitHub 组织和既有项目归属中，不作为首页主标题或方形字标内容。

## 首页信息架构

### 顶部导航

- 左侧字标：黑色方形 `T` + `Tim`
- 辅助说明：`independent software developer`
- 导航：`Work`、`Research`、`About`、`GitHub`
- `Work` 链接首页作品区锚点。
- `Research` 指向现有 Notion Research 页面，新窗口打开。
- `About` 指向 `/about/`。
- `GitHub` 指向 `https://github.com/ReverseScale`，新窗口打开。

### 首屏

主标题：

> I build tools for mobile teams.

说明文字覆盖移动工程、交付流程和开发者工具，不再把三个项目逐句塞入首屏段落。操作按钮为：

- `View selected work`：跳转首页 `#work`
- `About Tim`：跳转 `/about/`

首屏继续采用左右布局，但缩小主标题最大字号并改善两列比例，避免左侧文本压迫右侧内容。

### 作品微缩视觉

右侧显示三张横向项目卡：

- Roost：离线包、补丁产物和发布状态视觉，使用绿色。
- Babel：字符串行、语言差异和 review 状态视觉，使用蓝色。
- Bakery：Pipeline 阶段与构建进度视觉，使用暖棕色。

每张卡包含项目类别、名称、一句说明、`Active` 状态与 `View site`。所有视觉都由 HTML/CSS 绘制，使用正常横向比例和明确的最小宽度，不依赖会被挤压的串联节点。

移动端将卡片放在首屏文字之后，以单列正常流布局展示；卡片不使用绝对定位重叠，避免窄屏裁切和变形。

### Selected Work

现有三个项目卡片保留为首页主要作品区，但标题改为 `Selected work`，内容更符合个人作品集语气。每张卡提供：

- 项目名称与所属领域
- 一段面向访客的项目说明
- 三项核心能力
- `View project` 入口

项目卡不展示虚构指标，也不展示不可公开访问的源码入口。

### About 摘要

首页增加简短 About 区域，使用纯文字和 `Tim` 字标，不使用头像。内容说明 Tim 是一名专注移动工程、交付流程与开发者工具的独立软件开发者，并解释这些项目来自真实工程问题。

该区域提供：

- `More about Tim` → `/about/`
- `GitHub` → GitHub 组织页面

### Writing / Research

主站不显示文章列表。首页使用一个简洁的 Writing/Research 入口说明笔记与研究内容保存在 Notion，并链接到现有 Research 页面。

### 页脚

页脚显示 `Tim`、`Independent software developer`，以及 `About`、`Research`、`GitHub` 三个链接。移除当前以 ReverseScale 为主品牌的页脚文案。

## About 页面

`/about/` 不再重复首页，而是由同一个 Web Component 渲染独立内容。页面包含：

- `About Tim` 标题与专业身份
- 一段不虚构履历的个人介绍
- 关注领域：Mobile engineering、Delivery workflows、Developer tools、Practical self-hosting
- 工作方式：清晰状态、可审查变更、源码与交付上下文相连
- Selected work 简短索引
- Research 与 GitHub 外部入口

首页 About 摘要与详细页共用 `src/site-data.js` 中的个人资料数据，避免两处文案漂移。

## 内容与组件边界

### `src/site-data.js`

继续作为内容单一来源，新增或调整：

- `profile`：Tim 的名称、角色、简介、GitHub 与 Research 链接
- `projectLinks`：增加项目视觉类型 `package`、`strings`、`pipeline`
- `workingPrinciples`：供 About 页面与首页摘要使用
- 移除或替换产品公司语气的 `proofPoints`、`operatingPrinciples`、`currentFocus`

### `src/app.js`

- `page="home"` 渲染个人首页。
- `page="about"` 渲染独立 About 页面。
- `page="404"` 保留相同个人导航和页脚，显示简洁错误内容。
- 项目数据继续通过转义函数进入模板。
- 新增的微缩视觉由明确的 `visual` 枚举选择固定模板，不执行任意 HTML 数据。

### HTML 入口

- `index.html` 使用默认 `home` 页面。
- `about/index.html` 显式设置 `<rs-home page="about">`。
- `404.html` 继续使用 `<rs-home page="404">`。
- 更新首页与 About 页的 title、description 和 Open Graph 文案，使其以 Tim 的个人身份为中心。

### `src/styles.css`

- 保留现有颜色变量与轻量编辑风格。
- 移除旧流程图专用布局。
- 增加三种项目微缩视觉、个人 About、Research 入口和独立 About 页布局。
- 桌面和移动端使用正常文档流与 CSS Grid；不依赖固定坐标完成主要布局。

## 错误处理与外部链接

- Notion 和 GitHub 外链使用 `target="_blank" rel="noreferrer"`。
- 项目站点暂时不可用时不会影响主站渲染，因为主站不执行运行时请求。
- 不公开返回 404 的项目源码链接。
- 404 页面保留返回首页与查看作品的明确入口。

## 可访问性与响应式要求

- 导航、作品区、About 和 Research 区域使用可识别的 heading 与 `aria-labelledby`。
- 微缩视觉使用 `aria-hidden="true"`，项目卡片的文本承担信息表达。
- 所有交互链接保留清晰的 focus-visible 状态。
- 桌面端首屏两列平衡；`max-width: 860px` 后折叠为单列。
- 移动端导航允许换行，标题不溢出，三个微缩卡片保持横向内部结构并缩减装饰尺寸。

## 测试与验证

扩展现有 Python smoke tests，覆盖：

- 首页以 `Tim` 为主身份，包含新标题与专业描述。
- 导航包含 `Work`、Notion Research、`/about/` 与 GitHub。
- 首页不恢复文章列表或 `content.json`。
- 三个项目仍链接各自站点，并声明 `package`、`strings`、`pipeline` 视觉类型。
- 页面不包含三个不可公开访问的项目源码链接。
- `/about/` 使用 `page="about"` 并渲染独立 About 内容。
- 404 页面继续使用个人站 shell。
- CSS 包含三种微缩视觉和响应式单列规则，不再包含旧 `.flow` 串联节点布局。

实施完成后运行完整 Python 测试、JavaScript 语法检查、`git diff --check`，并在桌面与移动视口中检查首页和 About 页面。外部 GitHub、Notion 与三个项目站点使用 HTTP 请求验证可访问性。

该站点不包含登录、表单或业务状态；本次不新增分析埋点、监控看板或 A/B 实验。

## 完成标准

- 新访客能在首屏识别 Tim 是独立软件开发者，并理解作品领域。
- ReverseScale 不再像公司或团队品牌占据首页主叙事。
- 首屏右侧三项作品视觉清晰、互相区分，桌面和移动端均无压缩变形。
- 首页提供作品、About、Notion Research 和 GitHub 的明确路径。
- `/about/` 是独立个人介绍页，不再重复首页。
- 主站不展示文章列表、不虚构证据、不暴露无效源码链接。
- 自动化测试、语法检查、静态检查和视觉检查全部通过。
