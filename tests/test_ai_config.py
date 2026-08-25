import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class AIConfigProjectTest(unittest.TestCase):
    def test_runner_routing_keeps_roles_stable_when_providers_change(self) -> None:
        script = """
          import { createRoomRouting, runnerCatalog } from './src/ai-config-model.mjs';
          const defaultRouting = createRoomRouting();
          const swappedRouting = createRoomRouting({
            planning: 'claude-code',
            execution: 'gpt-sol',
          });
          console.log(JSON.stringify({
            runners: runnerCatalog.map(({ id, label }) => ({ id, label })),
            defaultRouting,
            swappedRouting,
          }));
        """
        result = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            json.loads(result.stdout),
            {
                "runners": [
                    {"id": "gpt-sol", "label": "GPT-5.6 Sol"},
                    {"id": "claude-code", "label": "Claude Code"},
                ],
                "defaultRouting": [
                    {
                        "role": "planning",
                        "label": "Plan & accept",
                        "runnerId": "gpt-sol",
                        "runnerLabel": "GPT-5.6 Sol",
                        "scope": "reason · review",
                    },
                    {
                        "role": "execution",
                        "label": "Implement & test",
                        "runnerId": "claude-code",
                        "runnerLabel": "Claude Code",
                        "scope": "edit · tools · test",
                    },
                ],
                "swappedRouting": [
                    {
                        "role": "planning",
                        "label": "Plan & accept",
                        "runnerId": "claude-code",
                        "runnerLabel": "Claude Code",
                        "scope": "reason · review",
                    },
                    {
                        "role": "execution",
                        "label": "Implement & test",
                        "runnerId": "gpt-sol",
                        "runnerLabel": "GPT-5.6 Sol",
                        "scope": "edit · tools · test",
                    },
                ],
            },
        )

    def test_case_study_exposes_the_full_ai_environment_lifecycle(self) -> None:
        html = read("ai-config/index.html")

        self.assertIn('src="../src/ai-config.js"', html)
        self.assertIn('data-route-preset="default"', html)
        self.assertIn('data-route-preset="swapped"', html)
        self.assertNotIn("<b>Grok</b>", html)
        for capability in (
            "bootstrap",
            "instructions",
            "capabilities",
            "continuity",
            "isolation",
            "evidence",
        ):
            self.assertIn(f'data-capability="{capability}"', html)


if __name__ == "__main__":
    unittest.main()
