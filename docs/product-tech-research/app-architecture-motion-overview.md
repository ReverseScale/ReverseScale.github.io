# App 架构交互解说动效参考

## 调研背景与范围

本轮只调研与 App 架构解说直接相关的视觉叙事和前端实现，不扩展到竞品定价、用户评价或合规分析。目标不是复制某个平台，而是提取适合无构建静态站的交互模式。

## 参考案例

| 案例 | 体验观察 | 对当前页面的启示 |
| --- | --- | --- |
| [Linear](https://linear.app/) | 大字号、暗色舞台、低对比网格与局部高亮共同建立层次，动效服务于焦点而不是让全屏同时移动。 | 架构画布使用深色舞台和局部光晕；说明文字保持克制。 |
| [Stripe](https://stripe.com/zh-sg) | 高饱和渐变负责营造空间，产品界面以多层悬浮卡片进入画面。 | 用渐变光晕区分阶段，但节点仍保持清晰的工程图语义。 |
| [Vercel](https://vercel.com/) | 极简黑白结构配合中心光源，让单一视觉对象成为叙事核心。 | 架构图固定为主视觉，章节文字围绕它推进，不把页面做成普通文档列表。 |
| [Cloudflare Reference Architecture](https://developers.cloudflare.com/reference-architecture/how-to-use/) | 架构图是主要内容，并由 supporting content 解释组件、集成点和使用场景。 | 每个阶段必须同时讲清节点、依赖方向和设计取舍。 |
| [React Flow animated edges](https://reactflow.dev/examples/edges/animating-edges) | 官方示例使用 SVG `animateMotion` 让元素沿依赖路径持续运动，路径变化后动画仍可重新建立。 | 使用原生 SVG 粒子表现依赖流动，不为一个页面引入完整图编辑依赖。 |
| [Apple Reduce Motion](https://support.apple.com/en-euro/guide/iphone/iph0b691d3ed/ios) | 用户可以关闭或减弱界面运动。 | `prefers-reduced-motion` 下停止粒子和节点位移，信息仍完整可读。 |

## 结论

<!-- HWPR -->
当前“定时切换整张架构图”的方案只能算幻灯片。新版采用以下组合：

1. Delivery Pipeline 使用横向时间线；节点被选中后进入同一工作台，不让八个详情面板同时争抢注意力。
2. 工作台以 `输入 → 关键动作 → 输出` 表达主链，并把 Gate、失败策略和可观测信号放进安全底座。
3. `App Runtime` 在工作台内继续展开 App Architecture；五阶段使用显式步骤导航，复用固定节点槽位，让节点在同一画布中移动、拆分和重组。
4. 依赖线重绘后，以 SVG 粒子展示组件依赖、模块注册或 Router 通信方向。
5. 暗色舞台只用于架构解说页，首页继续保持个人作品站的浅色视觉。
6. 移动端保留横向时间线与可滑动阶段导航，工作台改为单列，不把桌面二维关系压成小字。

## 技术取舍

- 不引入 React Flow、GSAP 或滚动动画依赖；当前规模使用 `IntersectionObserver`、`ResizeObserver`、CSS transition、Web Animations API 和 SVG `animateMotion` 足够。
- 阶段数据仍是单一事实源，视觉效果不能把错误依赖包装成“炫酷”。
- 组件限定为无业务逻辑的通用能力；业务模块由组件、业务 UI 和业务逻辑组成；最终由 App 壳注册模块，并通过 Router 完成模块间通信。
- 大型 App 的复杂度不继续堆进业务模块，而是分为模块交付、运行时控制、交付治理、数据与可观测四个横切平面。跨平台技术栈以模块产物接入，动态能力统一接受版本、灰度、回滚和审计约束。
- 动画属于解释机制：节点位移表示职责拆分，粒子表示注册、路由通信或组件依赖，颜色表示架构角色。
