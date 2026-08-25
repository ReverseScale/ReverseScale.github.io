from pathlib import Path
import json
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class MobileLabProjectTest(unittest.TestCase):
    def test_mobilelab_is_a_first_class_quality_project(self) -> None:
        source = read("src/site-data.js") + read("src/app.js") + read("index.html")
        script = """
          import { projectLinks } from './src/site-data.js';
          const project = projectLinks.find((item) => item.siteHref === '/mobile-lab/');
          console.log(JSON.stringify({ name: project?.name, siteHref: project?.siteHref }));
        """
        result = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )

        self.assertEqual(json.loads(result.stdout), {
            "name": "Mobile Lab",
            "siteHref": "/mobile-lab/",
        })
        self.assertIn('siteHref: "/mobile-lab/"', source)
        self.assertIn('visual: "device-flow"', source)
        self.assertIn('<a href="/mobile-lab/">Mobile Lab</a>', source)
        self.assertIn('<title>Mobile Lab — Quality at device-farm efficiency | Tim</title>', read("mobile-lab/index.html"))
        self.assertIn('<strong>Mobile Lab</strong>', read("src/mobile-lab.js"))
        self.assertIn("AI test orchestration", source)
        self.assertIn("App & IoT device farm", source)
        self.assertTrue((ROOT / "mobile-lab" / "index.html").is_file())

    def test_mobilelab_home_visual_uses_the_same_tinted_surface_contract(self) -> None:
        styles = read("src/styles.css")
        visual_block = styles.split(".micro-visual--device-flow {", 1)[1].split("}", 1)[0]
        ai_block = styles.split(".device-flow-ai {", 1)[1].split("}", 1)[0]
        fleet_block = styles.split(".device-flow-fleet i {", 1)[1].split("}", 1)[0]
        signal_block = styles.split(".device-flow-signal {", 1)[1].split("}", 1)[0]

        self.assertIn("background: var(--violet-soft);", visual_block)
        self.assertIn("padding: 9px 12px;", visual_block)
        self.assertIn("background: rgba(251, 250, 247, 0.72);", ai_block)
        self.assertIn("background: rgba(251, 250, 247, 0.72);", fleet_block)
        self.assertIn("background: rgba(251, 250, 247, 0.82);", signal_block)

    def test_mobilelab_models_the_full_quality_loop(self) -> None:
        script = """
          import { flowStages, isTerminalFlowStage } from './src/mobile-lab-flow.mjs';
          import {
            explorationStates,
            interactionMoments,
            planTasks,
            replayMarkers,
            showcaseScenario,
            storyCapabilities,
          } from './src/mobile-lab-story.mjs';
          const capabilityIds = new Set(storyCapabilities.map((item) => item.id));
          console.log(JSON.stringify({
            flow: flowStages.map((item) => item.id),
            terminalAtGate: isTerminalFlowStage(flowStages.at(-1).id),
            explorationCount: explorationStates.length,
            taskCount: planTasks.length,
            momentIds: interactionMoments.map((item) => item.id),
            markerKinds: replayMarkers.map((item) => item.kind),
            missingCapabilities: planTasks.flatMap((task) =>
              task.capabilityIds.filter((id) => !capabilityIds.has(id))
            ),
            terminal: showcaseScenario.terminal,
            qualityDecision: showcaseScenario.qualityDecision,
          }));
        """
        result = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)

        self.assertEqual(payload["flow"], [
            "change", "pipeline", "plan", "lease", "execute", "evidence", "gate",
        ])
        self.assertTrue(payload["terminalAtGate"])
        self.assertEqual(payload["explorationCount"], 6)
        self.assertEqual(payload["taskCount"], 5)
        self.assertEqual(payload["momentIds"], ["pair", "live", "alert"])
        self.assertEqual(payload["markerKinds"], ["Step", "Action", "IoT Event", "Log", "Decision"])
        self.assertEqual(payload["missingCapabilities"], [])
        self.assertNotEqual(payload["terminal"], payload["qualityDecision"])

    def test_mobilelab_renders_navigable_sections_and_precise_edges(self) -> None:
        script = """
          import {
            renderExplorationSection,
            renderInteractionSection,
            renderPlanSection,
            renderReplaySection,
          } from './src/mobile-lab-story-view.mjs';
          const exploration = renderExplorationSection();
          console.log(JSON.stringify({
            sections: [renderPlanSection(), renderInteractionSection(), renderReplaySection()]
              .map((html) => /id=\"([^\"]+)\"/.exec(html)?.[1]),
            stateButtons: (exploration.match(/data-exploration-state=/g) || []).length,
            directedEdges: (exploration.match(/marker-end=\"url\(#exploration-arrow\)\"/g) || []).length,
            edgeSources: (exploration.match(/data-edge-from=/g) || []).length,
            edgeTargets: (exploration.match(/data-edge-to=/g) || []).length,
          }));
        """
        result = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )

        self.assertEqual(json.loads(result.stdout), {
            "sections": ["plan", "run", "replay"],
            "stateButtons": 6,
            "directedEdges": 5,
            "edgeSources": 5,
            "edgeTargets": 5,
        })
        view_source = read("src/mobile-lab-story-view.mjs")
        self.assertIn("updateExplorationEdgePaths", view_source)
        self.assertIn("ResizeObserver", view_source)

    def test_mobilelab_surface_is_responsive_and_redacted(self) -> None:
        source = "".join(read(path) for path in (
            "mobile-lab/index.html",
            "src/mobile-lab.js",
            "src/mobile-lab-flow.mjs",
            "src/mobile-lab-story.mjs",
            "src/mobile-lab-story-view.mjs",
        ))
        styles = read("src/mobile-lab.css") + read("src/mobile-lab-story.css")

        self.assertIn("LangGraph-based", source)
        self.assertIn("Capability request", source)
        self.assertIn("Simulated walkthrough", source)
        self.assertIn("Timeline unavailable", source)
        self.assertIn("@media (max-width: 1024px)", styles)
        self.assertIn("@media (max-width: 680px)", styles)
        self.assertIn("prefers-reduced-motion: reduce", styles)
        for private_name in ("device-cloud", "devium-ai", "addx", "gitlab.addx.ai"):
            self.assertNotIn(private_name, source.lower())
        for asset_name in ("device-cluster.webp", "mobile-rack.webp", "iot-bench.webp"):
            self.assertTrue((ROOT / "assets" / "mobile-lab" / asset_name).is_file())


if __name__ == "__main__":
    unittest.main()
