import { NextRequest, NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

export async function GET() {
  const meetings = await dbSafe(() =>
    prisma.meeting.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { startTime: "asc" },
      include: { tasks: true },
    }),
    []
  );
  return NextResponse.json(meetings);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const meeting = await prisma.meeting.create({
      data: {
        userId: DEMO_USER_ID,
        title: body.title,
        description: body.description ?? null,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        location: body.location ?? null,
        meetLink: body.meetLink ?? null,
        attendees: body.attendees ?? null,
        status: "scheduled",
      },
    });
    return NextResponse.json(meeting);
  } catch (e) {
    console.error("[meetings POST]", e);
    return NextResponse.json({ error: "DB bağlantı hatası" }, { status: 503 });
  }
}
