# recap

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/Shoberman2/recap/actions/workflows/ci.yml/badge.svg)](https://github.com/Shoberman2/recap/actions/workflows/ci.yml)
[![Works with Claude Code](https://img.shields.io/badge/works%20with-Claude%20Code-blueviolet)](https://claude.ai/code)
[![GitHub stars](https://img.shields.io/github/stars/Shoberman2/recap?style=social)](https://github.com/Shoberman2/recap)
[![GitHub Discussions](https://img.shields.io/github/discussions/Shoberman2/recap)](https://github.com/Shoberman2/recap/discussions)

Slash commands for [Claude Code](https://claude.ai/code) that recap everything you've built on your laptop. Type `/recap` and Claude scans your git repos and tells you what you shipped.

No CLI to install. No dependencies. No API keys. Just copy the commands.

<!-- Add a demo GIF here — record yourself running /recap in Claude Code -->
<!-- ![demo](assets/demo.gif) -->

## Install

```bash
git clone https://github.com/Shoberman2/recap.git ~/recap && cp ~/recap/.claude/commands/recap*.md ~/.claude/commands/
```

That's it. Open Claude Code and type `/recap`.

## Commands

| Command | What it does |
|---------|-------------|
| `/recap` | Full overview: today, week, month, year, all time |
| `/recap-week` | What you shipped this week |
| `/recap-month` | This month's themes and biggest projects |
| `/recap-year` | Your year as a builder |
| `/recap-all` | Your entire coding history on this machine |
| `/recap-story` | Your developer origin story from lifetime git history |
| `/recap-diff` | Compare two time periods side by side (e.g., 2024 vs 2025) |
| `/recap-session` | Recap the current Claude Code session |

## How it works

Each command tells Claude to run `git log` across all repos on your machine, then narrate what it finds. Claude does the scanning, the analysis, and the storytelling. The commands are just prompts with embedded shell scripts.

- Scans `~`, `~/repos`, `~/src`, `~/code`, `~/projects`, `~/Developer` for git repos
- Filters by your `git config user.email`
- Skips `node_modules`, `.cache`, `vendor`, `Library`
- Everything runs locally. Nothing leaves your machine.

## Share your recap

Run `/recap-story` and post a screenshot — we'd love to see what you've built.

[**Tweet your recap**](https://twitter.com/intent/tweet?text=Just%20ran%20%2Frecap%20in%20Claude%20Code%20and%20got%20a%20narrated%20story%20of%20everything%20I%27ve%20built.%20Wild.%20%23devrecap&url=https%3A%2F%2Fgithub.com%2FShoberman2%2Frecap) | Tag **#devrecap** on Twitter/X

Share and discuss recaps in [GitHub Discussions](https://github.com/Shoberman2/recap/discussions).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for ideas and guidelines.

## License

MIT
