import { describe, expect, it } from "vitest";
import { z } from "zod";

import { getValidationMessage, isMissingRecord, parseNoteId } from "./notes-api";

describe("parseNoteId", () => {
  it("accepts positive integer ids", () => {
    expect(parseNoteId("1")).toBe(1);
    expect(parseNoteId("42")).toBe(42);
  });

  it("rejects invalid ids", () => {
    expect(parseNoteId("0")).toBeNull();
    expect(parseNoteId("-1")).toBeNull();
    expect(parseNoteId("1.5")).toBeNull();
    expect(parseNoteId("1e2")).toBeNull();
    expect(parseNoteId("0x10")).toBeNull();
    expect(parseNoteId(" 2 ")).toBeNull();
    expect(parseNoteId("abc")).toBeNull();
  });
});

describe("isMissingRecord", () => {
  it("detects Prisma missing-record errors", () => {
    expect(isMissingRecord({ code: "P2025" })).toBe(true);
  });

  it("rejects unrelated errors", () => {
    expect(isMissingRecord({ code: "P2002" })).toBe(false);
    expect(isMissingRecord(new Error("nope"))).toBe(false);
    expect(isMissingRecord(null)).toBe(false);
  });
});

describe("getValidationMessage", () => {
  it("returns the first zod issue message", () => {
    const schema = z.object({
      name: z.string().min(1, "Name is required."),
    });
    const result = schema.safeParse({ name: "" });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getValidationMessage(result.error)).toBe("Name is required.");
    }
  });
});
