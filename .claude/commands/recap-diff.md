Compare two time periods of the user's git history side by side.

Ask the user which two periods to compare if not provided as $ARGUMENTS. Examples: "2024 2025" for years, "2024-01 2024-06" for months.

**Step 1: Parse the two periods and find repos.**
```bash
GIT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")
echo "AUTHOR: $GIT_EMAIL"
```

**Step 2: Get commits from both periods across all repos.**

For each period, run:
```bash
find ~/repos ~/src ~/code ~/projects ~/Developer ~ -maxdepth 4 -name .git -type d 2>/dev/null | sort -u | head -100 | while read gitdir; do
  repo=$(dirname "$gitdir")
  name=$(basename "$repo")
  case "$repo" in *node_modules*|*.cache*|*vendor*|*Library*|*.Trash*|*.cargo*|*.rustup*) continue;; esac
  commits=$(git -C "$repo" log --after="<SINCE>" --before="<UNTIL>" --author="$GIT_EMAIL" --no-merges --oneline 2>/dev/null)
  if [ -n "$commits" ]; then
    count=$(echo "$commits" | wc -l | tr -d ' ')
    echo "=== $name ($count commits) ==="
    git -C "$repo" log --after="<SINCE>" --before="<UNTIL>" --author="$GIT_EMAIL" --no-merges --format="  %s" --numstat 2>/dev/null | head -50
    echo ""
  fi
done
```

Replace `<SINCE>` and `<UNTIL>` with the appropriate dates for each period. For years: "2024-01-01" to "2025-01-01". For months: "2024-01-01" to "2024-02-01".

**Step 3:** Compare the two periods and give the user a narrative. What changed, what grew, what they left behind. New repos started, repos gone inactive, language shifts, intensity changes. Make it a story about their evolution, not just numbers.