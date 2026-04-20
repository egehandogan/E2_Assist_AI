import { NextResponse } from "next/server";
import { getGoogleApis } from "@/lib/google";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const sessionCookie = await cookies();
    const demoCookie = sessionCookie.get("demo-session")?.value;
    const authSession = await auth();
    const userId = authSession?.user?.id || demoCookie;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const fileId = url.searchParams.get("fileId");

    if (!fileId) return NextResponse.json({ error: "No fileId provided" }, { status: 400 });

    const googleApis = await getGoogleApis(userId);
    if (!googleApis) return NextResponse.json({ error: "No google config" }, { status: 400 });

    const { drive } = googleApis;

    // Get file metadata to get the name
    const metadata = await drive.files.get({ fileId, fields: "name, mimeType" });
    const fileName = metadata.data.name || "download";

    // Fetch the file content
    const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });

    // Stream the file back to the user
    return new Response(res.data as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Content-Type": metadata.data.mimeType || "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Download Error:", error);
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
  }
}
