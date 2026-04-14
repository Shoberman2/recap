import { execSync } from "node:child_process";
import type { CommitData, DateRange, FileStats, RepoInfo } from "./types.js";

const FIELD_SEP = "\x1f"; // Unit Separator between fields
const COMMIT_SEP = "\x1e"; // Record Separator between commits

const GIT_FORMAT = [
  "%H",  // hash
  "%s",  // subject (first line of message)
  "%aI", // author date ISO
  "%ae", // author email
].join(FIELD_SEP);

export function extractCommits(
  repo: RepoInfo,
  period: DateRange,
  authorEmails: string[],
  timeout = 10000,
): CommitData[] {
  const commits: CommitData[] = [];

  for (const email of authorEmails) {
    try {
      const args = [
        "git",
        "log",
        `--format=${COMMIT_SEP}${GIT_FORMAT}`,
        "--numstat",
        `--after=${period.since.toISOString()}`,
        `--before=${period.until.toISOString()}`,
        `--author=${email}`,
        "--no-merges",
      ];

      const output = execSync(args.join(" "), {
        cwd: repo.path,
        timeout,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024, // 10MB
        stdio: ["pipe", "pipe", "pipe"],
      });

      commits.push(...parseGitLog(output, repo.name));
    } catch {
      // Corrupt repo, timeout, etc. — skip silently
    }
  }

  // Deduplicate by hash (in case multiple author emails match)
  const seen = new Set<string>();
  return commits.filter((c) => {
    if (seen.has(c.hash)) return false;
    seen.add(c.hash);
    return true;
  });
}

export function parseGitLog(output: string, repoName: string): CommitData[] {
  const commits: CommitData[] = [];
  if (!output.trim()) return commits;

  // Split by commit separator
  const parts = output.split(COMMIT_SEP).filter((p) => p.trim());

  for (const part of parts) {
    const lines = part.split("\n");
    if (lines.length === 0) continue;

    // First line has the formatted fields
    const headerLine = lines[0];
    const fields = headerLine.split(FIELD_SEP);
    if (fields.length < 4) continue;

    const [hash, message, dateStr, authorEmail] = fields;
    if (!hash || !dateStr) continue;

    // Remaining lines are numstat (insertions\tdeletions\tfilename)
    let insertions = 0;
    let deletions = 0;
    let filesChanged = 0;
    const files: FileStats[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const numstatMatch = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
      if (numstatMatch) {
        filesChanged++;
        // Binary files show "-" for insertions/deletions
        const ins = numstatMatch[1] === "-" ? 0 : parseInt(numstatMatch[1], 10);
        const del = numstatMatch[2] === "-" ? 0 : parseInt(numstatMatch[2], 10);
        insertions += ins;
        deletions += del;
        files.push({ path: numstatMatch[3], insertions: ins, deletions: del });
      }
    }

    commits.push({
      hash: hash.trim(),
      message: message || "(no message)",
      date: new Date(dateStr),
      authorEmail: authorEmail || "",
      filesChanged,
      insertions,
      deletions,
      repo: repoName,
      files,
    });
  }

  return commits;
}
