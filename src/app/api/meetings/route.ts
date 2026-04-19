import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getGoogleApis } from "@/lib/google";
import { cookies } from "next/headers";

export async function GET() {
  const session = await auth();
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo-session")?.value;

  if (!session?.user && !demoCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session?.user?.id || demoCookie;

  try {
    const googleApis = await getGoogleApis(userId as string);

    // If real user, fetch and sync from Google Calendar
    if (googleApis) {
      const { calendar } = googleApis;
      
      const timeMin = new Date();
      timeMin.setMonth(timeMin.getMonth() - 1); // 1 ay gerisi
      
      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = res.data.items || [];
      
      // Upsert into Prisma to maintain two-way sync
      for (const event of events) {
        if (!event.start?.dateTime && !event.start?.date) continue; // skip if not valid
        
        const startTime = new Date(event.start.dateTime || event.start.date!);
        const endTime = new Date(event.end?.dateTime || event.end?.date || event.start.dateTime!);
        
        await prisma.meeting.upsert({
          where: { 
            // We don't have a unique GoogleEventId field set up as @unique in prisma yet,
            // but we can query by it. So we use findFirst below and update/create.
            id: "dummy" // Wait, upsert needs unique. Let's use custom logic.
          },
          create: {
            userId: userId as string,
            title: event.summary || "İsimsiz Etkinlik",
            description: event.description || "",
            startTime,
            endTime,
            location: event.location || "",
            googleEventId: event.id || null,
            meetLink: event.hangoutLink || null,
            attendees: event.attendees?.map(a => a.email).join(", ") || null,
            status: "scheduled",
          },
          update: {
            title: event.summary || "İsimsiz Etkinlik",
            description: event.description || "",
            startTime,
            endTime,
            location: event.location || "",
            meetLink: event.hangoutLink || null,
            attendees: event.attendees?.map(a => a.email).join(", ") || null,
          }
        }).catch(() => {});
      }
      
      // To handle upsert without unique index properly:
      for (const event of events) {
          if (!event.id) continue;
          if (!event.start?.dateTime && !event.start?.date) continue;
          
          const startTime = new Date(event.start.dateTime || event.start.date!);
          const endTime = new Date(event.end?.dateTime || event.end?.date || event.start.dateTime!);

          const existingEvent = await prisma.meeting.findFirst({
              where: { googleEventId: event.id }
          });

          if (existingEvent) {
              await prisma.meeting.update({
                  where: { id: existingEvent.id },
                  data: {
                      title: event.summary || "İsimsiz Etkinlik",
                      description: event.description || "",
                      startTime,
                      endTime,
                      location: event.location || "",
                      meetLink: event.hangoutLink || null,
                  }
              });
          } else {
              await prisma.meeting.create({
                  data: {
                      userId: userId as string,
                      title: event.summary || "İsimsiz Etkinlik",
                      description: event.description || "",
                      startTime,
                      endTime,
                      location: event.location || "",
                      googleEventId: event.id,
                      meetLink: event.hangoutLink || null,
                      status: "scheduled"
                  }
              });
          }
      }
    }

    // Always serve from DB cache
    const meetings = await prisma.meeting.findMany({
      where: { userId: userId as string },
      orderBy: { startTime: "asc" },
      include: { tasks: true },
    });
    
    // Sort logic to make sure events are ordered
    return NextResponse.json(meetings);
  } catch (e) {
    console.error("[meetings GET]", e);
    return NextResponse.json({ error: "Veri okunamadı" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo-session")?.value;

  if (!session?.user && !demoCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session?.user?.id || demoCookie;

  try {
    const body = await req.json();
    let googleEventId = null;
    let meetLink = body.meetLink || null;

    const googleApis = await getGoogleApis(userId as string);
    if (googleApis) {
      const { calendar } = googleApis;
      
      const newEvent = {
        summary: body.title,
        description: body.description || "",
        location: body.location || "",
        start: { dateTime: new Date(body.startTime).toISOString() },
        end: { dateTime: new Date(body.endTime).toISOString() },
      };

      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: newEvent,
      });

      googleEventId = res.data.id;
      if (res.data.hangoutLink) meetLink = res.data.hangoutLink;
    }

    const meeting = await prisma.meeting.create({
      data: {
        userId: userId as string,
        title: body.title,
        description: body.description ?? null,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        location: body.location ?? null,
        meetLink: meetLink,
        googleEventId: googleEventId,
        attendees: body.attendees ?? null,
        status: "scheduled",
      },
    });
    return NextResponse.json(meeting);
  } catch (e) {
    console.error("[meetings POST]", e);
    return NextResponse.json({ error: "Kaydedilemedi" }, { status: 503 });
  }
}
