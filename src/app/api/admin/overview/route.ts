import { NextRequest, NextResponse } from "next/server";
import { adminCookie, isAdminSession } from "@/lib/admin-auth";
import { hasSupabaseServiceRole, supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  if (!isAdminSession(request.cookies.get(adminCookie.name)?.value)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (!hasSupabaseServiceRole()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Addis_Ababa" });
  const select = "id,reference,starts_at,ends_at,status,notes,customers(full_name,phone,email),services(name,price_etb,duration_minutes),barbers(name)";
  const result = await supabaseServer(`appointments?select=${encodeURIComponent(select)}&starts_at=gte.${today}T00:00:00%2B03:00&starts_at=lt.${today}T23:59:59%2B03:00&order=starts_at.asc`);
  if (!result.ok) return NextResponse.json({ error: "Could not load appointments." }, { status: 500 });
  const appointments = await result.json();
  const active = appointments.filter((item: { status: string }) => !["cancelled", "no_show"].includes(item.status));
  const expectedRevenue = active.reduce((sum: number, item: { services?: { price_etb?: number } }) => sum + Number(item.services?.price_etb ?? 0), 0);
  return NextResponse.json({ today, appointments, stats: { bookings: appointments.length, expectedRevenue, activeBookings: active.length } });
}
