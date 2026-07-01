import { z } from "zod";

export const noteSchema = z.object({
  author: z
    .string()
    .trim()
    .min(1, "Author is required.")
    .max(80, "Author must be 80 characters or fewer."),
  body: z
    .string()
    .trim()
    .min(1, "Body is required.")
    .max(1_000, "Body must be 1,000 characters or fewer."),
});

export type NoteInput = z.infer<typeof noteSchema>;

export type NoteDto = {
  id: number;
  author: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};
