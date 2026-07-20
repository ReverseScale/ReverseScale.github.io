# ReverseScale 统一产品路径入口设计

## 背景

ReverseScale 当前在同一台 macOS 主机上运行三个产品：

- Roost：本地 `http://127.0.0.1:8080`，公网 Funnel 根入口为 `https://tims.tail5d10b9.ts.net/`。
- Babel Web：本地 `http://127.0.0.1:3000`，公网 Funnel 入口为 `https://tims.tail5d10b9.ts.net:8443/`。
- Babel API：本地 `http://127.0.0.1:4000`，公网 Funnel 入口为 `https://tims.tail5d10b9.ts.net:10000/`。
- Bakery：本地 `http://127.0.0.1:60006`，尚无公网入口。

Tailscale Funnel 只允许 `443`、`8443` 和 `10000` 三个公网端口，现有端口已被占用。继续以端口区分产品无法为 Bakery 增加独立入口，也会让官网和用户记忆多个地址。

本次改造将三个产品统一到 `https://tims.tail5d10b9.ts.net`，通过稳定子路径访问，并同步更新 ReverseScale 及各产品官网中的运行入口。

## 目标

- 建立三个规范公网运行地址：
  - `https://tims.tail5d10b9.ts.net/roost/`
  - `https://tims.tail5d10b9.ts.net/babel/`
  - `https://tims.tail5d10b9.ts.net/bakery/`
- 让每个产品原生支持自己的 base path，而不是依赖代理层改写 HTML、Location 或响应正文。
- 让 Babel Web 通过同源 `/babel/api/` 访问 API，避免新入口继续暴露独立 API 端口依赖。
- 保持原 Babel `:8443` Web 和 `:10000` API 入口可用，作为兼容地址和回滚通道。
- 将 `https://tims.tail5d10b9.ts.net/` 重定向到 `/roost/`，保持原根入口进入 Roost 的使用习惯。
- 更新 `ReverseScale.github.io` 与三个产品官网的导航、产品卡片和 CTA，使运行入口指向规范地址。
- 在任何公网切换前证明三个产品的现有核心功能仍然正常。

## 非目标

- 不删除 GitHub Pages 上现有的 `/roost-site/`、`/babel-site/`、`/bakery-site/` 产品介绍页。
- 不删除或迁移 Roost、Babel、Bakery 的数据库和运行时数据。
- 不取消 Babel `:8443`、`:10000` 兼容入口。
- 不更改 Tailscale 设备名、tailnet 域名、Git remote 或仓库分支策略。
- 不在本次工作中引入 Cloudflare Tunnel、ngrok、Caddy、Nginx 或新的公网域名。
- 不处理与 base path 无关的重构和功能需求。

## 当前约束

- Babel 工作区已有 `apps/web/app/components/TopBar.tsx` 和 `apps/web/e2e/home.spec.ts` 未提交修改，实施必须保留这些内容。
- Roost 的 `examples/roost_hybrid` 子模块已有本地状态，且主分支落后远端；实施不得覆盖或清理该状态。
- Bakery 和 `ReverseScale.github.io` 在设计时工作区干净，但实施前仍需重新检查。
- 本机没有可直接复用的 Caddy 或 Nginx 命令，因此统一入口应优先复用 Tailscale Funnel 的原生路径处理器。
- Roost 的设备 API、签名 CDN URL 和 updater base URL 属于协议表面，不能只验证 Console 页面。
- Bakery 当前大量前端链接和 API 请求使用根绝对路径，必须通过集中式路径工具迁移，禁止用代理层正文替换兜底。

## 总体架构

Tailscale Funnel 在 HTTPS `443` 上配置多个路径处理器。官方 `--set-path` 使用类似 Go `ServeMux` 的路径匹配规则，较长、较具体的路径优先于产品根路径。

