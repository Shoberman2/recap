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

function extractForPeriod(repos: RepoInfo[], period: DateRange, emails: string[]): CommitData[] {
  const allCommits: CommitData[] = [];
  for (const repo of repos) {
    allCommits.push(...extractCommits(repo, period, emails));
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
  default:
    runRecap();
    break;
}
