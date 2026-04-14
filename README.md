# Recap

A developer diary that writes itself. Scans every git repo on your machine and tells you what you shipped — today, this week, this month, this year, and all time. No dashboards, no manual logging... just your git history turned into a personal narrative.

Built for [Claude Code](https://claude.ai/code). Type `/recap` in your terminal and Claude tells you what you've been building.

## Prerequisites

Install Claude Code: https://docs.anthropic.com/en/docs/claude-code/getting-started

## Install

Install globally via npm:

```bash
npm install -g recap-cli
```

**Or** clone the repo:

```bash
git clone https://github.com/Shoberman2/recap.git ~/recap
cd ~/recap
npm install
npm run build
```

Then add the slash commands to your global Claude Code instructions:

```bash
cat ~/recap/CLAUDE.md >> ~/.claude/CLAUDE.md
```

## Commands

| Command | What it does |
|---------|-------------|
| `/recap` | Full overview — today, week, month, year, all time |
| `/recap-week` | This week's commits with details |
| `/recap-month` | This month's themes and biggest projects |
| `/recap-year` | This year's stats and arcs |
| `/recap-all` | Your entire coding history on this machine |

## How it works

Recap discovers git repos across your filesystem, reads `git log` for each one, computes stats and streaks, and outputs structured text that Claude turns into a warm, personal narrative. No data leaves your machine. No API keys needed. Everything runs locally.

## Upcoming

- **`recap story`** — developer origin story. Reads your lifetime git history and generates a narrative of your evolution as a builder.
- **`recap diff 2023 2024`** — year-over-year comparison. Compare languages, repos, commit frequency, and see what changed.
- **Homebrew tap** — `brew install recap` for a more natural macOS install path.
