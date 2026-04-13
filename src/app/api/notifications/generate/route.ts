import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

async function gemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "";

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1024 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      }
      const err = await res.json().catch(() => ({}));
      const code = (err as { error?: { code?: number } }).error?.code;
      if (code !== 503 && code !== 429) break;
    } catch {
      continue;
    }
  }
  return "";
}

export async function POST() {
  const result = await dbSafe(async () => {
    const created: string[] = [];

    // 1) Yaklaşan görevler (2 gün)
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    const upcomingTasks = await prisma.task.findMany({
      where: {
        userId: DEMO_USER_ID,
        status: { not: "completed" },
        dueDate: { lte: twoDaysLater, gte: new Date() },
      },
    });
    for (const t of upcomingTasks) {
      const exists = await prisma.notification.findFirst({
        where: { userId: DEMO_USER_ID, type: "upcoming_task", title: { contains: t.id } },
      });
      if (!exists) {
        await prisma.notification.create({
          data: {
            userId: DEMO_USER_ID,
            type: "upcoming_task",
            title: `Yaklaşan görev: ${t.title}`,
            body: `"${t.title}" görevinin son tarihi yaklaşıyor. Öncelik: ${t.priority}`,
            link: "/dashboard/tasks",
          },
        });
        created.push(`task:${t.id}`);
      }
    }

    // 2) Yaklaşan toplantılar (24 saat)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        userId: DEMO_USER_ID,
        startTime: { lte: tomorrow, gte: new Date() },
      },
    });
    for (const m of upcomingMeetings) {
      const exists = await prisma.notification.findFirst({
        where: { userId: DEMO_USER_ID, type: "upcoming_meeting", title: { contains: m.id } },
      });
      if (!exists) {
        const time = new Date(m.startTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        await prisma.notification.create({
          data: {
            userId: DEMO_USER_ID,
            type: "upcoming_meeting",
            title: `Toplantı: ${m.title} - ${time}`,
            body: m.description ?? `"${m.title}" toplantınız yaklaşıyor.`,
            link: "/dashboard/calendar",
          },
        });
        created.push(`meeting:${m.id}`);
      }
    }

    // 3) AI ile hibe/AB projeleri (günde max 1)
    const lastGrantNotif = await prisma.notification.findFirst({
      where: { userId: DEMO_USER_ID, type: { in: ["grant_program", "eu_project"] } },
      orderBy: { createdAt: "desc" },
    });

    const shouldGenerate = !lastGrantNotif ||
      (Date.now() - new Date(lastGrantNotif.createdAt).getTime()) > 12 * 60 * 60 * 1000;

    if (shouldGenerate) {
      const prompt = `Sen bir dernek başkanı asistanısın. Türkiye'deki dernekler için güncel 2 hibe/fon fırsatı ve 1 AB projesi öner.
Her biri için JSON formatında döndür: [{"type":"grant_program"|"eu_project","title":"...","body":"..."}]
Gerçekçi, güncel bilgiler ver. Sadece JSON döndür.`;

      const aiResult = await gemini(prompt);
      const jsonMatch = aiResult.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const items = JSON.parse(jsonMatch[0]) as Array<{ type: string; title: string; body: string }>;
          for (const item of items) {
            if (item.title && item.body) {
              await prisma.notification.create({
                data: {
                  userId: DEMO_USER_ID,
                  type: item.type === "eu_project" ? "eu_project" : "grant_program",
                  title: item.title,
                  body: item.body,
                  link: null,
                },
              });
              created.push(`ai:${item.type}`);
            }
          }
        } catch { /* JSON parse failure, skip */ }
      }
    }

    return { ok: true, created };
  }, { ok: true, created: [] as string[] });

  return NextResponse.json(result);
}
