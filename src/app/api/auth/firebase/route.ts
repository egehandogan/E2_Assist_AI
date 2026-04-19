import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { accessToken, email, uid, name, image } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Upsert the User
    const user = await prisma.user.upsert({
      where: { id: uid },
      update: {
        name,
        email,
        image,
      },
      create: {
        id: uid,
        name,
        email,
        image,
      },
    });

    // 2. Upsert the Account holding the Google Access Token
    if (accessToken) {
      const existingAccount = await prisma.account.findFirst({
        where: { userId: uid, provider: "google" }
      });

      if (existingAccount) {
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: { access_token: accessToken }
        });
      } else {
        await prisma.account.create({
          data: {
            userId: uid,
            type: "oauth",
            provider: "google",
            providerAccountId: uid,
            access_token: accessToken,
          }
        });
      }
    }

    // 3. Set a session cookie for the backend
    const cookieStore = await cookies();
    cookieStore.set("firebase-session", uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("Firebase auth bridge error:", error);
    return NextResponse.json({ error: "Failed to sync user data" }, { status: 500 });
  }
}
