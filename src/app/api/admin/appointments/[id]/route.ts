import { NextRequest, NextResponse } from "next/server";
import { adminCookie, isAdminSession } from "@/lib/admin-auth";
import { hasSupabaseServiceRole, supabaseServer } from "@/lib/supabase-server";

const validStatuses = ["pending", "confirmed", "checked_in", "in_service", "completed", "cancelled", "no_show"];

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdminSession(request.cookies.get(adminCookie.name)?.value)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { status } = await request.json();
  if (!validStatuses.includes(status)) return NextResponse.json({ error: "Invalid appointment status." }, { status: 400 });
  if (!hasSupabaseServiceRole()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const { id } = await context.params;
  const result = await supabaseServer(`appointments?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status, updated_at: new Date().toISOString() }) });
  if (!result.ok) return NextResponse.json({ error: "Could not update the appointment." }, { status: 500 });
  return NextResponse.json({ appointment: (await result.json())[0] });
}
