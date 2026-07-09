from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class SiteSmokeTest(unittest.TestCase):
    def test_home_shell_uses_modern_reverse_scale_entrypoint(self) -> None:
        html = read("index.html")
        self.assertIn("ReverseScale", html)
        self.assertIn("src/app.js", html)
        self.assertIn("src/styles.css", html)
        self.assertNotIn("Hexo 3.8.0", html)
        self.assertNotIn("Tim's Technology Blog", html)

    def test_home_links_current_project_sites(self) -> None:
        html = read("index.html")
        self.assertIn("/roost-site/", html)
        self.assertIn("/babel-site/", html)

    def test_main_site_declares_tab_icon(self) -> None:
        html = read("index.html")
        self.assertTrue((ROOT / "icon.svg").exists())
        icon = read("icon.svg")

        self.assertIn('<link rel="icon" href="/icon.svg" type="image/svg+xml" />', html)
        self.assertIn("ReverseScale tab icon", icon)
        self.assertIn("<svg", icon)

    def test_app_links_research_workspace_without_restoring_notes_module(self) -> None:
        source = read("src/app.js") + read("src/site-data.js")
        self.assertIn("Research", source)
        self.assertIn("https://app.notion.com/p/timsappworkspace/Research-and-Insight-5fda3475a090427da9ac9b5c59964381", source)
        self.assertNotIn("renderArticleLibrary", source)

    def test_app_module_defines_componentized_site(self) -> None:
        source = read("src/app.js")
        content_source = source + read("src/site-data.js")
        self.assertIn('customElements.define("rs-home"', source)
        self.assertIn("projectLinks", source)
        self.assertIn("self-hosted product infrastructure", content_source)
        self.assertIn("Mobile release operations", content_source)

    def test_home_does_not_include_notes_module(self) -> None:
        source = read("src/app.js")
        html = read("index.html")
        self.assertNotIn("content.json", source)
        self.assertNotIn("article-library", source)
        self.assertNotIn("renderArticlePage", source)
        self.assertNotIn("Articles", source)
        self.assertNotIn("/articles/", html)

    def test_404_uses_same_modern_shell(self) -> None:
        html = read("404.html")
        self.assertIn("ReverseScale", html)
        self.assertIn("src/app.js", html)
        self.assertIn("rs-home", html)

    def test_modern_shell_does_not_reuse_legacy_visual_assets(self) -> None:
        for path in ["index.html", "404.html", "about/index.html", "archives/index.html"]:
            html = read(path)
            self.assertNotIn("/css/images/", html)
            self.assertNotIn("rocket.png", html)


if __name__ == "__main__":
    unittest.main()
