import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/prisma";

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

  return NextResponse.json(result);
}

export async function GET() {
  return POST();
}
