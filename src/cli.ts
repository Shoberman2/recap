#!/usr/bin/env node

import { loadConfig, saveConfig } from "./config.js";
import { discoverRepos, detectAuthorEmails } from "./discover.js";
import { extractCommits } from "./extract.js";
import { analyze } from "./analyze.js";
import type { DateRange, RecapData, CommitData, RepoInfo } from "./types.js";

function getDayRange(): DateRange {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  return { since: startOfDay, until: now };
}

function getWeekRange(): DateRange {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return { since: monday, until: now };
}

function getMonthRange(): DateRange {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return { since: firstOfMonth, until: now };
}

function getYearRange(): DateRange {
  const now = new Date();
  const firstOfYear = new Date(now.getFullYear(), 0, 1);
  return { since: firstOfYear, until: now };
}

function getAllTimeRange(): DateRange {
  return { since: new Date(2000, 0, 1), until: new Date() };
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function renderSection(label: string, data: RecapData, showCommits: boolean): void {
  const since = formatDate(data.period.since);
  const until = formatDate(data.period.until);

  console.log(`=== ${label}: ${since} → ${until} ===`);
  console.log();

  if (data.totalCommits === 0) {
    console.log("No commits.");
    console.log();
    return;
  }

  console.log(`${data.totalCommits} commits across ${data.repoStats.length} repos`);
  console.log(`+${data.totalLinesAdded.toLocaleString()} / -${data.totalLinesRemoved.toLocaleString()} lines`);
  if (data.longestStreak > 1) {
    console.log(`${data.longestStreak}-day streak`);
  }
  if (data.busiestDay) {
    console.log(`Busiest day: ${data.busiestDay.date} (${data.busiestDay.commits} commits)`);
  }
  console.log();

  console.log("repos:");
  for (const repo of data.repoStats) {
    console.log(`  ${repo.repo}: ${repo.commits} commits (+${repo.linesAdded}/-${repo.linesRemoved})`);
  }
  console.log();

  if (data.highlights.length > 0) {
    console.log("highlights:");
    for (const h of data.highlights) {
      console.log(`  ${h.description}`);
    }
    console.log();
  }

  if (showCommits && data.commitMessages.length > 0) {
    console.log("commits:");
    for (const msg of data.commitMessages) {
      console.log(`  ${msg}`);
    }
    console.log();
  }
}

function extractForPeriod(
  repos: RepoInfo[],
  period: DateRange,
  emails: string[],
  options?: { timeout?: number; progress?: boolean },
): CommitData[] {
  const allCommits: CommitData[] = [];
  for (let i = 0; i < repos.length; i++) {
    if (options?.progress) {
      process.stderr.write(`\rScanning repo ${i + 1}/${repos.length}: ${repos[i].name}...`);
    }
    allCommits.push(...extractCommits(repos[i], period, emails, options?.timeout));
  }
  if (options?.progress) {
    process.stderr.write("\r" + " ".repeat(60) + "\r");
  }
  return allCommits;
}

function runRecap(): void {
  const config = loadConfig();

  const repos = discoverRepos(config);
  if (repos.length === 0) {
    console.log("No repos found. Run `recap init` to configure scan directories.");
    return;
  }

  let emails = config.author_emails;
  if (emails.length === 0) {
    emails = detectAuthorEmails(repos);
    if (emails.length === 0) {
      console.log("No git author email found. Run `recap init` to configure.");
      return;
    }
  }

  const sections: { label: string; period: DateRange; showCommits: boolean }[] = [
    { label: "TODAY", period: getDayRange(), showCommits: true },
    { label: "THIS WEEK", period: getWeekRange(), showCommits: true },
    { label: "THIS MONTH", period: getMonthRange(), showCommits: false },
    { label: "THIS YEAR", period: getYearRange(), showCommits: false },
    { label: "ALL TIME", period: getAllTimeRange(), showCommits: false },
  ];

  console.log();
  for (const section of sections) {
    const commits = extractForPeriod(repos, section.period, emails);
    const data = analyze(commits, section.period);
    renderSection(section.label, data, section.showCommits);
  }
}

function runSection(label: string, periodFn: () => DateRange, showCommits: boolean): void {
  const config = loadConfig();
  const repos = discoverRepos(config);
  if (repos.length === 0) {
    console.log("No repos found. Run `recap init` to configure scan directories.");
    return;
  }

  let emails = config.author_emails;
  if (emails.length === 0) {
    emails = detectAuthorEmails(repos);
    if (emails.length === 0) {
      console.log("No git author email found. Run `recap init` to configure.");
      return;
    }
  }

  const period = periodFn();
  const commits = extractForPeriod(repos, period, emails);
  const data = analyze(commits, period);
  console.log();
  renderSection(label, data, showCommits);
}

function renderStory(data: RecapData): void {
  const since = formatDate(data.period.since);
  const until = formatDate(data.period.until);

  console.log("=== YOUR DEVELOPER STORY ===");
  console.log();

  if (data.totalCommits === 0) {
    console.log("No commits found.");
    console.log();
    return;
  }

  console.log(`Timeline: ${since} → ${until}`);
  console.log(`Total: ${data.totalCommits.toLocaleString()} commits across ${data.repoStats.length} repos`);
  console.log(`+${data.totalLinesAdded.toLocaleString()} / -${data.totalLinesRemoved.toLocaleString()} lines`);
  if (data.longestStreak > 1) {
    console.log(`Longest streak: ${data.longestStreak} consecutive days`);
  }
  if (data.busiestDay) {
    console.log(`Busiest day: ${data.busiestDay.date} (${data.busiestDay.commits} commits)`);
  }
  console.log();

  // Language breakdown
  const langEntries = Object.entries(data.languages).sort((a, b) => b[1] - a[1]);
  if (langEntries.length > 0) {
    const totalLines = langEntries.reduce((sum, [, n]) => sum + n, 0);
    console.log("languages:");
    for (const [lang, lines] of langEntries.slice(0, 10)) {
      const pct = totalLines > 0 ? Math.round((lines / totalLines) * 100) : 0;
      console.log(`  ${lang}: ${pct}% (${lines.toLocaleString()} lines)`);
    }
    console.log();
  }

  // Per-repo stats
  console.log("repos:");
  for (const repo of data.repoStats) {
    const langSummary = Object.entries(repo.languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang)
      .join(", ");
    console.log(`  ${repo.repo}: ${repo.commits} commits (+${repo.linesAdded.toLocaleString()}/-${repo.linesRemoved.toLocaleString()})${langSummary ? ` [${langSummary}]` : ""}`);
  }
  console.log();

  // Highlights
  if (data.highlights.length > 0) {
    console.log("highlights:");
    for (const h of data.highlights) {
      console.log(`  ${h.description}`);
    }
    console.log();
  }

  // Commit messages (capped)
  if (data.commitMessages.length > 0) {
    console.log(`recent commits (${data.commitMessages.length} of ${data.totalCommits}):`);
    for (const msg of data.commitMessages.slice(0, 50)) {
      console.log(`  ${msg}`);
    }
    if (data.commitMessages.length > 50) {
      console.log(`  ... and ${data.commitMessages.length - 50} more`);
    }
    console.log();
  }
}

function renderDiff(label: string, data1: RecapData, data2: RecapData, period1Label: string, period2Label: string): void {
  console.log(`=== RECAP DIFF: ${period1Label} vs ${period2Label} ===`);
  console.log();

  const pad = (s: string, n: number) => s.padStart(n);

  console.log(`${"".padEnd(20)}${pad(period1Label, 15)}${pad(period2Label, 15)}${pad("Delta", 15)}`);

  // Commits
  const commitDelta = data2.totalCommits - data1.totalCommits;
  const commitPct = data1.totalCommits > 0 ? Math.round((commitDelta / data1.totalCommits) * 100) : 0;
  console.log(`${"Commits:".padEnd(20)}${pad(data1.totalCommits.toLocaleString(), 15)}${pad(data2.totalCommits.toLocaleString(), 15)}${pad(`${commitDelta >= 0 ? "+" : ""}${commitPct}%`, 15)}`);

  // Repos
  const repoDelta = data2.repoStats.length - data1.repoStats.length;
  console.log(`${"Repos active:".padEnd(20)}${pad(String(data1.repoStats.length), 15)}${pad(String(data2.repoStats.length), 15)}${pad(`${repoDelta >= 0 ? "+" : ""}${repoDelta}`, 15)}`);

  // Lines added
  const linesDelta = data2.totalLinesAdded - data1.totalLinesAdded;
  const linesPct = data1.totalLinesAdded > 0 ? Math.round((linesDelta / data1.totalLinesAdded) * 100) : 0;
  console.log(`${"Lines added:".padEnd(20)}${pad(data1.totalLinesAdded.toLocaleString(), 15)}${pad(data2.totalLinesAdded.toLocaleString(), 15)}${pad(`${linesDelta >= 0 ? "+" : ""}${linesPct}%`, 15)}`);

  // Streaks
  console.log(`${"Longest streak:".padEnd(20)}${pad(`${data1.longestStreak} days`, 15)}${pad(`${data2.longestStreak} days`, 15)}${pad(`${data2.longestStreak - data1.longestStreak >= 0 ? "+" : ""}${data2.longestStreak - data1.longestStreak}`, 15)}`);

  console.log();

  // Languages comparison
  const langs1 = Object.keys(data1.languages).sort();
  const langs2 = Object.keys(data2.languages).sort();
  const newLangs = langs2.filter(l => !langs1.includes(l) && l !== "Other");
  const goneLangs = langs1.filter(l => !langs2.includes(l) && l !== "Other");

  if (newLangs.length > 0 || goneLangs.length > 0) {
    console.log("language changes:");
    if (newLangs.length > 0) console.log(`  New: ${newLangs.join(", ")}`);
    if (goneLangs.length > 0) console.log(`  Gone: ${goneLangs.join(", ")}`);
    console.log();
  }

  // New/gone repos
  const repos1 = new Set(data1.repoStats.map(r => r.repo));
  const repos2 = new Set(data2.repoStats.map(r => r.repo));
  const newRepos = [...repos2].filter(r => !repos1.has(r));
  const goneRepos = [...repos1].filter(r => !repos2.has(r));

  if (newRepos.length > 0) {
    console.log(`new in ${period2Label}:`);
    for (const r of newRepos) console.log(`  ${r}`);
    console.log();
  }
  if (goneRepos.length > 0) {
    console.log(`inactive in ${period2Label}:`);
    for (const r of goneRepos) console.log(`  ${r}`);
    console.log();
  }

  // Top projects comparison
  const top1 = data1.repoStats.slice(0, 5);
  const top2 = data2.repoStats.slice(0, 5);
  if (top1.length > 0 || top2.length > 0) {
    console.log("top projects (by commits):");
    if (top1.length > 0) console.log(`  ${period1Label}: ${top1.map(r => `${r.repo} (${r.commits})`).join(", ")}`);
    if (top2.length > 0) console.log(`  ${period2Label}: ${top2.map(r => `${r.repo} (${r.commits})`).join(", ")}`);
    console.log();
  }
}

export function parsePeriod(input: string): DateRange | null {
  // Year: "2024"
  const yearMatch = input.match(/^(\d{4})$/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    return { since: new Date(year, 0, 1), until: new Date(year + 1, 0, 1) };
  }

  // Quarter with year: "2024-q1"
  const yearQuarterMatch = input.match(/^(\d{4})-?q([1-4])$/i);
  if (yearQuarterMatch) {
    const year = parseInt(yearQuarterMatch[1], 10);
    const q = parseInt(yearQuarterMatch[2], 10);
    const startMonth = (q - 1) * 3;
    return { since: new Date(year, startMonth, 1), until: new Date(year, startMonth + 3, 1) };
  }

  // Quarter without year: "q1" (current year)
  const quarterMatch = input.match(/^q([1-4])$/i);
  if (quarterMatch) {
    const year = new Date().getFullYear();
    const q = parseInt(quarterMatch[1], 10);
    const startMonth = (q - 1) * 3;
    return { since: new Date(year, startMonth, 1), until: new Date(year, startMonth + 3, 1) };
  }

  // Month: "2024-01"
  const monthMatch = input.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const year = parseInt(monthMatch[1], 10);
    const month = parseInt(monthMatch[2], 10) - 1;
    if (month < 0 || month > 11) return null;
    return { since: new Date(year, month, 1), until: new Date(year, month + 1, 1) };
  }

  return null;
}

