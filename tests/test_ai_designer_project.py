from pathlib import Path
import json
import re
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class AIDesignerProjectTest(unittest.TestCase):
    def test_home_registers_ai_designer_as_a_first_class_project(self) -> None:
        result = subprocess.run(
            [
                "node",
                "--input-type=module",
                "-e",
                "import { projectLinks } from './src/site-data.js'; "
                "const project = projectLinks.find((item) => item.name === 'AI Designer'); "
                "console.log(JSON.stringify({ count: projectLinks.length, project }));",
            ],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)
        app_source = read("src/app.js")
        styles = read("src/styles.css")

        self.assertGreaterEqual(payload["count"], 6)
        self.assertEqual(payload["project"]["siteHref"], "/ai-designer/")
        self.assertEqual(payload["project"]["visual"], "design-system")
        self.assertIn('project.visual === "design-system"', app_source)
        self.assertIn("micro-visual--design-system", styles)
        self.assertIn(".project-card--rose", styles)
        self.assertIn('href="/ai-designer/"', read("index.html"))

    def test_public_surface_explains_the_release_and_review_loop(self) -> None:
        source = (
            read("ai-designer/index.html")
            + read("src/ai-designer.js")
            + read("src/ai-designer-model.mjs")
        )
        expected_terms = (
            "createdBy=user snapshot",
            "Component contract",
            "Cookbook / Widgetbook",
            "Run the real component, not a screenshot",
            "A deliberate snapshot becomes the import boundary",
            "Released foundations arrive as typed Flutter modules",
            "Every use case automatically enters visual coverage",
            "Expected",
            "Actual",
            "Diff",
        )

        for term in expected_terms:
            self.assertIn(term, source)
        self.assertNotIn("/Users/tim", source)
        self.assertNotIn("gitlab.addx.ai", source)

    def test_model_preserves_snapshot_order_and_interactive_preview_modes(self) -> None:
        script = """
          import {
            pipelineStages,
            componentStates,
            createComponentPreview,
            operatingCapabilities,
            previewThemes,
            previewViewports,
            reviewArtifacts,
          } from './src/ai-designer-model.mjs';

          const preview = createComponentPreview(componentStates);
          const visited = [preview.current().id];
          for (let index = 1; index < componentStates.length; index += 1) {
            visited.push(preview.next().id);
          }
          console.log(JSON.stringify({
            pipeline: pipelineStages.map((stage) => stage.id),
            detailedStages: pipelineStages.every((stage) => stage.input && stage.artifact && stage.gate),
            visited,
            wrapped: preview.next().id,
            capabilities: operatingCapabilities.map((item) => item.id),
            themes: previewThemes.map((theme) => theme.id),
            viewports: previewViewports.map((viewport) => viewport.id),
            artifacts: reviewArtifacts.map((artifact) => artifact.id),
          }));
        """
        result = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )

        self.assertEqual(
            json.loads(result.stdout),
            {
                "pipeline": ["snapshot", "foundations", "contract", "component", "review"],
                "detailedStages": True,
                "visited": ["default", "loading", "disabled", "approved"],
                "wrapped": "default",
                "capabilities": ["cookbook", "release", "packages", "review"],
                "themes": ["light", "dark"],
                "viewports": ["desktop", "compact"],
                "artifacts": ["button", "textfield", "badge", "empty"],
            },
        )

    def test_page_uses_token_and_component_layers(self) -> None:
        html = read("ai-designer/index.html")
        script = read("src/ai-designer.js")
        styles = read("src/ai-designer.css")
        tokens = read("src/ai-designer-tokens.css")
        components = read("src/ai-designer-components.mjs")

        self.assertIn('href="../src/ai-designer-tokens.css"', html)
        self.assertIn('from "./ai-designer-components.mjs"', script)
        self.assertIn("createAIDesignerPage", components)
        self.assertIn("renderSectionHeading", components)
        self.assertIn("renderCapabilityCard", components)
        self.assertIn("renderEvidenceArtifact", components)
        for token_family in ("--ds-color-", "--ds-space-", "--ds-radius-", "--ds-type-", "--ds-motion-"):
            self.assertIn(token_family, tokens)
        self.assertIn("@font-face", tokens)
        self.assertIsNone(re.search(r"#[0-9a-fA-F]{3,8}|rgba?\(", styles))
        self.assertIn("prefers-reduced-motion: reduce", styles)

    def test_real_golden_assets_and_font_are_committed_with_provenance(self) -> None:
        model = read("src/ai-designer-model.mjs")
        asset_root = ROOT / "assets" / "ai-designer"
        asset_names = (
            "design-button-state-matrix-light.png",
            "design-text-field-state-matrix-dark.png",
            "design-status-badge-state-matrix-light.png",
            "design-empty-state-interactive-light.png",
        )

        for asset_name in asset_names:
            asset_path = asset_root / asset_name
            self.assertEqual(asset_path.read_bytes()[:8], b"\x89PNG\r\n\x1a\n")
            self.assertIn(f"../assets/ai-designer/{asset_name}", model)
        self.assertTrue((asset_root / "fonts" / "WorkSans-Variable.ttf").is_file())
        self.assertTrue((asset_root / "fonts" / "OFL.txt").is_file())
        self.assertTrue((asset_root / "README.md").is_file())


if __name__ == "__main__":
    unittest.main()
