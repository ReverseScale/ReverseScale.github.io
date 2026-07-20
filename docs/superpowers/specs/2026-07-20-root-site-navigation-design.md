# ReverseScale 根入口与产品导航设计

## 背景

当前 `https://tims.tail5d10b9.ts.net/` 由 Tailscale Funnel 转发到 Roost，并由 Roost 将根路径跳转到 `/roost/`。ReverseScale 首页的项目卡片又直接指向三个产品运行时，导致官网介绍页被绕过。

用户期望形成清晰的两级导航：先从统一入口进入 ReverseScale 官网，再从官网进入具体产品官网，最后由产品官网的登录或控制台按钮进入对应运行时。

## 目标

- `https://tims.tail5d10b9.ts.net/` 跳转到 `https://reversescale.github.io/`。
- ReverseScale 首页的 Roost、Babel、Bakery 项目入口分别进入 `/roost-site/`、`/babel-site/`、`/bakery-site/`。
- 三个产品官网中的登录、控制台或启动按钮继续进入：
  - `https://tims.tail5d10b9.ts.net/roost/`
  - `https://tims.tail5d10b9.ts.net/babel/`
  - `https://tims.tail5d10b9.ts.net/bakery/`
- 保持 Babel API、三个产品子路径以及 Babel 旧兼容端口不变。

## 非目标

- 不在 Tailscale 域名下反向代理或复制 GitHub Pages 内容。
- 不改变三个产品的认证、数据库、API 或业务逻辑。
- 不移除 Babel 的 `:8443` Web 和 `:10000` API 兼容入口。
- 不修改 GitHub Pages 的 canonical origin。

## 方案选择

### 采用：独立根跳转服务

在本机 loopback 地址运行一个职责单一的轻量 HTTP 服务，只对 `/` 返回到 `https://reversescale.github.io/` 的外部重定向。Tailscale Funnel 的根处理器指向该服务，`/roost`、`/babel`、`/bakery` 和 `/babel/api` 的现有处理器保持不变。

该方案让浏览器地址栏切换到 GitHub Pages 的规范地址，避免代理静态资源时产生 base path、CSP、缓存和 canonical 重复问题。跳转服务与 Roost 解耦，因此 Roost 重启或路由调整不会重新改变统一入口的含义。

### 未采用：反向代理 GitHub Pages

该方案可以让地址栏保持 Tailscale 域名，但需要持续处理根相对资源、缓存头、CSP 和规范链接，故不采用。

### 未采用：本地复制官网

该方案会形成 GitHub Pages 与本地副本两套发布源，存在内容漂移和额外部署维护成本，故不采用。

## 导航与数据模型

ReverseScale 首页继续保留每个项目的两类 URL：

- `siteHref`：产品介绍页，供首页项目卡片和无 JavaScript 导航使用。
- `href`：产品运行时地址，保留为数据能力，但首页不直接使用。

`heroProjectCard` 和 `projectCard` 应使用 `siteHref`。静态 `index.html` 中的无 JavaScript 导航也应改为三个产品介绍页，确保 JavaScript 不可用时导航语义一致。

产品官网中的登录或控制台 URL 不回退到介绍页，继续直接使用各自的 Tailscale 运行时路径。

## 运行与持久化

根跳转服务只监听 `127.0.0.1`，不直接暴露局域网端口；TLS 和外部访问继续由 Tailscale Funnel 提供。服务需要使用现有本机服务管理方式持久运行，并具备最小化日志，至少可观察启动失败和请求状态。

Tailscale 配置仅替换 `/` 的目标，其他路径和旧端口配置必须在变更前后进行快照对比。回滚时将根处理器重新指向 Roost 的 `http://127.0.0.1:8080`，不会影响产品数据。

## 测试与验证

- 先更新 smoke test，使其断言首页项目卡片和静态导航使用三个 `siteHref`，并断言运行时 URL 数据仍保留。
- 运行 ReverseScale 完整测试和 `git diff --check`。
- 验证 GitHub Pages 根页及三个产品介绍页均返回 HTTP 200。
- 验证 Tailscale 根地址返回外部重定向，最终 URL 为 `https://reversescale.github.io/`。
- 验证 `/roost/`、`/babel/`、`/bakery/` 和 `/babel/api/healthz` 不经过根跳转且保持可访问。
- 验证三个产品官网的登录或控制台入口仍分别指向对应运行时。

## 可观测性

本次变更不引入新的业务事件或实验，因此不新增分析埋点、监控看板或 A/B 实验。运行层通过跳转服务日志、Tailscale Funnel 状态和 HTTP 健康矩阵观察；网站层由现有 smoke test 防止导航回归。

## 与既有设计的关系

本设计只覆盖统一根入口和官网导航，并取代 `2026-07-20-unified-product-paths-design.md` 中“根入口跳转到 `/roost/`”的决定。既有的三个产品子路径、Babel API 同源路径和旧端口兼容策略继续有效。
