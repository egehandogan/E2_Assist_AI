import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.tags !== undefined && { tags: body.tags }),
      },
    });
    return NextResponse.json(note);
  } catch (e) {
    console.error("[notes PATCH]", e);
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 503 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.note.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notes DELETE]", e);
    return NextResponse.json({ error: "Silinemedi" }, { status: 503 });
  }
}
