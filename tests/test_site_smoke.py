from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class SiteSmokeTest(unittest.TestCase):
    def test_about_page_has_dedicated_personal_content(self) -> None:
        app_source = read("src/app.js")
        about_html = read("about/index.html")

        self.assertIn("function renderAbout", app_source)
        self.assertIn("What I build and why.", app_source)
        self.assertIn("ReverseScale is the namespace", app_source)
        self.assertIn('<rs-home page="about"></rs-home>', about_html)
        self.assertIn("About Tim", about_html)

    def test_404_uses_tim_shell_and_clear_return_action(self) -> None:
        app_source = read("src/app.js")
        html = read("404.html")

        self.assertIn("function renderNotFound", app_source)
        self.assertIn("This page wandered off the release path.", app_source)
        self.assertIn("Back to Tim’s work", app_source)
        self.assertIn("Not found | Tim", html)

    def test_personal_site_does_not_invent_avatar_or_email(self) -> None:
        source = read("src/app.js") + read("src/site-data.js")

        self.assertNotIn("avatar", source.lower())
        self.assertNotIn("mailto:", source)

    def test_home_presents_tim_personal_identity_and_navigation(self) -> None:
        app_source = read("src/app.js")
        html = read("index.html")

        self.assertIn("I build tools for mobile teams.", app_source)
        self.assertIn('aria-label="Tim home"', app_source)
        self.assertIn('href="/#work"', app_source)
        self.assertIn('href="/about/"', app_source)
        self.assertIn("https://github.com/ReverseScale", app_source + read("src/site-data.js"))
        self.assertIn("Tim — Independent software developer", html)

    def test_home_renders_distinct_project_micro_visuals(self) -> None:
        app_source = read("src/app.js")
        styles = read("src/styles.css")

        self.assertIn("projectMicroVisual", app_source)
        self.assertIn('project.visual === "package"', app_source)
        self.assertIn('project.visual === "strings"', app_source)
        self.assertIn('project.visual === "pipeline"', app_source)
        self.assertIn("micro-visual--package", styles)
        self.assertIn("micro-visual--strings", styles)
        self.assertIn("micro-visual--pipeline", styles)

    def test_home_keeps_work_research_and_about_without_article_feed(self) -> None:
        app_source = read("src/app.js")

        self.assertIn('id="work"', app_source)
        self.assertIn('id="about"', app_source)
        self.assertIn('id="research"', app_source)
        self.assertIn("Notes and research live in Notion.", app_source + read("src/site-data.js"))
        self.assertNotIn("article-library", app_source)
        self.assertNotIn("renderArticlePage", app_source)

    def test_personal_profile_and_project_visual_contract(self) -> None:
        data_source = read("src/site-data.js")

        self.assertIn("export const profile", data_source)
        self.assertIn('name: "Tim"', data_source)
        self.assertIn('mark: "T"', data_source)
        self.assertIn('role: "Independent software developer"', data_source)
        self.assertIn("mobile engineering, delivery workflows, and developer tools", data_source)
        self.assertIn("https://github.com/ReverseScale", data_source)
        self.assertIn('visual: "package"', data_source)
        self.assertIn('visual: "strings"', data_source)
        self.assertIn('visual: "pipeline"', data_source)
        self.assertIn("export const workingPrinciples", data_source)

    def test_project_data_does_not_expose_private_source_links(self) -> None:
        data_source = read("src/site-data.js")

        self.assertNotIn("https://github.com/ReverseScale/roost", data_source)
        self.assertNotIn("https://github.com/ReverseScale/label", data_source)
        self.assertNotIn("https://github.com/ReverseScale/bakery", data_source)

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
        self.assertIn("/bakery-site/", html)

    def test_bakery_is_a_first_class_home_project(self) -> None:
        app_source = read("src/app.js")
        data_source = read("src/site-data.js")

        self.assertIn("projectLinks.map(heroProjectCard)", app_source)
        self.assertIn("projectLinks.map(projectCard)", app_source)
        self.assertIn('name: "Bakery"', data_source)
        self.assertIn('href: "/bakery-site/"', data_source)
        self.assertIn('label: "Mobile build and delivery"', data_source)
        self.assertIn('status: "Build & distribution"', data_source)
        self.assertIn('tone: "amber"', data_source)
        self.assertIn('visual: "pipeline"', data_source)
        self.assertIn("CI integration", data_source)
        self.assertIn("Pipeline visibility", data_source)
        self.assertIn("Artifact distribution", data_source)

    def test_bakery_project_uses_three_column_responsive_layout(self) -> None:
        styles = read("src/styles.css")

        self.assertIn("grid-template-columns: repeat(3, minmax(0, 1fr));", styles)
        self.assertIn(".project-card--amber", styles)
        self.assertIn("border-top: 4px solid var(--amber);", styles)

    def test_home_metadata_covers_mobile_build_and_distribution(self) -> None:
        html = read("index.html")

        self.assertIn("mobile build", html)
        self.assertIn("app distribution", html)

    def test_main_site_declares_tab_icon(self) -> None:
        html = read("index.html")
        self.assertTrue((ROOT / "icon.svg").exists())
        icon = read("icon.svg")

        self.assertIn('<link rel="icon" href="/icon.svg" type="image/svg+xml" />', html)
        self.assertIn("Tim tab icon", icon)
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
        self.assertIn("Independent software developer", content_source)
        self.assertIn("mobile engineering, delivery workflows, and developer tools", content_source)

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
        self.assertIn("Not found | Tim", html)
        self.assertIn("src/app.js", html)
        self.assertIn('<rs-home page="404">', html)

    def test_modern_shell_does_not_reuse_legacy_visual_assets(self) -> None:
        for path in ["index.html", "404.html", "about/index.html", "archives/index.html"]:
            html = read(path)
            self.assertNotIn("/css/images/", html)
            self.assertNotIn("rocket.png", html)


if __name__ == "__main__":
    unittest.main()