```text
Internet
   |
   v
Tailscale Funnel :443
   |-- /              -> Roost :8080，仅用于跳转到 /roost/
   |-- /roost/*       -> Roost :8080
   |-- /babel/api/*   -> Babel API :4000
   |-- /babel/*       -> Babel Web :3000
   `-- /bakery/*      -> Bakery :60006
```

不增加第四个常驻反向代理进程。实施的第一个网络验证步骤必须使用可回滚的临时处理器确认当前 Tailscale 版本对 mount path 的实际转发语义，包括后端看到的路径、Host、scheme 和转发头。若实际语义与应用 base path 需求不符，停止公网配置，回到设计评审，不以响应正文重写绕过。

## Roost 设计

### 配置边界

新增明确的公开路径配置 `ROOST_PUBLIC_BASE_PATH=/roost`。该值同时驱动：

- Console Vite `base`，复用已有 `VITE_PUBLIC_BASE_PATH` 能力。
- Console 路由解析、登录注册跳转和公开页面 URL。
- roostd HTTP 路由的前缀剥离或挂载。
- Admin API、patch check、事件上报、注册、metrics 和健康检查的外部路径。
- CDN 与 updater URL 的生成。
- `ROOST_BASE_URL=https://tims.tail5d10b9.ts.net/roost`。

所有后端 handler 内部继续使用现有无前缀路由。只在 HTTP 入口边界统一识别并剥离 `/roost`，避免业务 handler 分散拼接前缀。

### 根路径兼容

Roost 继续接收 Funnel 根处理器流量。仅当外部请求路径为 `/` 时返回到 `/roost/` 的重定向；未知根级路径不能静默伪装成 Roost 页面。

### 协议保护

必须验证：

- `/roost/api/v1/*` 的 patch check 和事件上报。
- `/roost/admin/v1/*` 的账号、项目和发布管理。
- `/roost/cdn/*` 的 HMAC 签名下载。
- 生成的 patch/updater URL 带 `/roost` 且可以真实下载。
- `/roost/healthz`、`/roost/readyz` 和受保护 metrics 行为保持一致。

## Babel 设计

### Web base path

Next.js Web 配置 `basePath=/babel`。内部链接、静态资源、Server Action、Route Handler、图片代理和认证跳转必须由 Next.js base path 或集中式 URL 工具生成，不能在组件中散布字符串前缀。

### 同源 API

浏览器和 SSR 的规范 API 地址改为同源 `/babel/api/`：

- 浏览器根据当前 origin 生成 `https://tims.tail5d10b9.ts.net/babel/api`。
- 服务端本地执行仍可直连 `http://127.0.0.1:4000`，避免不必要的公网回环。
- API 的外部入口边界统一处理 `/babel/api` 前缀，内部路由保持现状。
- Cookie path、CORS、CSRF/Origin 校验和登录回调必须覆盖规范 origin 与 base path。

### 兼容入口

`https://tims.tail5d10b9.ts.net:8443/` 和 `https://tims.tail5d10b9.ts.net:10000/` 保持现有代理关系。兼容入口不应被新 base path 强制跳转，确保旧书签、CLI 和集成仍能使用。

## Bakery 设计

### 统一公开路径配置

新增 `BAKERY_PUBLIC_BASE_PATH=/bakery`，并在配置加载时进行规范化：必须为空字符串或以单个 `/` 开头、末尾不带 `/` 的路径。

该配置驱动：

- Django `FORCE_SCRIPT_NAME`、`STATIC_URL` 和需要的 Cookie path。
- Django 重定向、OAuth callback、分享、下载、manifest 和证书引导 URL。
- Vite 构建资源 base 与模板中的静态资源地址。
- React 当前路由解析。
- 前端 `fetch`、XHR、导航、面包屑和资源链接。

前端新增单一 URL 模块，提供 `withPublicBasePath()`、`stripPublicBasePath()` 等意图明确的函数。现有根绝对路径逐步迁移到该模块，并用测试覆盖，禁止通过全局字符串替换或代理正文改写完成迁移。

### 主机与 HTTPS

Bakery 运行环境加入 `tims.tail5d10b9.ts.net` 到 `ALLOWED_HOSTS`，并配置规范 HTTPS origin。继续只监听 `127.0.0.1:60006`，不直接暴露局域网端口。Tailscale 负责公网 TLS 终止，Django 继续根据可信代理头识别 HTTPS。

### 本地兼容

本地 `http://127.0.0.1:60006/` 必须继续可用。base path 配置只在统一公网运行配置中启用，开发和测试默认空路径。

## 官网设计

### ReverseScale 主站

`ReverseScale.github.io` 中以下运行入口改为规范公网地址：

- 顶部导航。
- Hero CTA。
- 产品卡片。
- 无 JavaScript fallback 导航。
- 404 页复用的产品导航。

`src/site-data.js` 继续作为产品入口的单一数据源；`src/app.js` 不重复硬编码三个运行地址。产品介绍页仍保留，并在需要时使用明确的 `Learn more` 链接区分“运行产品”和“产品介绍”。

### 产品官网

审计 Babel、Roost、Bakery 各自官网源码和生成站点中的运行 CTA、登录、打开控制台、开始使用等链接。运行入口改为对应规范地址，文档和介绍内容自身仍留在 GitHub Pages。

只修改可维护的源码和测试；生成产物必须通过现有发布流程产生，不对大批生成 HTML 做无来源的机械替换。

## 数据流

以 Bakery 登录为例：

1. 浏览器访问 `/bakery/login/signin`。
2. Funnel 按 `/bakery` 处理器转发到本地 Bakery。
3. Bakery 在 HTTP 边界识别公开前缀，内部 Django 路由仍解析 `/login/signin`。
4. 模板生成 `/bakery/static/modern/app.js`。
5. React 登录请求发送到 `/bakery/login/api/signin`。
6. Session Cookie 在 `/bakery` 范围内生效，避免与 Babel、Roost Cookie 冲突。
7. 登录成功后跳转到 `/bakery/package/home/app=all`。

Babel 和 Roost 遵循相同原则：公开前缀只在入口边界处理，业务路由保持内部语义，浏览器端所有可见 URL 始终带产品前缀。

## 错误处理与隔离

- 每个产品只接受自己的公开前缀，防止 `/babel` 请求落入 Roost fallback。
- 未识别的产品路径返回明确 404，不回退到其他产品 SPA。
- API 认证失效只能跳转到本产品登录页。
- Cookie 使用产品路径隔离；Cookie 名冲突时仍不得跨产品发送。
- Funnel 路由按最具体路径优先，`/babel/api` 必须先于 `/babel` 验证。
- 健康检查失败时不自动修改或重置其他产品处理器。
- 大文件上传、Roost CDN 下载和 Bakery 包下载必须验证流式传输与 Range 行为，不能只验证小响应。

## 实施顺序

1. 重新检查四个仓库状态并记录现存改动。
2. 保存 `tailscale serve status --json` 和 `tailscale funnel status --json`，生成可验证的回滚快照。
3. 用最小临时服务验证 `--set-path` 的 Host、scheme、路径和头转发语义，验证后清理临时处理器。
4. 先为 Roost 实现 `/roost` 支持并完成本地测试。
5. 为 Babel Web/API 实现 `/babel` 和 `/babel/api`，同时保持旧端口。
6. 为 Bakery 实现 `/bakery`，并保持空 base path 本地模式。
7. 更新 ReverseScale 主站和三个产品官网入口。
8. 在不改变根处理器的前提下逐个增加新 Funnel 路径并验证。
9. 所有验收通过后，将根路径切换为到 `/roost/` 的兼容跳转。
10. 再次验证旧 Babel 端口、三个新入口、官网链接和本地入口。

## 测试与验收

### 仓库级验证

- Roost：Go 单元/集成测试、Console 测试与构建、现有本地 smoke。
- Babel：受影响 package 的单元/集成测试、Web build、API 测试与关键 Playwright E2E。
- Bakery：Django 测试、React/Vitest 测试、前端生产构建和针对 base path 的集成测试。
- ReverseScale 主站：完整 smoke test、静态链接断言和 `git diff --check`。

### 核心功能验收

- Roost：登录、项目读取、管理 API、patch check、事件上报、签名 CDN 下载、健康与就绪检查。
- Babel：登录、组织/项目页、同源 API、SSR、图片接口、Cookie、CORS 和旧端口。
- Bakery：登录、工作台、应用管理、包类型、构建页/API、公开分享、静态资源和下载。
- 官网：导航、Hero CTA、产品卡片和 fallback 全部指向规范地址。

### 公网验证

- 三个规范入口返回预期页面和状态。
- JS、CSS、字体、图片及动态 chunk 无 404。
- 所有重定向均留在当前产品前缀内。
- 浏览器 Console 无 base path 相关错误。
- API、Cookie 和 CSRF/Origin 行为正常。
- Babel `:8443`、`:10000` 兼容入口继续工作。
- Roost CDN 和 Bakery 下载验证大文件或 Range 请求，不以首页 200 代替。

只有上述门槛全部通过，才可以报告切换完成。

## 可观测性

- 保留并验证三个产品现有健康检查。
- 为规范路径建立可脚本化的 HTTP smoke，输出 URL、状态码和关键响应断言，不记录凭据。
- 公网切换期间持续观察各服务错误日志、4xx/5xx 和静态资源失败。
- 本次为入口迁移，不新增产品行为，不需要 A/B 实验；若现有分析系统记录路径，需要将新前缀加入报表归一化规则。

## 回滚

- Tailscale 配置变更前保存完整 JSON 和人类可读状态。
- 新路径以增量方式加入；旧根、`:8443`、`:10000` 在最终切换前不删除。
- 任一关键验收失败时，恢复原 Funnel 配置并重启受影响服务的原运行方式。
- 不回滚数据库、不删除 volume、不重建 Roost signing key、不覆盖 Bakery SQLite、不重建 Babel Postgres。
- 代码按仓库独立提交，使单个产品可以独立回退，不创建混合四仓库的不可分提交。

## 完成标准

- 三个规范公网 URL 可以从外部网络访问并完成各自核心工作流。
- 根 URL 自动进入 `/roost/`。
- Babel 旧公网端口继续可用。
- 三个产品本地入口继续可用。
- ReverseScale 主站及三个产品官网的运行 CTA 全部使用规范地址。
- 全部仓库级测试、构建、smoke 和公网验收通过。
- 工作区原有未提交内容保持不变。
- 回滚快照、运行说明和路径配置已写入维护文档。
