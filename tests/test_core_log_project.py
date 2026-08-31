from html.parser import HTMLParser
import json
from pathlib import Path
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class PageTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        if data.strip():
            self.parts.append(data.strip())

    def text(self) -> str:
        return " ".join(" ".join(self.parts).split())


class CoreLogProjectTest(unittest.TestCase):
    def test_home_registers_core_log_as_a_portable_native_runtime(self) -> None:
        script = """
          import { projectLinks } from './src/site-data.js';
          const matches = projectLinks.filter((item) => item.name === 'Core Log');
          console.log(JSON.stringify({ matchCount: matches.length, project: matches[0] }));
        """
        result = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)

        self.assertEqual(payload["matchCount"], 1)
        self.assertEqual(payload["project"]["siteHref"], "/core-log/")
        self.assertEqual(payload["project"]["visual"], "log-runtime")
        self.assertIn("portable C/C++", payload["project"]["summary"])
        self.assertEqual(
            payload["project"]["points"],
            ["Runtime policy control", "Lifecycle-safe bridges", "Bounded diagnosis"],
        )

    def test_project_page_explains_the_portable_contract_and_evidence_lifecycle(self) -> None:
        html = read("core-log/index.html")
        parser = PageTextParser()
        parser.feed(html)
        page_text = parser.text()

        self.assertIn("Every event becomes trustworthy evidence.", page_text)
        self.assertIn("Portable core. Replaceable edges.", page_text)
        self.assertIn("Sanitize before persistence", page_text)
        self.assertIn("Trace the work, not just the error", page_text)
        self.assertIn("Rotate without losing the write path", page_text)
        self.assertIn("One incident. Three logging surfaces.", page_text)
        self.assertIn("App logs", page_text)
        self.assertIn("Service logs", page_text)
        self.assertIn("IoT logs", page_text)
        self.assertIn("Controlled decryption", page_text)
        self.assertIn("Cross-layer diagnosis", page_text)
        self.assertIn("HarmonyOS", page_text)
        self.assertIn("Extension path", page_text)
        self.assertNotIn("Zero-copy", page_text)
        self.assertNotIn("already supports HarmonyOS", page_text)
        self.assertIn('src="write-path-figure.html"', html)
        self.assertIn('href="../src/core-log.css"', html)
        self.assertIn('src="../src/core-log.js"', html)

    def test_project_page_exposes_runtime_assurance_features_without_overclaiming(self) -> None:
        html = read("core-log/index.html")
        css = read("src/core-log.css")
        parser = PageTextParser()
        parser.feed(html)
        page_text = parser.text()

        for expected_claim in (
            "Update the policy, not the SDK",
            "Keep the last known-good policy",
            "Destroy one logger without disturbing another",
            "Rotation is an observable event",
            "Read evidence without exhausting the device",
            "64 MiB",
            "4,096 records",
            "Artifacts are part of the contract",
            "Four Android ABIs",
            "Same-source evidence",
        ):
            self.assertIn(expected_claim, page_text)

        self.assertNotIn("Remote configuration platform", page_text)
        self.assertNotIn("HarmonyOS is currently supported", page_text)
        for surface_class in (
            "policy-console",
            "rotation-contract",
            "lifecycle-ledger",
            "retrieval-guard",
            "proof-ledger",
        ):
            self.assertIn(f'class="{surface_class}', html)
            self.assertIn(f".{surface_class}", css)

    def test_write_path_figure_and_brief_keep_claims_traceable(self) -> None:
        figure = read("core-log/write-path-figure.html")
        brief = json.loads(read("core-log/write-path-brief.json"))

        self.assertEqual(
            set(brief),
            {
                "story_spine",
                "figure_role",
                "selected_context",
                "panels",
                "caption_suggestion",
                "caption_outside_figure",
                "open_assumptions",
            },
        )
        self.assertTrue(brief["caption_outside_figure"])
        self.assertIn('data-figure-panel="A"', figure)
        self.assertIn('data-figure-panel="B"', figure)
        self.assertIn('data-figure-panel="C"', figure)
        self.assertIn('role="img"', figure)
        self.assertIn("Platform adapters", figure)
        self.assertIn("Native evidence pipeline", figure)
        self.assertIn("Durable evidence", figure)
        self.assertIn('<text class="node-label" x="58" y="370">Other VM</text>', figure)
        self.assertNotIn("<tspan", figure)

    def test_pipeline_model_has_explicit_failure_semantics(self) -> None:
        script = """
          import { pipelineStages, createPipelineCursor } from './src/core-log-model.mjs';
          const cursor = createPipelineCursor(pipelineStages);
          const seen = [cursor.current().id];
          for (let index = 1; index < pipelineStages.length; index += 1) seen.push(cursor.next().id);
          console.log(JSON.stringify({ stages: pipelineStages, seen }));
        """
        result = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)

        self.assertEqual(payload["seen"], [stage["id"] for stage in payload["stages"]])
        self.assertGreaterEqual(len(payload["stages"]), 6)
        for stage in payload["stages"]:
            self.assertTrue(stage["input"])
            self.assertTrue(stage["guarantee"])
            self.assertTrue(stage["failure"])

    def test_interactions_emit_observable_semantic_events(self) -> None:
        source = read("src/core-log.js")

        self.assertIn('new CustomEvent("corelog:pipeline-stage"', source)
        self.assertIn('new CustomEvent("corelog:diagnosis-signal"', source)
        self.assertIn("stageId: stage.id", source)
        self.assertIn("signalId: signal.id", source)

    def test_sparse_system_cards_have_semantic_css_glyphs(self) -> None:
        html = read("core-log/index.html")
        css = read("src/core-log.css")

        for glyph in (
            "stage-glyph--accept",
            "stage-glyph--filter",
            "stage-glyph--sanitize",
            "stage-glyph--correlate",
            "stage-glyph--encode",
            "stage-glyph--persist",
            "rotation-glyph--preflight",
            "rotation-glyph--prepare",
            "rotation-glyph--switch",
            "rotation-glyph--retire",
            "adapter-glyph--native",
            "adapter-glyph--flutter",
            "adapter-glyph--harmony",
            "adapter-glyph--other",
        ):
            self.assertIn(glyph, html)

        for icon_name in ("inbox", "list-filter", "shield-check", "git-merge", "braces", "database"):
            icon_path = ROOT / "assets" / "core-log" / f"{icon_name}.svg"
            self.assertTrue(icon_path.is_file(), f"missing icon asset: {icon_name}")
            self.assertIn('stroke-width="1.25"', icon_path.read_text(encoding="utf-8"))
            self.assertIn(f"../assets/core-log/{icon_name}.svg", css)

        self.assertTrue((ROOT / "assets" / "core-log" / "LICENSE.txt").is_file())


if __name__ == "__main__":
    unittest.main()
