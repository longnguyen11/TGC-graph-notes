import { ZodError } from "zod";

export function getValidationMessage(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid note.";
}

export function parseNoteId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  return id;
}

export function isMissingRecord(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}
