import type { CommitData, DateRange, Highlight, RecapData, RepoStats } from "./types.js";

const EXTENSION_MAP: Record<string, string> = {
  ".ts": "TypeScript", ".tsx": "TypeScript",
  ".js": "JavaScript", ".jsx": "JavaScript", ".mjs": "JavaScript", ".cjs": "JavaScript",
  ".py": "Python",
  ".rs": "Rust",
  ".go": "Go",
  ".rb": "Ruby",
  ".java": "Java",
  ".kt": "Kotlin",
  ".swift": "Swift",
  ".c": "C", ".h": "C",
  ".cpp": "C++", ".cc": "C++", ".cxx": "C++", ".hpp": "C++",
  ".cs": "C#",
  ".php": "PHP",
  ".html": "HTML", ".htm": "HTML",
  ".css": "CSS", ".scss": "SCSS", ".sass": "Sass", ".less": "Less",
  ".json": "JSON",
  ".yaml": "YAML", ".yml": "YAML",
  ".md": "Markdown",
  ".sql": "SQL",
  ".sh": "Shell", ".bash": "Shell", ".zsh": "Shell",
  ".dockerfile": "Docker",
  ".toml": "TOML",
  ".xml": "XML",
  ".vue": "Vue",
  ".svelte": "Svelte",
};

function detectLanguage(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower === "dockerfile" || lower.endsWith("/dockerfile")) return "Docker";

  const lastDot = filePath.lastIndexOf(".");
  if (lastDot === -1) return "Other";

  const ext = filePath.slice(lastDot).toLowerCase();
  return EXTENSION_MAP[ext] || "Other";
}

function computeRepoStats(commits: CommitData[], repoName: string): RepoStats {
  const languages: Record<string, number> = {};
  const fileCounts: Record<string, number> = {};
  let linesAdded = 0;
  let linesRemoved = 0;

  for (const commit of commits) {
    linesAdded += commit.insertions;
    linesRemoved += commit.deletions;
  }

  return {
    repo: repoName,
    commits: commits.length,
    linesAdded,
    linesRemoved,
    languages,
    topFiles: [],
  };
}

function computeLanguages(commits: CommitData[]): Record<string, number> {
  // We don't have per-file data in CommitData, only aggregate insertions.
  // Language detection requires file-level data from numstat.
  // For now, we'll track at the repo level based on file extensions in commit data.
  // This is a simplification — we can enhance later with file-level tracking.
  return {};
}

export function analyze(commits: CommitData[], period: DateRange): RecapData {
  // Group commits by repo
  const byRepo = new Map<string, CommitData[]>();
  for (const commit of commits) {
    const existing = byRepo.get(commit.repo) || [];
    existing.push(commit);
    byRepo.set(commit.repo, existing);
  }

  // Compute per-repo stats
  const repoStats: RepoStats[] = [];
  for (const [repoName, repoCommits] of byRepo) {
    repoStats.push(computeRepoStats(repoCommits, repoName));
  }

  // Sort repos by commit count descending
  repoStats.sort((a, b) => b.commits - a.commits);

  // Aggregate stats
  const totalCommits = commits.length;
  const totalLinesAdded = commits.reduce((sum, c) => sum + c.insertions, 0);
  const totalLinesRemoved = commits.reduce((sum, c) => sum + c.deletions, 0);

  // Busiest day
  const commitsByDay = new Map<string, number>();
  for (const commit of commits) {
    const day = commit.date.toISOString().split("T")[0];
    commitsByDay.set(day, (commitsByDay.get(day) || 0) + 1);
  }
  let busiestDay: { date: string; commits: number } | null = null;
  for (const [date, count] of commitsByDay) {
    if (!busiestDay || count > busiestDay.commits) {
      busiestDay = { date, commits: count };
    }
  }

  // Longest streak (consecutive days with commits)
  const days = [...commitsByDay.keys()].sort();
  let longestStreak = 0;
  let currentStreak = 0;
  for (let i = 0; i < days.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diffMs = curr.getTime() - prev.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  // Highlights
  const highlights: Highlight[] = [];

  // Biggest commit
  if (commits.length > 0) {
    const biggest = commits.reduce((max, c) =>
      c.insertions + c.deletions > max.insertions + max.deletions ? c : max
    );
    highlights.push({
      type: "biggest_commit",
      description: `Biggest commit: "${biggest.message}" in ${biggest.repo}`,
      value: biggest.insertions + biggest.deletions,
    });
  }

  // Most active repo
  if (repoStats.length > 0) {
    highlights.push({
      type: "most_active_repo",
      description: `Most active repo: ${repoStats[0].repo}`,
      value: repoStats[0].commits,
    });
  }

  // Busiest day
  if (busiestDay) {
    highlights.push({
      type: "busiest_day",
      description: `Busiest day: ${busiestDay.date}`,
      value: busiestDay.commits,
    });
  }

  // Longest streak
  if (longestStreak > 1) {
    highlights.push({
      type: "longest_streak",
      description: `Longest streak: ${longestStreak} consecutive days`,
      value: longestStreak,
    });
  }

  // Collect commit messages for narration (cap at 500 for lifetime recaps)
  const sortedCommits = [...commits].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  const cappedCommits = sortedCommits.slice(0, 500);
  const commitMessages = cappedCommits.map(
    (c) => `[${c.repo}] ${c.message}`
  );

  return {
    period,
    repoStats,
    totalCommits,
    totalLinesAdded,
    totalLinesRemoved,
    languages: computeLanguages(commits),
    highlights,
    busiestDay,
    longestStreak,
    commitMessages,
  };
}
