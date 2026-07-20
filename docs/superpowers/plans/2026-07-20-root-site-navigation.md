# ReverseScale 根入口与产品导航 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 Tailscale 根地址跳转到 ReverseScale 官网，官网项目入口先进入三个产品介绍页，再由各产品官网进入对应运行时。

**Architecture:** ReverseScale 首页项目卡片使用现有 `siteHref`，运行时 `href` 继续保留给产品登录入口。新增一个仅监听 `127.0.0.1:8090` 的 Python 标准库跳转服务，并由 launchd 持久运行；Tailscale Funnel 只替换根处理器，产品子路径和兼容端口保持原样。

**Tech Stack:** 静态 HTML、原生 JavaScript、Python 3 `http.server`、`unittest`、macOS launchd、Tailscale Funnel。

## Global Constraints

- 根地址必须跳转到 `https://reversescale.github.io/`，浏览器地址栏允许切换到 GitHub Pages。
- 首页 Roost、Babel、Bakery 入口必须分别使用 `/roost-site/`、`/babel-site/`、`/bakery-site/`。
- 三个运行时继续使用 `https://tims.tail5d10b9.ts.net/{roost,babel,bakery}/`。
- `/babel/api`、`:8443` 和 `:10000` 不得改变。
- 跳转服务只监听 `127.0.0.1`，不得直接开放局域网端口。
- 必须保留现有未提交修改，不覆盖其他项目工作树。

---

## File Structure

- `src/app.js`：首页动态项目卡片；只把卡片目标从 `href` 改为 `siteHref`。
- `index.html`：无 JavaScript 导航；改为三个产品介绍页。
- `tests/test_site_smoke.py`：网站导航契约，分别检查介绍页入口和运行时数据。
- `ops/root_redirect_server.py`：独立根跳转 HTTP 服务，仅根路径返回重定向。
- `ops/com.reversescale.root-redirect.plist`：launchd 持久化配置模板。
- `tests/test_root_redirect_server.py`：跳转状态、Location、HEAD 和非根路径测试。
- `docs/superpowers/specs/2026-07-20-root-site-navigation-design.md`：已批准设计依据。

### Task 1: ReverseScale 首页先进入产品介绍页

**Files:**
- Modify: `tests/test_site_smoke.py:137-164`
- Modify: `src/app.js:48-72`
- Modify: `index.html:32-40`

**Interfaces:**
- Consumes: `projectLinks[].siteHref: string` 和 `projectLinks[].href: string`。
- Produces: `heroProjectCard(project, index): string` 与 `projectCard(project): string` 中的产品介绍页链接。

- [ ] **Step 1: 写失败的网站导航测试**

将原 `test_home_links_all_product_runtimes` 拆分为介绍页导航和运行时数据两个契约：

```python
def test_home_project_cards_and_fallback_navigation_link_product_sites(self) -> None:
    app_source = read("src/app.js")
    html = read("index.html")

    self.assertEqual(app_source.count('href="${project.siteHref}"'), 2)
    for product_path in ("roost", "babel", "bakery"):
        self.assertIn(f'href="/{product_path}-site/"', html)
        self.assertNotIn(
            f'href="https://tims.tail5d10b9.ts.net/{product_path}/"',
            html,
        )

def test_project_data_keeps_product_runtime_urls(self) -> None:
    source = read("src/site-data.js")

    self.assertIn('export const runtimeBaseURL = "https://tims.tail5d10b9.ts.net"', source)
    for product_path in ("roost", "babel", "bakery"):
        self.assertIn(f'`${{runtimeBaseURL}}/{product_path}/`', source)
```

- [ ] **Step 2: 运行定向测试并确认失败**

Run: `python3 -m unittest tests.test_site_smoke.SiteSmokeTest.test_home_project_cards_and_fallback_navigation_link_product_sites -v`

Expected: FAIL，因为 `src/app.js` 仍使用 `project.href`，`index.html` 仍包含运行时 URL。

- [ ] **Step 3: 最小化修改动态和静态导航**

在 `src/app.js` 的两个项目卡片模板中使用：

```javascript
href="${project.siteHref}"
```

在 `index.html` 的 `<noscript>` 导航中使用：

```html
<a href="/roost-site/">Roost</a>
<a href="/babel-site/">Babel</a>
<a href="/bakery-site/">Bakery</a>
```

- [ ] **Step 4: 运行完整网站测试**

