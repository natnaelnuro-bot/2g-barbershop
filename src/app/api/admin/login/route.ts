import { NextRequest, NextResponse } from "next/server";
import { adminCookie, adminIsConfigured, createAdminSession, validateAdminPassword } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (!adminIsConfigured()) return NextResponse.json({ error: "Admin access has not been configured." }, { status: 503 });
  if (!validateAdminPassword(String(password ?? ""))) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie.name, createAdminSession(), { httpOnly: true, secure: true, sameSite: "lax", maxAge: adminCookie.maxAge, path: "/" });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie.name, "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/" });
  return response;
}
