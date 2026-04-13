import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: [
        { status: "asc" },
        { priority: "asc" },
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
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
    console.error(e);
    return NextResponse.json({ error: "Görev oluşturulamadı" }, { status: 500 });
  }
}
