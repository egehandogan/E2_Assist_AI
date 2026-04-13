import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Ensure demo user exists
    await prisma.user.upsert({
      where: { id: "demo-user" },
      create: {
        id: "demo-user",
        name: "Nurevşan Doğan",
        email: "nurevsan@demo.com",
      },
      update: {},
    });

    return NextResponse.json({ ok: true, message: "Demo kullanıcı hazır" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
