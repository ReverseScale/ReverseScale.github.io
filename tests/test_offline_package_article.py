from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import json
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[1]


class OfflinePackageArticleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.article_count = 0
        self.heading_ids: set[str] = set()
        self.links: dict[str, str] = {}
        self.lifecycle_stage_count = 0
        self.fallback_step_count = 0
        self.text_parts: list[str] = []
        self._current_link: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        classes = set((attributes.get("class") or "").split())
        if tag == "article":
            self.article_count += 1
        if tag in {"h2", "h3"} and attributes.get("id"):
            self.heading_ids.add(attributes["id"] or "")
        if tag == "a" and attributes.get("href"):
            self._current_link = attributes["href"]
        if "lifecycle-stage" in classes:
            self.lifecycle_stage_count += 1
        if "fallback-step" in classes:
            self.fallback_step_count += 1

    def handle_endtag(self, tag: str) -> None:
        if tag == "a":
            self._current_link = None

    def handle_data(self, data: str) -> None:
        clean = " ".join(data.split())
        if not clean:
            return
        self.text_parts.append(clean)
        if self._current_link:
            self.links[clean] = self._current_link

    def text(self) -> str:
        return " ".join(self.text_parts)


class OfflinePackageArticleTest(unittest.TestCase):
    def render_home(self) -> str:
        script = """
          globalThis.HTMLElement = class {
            getAttribute() { return null; }
          };
          globalThis.customElements = {
            define(_name, component) { globalThis.HomeComponent = component; }
          };
          await import('./src/app.js');
          const home = new globalThis.HomeComponent();
          home.connectedCallback();
          console.log(JSON.stringify({ html: home.innerHTML }));
        """
        result = subprocess.run(
            ["node", "--input-type=module", "--eval", script],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(result.stdout)["html"]

    def test_home_renders_both_research_articles_with_distinct_visuals(self) -> None:
        home_html = self.render_home()

        self.assertEqual(home_html.count('class="article-card"'), 2)
        self.assertIn('href="/im-system-evolution/"', home_html)
        self.assertIn('href="/offline-package-system/"', home_html)
        self.assertIn(
            '<span class="project-card__name">不只是缓存：移动端离线包的发布、校验与回滚</span>',
            home_html,
        )
        self.assertIn('class="micro-visual micro-visual--message-path"', home_html)
        self.assertIn('class="micro-visual micro-visual--offline-package"', home_html)

    def test_article_is_a_semantic_end_to_end_system_design(self) -> None:
        article_path = ROOT / "offline-package-system" / "index.html"
        self.assertTrue(article_path.exists(), "The public offline package article route must exist")

        parser = OfflinePackageArticleParser()
        parser.feed(article_path.read_text(encoding="utf-8"))

        self.assertEqual(parser.article_count, 1)
        self.assertIn("不只是缓存：一套移动端离线包系统如何发布、校验、回滚与观测", parser.text())
        self.assertEqual(
            parser.heading_ids,
            {
                "why",
                "topology",
                "manifest",
                "delivery",
                "interception",
                "recovery",
                "security",
                "observability",
                "boundaries",
            },
        )
        self.assertEqual(parser.lifecycle_stage_count, 5)
        self.assertEqual(parser.fallback_step_count, 3)
        self.assertEqual(
            parser.links["查看原始研究笔记"],
            "https://app.notion.com/p/timsappworkspace/0277da40f7194b75b01627c975b19487?source=copy_link",
        )

    def test_article_exposes_shareable_metadata_and_primary_references_without_javascript(self) -> None:
        article_path = ROOT / "offline-package-system" / "index.html"
        self.assertTrue(article_path.exists(), "The article metadata must ship at the public route")
        html = article_path.read_text(encoding="utf-8")

        self.assertIn('<html lang="zh-CN">', html)
        self.assertIn('<meta property="og:type" content="article" />', html)
        self.assertIn(
            '<link rel="canonical" href="https://reversescale.github.io/offline-package-system/" />',
            html,
        )
        self.assertIn('"@type": "BlogPosting"', html)
        self.assertIn('<link rel="stylesheet" href="../src/offline-package-article.css" />', html)
        self.assertNotIn('<script type="module"', html)
        self.assertIn("https://developer.apple.com/documentation/webkit/wkurlschemehandler", html)
        self.assertIn("https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader.html", html)
        self.assertIn("https://www.rfc-editor.org/rfc/rfc9111.html", html)
        self.assertIn("https://mas.owasp.org/MASWE/MASVS-CRYPTO/MASWE-0011/", html)

    def test_home_fallback_navigation_exposes_the_offline_package_article(self) -> None:
        fallback_html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('href="/offline-package-system/"', fallback_html)

    def test_mobile_article_diagrams_reflow_without_wide_internal_canvases(self) -> None:
        stylesheet_path = ROOT / "src" / "offline-package-article.css"
        self.assertTrue(stylesheet_path.exists(), "The article stylesheet must exist")
        styles = stylesheet_path.read_text(encoding="utf-8")
        mobile_styles = styles.split("@media (max-width: 720px)", maxsplit=1)[1]

        self.assertNotRegex(mobile_styles, r"min-width:\s*[4-9]\d{2}px")
        self.assertRegex(mobile_styles, r"\.system-map__client\s*\{[^}]*grid-template-columns:\s*1fr;")
        self.assertRegex(mobile_styles, r"\.lifecycle-flow\s*\{[^}]*grid-template-columns:\s*1fr;")
        self.assertRegex(mobile_styles, r"\.fallback-chain\s*\{[^}]*grid-template-columns:\s*1fr;")


if __name__ == "__main__":
    unittest.main()
