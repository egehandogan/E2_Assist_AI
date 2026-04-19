import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGoogleApis } from "@/lib/google";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const session = await auth();
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("demo-session")?.value;

  if (!session?.user && !demoCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session?.user?.id || demoCookie;

  try {
    const { to, subject, body, threadId } = await req.json();

    const googleApis = await getGoogleApis(userId!);

    if (!googleApis) {
      // Demo Mode
      return NextResponse.json({ ok: true, message: "Demo mode: E-posta gönderildi sayıldı." });
    }

    const { gmail } = googleApis;

    // Construct raw email according to RFC 2822
    const messageParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "MIME-Version: 1.0",
      "",
      body,
    ];

    const message = messageParts.join("\n");
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
        threadId: threadId || undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email Send Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
