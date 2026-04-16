import { NextResponse } from "next/server";
import { createSessionToken, getSessionCookieName, getSessionMaxAgeSec } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const authSecret = process.env.AUTH_SECRET ?? "";

  if (!adminEmail || !adminPassword || !authSecret) {
    return NextResponse.json(
      { error: "Auth env not configured: ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET required" },
      { status: 500 },
    );
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(email, authSecret);
  const response = NextResponse.json({ data: { success: true, role: "owner" } });
  response.cookies.set({
    name: getSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: getSessionMaxAgeSec(),
    path: "/",
  });
  return response;
}

