# Contributing to recap

Thanks for wanting to contribute! recap is a small project and contributions are welcome.

## Adding a new command

1. Create a new `.md` file in `.claude/commands/`
2. Follow the pattern of existing commands — Step 1 finds repos, Step 2 runs git log, Step 3 tells Claude how to narrate
3. Add your command to the table in `README.md`
4. Open a PR with a screenshot or paste of the output

## Ideas for new commands

- `/recap-language` — breakdown by programming language over time
- `/recap-streak` — longest commit streaks and most active periods
- `/recap-collab` — who you've worked with most across repos
- `/recap-weekend` — what you build on nights and weekends vs work hours

## Bug reports

Open an issue with:
- What command you ran
- What you expected
- What happened instead

## Style

- Keep commands self-contained — each `.md` file should work independently
- No external dependencies — everything runs with git and standard unix tools
- Narratives over dashboards — Claude should tell a story, not dump stats
