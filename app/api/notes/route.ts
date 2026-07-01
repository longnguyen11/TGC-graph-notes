import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { noteSchema } from "@/lib/notes";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

function validationMessage(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid note.";
}

function serverError(error: unknown) {
  console.error(error);

  return NextResponse.json(
    { error: "Unable to process notes right now." },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const notes = await getPrisma().note.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = noteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: validationMessage(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const note = await getPrisma().note.create({
      data: parsed.data,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
