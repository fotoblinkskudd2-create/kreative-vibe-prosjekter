# Cost control

Every input token is paid capital. Ranked by leverage.

> Prices below are Anthropic first-party rates cached 2026-06-24 in
> `orchestration/policy.toml`. Verify at
> <https://platform.claude.com/docs/en/pricing> before quoting them. Bedrock and
> Vertex are partner-operated with separate pricing.

## 1. Prompt caching

The largest lever, and the easiest to break.

| | Multiplier vs base input |
| --- | --- |
| Cache read | 0.1x |
| Cache write, 5m TTL | 1.25x |
| Cache write, 1h TTL | 2.0x |

Break-even is **2 reads** at 5m TTL, **3 reads** at 1h. Below that, caching costs
more than it saves — don't cache a prompt whose prefix differs every request.

**Cache is a prefix match.** Render order is `tools → system → messages`. One
changed byte invalidates every breakpoint after it. Max 4 breakpoints.

Minimum cacheable prefix is **not uniform, and not monotonic across tiers**:

| Model | Minimum |
| --- | --- |
| `claude-opus-5` | 512 tokens |
| `claude-sonnet-5` | 1024 tokens |
| `claude-haiku-4-5` | 4096 tokens |

A 2K-token prefix caches on Opus and silently does not on Haiku — no error, just
`cache_creation_input_tokens: 0`. This is the trap in cheap-first routing.

**Silent invalidators.** Grep for these in anything feeding the prefix:

- `datetime.now()` / `Date.now()` in the system prompt
- UUIDs or request IDs early in content
- `json.dumps()` without `sort_keys=True`; iterating a `set`
- session or user id interpolated into the system prompt
- conditional system sections — every flag combination is a distinct prefix
- a tool set that varies per user (tools render at position 0)

**Verify, don't assume.** `usage.cache_read_input_tokens` at zero across repeated
identical-prefix requests means an invalidator is live. Note that
`input_tokens` is only the *uncached remainder* — total prompt size is
`input_tokens + cache_creation_input_tokens + cache_read_input_tokens`.

## 2. Route cheap first

Haiku for classification, summarisation, routing, extraction, simple tool calls.
Sonnet for most production work. Opus for architecture, deep review, and
high-stakes correctness. Escalate on a failed quality gate, never on a hunch.

Let the router decide: `python3 orchestration/route.py "task" --json`.

## 3. Effort

`output_config: {effort: "low"|"medium"|"high"|"xhigh"|"max"}` — nested, not
top-level. Default is `high`.

- `low` — short scoped tasks, latency-sensitive, not intelligence-sensitive
- `medium` — cost-sensitive step-down
- `high` — default for intelligence-sensitive work
- `xhigh` — coding and agentic work; the best setting for those
- `max` — correctness outranks cost; can overthink simpler tasks

Higher effort up front often *reduces* total cost on agentic work by cutting turn
count. Sweep it against real evals rather than assuming monotonic spend.

## 4. Batch

50% off all token usage for anything not latency-sensitive. Most batches finish
within an hour. Results arrive in any order — key by `custom_id`, never position.

## 5. Front-load static context

Durable context belongs in `CLAUDE.md`, `AGENTS.md`, `foci/`, and `memory/` — read
once, cached, never re-sent. Re-sending the same static block every turn is the
most common avoidable spend in this kernel.

## 6. Context hygiene

- Compact at 60% window used.
- Drop tool noise, intermediate logs, failed attempts — after extracting the durable lesson into `memory/`.
- Long loops compound: send the diff and the failing output, not the whole repo.
- Do not re-read a file you just wrote to confirm the write.
- Keep memory files under 300 lines; `memlint.py` enforces it.

## 7. Declare the class

State an estimated cost class — low / medium / high — before starting heavy work.
It is cheap to say and it makes overspend visible before it happens.
