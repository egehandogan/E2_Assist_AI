import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.summary !== undefined && { summary: body.summary }),
        ...(body.transcript !== undefined && { transcript: JSON.stringify(body.transcript) }),
        ...(body.aiJoined !== undefined && { aiJoined: body.aiJoined }),
      },
    });
    return NextResponse.json(meeting);
  } catch (e) {
    console.error("[meetings PATCH]", e);
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 503 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.meeting.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[meetings DELETE]", e);
    return NextResponse.json({ error: "Silinemedi" }, { status: 503 });
  }
}
