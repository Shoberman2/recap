import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { execSync } from "node:child_process";
import type { RepoInfo, RecapConfig } from "./types.js";
import { getExpandedScanDirs, getConfigDir } from "./config.js";
import { mkdirSync, writeFileSync } from "node:fs";

const REPOS_CACHE_PATH = join(getConfigDir(), "repos.json");

function scanForRepos(
  dir: string,
  ignorePatterns: string[],
  maxDepth: number,
  currentDepth: number = 0,
): RepoInfo[] {
  if (currentDepth >= maxDepth) return [];

  const repos: RepoInfo[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    // EACCES, EPERM, ENOENT — skip silently
    return [];
  }

  for (const entry of entries) {
    if (ignorePatterns.includes(entry)) continue;
    if (entry.startsWith(".") && entry !== ".git") continue;

    const fullPath = join(dir, entry);

    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    // Don't follow symlinks to avoid loops
    if (!stat.isDirectory()) continue;

    if (entry === ".git") {
      // Found a repo — the parent directory is the repo root
      const repoPath = dir;
      const name = basename(dir);
      let remoteUrl: string | undefined;
      try {
        remoteUrl = execSync("git remote get-url origin", {
          cwd: repoPath,
          timeout: 5000,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        }).trim();
      } catch {
        // No remote, that's fine
      }
      repos.push({ path: repoPath, name, remoteUrl });
      // Don't recurse into .git or deeper into this repo's subdirectories
      return repos;
    }

    repos.push(...scanForRepos(fullPath, ignorePatterns, maxDepth, currentDepth + 1));
  }

  return repos;
}

export function discoverRepos(config: RecapConfig): RepoInfo[] {
  const scanDirs = getExpandedScanDirs(config);
  const repos: RepoInfo[] = [];
  const seen = new Set<string>();

  for (const dir of scanDirs) {
    const found = scanForRepos(dir, config.ignore_patterns, config.scan_max_depth);
    for (const repo of found) {
      if (!seen.has(repo.path)) {
        seen.add(repo.path);
        repos.push(repo);
      }
    }
  }

  // Cache the repo list
  try {
    mkdirSync(getConfigDir(), { recursive: true });
    writeFileSync(REPOS_CACHE_PATH, JSON.stringify(repos, null, 2));
  } catch {
    // Non-fatal
  }

  return repos;
}

export function getCachedRepos(): RepoInfo[] | null {
  try {
    if (!existsSync(REPOS_CACHE_PATH)) return null;
    const raw = readFileSync(REPOS_CACHE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function detectAuthorEmails(repos: RepoInfo[]): string[] {
  const emails = new Set<string>();

  for (const repo of repos) {
    try {
      const email = execSync("git config user.email", {
        cwd: repo.path,
        timeout: 5000,
        encoding: "utf-8",
      }).trim();
      if (email) emails.add(email);
    } catch {
      // No email configured for this repo
    }
  }

  return [...emails];
}
