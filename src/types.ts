export interface DateRange {
  since: Date;
  until: Date;
}

export interface RepoInfo {
  path: string;
  name: string;
  remoteUrl?: string;
}

export interface CommitData {
  hash: string;
  message: string;
  date: Date;
  authorEmail: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
  repo: string;
}

export interface FileStats {
  insertions: number;
  deletions: number;
  path: string;
}

export interface RepoStats {
  repo: string;
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  languages: Record<string, number>; // language → lines added
  topFiles: string[];
}

export interface Highlight {
  type: "biggest_commit" | "new_repo" | "longest_streak" | "busiest_day" | "most_active_repo";
  description: string;
  value: string | number;
}

export interface RecapData {
  period: DateRange;
  repoStats: RepoStats[];
  totalCommits: number;
  totalLinesAdded: number;
  totalLinesRemoved: number;
  languages: Record<string, number>;
  highlights: Highlight[];
  busiestDay: { date: string; commits: number } | null;
  longestStreak: number;
  commitMessages: string[];
}

export interface RecapConfig {
  scan_dirs: string[];
  scan_max_depth: number;
  ignore_patterns: string[];
  author_emails: string[];
  default_format: "terminal" | "html";
}
