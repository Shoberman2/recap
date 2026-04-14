# TODOS

## Post-v1

### ~~`recap story` — developer origin story~~ DONE (v0.2)
### ~~`recap diff 2023 2024` — year-over-year comparison~~ DONE (v0.2)

### Homebrew tap
- **What:** `brew install recap` via a Homebrew formula
- **Why:** More natural install path for macOS developers than npm
- **Reuses:** GitHub Actions CI/CD pipeline
- **Blocked by:** npm package published and stable
- **Added:** 2026-04-11 via /plan-eng-review

### shape.ts — structural analysis module
- **What:** Pre-compute eras (gap-based clustering), milestones (first commits, intensity spikes), language evolution over time from commit data
- **Why:** If Claude Code narratives from raw data need more deterministic structure, this is the fallback. Enables ASCII timeline visualization and language sparklines.
- **Reuses:** analyze.ts language detection, extract.ts commit data with FileStats
- **Blocked by:** v0.2 shipped (evaluate whether raw data + Claude produces good enough narratives first)
- **Added:** 2026-04-14 via /plan-ceo-review (deferred after outside voice challenge)

### `recap collab` — collaborator analysis
- **What:** Map working relationships from local commit data. Who you ship with, across which repos, over what time periods.
- **Why:** "Nobody has this" — the social graph of building. Unique differentiator for group chat sharing.
- **Reuses:** extract.ts commit data (other committers in shared repos)
- **Blocked by:** PII handling design (git emails in shareable output need hashing/anonymization or opt-in)
- **Added:** 2026-04-14 via /plan-ceo-review (deferred for privacy design)
