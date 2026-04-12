# TODOS

## Post-v1

### `recap story` — developer origin story
- **What:** Add `recap story` command that reads lifetime history and generates a narrative of your evolution as a developer
- **Why:** Emotional peak of the tool. The "whoa" feature people would share
- **Reuses:** analyze.ts commit curation (500-commit cap logic), narrate.ts pipeline
- **Blocked by:** Core pipeline (week/month) working first
- **Added:** 2026-04-11 via /plan-eng-review

### `recap diff 2023 2024` — year-over-year comparison
- **What:** Compare two time periods side by side. Languages, repos, commit frequency, narrative "what changed"
- **Why:** The mirror over time. "Am I writing more tests? Different languages?"
- **Reuses:** Two RecapData objects from cache/pipeline, analyze.ts
- **Blocked by:** Core pipeline and caching working first
- **Added:** 2026-04-11 via /plan-eng-review

### Homebrew tap
- **What:** `brew install recap` via a Homebrew formula
- **Why:** More natural install path for macOS developers than npm
- **Reuses:** GitHub Actions CI/CD pipeline
- **Blocked by:** npm package published and stable
- **Added:** 2026-04-11 via /plan-eng-review
