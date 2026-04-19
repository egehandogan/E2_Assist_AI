import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGoogleApis } from "@/lib/google";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const session = await auth();
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo-session")?.value;

  if (!session?.user && !demoCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session?.user?.id || demoCookie;

  try {
    const googleApis = await getGoogleApis(userId!);

    if (!googleApis) {
      // Return mock data for Demo Mode
      return NextResponse.json([
        {
          id: "1",
          from: "Nurevşan Doğan",
          fromEmail: "nurevsan@demo.com",
          subject: "Hoş Geldiniz",
          body: "Yönetim paneline hoş geldiniz. Paneliniz demo modunda çalışmaktadır.",
          time: "10:00",
          date: "Bugün",
          isRead: false,
          isStarred: true,
          account: "demo@dernek.org",
          labels: ["Bilgi"],
        },
      ]);
    }

    const { gmail } = googleApis;
    const profile = await gmail.users.getProfile({ userId: "me" });
    const userEmail = profile.data.emailAddress;

    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 15,
      labelIds: ["INBOX"],
    });

    if (!listRes.data.messages || listRes.data.messages.length === 0) {
      return NextResponse.json([]);
    }

    const emails = await Promise.all(
      listRes.data.messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "full",
        });

        const headers = detail.data.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

        const subject = getHeader("subject") || "(Konu Yok)";
        const fromHeader = getHeader("from");
        const dateHeader = getHeader("date");

        // Parse Name and Email
        let fromName = fromHeader;
        let fromEmail = fromHeader;
        const emailMatch = fromHeader.match(/<(.+)>/);
        if (emailMatch) {
          fromEmail = emailMatch[1];
          fromName = fromHeader.replace(/<.+>/, "").trim().replace(/"/g, "") || fromEmail;
        }

        // Parse Date
        const dateObj = new Date(dateHeader || Date.now());
        const isToday = new Date().toDateString() === dateObj.toDateString();
        const timeStr = dateObj.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        const dateStr = isToday ? "Bugün" : dateObj.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

        // Parse Body
        let body = "";
        const parts = detail.data.payload?.parts;
        if (parts) {
          const textPart = parts.find((p) => p.mimeType === "text/plain");
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, "base64url").toString("utf-8");
          } else {
            body = detail.data.snippet || "";
          }
        } else if (detail.data.payload?.body?.data) {
          body = Buffer.from(detail.data.payload.body.data, "base64url").toString("utf-8");
        } else {
          body = detail.data.snippet || "";
        }

        const isUnread = detail.data.labelIds?.includes("UNREAD") ?? false;
        const isStarred = detail.data.labelIds?.includes("STARRED") ?? false;

        return {
          id: msg.id,
          threadId: detail.data.threadId,
          from: fromName,
          fromEmail,
          subject,
          body,
          time: timeStr,
          date: dateStr,
          isRead: !isUnread,
          isStarred,
          account: userEmail,
          labels: detail.data.labelIds?.filter(l => !["INBOX", "UNREAD", "STARRED", "CATEGORY_PERSONAL"].includes(l)) || [],
        };
      })
    );

    return NextResponse.json(emails);
  } catch (error) {
    console.error("Email API Error:", error);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}
