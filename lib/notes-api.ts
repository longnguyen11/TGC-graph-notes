import { ZodError } from "zod";

export function getValidationMessage(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid note.";
}

export function parseNoteId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  return Number(value);
}

export function isMissingRecord(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}