function runStory(): void {
  const config = loadConfig();
  const repos = discoverRepos(config);
  if (repos.length === 0) {
    console.log("No repos found. Run `recap init` to configure scan directories.");
    return;
  }

  let emails = config.author_emails;
  if (emails.length === 0) {
    emails = detectAuthorEmails(repos);
    if (emails.length === 0) {
      console.log("No git author email found. Run `recap init` to configure.");
      return;
    }
  }

  const period = getAllTimeRange();
  const commits = extractForPeriod(repos, period, emails, { timeout: 30000, progress: true });
  const data = analyze(commits, period);
  console.log();
  renderStory(data);
}

function runDiff(period1Str: string, period2Str: string): void {
  const period1 = parsePeriod(period1Str);
  const period2 = parsePeriod(period2Str);

  if (!period1 || !period2) {
    console.log("Invalid period format. Examples:");
    console.log("  recap diff 2024 2025          (years)");
    console.log("  recap diff q1 q2              (quarters, current year)");
    console.log("  recap diff 2024-q1 2024-q3    (quarters with year)");
    console.log("  recap diff 2024-01 2024-06    (months)");
    return;
  }

  // Auto-swap if reversed
  let p1 = period1;
  let p2 = period2;
  let l1 = period1Str;
  let l2 = period2Str;
  if (p1.since > p2.since) {
    [p1, p2] = [p2, p1];
    [l1, l2] = [l2, l1];
  }

  // Warn about future dates
  const now = new Date();
  if (p2.until > now) {
    process.stderr.write(`Note: ${l2} extends into the future. Showing data through today.\n`);
    p2 = { since: p2.since, until: now };
  }

  const config = loadConfig();
  const repos = discoverRepos(config);
  if (repos.length === 0) {
    console.log("No repos found. Run `recap init` to configure scan directories.");
    return;
  }

  let emails = config.author_emails;
  if (emails.length === 0) {
    emails = detectAuthorEmails(repos);
    if (emails.length === 0) {
      console.log("No git author email found. Run `recap init` to configure.");
      return;
    }
  }

  const commits1 = extractForPeriod(repos, p1, emails);
  const commits2 = extractForPeriod(repos, p2, emails);
  const data1 = analyze(commits1, p1);
  const data2 = analyze(commits2, p2);

  console.log();
  renderDiff("RECAP DIFF", data1, data2, l1, l2);
}

