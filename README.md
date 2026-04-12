# recap

Recap everything you've built on your laptop. Scans all your git repos and shows what you shipped — today, this week, this month, this year, and all time.

Built for [Claude Code](https://claude.ai/code). Type `/recap` and Claude tells you what you've been building.

## Install

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

That registers `/recap`, `/recap-week`, `/recap-month`, `/recap-year`, and `/recap-all` as slash commands in every Claude Code session.

## Setup

```bash
npx tsx ~/recap/src/cli.ts init
```

This scans your machine for git repos and detects your author email. Config is saved to `~/.config/recap/config.json`.

By default, recap scans `~`, `~/repos`, `~/src`, `~/code`, `~/projects`, and `~/Developer`. Edit the config to add your own directories.

## Usage

### In Claude Code

Just type any of these slash commands:

- `/recap` — full overview: today, week, month, year, all time
- `/recap-week` — this week with commit details
- `/recap-month` — this month with commit details
- `/recap-year` — this year stats
- `/recap-all` — all time stats

Claude reads the output and gives you a personal narrative of what you built.

### From the terminal

```bash
npx tsx ~/recap/src/cli.ts          # full overview
npx tsx ~/recap/src/cli.ts week     # this week
npx tsx ~/recap/src/cli.ts month    # this month
npx tsx ~/recap/src/cli.ts year     # this year
npx tsx ~/recap/src/cli.ts all      # all time
```

## How it works

1. **Discover** — scans your filesystem for git repos
2. **Extract** — reads `git log` for each repo in the time period
3. **Analyze** — computes stats, streaks, highlights
4. **Render** — outputs structured text that Claude (or you) can read

No data leaves your machine. No API keys needed. Everything runs locally against your git history.

## Config

Edit `~/.config/recap/config.json`:

```json
{
  "scan_dirs": ["~", "~/code", "~/projects"],
  "scan_max_depth": 4,
  "ignore_patterns": ["node_modules", ".cache", "vendor"],
  "author_emails": ["you@example.com"]
}
```

## License

MIT
