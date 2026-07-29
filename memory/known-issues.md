# Known issues

> Confirmed behaviour that surprised us, plus the workaround. Not a wishlist.

- (2026-07-29) The Foci config schema in `foci/config.example.toml` is unverified against any installed Foci build — treat every key as a guess until checked.
- (2026-07-29) Codex CLI pricing and context limits are not tracked in `policy.toml`, so cost estimates for `engine = codex` routes are structurally incomplete.
- (2026-07-29) Prompt-cache minimums are not monotonic across models: 512 tokens on Opus 5, but 4096 on Haiku 4.5 — a prefix that caches on Opus silently will not cache on Haiku.
- (2026-07-29) Mid-conversation `role: "system"` messages work on Opus 5 and Opus 4.8 but return 400 on Sonnet 5; catch the error and fall back to a user-turn reminder block.
- (2026-07-29) `memlint.py` scans fenced code blocks for secrets but skips them for formatting rules — a credential in an example block still fails, by design.
