import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGoogleApis } from "@/lib/google";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const googleApis = await getGoogleApis(session.user.id);
    
    if (!googleApis) {
      // Mock data for demo
      return NextResponse.json([
        {
          id: "demo-1",
          title: "Hoş Geldiniz Toplantısı",
          time: "10:00 - 11:00",
          type: "online",
          attendees: ["Asistan"],
          status: "upcoming",
          minutesLeft: 30,
        }
      ]);
    }

    const { calendar } = googleApis;
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Next 7 days

    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 10,
    });

    const events = (res.data.items || []).map((event: any) => {
      const start = new Date(event.start?.dateTime || event.start?.date || "");
      const end = new Date(event.end?.dateTime || event.end?.date || "");
      
      const isToday = now.toDateString() === start.toDateString();
      const timeStr = isToday 
        ? `${start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`
        : `${start.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} ${start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;

      let minutesLeft: number | null = null;
      if (isToday && start.getTime() > now.getTime()) {
        minutesLeft = Math.floor((start.getTime() - now.getTime()) / (1000 * 60));
      }

      return {
        id: event.id,
        title: event.summary || "Konu Belirtilmemiş",
        time: timeStr,
        type: event.location?.includes("http") || !event.location ? "online" : "inperson",
        location: event.location,
        attendees: (event.attendees || []).slice(0, 3).map((a: any) => a.displayName || a.email.split("@")[0]),
        status: isToday ? "upcoming" : "tomorrow",
        minutesLeft,
      };
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Calendar API Error:", error);
    return NextResponse.json({ error: "Takvim verileri alınamadı" }, { status: 500 });
  }
}
