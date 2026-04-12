import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { RecapConfig } from "./types.js";

const CONFIG_DIR = join(homedir(), ".config", "recap");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG: RecapConfig = {
  scan_dirs: ["~", "~/repos", "~/src", "~/code", "~/projects", "~/Developer"],
  scan_max_depth: 4,
  ignore_patterns: ["node_modules", ".cache", "vendor", "Library", ".Trash"],
  author_emails: [],
  default_format: "terminal",
};

function expandTilde(p: string): string {
  if (p === "~") return homedir();
  if (p.startsWith("~/")) {
    return join(homedir(), p.slice(2));
  }
  return p;
}

export function loadConfig(): RecapConfig {
  try {
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: RecapConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export function getExpandedScanDirs(config: RecapConfig): string[] {
  return config.scan_dirs.map(expandTilde).filter((d) => existsSync(d));
}
