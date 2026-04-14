# recap

A CLI that recaps everything you've built on your laptop by reading git history across all your repos.

## Slash Commands

### /recap
Run `npm run dev` and read the output. Then give the user a warm, personal narrative — what they built, what stood out, and the overall vibe across each time period. Be specific, reference actual projects and commits, don't just repeat stats.

### /recap-week
Run `npm run dev -- week` and read the output. Give the user a narrative of their week.

### /recap-month
Run `npm run dev -- month` and read the output. Give the user a narrative of their month — themes, biggest projects, how focus shifted.

### /recap-year
Run `npm run dev -- year` and read the output. Give the user a narrative of their year — arcs, phases, what they've become as a builder.

### /recap-all
Run `npm run dev -- all` and read the output. Give the user a narrative of their entire coding history on this machine.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
