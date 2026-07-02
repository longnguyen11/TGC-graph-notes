import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPrisma } from "@/lib/prisma";

import { DELETE } from "./route";

vi.mock("@/lib/prisma", () => ({
  getPrisma: vi.fn(),
}));

const mockGetPrisma = vi.mocked(getPrisma);

function context(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
}

describe("/api/notes/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-decimal ids", async () => {
    const deleteNote = vi.fn();

    mockGetPrisma.mockReturnValue({
      note: { delete: deleteNote },
    } as ReturnType<typeof getPrisma>);

    const response = await DELETE(
      new Request("http://localhost/api/notes/1e2"),
      context("1e2"),
    );

    expect(response.status).toBe(400);
    expect(deleteNote).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({ error: "Invalid note id." });
  });

  it("deletes a note by id", async () => {
    const deleteNote = vi.fn().mockResolvedValue({});

    mockGetPrisma.mockReturnValue({
      note: { delete: deleteNote },
    } as ReturnType<typeof getPrisma>);

    const response = await DELETE(
      new Request("http://localhost/api/notes/42"),
      context("42"),
    );

    expect(response.status).toBe(204);
    expect(deleteNote).toHaveBeenCalledWith({ where: { id: 42 } });
  });

  it("returns 404 when the note does not exist", async () => {
    const deleteNote = vi.fn().mockRejectedValue({ code: "P2025" });

    mockGetPrisma.mockReturnValue({
      note: { delete: deleteNote },
    } as ReturnType<typeof getPrisma>);

    const response = await DELETE(
      new Request("http://localhost/api/notes/42"),
      context("42"),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Note not found." });
  });
});
