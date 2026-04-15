Scan the user's machine for git repos and recap what they've built across multiple time periods.

**Step 1: Find repos and detect author email.**

```bash
# Get the user's git email
GIT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")
echo "AUTHOR: $GIT_EMAIL"

# Find all git repos under common directories (max depth 4, skip noise)
find ~/repos ~/src ~/code ~/projects ~/Developer ~ -maxdepth 4 -name .git -type d 2>/dev/null | sort -u | head -100 | while read gitdir; do
  repo=$(dirname "$gitdir")
  name=$(basename "$repo")
  # Skip common non-project directories
  case "$repo" in *node_modules*|*.cache*|*vendor*|*Library*|*.Trash*|*.cargo*|*.rustup*) continue;; esac
  echo "REPO: $name ($repo)"
done
```

**Step 2: For each time period, get commit stats.** Run git log across all discovered repos for these periods: today, this week, this month, this year, and all time.

For each period, run this in each repo directory:
```bash
git log --after="<since>" --before="<until>" --author="$GIT_EMAIL" --no-merges --format="%H|%s|%aI" --numstat 2>/dev/null
```

**Step 3: Read the output and give the user a warm, personal narrative.** What they built, what stood out, and the overall vibe across each time period. Be specific, reference actual projects and commits, don't just repeat stats. Make it feel like a story about their week/month/year, not a dashboard.