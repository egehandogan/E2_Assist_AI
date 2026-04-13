import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        ...(body.isRead !== undefined && { isRead: body.isRead }),
      },
    });
    return NextResponse.json(notification);
  } catch (e) {
    console.error("[notifications PATCH]", e);
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 503 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notifications DELETE]", e);
    return NextResponse.json({ error: "Silinemedi" }, { status: 503 });
  }
}
