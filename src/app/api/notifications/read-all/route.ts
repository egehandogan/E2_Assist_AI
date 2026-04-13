import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

export async function POST() {
  const result = await dbSafe(async () => {
    await prisma.notification.updateMany({
      where: { userId: DEMO_USER_ID, isRead: false },
      data: { isRead: true },
    });
    return { ok: true };
  }, { ok: false });
  return NextResponse.json(result);
}
