"""Memory hygiene tests, including that the repo's own memory/ passes."""

from __future__ import annotations

import io
import sys
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import memlint  # noqa: E402


class MemlintTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.memory = memlint.load_memory_policy()

    def lint(self, content: str, name: str = "facts.md"):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / name
            path.write_text(content, encoding="utf-8")
            return memlint.check_file(path, self.memory)

    def rules(self, content: str, name: str = "facts.md") -> set[str]:
        return {f.rule for f in self.lint(content, name)}


class TestSecrets(MemlintTestCase):
    def test_anthropic_key_is_caught(self):
        self.assertIn("secret", self.rules("- key sk-ant-api03-abcdefghijklmnop\n"))

    def test_github_token_is_caught(self):
        self.assertIn("secret", self.rules("- token ghp_abcdefghijklmnopqrst\n"))

    def test_aws_access_key_is_caught(self):
        self.assertIn("secret", self.rules("- AKIAIOSFODNN7EXAMPLE is the id\n"))

    def test_private_key_header_is_caught(self):
        self.assertIn("secret", self.rules("- -----BEGIN RSA PRIVATE KEY-----\n"))

    def test_assigned_password_is_caught(self):
        self.assertIn("secret", self.rules("- password = hunter2hunter2hunter2\n"))

    def test_secrets_are_caught_inside_code_fences(self):
        content = "- Example:\n\n```\nsk-ant-api03-abcdefghijklmnop\n```\n"
        self.assertIn("secret", self.rules(content))

    def test_prose_about_secrets_is_not_flagged(self):
        content = "- Never store an api key or token in this file.\n"
        self.assertNotIn("secret", self.rules(content))


class TestFormat(MemlintTestCase):
    def test_clean_file_passes(self):
        content = "# Facts\n\n- (2026-07-29) A single durable fact.\n- Another fact.\n"
        self.assertEqual(self.lint(content), [])

    def test_bare_prose_line_is_flagged(self):
        self.assertIn("format", self.rules("# Facts\n\nThis is a paragraph.\n"))

    def test_headings_and_quotes_are_exempt(self):
        content = "# Title\n## Sub\n> a note\n- a fact\n"
        self.assertNotIn("format", self.rules(content))

    def test_fenced_content_is_exempt_from_format(self):
        content = "- Shape:\n\n```python\nx = 1\n```\n"
        self.assertNotIn("format", self.rules(content))

    def test_overlong_entry_is_flagged(self):
        limit = int(self.memory["max_entry_chars"])
        self.assertIn("length", self.rules(f"- {'x' * (limit + 10)}\n"))

    def test_entry_at_limit_passes(self):
        limit = int(self.memory["max_entry_chars"])
        self.assertNotIn("length", self.rules(f"- {'x' * (limit - 2)}\n"))

    def test_prose_files_skip_the_bullet_rule(self):
        content = "# Readme\n\nFree prose is fine here.\n"
        name = self.memory["prose_files"][0]
        self.assertNotIn("format", self.rules(content, name=name))


class TestDatesAndBudget(MemlintTestCase):
    def test_non_iso_date_is_flagged(self):
        self.assertIn("date", self.rules("- (29-07-2026) A fact.\n"))

    def test_slash_date_is_flagged(self):
        self.assertIn("date", self.rules("- Shipped on 07/29/2026 as planned.\n"))

    def test_iso_date_passes(self):
        self.assertNotIn("date", self.rules("- (2026-07-29) A fact.\n"))

    def test_line_budget_is_enforced(self):
        limit = int(self.memory["max_lines"])
        content = "".join(f"- fact {i}\n" for i in range(limit + 5))
        self.assertIn("budget", self.rules(content))

    def test_file_at_budget_passes(self):
        limit = int(self.memory["max_lines"])
        content = "".join(f"- fact {i}\n" for i in range(limit))
        self.assertNotIn("budget", self.rules(content))


class TestRepoMemory(MemlintTestCase):
    def test_repo_memory_directory_is_clean(self):
        targets = memlint.collect_targets(self.memory, [])
        self.assertTrue(targets, "memory/ should contain markdown files")
        findings = [f for p in targets for f in memlint.check_file(p, self.memory)]
        detail = "\n".join(f.render(memlint.REPO_ROOT) for f in findings)
        self.assertEqual(findings, [], f"repo memory is dirty:\n{detail}")

    def run_cli(self, argv: list[str]) -> int:
        with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
            return memlint.main(argv)

    def test_cli_reports_clean_repo(self):
        self.assertEqual(self.run_cli([]), 0)

    def test_cli_flags_a_dirty_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "dirty.md"
            path.write_text("plain prose line\n", encoding="utf-8")
            self.assertEqual(self.run_cli([str(path)]), 1)


if __name__ == "__main__":
    unittest.main()
