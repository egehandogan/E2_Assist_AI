import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionCookie = await cookies();
    const demoCookie = sessionCookie.get("demo-session")?.value;
    const authSession = await auth();
    const userId = authSession?.user?.id || demoCookie;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.chatSession.findUnique({
      where: { id, userId }
    });

    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...session,
      messages: JSON.parse(session.messages)
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionCookie = await cookies();
    const demoCookie = sessionCookie.get("demo-session")?.value;
    const authSession = await auth();
    const userId = authSession?.user?.id || demoCookie;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.chatSession.delete({ where: { id, userId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
