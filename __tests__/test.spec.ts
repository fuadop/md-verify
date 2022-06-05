import fs from "node:fs";
import path from "node:path";
import mdVerify from "../src/verify";

let source: string | null = "";
beforeAll(() => {
  source = fs
    .readFileSync(path.resolve(__dirname, "data", "temp.md"))
    .toString("binary");
});

afterAll(() => {
  source = null;
});

describe("API", () => {
  test("header should pass", () => {
    expect(() => {
      mdVerify(source!, ["## PR Checklist"]);
    }).not.toThrow();
  });
  test("link in list should pass", () => {
    expect(() => {
      mdVerify(source!, [
        "- [CONTRIBUTING.md](https://github.com/LearningTypeScript/projects/blob/main/.github/CONTRIBUTING.md)",
      ]);
    }).not.toThrow();
  });
  test("link in list should fail", () => {
    expect(() => {
      mdVerify(source!, ["- [dummy link](https://dummy.com)"]);
    }).toThrow();
  });
  test("header should fail", () => {
    expect(() => {
      mdVerify(source!, ["## pr checklist"]);
    }).toThrow();
  });
  test("no match should fail", () => {
    expect(() => {
      mdVerify(source!, ["# Get started"]);
    }).toThrow();
  });
});
