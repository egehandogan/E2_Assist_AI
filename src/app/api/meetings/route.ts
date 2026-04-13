import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { startTime: "asc" },
      include: { tasks: true },
    });
    return NextResponse.json(meetings);
  } catch {
    return NextResponse.json([]);
  }
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
        attendees: body.attendees ? JSON.stringify(body.attendees) : null,
        status: "scheduled",
      },
    });
    return NextResponse.json(meeting);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Toplantı oluşturulamadı" }, { status: 500 });
  }
}
