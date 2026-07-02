import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPrisma } from "@/lib/prisma";

import { GET, POST } from "./route";

vi.mock("@/lib/prisma", () => ({
  getPrisma: vi.fn(),
}));

const mockGetPrisma = vi.mocked(getPrisma);

describe("/api/notes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists notes newest first", async () => {
    const notes = [
      {
        id: 1,
        author: "Jen",
        body: "Frame pacing looks stable.",
        createdAt: new Date("2026-07-01T12:00:00Z"),
        updatedAt: new Date("2026-07-01T12:00:00Z"),
      },
    ];
    const findMany = vi.fn().mockResolvedValue(notes);

    mockGetPrisma.mockReturnValue({
      note: { findMany },
    } as ReturnType<typeof getPrisma>);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(findMany).toHaveBeenCalledWith({ orderBy: { createdAt: "desc" } });
    expect(await response.json()).toEqual({
      notes: [
        {
          ...notes[0],
          createdAt: notes[0].createdAt.toISOString(),
          updatedAt: notes[0].updatedAt.toISOString(),
        },
      ],
    });
  });

  it("rejects malformed JSON on create", async () => {
    const response = await POST(
      new Request("http://localhost/api/notes", {
        body: "{",
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Request body must be JSON." });
  });

  it("rejects invalid note input on create", async () => {
    const response = await POST(
      new Request("http://localhost/api/notes", {
        body: JSON.stringify({ author: "", body: "" }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Author is required." });
  });

  it("creates a note from validated input", async () => {
    const note = {
      id: 2,
      author: "Jen",
      body: "Frame pacing looks stable.",
      createdAt: new Date("2026-07-01T12:00:00Z"),
      updatedAt: new Date("2026-07-01T12:00:00Z"),
    };
    const create = vi.fn().mockResolvedValue(note);

    mockGetPrisma.mockReturnValue({
      note: { create },
    } as ReturnType<typeof getPrisma>);

    const response = await POST(
      new Request("http://localhost/api/notes", {
        body: JSON.stringify({
          author: "  Jen  ",
          body: "  Frame pacing looks stable.  ",
        }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({
      data: {
        author: "Jen",
        body: "Frame pacing looks stable.",
      },
    });
    expect(await response.json()).toEqual({
      note: {
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      },
    });
  });
});
