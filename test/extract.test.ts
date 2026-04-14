import { describe, it, expect } from "vitest";
import { parseGitLog } from "../src/extract.js";

describe("parseGitLog file preservation", () => {
  it("preserves file paths from numstat output", () => {
    const SEP_F = "\x1f";
    const SEP_C = "\x1e";

    const output = `${SEP_C}abc123${SEP_F}feat: add feature${SEP_F}2024-01-15T10:00:00Z${SEP_F}dev@test.com
10\t5\tsrc/index.ts
20\t0\tsrc/style.css`;

    const commits = parseGitLog(output, "test-repo");
    expect(commits).toHaveLength(1);
    expect(commits[0].files).toBeDefined();
    expect(commits[0].files).toHaveLength(2);
    expect(commits[0].files![0]).toEqual({
      path: "src/index.ts",
      insertions: 10,
      deletions: 5,
    });
    expect(commits[0].files![1]).toEqual({
      path: "src/style.css",
      insertions: 20,
      deletions: 0,
    });
  });

  it("handles binary files with - stats", () => {
    const SEP_F = "\x1f";
    const SEP_C = "\x1e";

    const output = `${SEP_C}def456${SEP_F}add image${SEP_F}2024-01-15T10:00:00Z${SEP_F}dev@test.com
-\t-\tlogo.png`;

    const commits = parseGitLog(output, "test-repo");
    expect(commits).toHaveLength(1);
    expect(commits[0].files).toHaveLength(1);
    expect(commits[0].files![0]).toEqual({
      path: "logo.png",
      insertions: 0,
      deletions: 0,
    });
  });
});
