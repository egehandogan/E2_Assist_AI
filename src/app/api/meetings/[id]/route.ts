import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getGoogleApis } from "@/lib/google";
import { cookies } from "next/headers";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const session = await auth();
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("demo-session")?.value;
    const userId = session?.user?.id || demoCookie;

    const existing = await prisma.meeting.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const googleApis = userId ? await getGoogleApis(userId) : null;
    
    if (googleApis && existing.googleEventId) {
      const { calendar } = googleApis;
      
      const patchData: any = {};
      if (body.title !== undefined) patchData.summary = body.title;
      if (body.notes !== undefined) patchData.description = (existing.description || "") + "\n\nToplantı Notları:\n" + body.notes;
      
      if (Object.keys(patchData).length > 0) {
        await calendar.events.patch({
          calendarId: "primary",
          eventId: existing.googleEventId,
          requestBody: patchData
        }).catch(() => {});
      }
    }

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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const session = await auth();
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("demo-session")?.value;
    const userId = session?.user?.id || demoCookie;

    const existing = await prisma.meeting.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const googleApis = userId ? await getGoogleApis(userId) : null;
    
    if (googleApis && existing.googleEventId) {
      const { calendar } = googleApis;
      await calendar.events.delete({
        calendarId: "primary",
        eventId: existing.googleEventId
      }).catch(() => {});
    }

    await prisma.meeting.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[meetings DELETE]", e);
    return NextResponse.json({ error: "Silinemedi" }, { status: 503 });
  }
}
