# Tim 个人作品站第二轮体验优化设计

日期：2026-07-20

## 背景

公网审阅确认当前网站已建立清晰的 Tim 个人身份与 Roost、Babel、Bakery 三项目视觉，但仍有四个可验证的问题：

- 320–390px 宽度下唯一联系方式 GitHub 被隐藏。
- 手机首页高度接近 4,900px，首屏项目预览与完整项目卡重复。
- `2026` 同时出现在作品标签和版权中，前者含义不清，后者会过期。
- 首页缺少 canonical URL 与 `Person` 结构化数据。

About 经历与项目状态需要用户提供真实信息，不属于本轮实施范围。

## 方案选择

采用响应式裁剪方案：桌面保留首屏三项目预览，手机隐藏这组预览并直接进入完整项目卡。手机顶部导航保留 `Work / About / GitHub`，Research 仍可从首页 Research 区与 About 页面访问。

未采用的方案：

1. 所有尺寸继续显示两组项目内容：改动最少，但无法解决手机页面过长和重复。
2. 所有尺寸都删除首屏项目预览：结构最简，但会削弱桌面首屏右侧已建立的三项目视觉。

## 页面与组件调整

### 导航

- 保持桌面导航 `Work / Research / About / GitHub`。
- 在 `max-width: 680px` 下隐藏 Research，显示 GitHub。
- 为 Research 和 GitHub 添加独立类名，不再依赖 `.nav-external` 同时承担视觉和响应式语义。
- 320px 宽度不得出现横向滚动或导航重叠。

### 首屏与项目区

- 桌面首屏右侧继续渲染三条项目预览。
- `max-width: 680px` 下隐藏 `.hero-work`，避免在完整项目卡之前重复三项内容。
- 首屏项目头部的 `2026` 替换为 `3 projects`，避免暗示项目年份。
- 手机端 section 纵向 padding 从 76px 收紧到 56px。
- 手机端三条 working principles 降低内部留白，保留内容但减少滚动长度。

### 页脚年份

- `app.js` 使用 `new Date().getFullYear()` 生成版权年份。
- 页面不得继续包含硬编码的 `© 2026 Tim`。

### SEO

- 首页添加 `https://reversescale.github.io/` canonical URL。
- 首页添加 `Person` JSON-LD，包含 Tim、职业描述、站点 URL 与 GitHub `sameAs`。
- 本轮不创建 `og:image`，因为它需要单独的分享图视觉设计与素材验收。

## 测试与验收

自动化测试必须覆盖：

- GitHub 与 Research 拥有可独立控制的导航类名。
- 手机媒体查询显示 GitHub、隐藏 Research 与 `.hero-work`。
- 项目标记为 `3 projects`，版权年份通过 JavaScript 动态生成。
- 首页包含 canonical 与 `Person` JSON-LD。
- 既有 19 个站点测试继续通过。

浏览器验收尺寸：

- 1440×900：首页完整导航和首屏项目预览可见。
- 390×844：顶部 GitHub 可见、Research 与首屏项目预览隐藏。
- 320×700：无横向溢出，导航不重叠。

## 非目标

- 不编写未经确认的个人经历、所在地、工作年限或技术栈。
- 不猜测 Roost、Babel、Bakery 的发布状态。
- 不修改三个项目站点。
- 不恢复主站文章列表。
