import { describe, expect, it } from "vitest";

import { getNoteFieldErrors, NOTE_LIMITS, noteSchema } from "./notes";

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
      author: "a".repeat(NOTE_LIMITS.author + 1),
      body: "b".repeat(NOTE_LIMITS.body + 1),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual([
        "Author must be 80 characters or fewer.",
        "Body must be 256 characters or fewer.",
      ]);
    }
  });

  it("maps validation issues to form fields", () => {
    const result = noteSchema.safeParse({
      author: "",
      body: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getNoteFieldErrors(result.error)).toEqual({
        author: "Author is required.",
        body: "Body is required.",
      });
    }
  });
});
