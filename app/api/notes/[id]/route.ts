import { NextResponse } from "next/server";

import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseNoteId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  return id;
}

function isMissingRecord(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = parseNoteId(rawId);

  if (!id) {
    return NextResponse.json({ error: "Invalid note id." }, { status: 400 });
  }

  try {
    await getPrisma().note.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (isMissingRecord(error)) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    console.error(error);

    return NextResponse.json(
      { error: "Unable to delete note right now." },
      { status: 500 },
    );
  }
}
