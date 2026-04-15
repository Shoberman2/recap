Scan the user's git repos and recap their entire coding history.

**Step 1: Find repos and author email.**
```bash
GIT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")
echo "AUTHOR: $GIT_EMAIL"
```

**Step 2: Get all-time commits from all repos.**
```bash
find ~/repos ~/src ~/code ~/projects ~/Developer ~ -maxdepth 4 -name .git -type d 2>/dev/null | sort -u | head -100 | while read gitdir; do
  repo=$(dirname "$gitdir")
  name=$(basename "$repo")
  case "$repo" in *node_modules*|*.cache*|*vendor*|*Library*|*.Trash*|*.cargo*|*.rustup*) continue;; esac
  commits=$(git -C "$repo" log --author="$GIT_EMAIL" --no-merges --oneline 2>/dev/null)
  if [ -n "$commits" ]; then
    count=$(echo "$commits" | wc -l | tr -d ' ')
    echo "=== $name ($count commits) ==="
    git -C "$repo" log --author="$GIT_EMAIL" --no-merges --format="  %s (%ar)" 2>/dev/null | head -20
    echo ""
  fi
done
```

**Step 3:** Read the output and give the user a narrative of their entire coding history on this machine. The full arc, from first commit to today.