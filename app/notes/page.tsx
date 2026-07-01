"use client";

import { FormEvent, useMemo, useState } from "react";
import useSWR from "swr";

import { NoteDto, noteSchema } from "@/lib/notes";

type NotesResponse = {
  notes: NoteDto[];
};

type NoteResponse = {
  note: NoteDto;
};

type ErrorResponse = {
  error?: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as ErrorResponse;
    throw new Error(data.error ?? "Unable to load notes.");
  }

  return (await response.json()) as NotesResponse;
};

function formatNoteDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Notes() {
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data,
    error,
    isLoading,
    mutate: refreshNotes,
  } = useSWR<NotesResponse>("/api/notes", fetcher);

  const notes = data?.notes ?? [];
  const noteCountLabel = useMemo(() => {
    if (notes.length === 1) {
      return "1 post";
    }

    return `${notes.length} posts`;
  }, [notes.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const parsed = noteSchema.safeParse({ author, body });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid note.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const responseBody = (await response.json().catch(() => ({}))) as
        | NoteResponse
        | ErrorResponse;

      if (!response.ok) {
        const message =
          "error" in responseBody ? responseBody.error : "Unable to publish note.";

        throw new Error(message ?? "Unable to publish note.");
      }

      if (!("note" in responseBody)) {
        throw new Error("Unable to publish note.");
      }

      await refreshNotes(
        (current) => ({
          notes: [responseBody.note, ...(current?.notes ?? [])],
        }),
        { revalidate: false },
      );

      setAuthor("");
      setBody("");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to publish note.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    setFormError("");

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as ErrorResponse;
        throw new Error(data.error ?? "Unable to delete note.");
      }

      await refreshNotes(
        (current) => ({
          notes: (current?.notes ?? []).filter((note) => note.id !== id),
        }),
        { revalidate: false },
      );
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to delete note.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="page">
      <section className="page-header">
        <span className="eyebrow">Notes</span>
        <h1 className="page-title">Post updates to a persistent feed.</h1>
        <p className="page-copy">
          Add short posts with a free-form author field. Empty submissions are
          rejected before they reach the database.
        </p>
      </section>

      <section className="notes-layout">
        <aside className="panel">
          <div className="panel-title">
            <h2>Create post</h2>
            <span>Author + body</span>
          </div>

          <form className="note-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="author">Author</label>
              <input
                id="author"
                name="author"
                autoComplete="name"
                maxLength={80}
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="e.g. Jen"
              />
            </div>

            <div className="field">
              <label htmlFor="body">Body</label>
              <textarea
                id="body"
                name="body"
                maxLength={1000}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write a note..."
              />
            </div>

            {formError ? <div className="form-error">{formError}</div> : null}

            <button
              className="primary-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publishing..." : "Publish post"}
            </button>
          </form>
        </aside>

        <section className="panel">
          <div className="panel-title">
            <h2>Feed</h2>
            <span>{noteCountLabel}</span>
          </div>

          {isLoading ? <div className="loading-state">Loading feed...</div> : null}

          {error ? (
            <div className="inline-error">
              {error instanceof Error ? error.message : "Unable to load notes."}
            </div>
          ) : null}

          {!isLoading && !error && notes.length === 0 ? (
            <div className="empty-state">No posts yet.</div>
          ) : null}

          {notes.length > 0 ? (
            <div className="feed">
              {notes.map((note) => (
                <article className="note-card" key={note.id}>
                  <header>
                    <div>
                      <p className="note-author">{note.author}</p>
                      <div className="note-date">
                        {formatNoteDate(note.createdAt)}
                      </div>
                    </div>

                    <button
                      className="danger-button"
                      type="button"
                      disabled={deletingId === note.id}
                      onClick={() => handleDelete(note.id)}
                    >
                      {deletingId === note.id ? "Deleting..." : "Delete"}
                    </button>
                  </header>

                  <p className="note-body">{note.body}</p>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
