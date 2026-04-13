import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

export async function POST() {
  try {
    await prisma.notification.updateMany({
      where: { userId: DEMO_USER_ID, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}