Run: `python3 -m unittest discover -s tests -v`

Expected: 所有测试 PASS。

- [ ] **Step 5: 提交首页导航变更**

```bash
git add src/app.js index.html tests/test_site_smoke.py
git commit -m "fix: route home cards through product sites"
```

### Task 2: 新增可持久运行的根跳转服务

**Files:**
- Create: `tests/test_root_redirect_server.py`
- Create: `ops/root_redirect_server.py`
- Create: `ops/com.reversescale.root-redirect.plist`
- Modify: `docs/superpowers/specs/2026-07-20-root-site-navigation-design.md`

**Interfaces:**
- Produces: `RootRedirectHandler(BaseHTTPRequestHandler)`；`GET /` 和 `HEAD /` 返回 `308` 与 `Location: https://reversescale.github.io/`，其他路径返回 `404`。
- Produces: loopback 服务 `127.0.0.1:8090`，供 Tailscale Funnel 根处理器消费。

- [ ] **Step 1: 写失败的跳转服务测试**

创建 `tests/test_root_redirect_server.py`：

```python
import http.client
from http.server import ThreadingHTTPServer
from pathlib import Path
import sys
import threading
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ops.root_redirect_server import RootRedirectHandler


class RootRedirectServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), RootRedirectHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.port = cls.server.server_address[1]

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def request(self, method: str, path: str) -> http.client.HTTPResponse:
        connection = http.client.HTTPConnection("127.0.0.1", self.port)
        connection.request(method, path)
        return connection.getresponse()

    def test_root_get_redirects_permanently_to_reverse_scale(self) -> None:
        response = self.request("GET", "/")
        self.assertEqual(response.status, 308)
        self.assertEqual(response.getheader("Location"), "https://reversescale.github.io/")

    def test_root_head_has_same_redirect_without_body(self) -> None:
        response = self.request("HEAD", "/")
        self.assertEqual(response.status, 308)
        self.assertEqual(response.read(), b"")

    def test_non_root_path_is_not_redirected(self) -> None:
        response = self.request("GET", "/babel/")
        self.assertEqual(response.status, 404)
        self.assertIsNone(response.getheader("Location"))
```

- [ ] **Step 2: 运行测试并确认导入失败**

Run: `python3 -m unittest tests.test_root_redirect_server -v`

Expected: ERROR，`ops.root_redirect_server` 尚不存在。

- [ ] **Step 3: 实现最小跳转服务**

创建 `ops/root_redirect_server.py`：

```python
#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = 8090
TARGET_URL = "https://reversescale.github.io/"


class RootRedirectHandler(BaseHTTPRequestHandler):
    def _respond(self, include_body: bool) -> None:
        if self.path != "/":
            self.send_error(404)
            return

        body = b"Redirecting to ReverseScale.\n"
        self.send_response(308)
        self.send_header("Location", TARGET_URL)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body) if include_body else 0))
        self.end_headers()
        if include_body:
            self.wfile.write(body)

    def do_GET(self) -> None:
        self._respond(include_body=True)

    def do_HEAD(self) -> None:
        self._respond(include_body=False)


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), RootRedirectHandler)
    print(f"Root redirect listening on http://{HOST}:{PORT}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: 新增 launchd 配置模板并补充运行文档**

创建 `ops/com.reversescale.root-redirect.plist`，使用 `/usr/bin/python3` 执行 `/Users/tim/Workspace/ReverseScale.github.io/ops/root_redirect_server.py`，设置 `RunAtLoad` 和 `KeepAlive` 为 `true`，日志写入 `/tmp/com.reversescale.root-redirect.{out,err}.log`。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.reversescale.root-redirect</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/python3</string>
    <string>/Users/tim/Workspace/ReverseScale.github.io/ops/root_redirect_server.py</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/com.reversescale.root-redirect.out.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/com.reversescale.root-redirect.err.log</string>
</dict>
</plist>
```

在设计文档“运行与持久化”中记录固定端口 `8090`、launchd label `com.reversescale.root-redirect` 和日志路径。

- [ ] **Step 5: 运行跳转服务测试和全量回归**

Run: `python3 -m unittest tests.test_root_redirect_server -v && python3 -m unittest discover -s tests -v && git diff --check`

Expected: 所有测试 PASS，`git diff --check` 无输出。

- [ ] **Step 6: 提交跳转服务**

