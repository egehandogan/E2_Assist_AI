import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST() {
  const result = await dbSafe(async () => {
    await prisma.user.upsert({
      where: { id: "demo-user" },
      create: {
        id: "demo-user",
        name: "Nurevşan Doğan",
        email: "nurevsan@demo.com",
      },
      update: {},
    });
    return { ok: true, message: "Demo kullanıcı hazır" };
  }, { ok: false, message: "DB bağlantısı yok — demo modda çalışıyor" });

  // Set a demo session cookie so middleware can recognize the user
  const cookieStore = await cookies();
  cookieStore.set("demo-session", "demo-user", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return NextResponse.json(result);
}

export async function GET() {
  return POST();
}
