import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/auth";

export async function POST(req: Request) {
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
