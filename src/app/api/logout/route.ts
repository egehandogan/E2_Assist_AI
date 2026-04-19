import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // Clear demo session cookie
  cookieStore.set("demo-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire immediately
  });

  // Clear firebase session cookie
  cookieStore.set("firebase-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  // Clear leftover NextAuth cookies
  cookieStore.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
  cookieStore.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return POST();
}
