import { describe, it, expect } from "vitest";
import { detectLanguage, computeLanguages } from "../src/analyze.js";
import type { CommitData } from "../src/types.js";

describe("detectLanguage", () => {
  it("detects TypeScript from .ts extension", () => {
    expect(detectLanguage("src/cli.ts")).toBe("TypeScript");
  });

  it("detects TypeScript from .tsx extension", () => {
    expect(detectLanguage("components/App.tsx")).toBe("TypeScript");
  });

  it("returns Other for unknown extension", () => {
    expect(detectLanguage("data.xyz")).toBe("Other");
  });

  it("returns Other for files with no extension", () => {
    expect(detectLanguage("Makefile")).toBe("Other");
  });

  it("detects Docker from Dockerfile", () => {
    expect(detectLanguage("Dockerfile")).toBe("Docker");
  });

  it("detects Docker from nested Dockerfile", () => {
    expect(detectLanguage("docker/Dockerfile")).toBe("Docker");
  });

  it("is case-insensitive for extensions", () => {
    expect(detectLanguage("README.MD")).toBe("Markdown");
  });

  it("detects Python from .py extension", () => {
    expect(detectLanguage("script.py")).toBe("Python");
  });
});

describe("computeLanguages", () => {
  it("computes language breakdown from commits with files", () => {
    const commits: CommitData[] = [
      {
        hash: "abc123",
        message: "feat: add feature",
        date: new Date("2024-01-01"),
        authorEmail: "dev@test.com",
        filesChanged: 2,
        insertions: 50,
        deletions: 10,
        repo: "test-repo",
        files: [
          { path: "src/index.ts", insertions: 30, deletions: 5 },
          { path: "src/style.css", insertions: 20, deletions: 5 },
        ],
      },
    ];

    const result = computeLanguages(commits);
    expect(result["TypeScript"]).toBe(30);
    expect(result["CSS"]).toBe(20);
  });

  it("returns empty object for commits without files", () => {
    const commits: CommitData[] = [
      {
        hash: "abc123",
        message: "old commit",
        date: new Date("2024-01-01"),
        authorEmail: "dev@test.com",
        filesChanged: 1,
        insertions: 10,
        deletions: 0,
        repo: "test-repo",
      },
    ];

    const result = computeLanguages(commits);
    expect(result).toEqual({});
  });

  it("groups unknown extensions as Other", () => {
    const commits: CommitData[] = [
      {
        hash: "abc123",
        message: "add data",
        date: new Date("2024-01-01"),
        authorEmail: "dev@test.com",
        filesChanged: 1,
        insertions: 10,
        deletions: 0,
        repo: "test-repo",
        files: [
          { path: "data.bin", insertions: 10, deletions: 0 },
        ],
      },
    ];

    const result = computeLanguages(commits);
    expect(result["Other"]).toBe(10);
  });
});