const arg = process.argv[2];
switch (arg) {
  case "init": {
    const config = loadConfig();
    const repos = discoverRepos(config);
    console.log(`Found ${repos.length} repos.`);
    const emails = detectAuthorEmails(repos);
    if (emails.length > 0) {
      config.author_emails = emails;
      console.log(`Detected emails: ${emails.join(", ")}`);
    }
    saveConfig(config);
    console.log(`Config saved to ~/.config/recap/config.json`);
    break;
  }
  case "week":
    runSection("THIS WEEK", getWeekRange, true);
    break;
  case "month":
    runSection("THIS MONTH", getMonthRange, true);
    break;
  case "year":
    runSection("THIS YEAR", getYearRange, false);
    break;
  case "all":
    runSection("ALL TIME", getAllTimeRange, false);
    break;
  case "story":
    runStory();
    break;
  case "diff": {
    const p1 = process.argv[3];
    const p2 = process.argv[4];
    if (!p1 || !p2) {
      console.log("Usage: recap diff <period1> <period2>");
      console.log("Examples:");
      console.log("  recap diff 2024 2025");
      console.log("  recap diff q1 q2");
      console.log("  recap diff 2024-01 2024-06");
    } else {
      runDiff(p1, p2);
    }
    break;
  }
  default:
    runRecap();
    break;
}
