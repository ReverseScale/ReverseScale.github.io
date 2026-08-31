from pathlib import Path
import json
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class ForgeProjectTest(unittest.TestCase):
    def test_forge_is_a_first_class_personalized_learning_project(self) -> None:
        script = """
          import { projectLinks } from './src/site-data.js';
          const project = projectLinks.find((item) => item.name === 'Forge');
          console.log(JSON.stringify({ count: projectLinks.length, project }));
        """
        result = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        payload = json.loads(result.stdout)

        self.assertGreaterEqual(payload["count"], 6)
        self.assertEqual(
            payload["project"],
            {
                "name": "Forge",
                "label": "Personalized developer training",
                "href": "/forge/",
                "siteHref": "/forge/",
                "status": "Agent learning system",
                "tone": "cobalt",
                "visual": "learning-loop",
                "summary": (
                    "An agent-driven training loop that turns technical goals, "
                    "project context, and answer history into focused questions, "
                    "deeper follow-ups, and a reusable ability map."
                ),
                "points": [
                    "Adaptive questions",
                    "Multi-turn coaching",
                    "Ability memory",
                ],
            },
        )
        self.assertIn('href="/forge/"', read("index.html"))
        self.assertIn('project.visual === "learning-loop"', read("src/app.js"))
        self.assertIn(".project-card--cobalt", read("src/styles.css"))
        self.assertIn(".micro-visual--learning-loop", read("src/styles.css"))

    def test_forge_case_study_explains_the_training_loop_and_boundaries(self) -> None:
        html = read("forge/index.html")
        styles = read("src/forge.css")

        self.assertIn("Turn real project work into deliberate practice.", html)
        self.assertIn('id="loop"', html)
        self.assertIn('id="architecture"', html)
        self.assertIn("Curriculum", html)
        self.assertIn("Generator", html)
        self.assertIn("Interrogator", html)
        self.assertIn("Curator", html)
        self.assertIn("PostgreSQL + pgvector", html)
        self.assertIn("FastAPI", html)
        self.assertIn("Next.js", html)
        self.assertIn("MCP", html)
        self.assertIn('href="../src/forge.css"', html)
        self.assertIn("prefers-reduced-motion: reduce", styles)
        self.assertIn("@media (max-width: 720px)", styles)
        self.assertNotIn("/Users/tim", html)
        self.assertNotIn("dev-token-change-me", html)

    def test_forge_learning_loop_model_preserves_the_agent_handoff(self) -> None:
        script = """
          import { agentStages, createAgentStageCursor } from './src/forge-model.mjs';
          const firstCursor = createAgentStageCursor(agentStages);
          const secondCursor = createAgentStageCursor(agentStages);
          const visited = [firstCursor.current().id];
          for (let index = 1; index < agentStages.length; index += 1) {
            visited.push(firstCursor.next().id);
          }
          console.log(JSON.stringify({
            visited,
            wrapped: firstCursor.next().id,
            independent: secondCursor.current().id,
            completeContracts: agentStages.every((stage) =>
              stage.input && stage.decision && stage.tool && stage.output
            ),
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
                "visited": ["curriculum", "generator", "interrogator", "curator"],
                "wrapped": "curriculum",
                "independent": "curriculum",
                "completeContracts": True,
            },
        )

    def test_forge_page_exposes_an_accessible_interactive_agent_loop(self) -> None:
        html = read("forge/index.html")
        script = read("src/forge.js")
        styles = read("src/forge.css")

        self.assertIn('src="../src/forge.js"', html)
        self.assertEqual(html.count("data-agent-stage="), 4)
        self.assertIn("data-agent-inspector", html)
        self.assertIn("data-loop-play", html)
        self.assertIn('aria-label="Explore the four-agent learning loop"', html)
        self.assertIn('customElements.define("forge-learning-loop"', script)
        self.assertIn('event.key === "ArrowRight"', script)
        self.assertIn('setAttribute("aria-selected"', script)
        self.assertIn(":focus-visible", styles)

    def test_forge_page_explains_product_capabilities_and_delivery_scope(self) -> None:
        html = read("forge/index.html")

        self.assertIn('id="capabilities"', html)
        self.assertEqual(html.count("data-product-capability="), 9)
        for capability in (
            "Weighted learning directions",
            "Project-grounded questions",
            "Deep or quick sessions",
            "Hints and teacher reactions",
            "Ability snapshot and spaced review",
            "A quality-controlled question bank",
            "Web and MCP practice surfaces",
            "Runtime model settings",
            "Per-agent token accounting",
        ):
            self.assertIn(capability, html)

        self.assertIn("Up to four follow-up rounds", html)
        self.assertIn("Three hints per session", html)
        self.assertIn("Usage accounting", html)
        self.assertIn("Input tokens · output tokens", html)
        self.assertIn("Run monitoring", html)
        self.assertIn("Latency · status · error", html)
        self.assertIn('data-scope="available"', html)
        self.assertIn('data-scope="planned"', html)
        for planned_capability in (
            "Sandbox-backed coding evaluation",
            "Ability radar and timeline",
            "Git activity question seeds",
            "Multi-user OAuth and team sharing",
            "Web and MCP usage dashboard with threshold alerts",
        ):
            self.assertIn(planned_capability, html)

    def test_forge_boundary_cards_keep_a_compact_vertical_rhythm(self) -> None:
        html = read("forge/index.html")
        styles = read("src/forge.css")
        outcome_styles = styles[styles.index(".outcome-grid {"):styles.index(".mvp-note {")]
        note_styles = styles[styles.index(".mvp-note {"):styles.index(".mvp-note span {")]

        self.assertIn("align-self: start;", outcome_styles)
        self.assertIn("min-height: 320px;", outcome_styles)
        self.assertIn("margin: 48px 0 24px;", outcome_styles)
        self.assertIn("grid-column: 1 / -1;", note_styles)
        self.assertNotIn("grid-column: 2;", note_styles)
        self.assertIn(
            "</article>\n            <div class=\"mvp-note\">",
            html,
        )
        self.assertNotIn("min-height: 395px;", outcome_styles)
        self.assertNotIn("margin: 94px 0 30px;", outcome_styles)


if __name__ == "__main__":
    unittest.main()
