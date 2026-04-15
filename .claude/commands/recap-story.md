Scan the user's git repos and tell their developer origin story.

**Step 1: Find repos and author email.**
```bash
GIT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")
echo "AUTHOR: $GIT_EMAIL"
```

**Step 2: Get lifetime commit data with file-level detail from all repos.**
```bash
find ~/repos ~/src ~/code ~/projects ~/Developer ~ -maxdepth 4 -name .git -type d 2>/dev/null | sort -u | head -100 | while read gitdir; do
  repo=$(dirname "$gitdir")
  name=$(basename "$repo")
  case "$repo" in *node_modules*|*.cache*|*vendor*|*Library*|*.Trash*|*.cargo*|*.rustup*) continue;; esac
  commits=$(git -C "$repo" log --author="$GIT_EMAIL" --no-merges --oneline 2>/dev/null)
  if [ -n "$commits" ]; then
    count=$(echo "$commits" | wc -l | tr -d ' ')
    first=$(git -C "$repo" log --author="$GIT_EMAIL" --no-merges --format="%aI" --reverse 2>/dev/null | head -1)
    last=$(git -C "$repo" log --author="$GIT_EMAIL" --no-merges --format="%aI" -1 2>/dev/null)
    echo "=== $name ($count commits, $first to $last) ==="
    git -C "$repo" log --author="$GIT_EMAIL" --no-merges --format="  %aI %s" --numstat 2>/dev/null | head -100
    echo ""
  fi
done
```

**Step 3:** Read the output and give the user their developer origin story. Identify eras (clusters of work on different projects), milestones (first commits, intense sprints), language evolution (from file extensions in numstat), and the overall arc of who they've become as a builder. Make it feel personal and meaningful, not just stats.