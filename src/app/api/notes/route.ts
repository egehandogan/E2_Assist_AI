import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json([]);
  }
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
        tags: body.tags ? JSON.stringify(body.tags) : null,
      },
    });
    return NextResponse.json(note);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Not oluşturulamadı" }, { status: 500 });
  }
}