```bash
git add ops/root_redirect_server.py ops/com.reversescale.root-redirect.plist tests/test_root_redirect_server.py docs/superpowers/specs/2026-07-20-root-site-navigation-design.md
git commit -m "feat: add persistent root redirect service"
```

### Task 3: 安装服务、切换 Funnel 并发布官网

**Files:**
- Install: `~/Library/LaunchAgents/com.reversescale.root-redirect.plist`
- Runtime config: Tailscale Funnel 根处理器 `/`

**Interfaces:**
- Consumes: `http://127.0.0.1:8090/`。
- Produces: `https://tims.tail5d10b9.ts.net/` → `308 https://reversescale.github.io/`；产品和 API 子路径保持原处理器。

- [ ] **Step 1: 记录变更前状态**

Run outside sandbox:

```bash
/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel status --json
launchctl list com.reversescale.root-redirect
```

Expected: Funnel 状态包含 `/roost`、`/babel`、`/bakery`、`/babel/api` 以及旧端口；launchd label 初次安装时可以不存在。

- [ ] **Step 2: 安装并启动 launchd 服务**

```bash
mkdir -p /Users/tim/Library/LaunchAgents
cp ops/com.reversescale.root-redirect.plist /Users/tim/Library/LaunchAgents/com.reversescale.root-redirect.plist
launchctl bootout gui/501/com.reversescale.root-redirect 2>/dev/null || true
launchctl bootstrap gui/501 /Users/tim/Library/LaunchAgents/com.reversescale.root-redirect.plist
launchctl kickstart -k gui/501/com.reversescale.root-redirect
```

Expected: `curl -I http://127.0.0.1:8090/` 返回 `308` 和正确 `Location`。

- [ ] **Step 3: 仅切换 Funnel 根处理器**

Run outside sandbox:

```bash
/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --bg --set-path / http://127.0.0.1:8090
```

Expected: 状态中的 `/` 目标变为 `http://127.0.0.1:8090`，其他处理器与变更前快照一致。

回滚命令必须在现场验证前保留：

```bash
/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --bg --set-path / http://127.0.0.1:8080
```

- [ ] **Step 4: 推送 ReverseScale 官网**

```bash
git push origin master
```

Expected: `origin/master` 包含本计划产生的提交，GitHub Pages 随后发布新导航。

- [ ] **Step 5: 验证根跳转和网站导航**

```bash
curl -sS -I https://tims.tail5d10b9.ts.net/
curl -sS -L -o /dev/null -w '%{http_code} %{url_effective}\n' https://tims.tail5d10b9.ts.net/
curl -sS https://reversescale.github.io/ | rg '/(roost|babel|bakery)-site/'
```

Expected: 首个请求返回 `308` 且 Location 为 GitHub Pages；跟随跳转最终为 `200 https://reversescale.github.io/`；官网 HTML 包含三个产品介绍页链接。

- [ ] **Step 6: 验证产品、API 和产品官网 CTA**

```bash
for url in \
  https://tims.tail5d10b9.ts.net/roost/ \
  https://tims.tail5d10b9.ts.net/babel/login \
  https://tims.tail5d10b9.ts.net/bakery/ \
  https://tims.tail5d10b9.ts.net/babel/api/healthz \
  https://tims.tail5d10b9.ts.net:8443/ \
  https://tims.tail5d10b9.ts.net:10000/healthz \
  https://reversescale.github.io/roost-site/ \
  https://reversescale.github.io/babel-site/ \
  https://reversescale.github.io/bakery-site/; do
  curl -sS -L -o /dev/null -w '%{http_code} %{url_effective}\n' "$url"
done
```

Expected: 所有 URL 最终返回 2xx；三个产品官网源代码仍包含各自的 Tailscale 登录或控制台 URL。

Run:

```bash
curl -sS https://reversescale.github.io/roost-site/ | rg 'https://tims\.tail5d10b9\.ts\.net/roost/'
curl -sS https://reversescale.github.io/babel-site/ | rg 'https://tims\.tail5d10b9\.ts\.net/babel/'
curl -sS https://reversescale.github.io/bakery-site/ | rg 'https://tims\.tail5d10b9\.ts\.net/bakery/'
```

Expected: 三条命令均匹配到各自运行时 URL。

- [ ] **Step 7: 最终版本与工作树检查**

```bash
git status --short --branch
git rev-list --left-right --count origin/master...master
```

Expected: ReverseScale 工作树干净，分支计数为 `0 0`。其他仓库的用户改动保持不变。
