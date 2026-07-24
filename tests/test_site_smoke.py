from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class SiteSmokeTest(unittest.TestCase):
    def test_home_declares_canonical_person_metadata(self) -> None:
        html = read("index.html")

        self.assertIn('<link rel="canonical" href="https://reversescale.github.io/" />', html)
        self.assertIn('type="application/ld+json"', html)
        self.assertIn('"@type": "Person"', html)
        self.assertIn('"name": "Tim"', html)
        self.assertIn('"url": "https://reversescale.github.io/"', html)
        self.assertIn('"https://github.com/ReverseScale"', html)

    def test_mobile_navigation_keeps_github_and_removes_duplicate_project_preview(self) -> None:
        app_source = read("src/app.js")
        styles = read("src/styles.css")

        self.assertIn('class="nav-research"', app_source)
        self.assertIn('class="nav-github nav-external"', app_source)
        self.assertIn(".site-nav .nav-research", styles)
        self.assertIn(".site-nav .nav-github", styles)
        self.assertIn(".hero-work {\n    display: none;\n  }", styles)
        self.assertIn(".section {\n    padding: 56px 0;\n  }", styles)

    def test_project_label_and_footer_year_do_not_go_stale(self) -> None:
        app_source = read("src/app.js")

        self.assertIn("3 projects", app_source)
        self.assertIn("new Date().getFullYear()", app_source)
        self.assertNotIn("© 2026", app_source)

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

        self.assertIn("Tools for mobile", app_source)
        self.assertIn("software, from code", app_source)
        self.assertIn("to release.", app_source)
        self.assertIn('aria-label="Tim home"', app_source)
        self.assertIn('href="/#work"', app_source)
        self.assertIn('href="/about/"', app_source)
        self.assertIn("https://github.com/ReverseScale", app_source + read("src/site-data.js"))
        self.assertIn("Tim — Independent software developer", html)

    def test_long_home_title_uses_desktop_breaks_without_forcing_mobile_lines(self) -> None:
        app_source = read("src/app.js")
        styles = read("src/styles.css")

        self.assertEqual(app_source.count('class="desktop-title-break"'), 2)
        self.assertIn(".hero h1 {\n  font-size: clamp(52px, 5vw, 68px);\n}", styles)
        self.assertIn(".desktop-title-break {\n    display: none;\n  }", styles)

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
        data_source = read("src/site-data.js")
        self.assertIn('siteHref: "/roost-site/"', data_source)
        self.assertIn('siteHref: "/babel-site/"', data_source)
        self.assertIn('siteHref: "/bakery-site/"', data_source)

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

    def test_bakery_is_a_first_class_home_project(self) -> None:
        app_source = read("src/app.js")
        data_source = read("src/site-data.js")

        self.assertIn("projectLinks.map(heroProjectCard)", app_source)
        self.assertIn("projectLinks.map(projectCard)", app_source)
        self.assertIn('name: "Bakery"', data_source)
        self.assertIn('href: `${runtimeBaseURL}/bakery/`', data_source)
        self.assertIn('siteHref: "/bakery-site/"', data_source)
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

    def test_architecture_explainer_is_separate_from_project_catalog(self) -> None:
        app_source = read("src/app.js")
        data_source = read("src/site-data.js")
        html = read("app-architecture/index.html")

        self.assertIn('href="/app-architecture/"', app_source)
        self.assertIn('id="architecture"', app_source)
        self.assertIn("Open the interactive explainer", app_source)
        self.assertIn("<app-architecture-explainer>", html)
        self.assertIn("../src/app-architecture.js", html)
        self.assertIn("../src/app-architecture.css", html)
        self.assertNotIn("App Architecture", data_source)

    def test_homepage_architecture_entry_matches_the_english_site_language(self) -> None:
        app_source = read("src/app.js")
        root_html = read("index.html")

        self.assertIn(">Architecture</a>", app_source)
        self.assertIn(">App Architecture</a>", root_html)
        self.assertIn("How an app moves from chaos to order.", app_source)
        self.assertIn("Interactive explainer", app_source)
        self.assertIn("Play through eight architecture levels", app_source)
        self.assertIn("8 levels · 34 decisions", app_source)
        self.assertIn("Monolith → Shared Components → Business Modules → App Assembly → Scale", app_source)
        self.assertNotIn(">架构</a>", app_source)
        self.assertNotIn("架构解说", app_source)
        self.assertNotIn("进入交互解说", app_source)

    def test_architecture_explainer_is_written_in_simplified_chinese(self) -> None:
        source = read("src/app-architecture.js") + read("app-architecture/index.html")

        self.assertIn("一个 App，如何从混乱走向秩序", source)
        self.assertIn('<html lang="zh-CN">', source)
        self.assertIn("单体应用", source)
        self.assertIn("通用组件", source)
        self.assertIn("业务模块", source)
        self.assertIn("App 组装", source)
        self.assertIn("从混乱重构到有序", source)
        self.assertIn("拖拽卡片", source)
        self.assertNotIn("How an App learns to scale", source)
        self.assertNotIn("Everything starts close together", source)

    def test_architecture_explainer_models_eight_data_driven_game_levels(self) -> None:
        source = read("src/app-architecture.js")

        self.assertIn("architectureGameLevels", source)
        self.assertIn('id: "extract-shared-capabilities"', source)
        self.assertIn('id: "form-business-modules"', source)
        self.assertIn('id: "own-module-data"', source)
        self.assertIn('id: "control-dependency-direction"', source)
        self.assertIn('id: "design-module-contracts"', source)
        self.assertIn('id: "assemble-the-app"', source)
        self.assertIn('id: "govern-runtime-change"', source)
        self.assertIn('id: "design-failure-recovery"', source)
        self.assertEqual(source.count("principle:"), 8)
        self.assertEqual(source.count("target:"), 34)
        self.assertEqual(source.count("reason:"), 34)
        self.assertIn("assertArchitectureGameContract(architectureGameLevels)", source)
        self.assertIn('if (!zoneIds.has(piece.target))', source)
        self.assertIn("renderGame()", source)
        self.assertIn("placeGamePiece(pieceId, zoneId)", source)

    def test_advanced_game_levels_cover_ownership_contracts_and_recovery(self) -> None:
        source = read("src/app-architecture.js")
        html = read("app-architecture/index.html")

        self.assertIn("收拢数据所有权", source)
        self.assertIn("首页数据边界", source)
        self.assertIn("平台数据边界", source)
        self.assertIn("控制依赖方向", source)
        self.assertIn("Feature → Domain", source)
        self.assertIn("反向依赖待修复", source)
        self.assertIn("设计模块契约", source)
        self.assertIn("Public API", source)
        self.assertIn("Route Contract", source)
        self.assertIn("Domain Event", source)
        self.assertIn("设计失败降级", source)
        self.assertIn("Built-in Baseline", source)
        self.assertIn("Last Known Good", source)
        self.assertIn("Kill Switch", source)
        self.assertIn("Recovery Signals", source)
        self.assertIn("八关架构重构游戏", html)
        self.assertIn("亲手完成八项 App 架构重构任务", html)

    def test_game_teaches_components_and_modules_as_distinct_boundaries(self) -> None:
        source = read("src/app-architecture.js")
        styles = read("src/app-architecture.css")

        self.assertIn("UI 组件库", source)
        self.assertIn("功能组件库", source)
        self.assertIn("首页模块", source)
        self.assertIn("目录模块", source)
        self.assertIn("结算模块", source)
        self.assertIn("组件提供能力，但不替业务做决定", source)
        self.assertIn("模块是一项完整业务", source)
        self.assertIn(".architecture-game__zone", styles)
        self.assertIn("overflow-wrap: anywhere;", styles)

    def test_app_assembly_registers_modules_and_routes_between_them(self) -> None:
        source = read("src/app-architecture.js")

        self.assertIn("App 壳", source)
        self.assertIn("模块注册表", source)
        self.assertIn("Router", source)
        self.assertIn("跨模块跳转协议", source)
        self.assertIn("壳组装模块，Router 传协议", source)
        self.assertIn('target: "app-shell"', source)
        self.assertIn('target: "router"', source)
        self.assertIn('target: "business-modules"', source)
        self.assertIn('target: "shared-components"', source)

    def test_runtime_game_separates_resources_config_delivery_and_telemetry(self) -> None:
        source = read("src/app-architecture.js")
        styles = read("src/app-architecture.css")

        self.assertIn("动态交付 Runtime", source)
        self.assertIn("资源系统", source)
        self.assertIn("内置资源", source)
        self.assertIn("i18n", source)
        self.assertIn("配置与实验", source)
        self.assertIn("Feature Flag / A/B Test", source)
        self.assertIn("Telemetry Runtime", source)
        self.assertIn("Log / 埋点 / 指标", source)
        self.assertIn('target: "delivery-runtime"', source)
        self.assertIn('target: "resource-system"', source)
        self.assertIn('target: "config-experiment"', source)
        self.assertIn('target: "telemetry-runtime"', source)
        self.assertIn("architecture-capabilities", source)
        self.assertIn(".architecture-capabilities", styles)

    def test_pipeline_and_architecture_game_are_independent_sections(self) -> None:
        source = read("src/app-architecture.js")
        styles = read("src/app-architecture.css")

        self.assertIn("pipelineStages", source)
        self.assertIn("architectureGameLevels", source)
        self.assertIn("renderPipelineStages", source)
        self.assertIn("renderPipelineDetail", source)
        self.assertIn("selectPipelineStage", source)
        self.assertIn("renderArchitectureGame", source)
        self.assertNotIn("axisPanels", source)
        self.assertNotIn('axisId: "app-architecture"', source)
        self.assertNotIn("setExpandedAxis", source)
        self.assertNotIn("ResizeObserver", source)
        self.assertIn('id="app-architecture-game"', source)
        self.assertIn('id="delivery-pipeline"', source)
        self.assertIn("architecture-coordinate", source)
        self.assertIn("pipeline-axis", source)
        self.assertIn("pipeline-detail", source)
        self.assertIn("Delivery Pipeline · 独立视角", source)
        self.assertIn("Pipeline 只描述交付生命周期", source)
        self.assertIn("代码变更", source)
        self.assertIn("变更预检", source)
        self.assertIn("多技术栈构建", source)
        self.assertIn("质量与包大小 Gate", source)
        self.assertIn("签名与制品库", source)
        self.assertIn("渐进式发布", source)
        self.assertIn("App Runtime", source)
        self.assertIn("Telemetry 反馈", source)
        self.assertIn("包大小 Gate", source)
        self.assertIn("总量预算", source)
        self.assertIn("模块增量", source)
        self.assertIn("热更增量", source)
        self.assertIn("趋势", source)
        self.assertIn("依赖与资源归因", source)
        self.assertIn("AI 辅助", source)
        self.assertIn("确定性门禁", source)
        self.assertIn("AI 提供证据，不接管门禁", source)
        self.assertIn("保留最终决定权", source)
        self.assertEqual(source.count("inputs: ["), 8)
        self.assertEqual(source.count("actions: ["), 8)
        self.assertEqual(source.count("outputs: ["), 8)
        self.assertEqual(source.count("gates: ["), 8)
        self.assertEqual(source.count("failure:"), 8)
        self.assertEqual(source.count("signals: ["), 8)
        self.assertIn("architectureIcon", source)
        self.assertIn("<svg", source)
        self.assertIn(".architecture-game", styles)
        self.assertIn(".architecture-coordinate", styles)
        self.assertIn(".pipeline-axis", styles)
        self.assertIn(".pipeline-axis__viewport", styles)
        self.assertIn(".pipeline-node", styles)
        self.assertIn(".pipeline-node__icon", styles)
        self.assertIn(".pipeline-detail", styles)
        self.assertIn(".pipeline-detail__flow", styles)
        self.assertIn(".pipeline-detail__safety", styles)
        self.assertIn(".architecture-coordinate.is-in-view", styles)
        self.assertIn("@keyframes architecture-pipeline-flow", styles)
        self.assertNotIn("architecture-delivery__steps", source)

    def test_architecture_explainer_uses_a_bounded_heading_scale(self) -> None:
        styles = read("src/app-architecture.css")

        self.assertIn("font-size: clamp(36px, 4vw, 52px)", styles)
        self.assertIn("font-size: clamp(26px, 2.6vw, 34px)", styles)
        self.assertIn("font-size: clamp(18px, 1.7vw, 23px)", styles)
        self.assertIn("font-size: clamp(18px, 1.45vw, 22px)", styles)
        self.assertIn("font-size: clamp(30px, 8vw, 34px)", styles)
        self.assertNotIn("font-size: clamp(52px, 7vw, 92px)", styles)
        self.assertNotIn("font-size: clamp(42px, 5.4vw, 72px)", styles)
        self.assertNotIn("font-size: 23px", styles)

    def test_architecture_game_and_pipeline_have_independent_motion(self) -> None:
        source = read("src/app-architecture.js")
        styles = read("src/app-architecture.css")

        self.assertIn("IntersectionObserver", source)
        self.assertIn("data-pipeline-node", source)
        self.assertIn('this.addEventListener("dragstart"', source)
        self.assertIn('this.addEventListener("drop"', source)
        self.assertIn("placeGamePiece(pieceId, zoneId)", source)
        self.assertNotIn("data-axis-panel", source)
        self.assertIn("transition:", styles)
        self.assertIn("@keyframes architecture-pipeline-flow", styles)
        self.assertIn(".architecture-game__piece.is-dragging", styles)

    def test_architecture_explainer_has_manual_and_accessible_controls(self) -> None:
        source = read("src/app-architecture.js")
        styles = read("src/app-architecture.css")

        self.assertIn('aria-label="架构重构关卡"', source)
        self.assertIn('aria-label="目标架构边界"', source)
        self.assertIn('aria-live="polite"', source)
        self.assertIn('role="tablist"', source)
        self.assertIn('data-game-piece="${escapeHtml(piece.id)}"', source)
        self.assertIn('data-game-zone="${escapeHtml(zone.id)}"', source)
        self.assertIn('draggable="true"', source)
        self.assertIn('aria-pressed="false"', source)
        self.assertIn('aria-controls="pipeline-detail"', source)
        self.assertNotIn('aria-expanded="true"', source)
        self.assertIn("prefers-reduced-motion: reduce", styles)
        self.assertIn("@media (max-width: 760px)", styles)

    def test_architecture_game_exposes_a_complete_play_loop(self) -> None:
        source = read("src/app-architecture.js")
        styles = read("src/app-architecture.css")

        self.assertIn("data-game-start", source)
        self.assertIn("data-game-moves", source)
        self.assertIn("data-game-streak", source)
        self.assertIn("data-game-reset-level", source)
        self.assertIn("animateRejectedPlacement", source)
        self.assertIn('"piece-rejected"', source)
        self.assertIn('"piece-placed"', source)
        self.assertIn('"architecture-game:event"', source)
        self.assertIn("data-game-progress", source)
        self.assertIn("this.gameShell.dataset.gameLevelId", source)
        self.assertIn("this.gameShell.dataset.gameMoveCount", source)
        self.assertNotIn("this.gameShell.dataset.gameLevel =", source)
        self.assertNotIn("this.gameShell.dataset.gameMoves =", source)
        self.assertIn(".architecture-game__piece.is-accepted", styles)
        self.assertIn(".architecture-game__zone.is-awaiting-piece", styles)
        self.assertIn("@keyframes architecture-game-reject", styles)
        self.assertIn("@keyframes architecture-game-piece-land", styles)
        self.assertIn("@keyframes architecture-game-celebrate", styles)

    def test_architecture_game_uses_shuffled_pieces_and_semantic_topologies(self) -> None:
        source = read("src/app-architecture.js")
        styles = read("src/app-architecture.css")

        self.assertIn("shuffleArchitectureGamePieces", source)
        self.assertIn("createArchitectureGamePieceOrder", source)
        self.assertIn("gamePieceOrderByLevel", source)
        self.assertIn("orderedGamePiecesForActiveLevel", source)
        self.assertIn("previousPieceIds = []", source)
        self.assertIn("disallowedOrders", source)
        self.assertIn("混乱区 · 已随机打乱", source)
        self.assertIn("重置并打乱", source)
        self.assertIn("data-piece-order", source)
        self.assertIn('layout: "shared-capabilities"', source)
        self.assertIn('layout: "business-modules"', source)
        self.assertIn('layout: "data-ownership"', source)
        self.assertIn('layout: "dependency-direction"', source)
        self.assertIn('layout: "module-contracts"', source)
        self.assertIn('layout: "app-assembly"', source)
        self.assertIn('layout: "runtime-platform"', source)
        self.assertIn('layout: "resilience-layers"', source)
        self.assertEqual(source.count("topologyLabel:"), 8)
        self.assertEqual(source.count("blueprint:"), 30)
        self.assertIn('data-architecture-layout="${escapeHtml(level.layout)}"', source)
        self.assertIn('data-zone-role="${escapeHtml(zone.role)}"', source)
        self.assertIn("architecture-game__blueprint", source)
        self.assertIn("architecture-game__topology-header", source)
        self.assertIn('[data-architecture-layout="app-assembly"]', styles)
        self.assertIn('[data-architecture-layout="runtime-platform"]', styles)
        self.assertIn('[data-architecture-layout="data-ownership"]', styles)
        self.assertIn('[data-architecture-layout="dependency-direction"]', styles)
        self.assertIn('[data-architecture-layout="module-contracts"]', styles)
        self.assertIn('[data-architecture-layout="resilience-layers"]', styles)
        self.assertIn(".architecture-game__blueprint", styles)


if __name__ == "__main__":
    unittest.main()
