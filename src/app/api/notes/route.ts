import { NextRequest, NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

export async function GET() {
  const notes = await dbSafe(() =>
    prisma.note.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { createdAt: "desc" },
    }),
    []
  );
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const note = await prisma.note.create({
      data: {
        userId: DEMO_USER_ID,
        title: body.title ?? null,
        content: body.content,
        source: body.source ?? "manual",
        tags: body.tags ?? null,
      },
    });
    return NextResponse.json(note);
  } catch (e) {
    console.error("[notes POST]", e);
    return NextResponse.json({ error: "DB bağlantı hatası" }, { status: 503 });
  }
}
