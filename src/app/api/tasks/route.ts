import { NextRequest, NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

export async function GET() {
  const tasks = await dbSafe(() =>
    prisma.task.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: [{ status: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
    }),
    []
  );
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const task = await prisma.task.create({
      data: {
        userId: DEMO_USER_ID,
        title: body.title,
        description: body.description ?? null,
        assignee: body.assignee ?? null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        priority: body.priority ?? "medium",
        status: body.status ?? "pending",
        category: body.category ?? null,
        meetingId: body.meetingId ?? null,
      },
    });
    return NextResponse.json(task);
  } catch (e) {
    console.error("[tasks POST]", e);
    return NextResponse.json({ error: "DB bağlantı hatası" }, { status: 503 });
  }
}
