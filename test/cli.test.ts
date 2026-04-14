import { describe, it, expect } from "vitest";
import { parsePeriod } from "../src/cli.js";

describe("parsePeriod", () => {
  it("parses a year: 2024", () => {
    const result = parsePeriod("2024");
    expect(result).not.toBeNull();
    expect(result!.since).toEqual(new Date(2024, 0, 1));
    expect(result!.until).toEqual(new Date(2025, 0, 1));
  });

  it("parses a quarter without year: q1 (current year)", () => {
    const result = parsePeriod("q1");
    const year = new Date().getFullYear();
    expect(result).not.toBeNull();
    expect(result!.since).toEqual(new Date(year, 0, 1));
    expect(result!.until).toEqual(new Date(year, 3, 1));
  });

  it("parses a quarter with year: 2024-q3", () => {
    const result = parsePeriod("2024-q3");
    expect(result).not.toBeNull();
    expect(result!.since).toEqual(new Date(2024, 6, 1));
    expect(result!.until).toEqual(new Date(2024, 9, 1));
  });

  it("parses a month: 2024-01", () => {
    const result = parsePeriod("2024-01");
    expect(result).not.toBeNull();
    expect(result!.since).toEqual(new Date(2024, 0, 1));
    expect(result!.until).toEqual(new Date(2024, 1, 1));
  });

  it("parses December correctly: 2024-12", () => {
    const result = parsePeriod("2024-12");
    expect(result).not.toBeNull();
    expect(result!.since).toEqual(new Date(2024, 11, 1));
    expect(result!.until).toEqual(new Date(2025, 0, 1));
  });

  it("returns null for invalid format", () => {
    expect(parsePeriod("abc")).toBeNull();
    expect(parsePeriod("")).toBeNull();
    expect(parsePeriod("2024-13")).toBeNull();
    expect(parsePeriod("2024-00")).toBeNull();
  });

  it("handles quarter case-insensitively: Q2", () => {
    const result = parsePeriod("Q2");
    const year = new Date().getFullYear();
    expect(result).not.toBeNull();
    expect(result!.since).toEqual(new Date(year, 3, 1));
    expect(result!.until).toEqual(new Date(year, 6, 1));
  });

  it("handles year-quarter case-insensitively: 2024-Q4", () => {
    const result = parsePeriod("2024-Q4");
    expect(result).not.toBeNull();
    expect(result!.since).toEqual(new Date(2024, 9, 1));
    expect(result!.until).toEqual(new Date(2025, 0, 1));
  });
});
