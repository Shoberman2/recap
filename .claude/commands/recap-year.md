Scan the user's git repos and recap their year.

**Step 1: Find repos and author email.**
```bash
GIT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")
echo "AUTHOR: $GIT_EMAIL"
SINCE=$(date +%Y-01-01T00:00:00)
echo "SINCE: $SINCE"
```

**Step 2: Get this year's commits from all repos.**
```bash
find ~/repos ~/src ~/code ~/projects ~/Developer ~ -maxdepth 4 -name .git -type d 2>/dev/null | sort -u | head -100 | while read gitdir; do
  repo=$(dirname "$gitdir")
  name=$(basename "$repo")
  case "$repo" in *node_modules*|*.cache*|*vendor*|*Library*|*.Trash*|*.cargo*|*.rustup*) continue;; esac
  commits=$(git -C "$repo" log --after="$SINCE" --author="$GIT_EMAIL" --no-merges --oneline 2>/dev/null)
  if [ -n "$commits" ]; then
    count=$(echo "$commits" | wc -l | tr -d ' ')
    echo "=== $name ($count commits) ==="
    git -C "$repo" log --after="$SINCE" --author="$GIT_EMAIL" --no-merges --format="  %s (%ar)" 2>/dev/null
    echo ""
  fi
done
```

**Step 3:** Read the output and give the user a narrative of their year. Arcs, phases, what they've become as a builder. Be specific, reference actual projects.