import { z, ZodError } from "zod";

export const NOTE_LIMITS = {
  author: 80,
  body: 256,
} as const;

export const noteSchema = z.object({
  author: z
    .string()
    .trim()
    .min(1, "Author is required.")
    .max(NOTE_LIMITS.author, "Author must be 80 characters or fewer."),
  body: z
    .string()
    .trim()
    .min(1, "Body is required.")
    .max(NOTE_LIMITS.body, "Body must be 256 characters or fewer."),
});

export type NoteInput = z.infer<typeof noteSchema>;
export type NoteFieldErrors = Partial<Record<keyof NoteInput, string>>;

export type NoteDto = {
  id: number;
  author: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export function getNoteFieldErrors(error: ZodError) {
  const fieldErrors: NoteFieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if ((field === "author" || field === "body") && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}
