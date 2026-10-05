import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseServiceRole, supabaseRpc } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const service = searchParams.get("service");
  const barber = searchParams.get("barber") ?? "any";
  if (!date || !service || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Choose a valid date and service." }, { status: 400 });
  if (!hasSupabaseServiceRole()) return NextResponse.json({ slots: [] });
  const result = await supabaseRpc("available_slots", { p_date: date, p_service_slug: service, p_barber_slug: barber });
  if (!result.ok) return NextResponse.json({ error: "Could not check availability." }, { status: 500 });
  const rows = await result.json();
  return NextResponse.json({ slots: rows.map((row: { slot_time: string }) => row.slot_time) });
}
