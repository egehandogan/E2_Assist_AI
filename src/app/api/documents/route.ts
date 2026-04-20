import { NextResponse } from "next/server";
import { getGoogleApis } from "@/lib/google";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const sessionCookie = await cookies();
    const demoCookie = sessionCookie.get("demo-session")?.value;
    const authSession = await auth();
    const userId = authSession?.user?.id || demoCookie;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const googleApis = await getGoogleApis(userId);
    if (!googleApis) return NextResponse.json([]);

    const { drive } = googleApis;

    // Filter for Google Docs, Sheets, and Slides
    const query = `(mimeType = 'application/vnd.google-apps.document' or 
                    mimeType = 'application/vnd.google-apps.spreadsheet' or 
                    mimeType = 'application/vnd.google-apps.presentation') and trashed = false`;

    const res = await drive.files.list({
      q: query,
      fields: "files(id, name, mimeType, modifiedTime, webViewLink)",
      orderBy: "modifiedTime desc",
      pageSize: 100,
    });

    const items = res.data.files?.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      date: f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString("tr-TR") : "",
      url: f.webViewLink,
    })) || [];

    return NextResponse.json(items);
  } catch (error) {
    console.error("Documents Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}
