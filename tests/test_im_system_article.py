from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import json
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[1]


class ArticleDocumentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.article_count = 0
        self.heading_ids: set[str] = set()
        self.links: dict[str, str] = {}
        self.text_parts: list[str] = []
        self._current_link: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "article":
            self.article_count += 1
        if tag in {"h2", "h3"} and attributes.get("id"):
            self.heading_ids.add(attributes["id"] or "")
        if tag == "a" and attributes.get("href"):
            self._current_link = attributes["href"]

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


class ServiceTopologyParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.class_stack: list[set[str]] = []
        self.fanout_count = 0
        self.fanout_stem_count = 0
        self.branch_count = 0
        self.branch_service_counts: list[int] = []
        self.branch_dependency_counts: list[int] = []
        self.obsolete_split_count = 0

    def handle_starttag(self, _tag: str, attrs: list[tuple[str, str | None]]) -> None:
        classes = set((dict(attrs).get("class") or "").split())
        self.class_stack.append(classes)

        if "service-map__fanout" in classes:
            self.fanout_count += 1
        if "service-map__fanout-stem" in classes:
            self.fanout_stem_count += 1
        if "service-map__split" in classes:
            self.obsolete_split_count += 1
        if "service-map__branch" in classes:
            self.branch_count += 1
            self.branch_service_counts.append(0)
            self.branch_dependency_counts.append(0)

        branch_index = self._open_branch_index()
        if branch_index is None:
            return
        if "service-node" in classes and "service-node--edge" not in classes:
            self.branch_service_counts[branch_index] += 1
        if "service-dependency" in classes:
            self.branch_dependency_counts[branch_index] += 1

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, _tag: str) -> None:
        if self.class_stack:
            self.class_stack.pop()

    def _open_branch_index(self) -> int | None:
        open_branch_count = sum("service-map__branch" in classes for classes in self.class_stack)
        if not open_branch_count:
            return None
        return self.branch_count - 1


class ImSystemArticleTest(unittest.TestCase):
    def test_home_renders_the_featured_im_article(self) -> None:
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
        rendered = json.loads(result.stdout)
        home_html = rendered["html"]

        self.assertIn('href="/im-system-evolution/"', home_html)
        self.assertIn("从能聊到可靠", home_html)
        self.assertEqual(home_html.count('class="article-card"'), 1)
        self.assertIn('class="micro-visual micro-visual--message-path"', home_html)
        self.assertNotIn('class="section research-brief"', home_html)
        self.assertLess(home_html.index('class="project-grid"'), home_html.index('class="article-card"'))
        self.assertLess(home_html.index('class="article-card"'), home_html.index('class="section architecture-brief"'))

    def test_article_is_a_semantic_long_form_reading_path(self) -> None:
        article_path = ROOT / "im-system-evolution" / "index.html"
        self.assertTrue(article_path.exists(), "The public article route must exist")

        parser = ArticleDocumentParser()
        parser.feed(article_path.read_text(encoding="utf-8"))

        self.assertEqual(parser.article_count, 1)
        self.assertIn("从能聊到可靠：一套 IM 系统的演进路线", parser.text())
        self.assertEqual(
            parser.heading_ids,
            {
                "roadmap",
                "protocol",
                "reliability",
                "connection",
                "client-state",
                "service-architecture",
                "operations",
                "principles",
            },
        )
        self.assertEqual(
            parser.links["查看原始研究笔记"],
            "https://app.notion.com/p/4c0718e86da24deebb2b1bf0dcf786ae",
        )

    def test_article_exposes_shareable_metadata_without_javascript(self) -> None:
        article_path = ROOT / "im-system-evolution" / "index.html"
        self.assertTrue(article_path.exists(), "The metadata must ship with the public article")
        html = article_path.read_text(encoding="utf-8")

        self.assertIn('<html lang="zh-CN">', html)
        self.assertIn('<meta property="og:type" content="article" />', html)
        self.assertIn(
            '<link rel="canonical" href="https://reversescale.github.io/im-system-evolution/" />',
            html,
        )
        self.assertIn('"@type": "BlogPosting"', html)
        self.assertIn('<link rel="stylesheet" href="../src/im-system-article.css" />', html)
        self.assertNotIn("<script type=\"module\"", html)

    def test_service_topology_has_one_connected_fanout_and_three_complete_branches(self) -> None:
        html = (ROOT / "im-system-evolution" / "index.html").read_text(encoding="utf-8")
        parser = ServiceTopologyParser()
        parser.feed(html)

        self.assertEqual(parser.fanout_count, 1)
        self.assertEqual(parser.fanout_stem_count, 3)
        self.assertEqual(parser.branch_count, 3)
        self.assertEqual(parser.branch_service_counts, [1, 1, 1])
        self.assertEqual(parser.branch_dependency_counts, [1, 1, 1])
        self.assertEqual(parser.obsolete_split_count, 0)

    def test_article_anchor_targets_leave_reading_space_above_headings(self) -> None:
        styles = (ROOT / "src" / "im-system-article.css").read_text(encoding="utf-8")

        self.assertRegex(
            styles,
            r"\.article-section h2\[id\]\s*\{[^}]*scroll-margin-top:\s*(?:[4-9]\d|\d{3,})px;",
        )

    def test_mobile_diagrams_do_not_require_wide_internal_canvases(self) -> None:
        styles = (ROOT / "src" / "im-system-article.css").read_text(encoding="utf-8")
        mobile_styles = styles.split("@media (max-width: 720px)", maxsplit=1)[1]

        self.assertNotRegex(mobile_styles, r"\.state-machine__row\s*\{[^}]*min-width:")
        self.assertNotRegex(mobile_styles, r"\.state-machine__return\s*\{[^}]*min-width:")
        self.assertNotRegex(mobile_styles, r"\.client-flow__lane\s*\{[^}]*min-width:")
        self.assertNotRegex(mobile_styles, r"\.service-map\s*>\s*\*\s*\{[^}]*min-width:")

    def test_mobile_reading_scale_avoids_orphaned_headings_and_tiny_core_labels(self) -> None:
        styles = (ROOT / "src" / "im-system-article.css").read_text(encoding="utf-8")
        mobile_styles = styles.split("@media (max-width: 720px)", maxsplit=1)[1]

        self.assertRegex(
            mobile_styles,
            r"\.section-heading h2\s*\{[^}]*font-size:\s*(?:2[8-9]|3[0-2])px;",
        )
        self.assertRegex(
            mobile_styles,
            r"\.hero-terminal li small\s*\{[^}]*font-size:\s*(?:1\d|\d{3,})px;",
        )
        self.assertRegex(
            mobile_styles,
            r"\.article-toc a span\s*\{[^}]*font-size:\s*(?:1\d|\d{3,})px;",
        )

    def test_home_article_diagram_stacks_in_the_mobile_work_grid(self) -> None:
        styles = (ROOT / "src" / "styles.css").read_text(encoding="utf-8")
        mobile_styles = styles.split("@media (max-width: 680px)", maxsplit=1)[1]

        self.assertRegex(
            mobile_styles,
            r"\.micro-visual--message-path\s*\{[^}]*grid-template-columns:\s*1fr;",
        )


if __name__ == "__main__":
    unittest.main()
