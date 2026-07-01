import { describe, expect, it } from "vitest";

import { noteSchema } from "./notes";

describe("noteSchema", () => {
  it("trims valid note input", () => {
    const result = noteSchema.parse({
      author: "  Jen  ",
      body: "  Frame pacing looks stable.  ",
    });

    expect(result).toEqual({
      author: "Jen",
      body: "Frame pacing looks stable.",
    });
  });

  it("rejects empty author and body fields", () => {
    const result = noteSchema.safeParse({
      author: "   ",
      body: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual([
        "Author is required.",
        "Body is required.",
      ]);
    }
  });

  it("enforces field length limits", () => {
    const result = noteSchema.safeParse({
      author: "a".repeat(81),
      body: "b".repeat(1_001),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual([
        "Author must be 80 characters or fewer.",
        "Body must be 1,000 characters or fewer.",
      ]);
    }
  });
});
