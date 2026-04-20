import { NextResponse } from "next/server";
import { getGoogleApis } from "@/lib/google";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { PassThrough } from "stream";

export async function GET(req: Request) {
  try {
    const sessionCookie = await cookies();
    const demoCookie = sessionCookie.get("demo-session")?.value;
    const authSession = await auth();
    const userId = authSession?.user?.id || demoCookie;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const googleApis = await getGoogleApis(userId);
    if (!googleApis) {
      return NextResponse.json([
        {
          id: "1",
          name: "Etkinlik Dosyaları (Demo)",
          type: "folder",
          date: new Date().toLocaleDateString("tr-TR"),
          description: "Sadece demo verisidir.",
        }
      ]);
    }

    const { drive } = googleApis;

    // Use URL params to filter folders or specific files
    const url = new URL(req.url);
    const folderId = url.searchParams.get("folderId") || "root";
    
    // We only want files directly inside the requested folder
    const query = `'${folderId}' in parents and trashed = false`;

    const res = await drive.files.list({
      q: query,
      fields: "files(id, name, mimeType, size, createdTime, webViewLink, thumbnailLink, description, properties, starred)",
      orderBy: "folder, modifiedTime desc",
      pageSize: 50,
    });

    const items = res.data.files?.map((f) => {
      let type = "document";
      const mime = f.mimeType || "";
      if (mime === "application/vnd.google-apps.folder") type = "folder";
      else if (mime.includes("pdf")) type = "pdf";
      else if (mime.startsWith("image/")) type = "image";
      else type = "document";

      // Card is specific to our app, might be stored in Drive properties or identified by name
      if (f.name?.toLowerCase().includes("kartvizit")) type = "card";

      const sizeRaw = parseInt(f.size || "0", 10);
      const sizeStr = sizeRaw > 1024 * 1024 
        ? `${(sizeRaw / (1024 * 1024)).toFixed(1)} MB` 
        : sizeRaw > 0 ? `${(sizeRaw / 1024).toFixed(0)} KB` : undefined;

      return {
        id: f.id,
        name: f.name,
        type,
        size: sizeStr,
        date: f.createdTime ? new Date(f.createdTime).toLocaleDateString("tr-TR") : "",
        thumbnail: f.thumbnailLink || undefined,
        description: f.description || "",
        isStarred: f.starred || false,
        url: f.webViewLink,
        mimeType: mime,
      };
    }) || [];

    return NextResponse.json(items);
  } catch (error) {
    console.error("Drive Error:", error);
    return NextResponse.json({ error: "Failed to fetch drive files" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionCookie = await cookies();
    const demoCookie = sessionCookie.get("demo-session")?.value;
    const authSession = await auth();
    const userId = authSession?.user?.id || demoCookie;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const googleApis = await getGoogleApis(userId);
    if (!googleApis) {
      return NextResponse.json({ error: "No google config" }, { status: 400 });
    }

    const { drive } = googleApis;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const parentId = (formData.get("parentId") as string) || "root";

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      // Convert File to Buffer/Stream for Google SDK
      const buffer = Buffer.from(await file.arrayBuffer());
      const bufferStream = new PassThrough();
      bufferStream.end(buffer);

      const res = await drive.files.create({
        requestBody: {
          name: file.name,
          parents: [parentId],
        },
        media: {
          mimeType: file.type,
          body: bufferStream,
        },
        fields: "id, name, webViewLink",
      });

      return NextResponse.json({ id: res.data.id, ok: true, name: res.data.name });
    }

    // Handle JSON actions (like create_folder)
    const body = await req.json();
    if (body.action === "create_folder") {
      const res = await drive.files.create({
        requestBody: {
          name: body.name || "Yeni Klasör",
          mimeType: "application/vnd.google-apps.folder",
          parents: [body.parentId || "root"],
        },
        fields: "id",
      });
      return NextResponse.json({ id: res.data.id, ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Upload/Action Error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

