import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(notifications);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const notification = await prisma.notification.create({
      data: {
        userId: DEMO_USER_ID,
        type: body.type,
        title: body.title,
        body: body.body,
        link: body.link ?? null,
      },
    });
    return NextResponse.json(notification);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bildirim oluşturulamadı" }, { status: 500 });
  }
}
