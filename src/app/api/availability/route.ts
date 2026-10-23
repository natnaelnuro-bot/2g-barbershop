import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseServiceRole, supabaseRpc } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const service = searchParams.get("service");
  const barber = searchParams.get("barber") ?? "any";
  if (!date || !service || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Choose a valid date and service." }, { status: 400 });
  if (!hasSupabaseServiceRole()) return NextResponse.json({ error: "Booking is not configured yet." }, { status: 503 });

  try {
    const result = await supabaseRpc("available_slots", {
      p_date: date,
      p_service_slug: service,
      p_barber_slug: barber,
    });
    const body = await result.text();

    if (!result.ok) {
      console.error("Availability query failed", { status: result.status, body });
      return NextResponse.json({ error: "Could not check availability. Please try again." }, { status: 503 });
    }

    // PostgREST normally returns an array. Treat an empty successful body as no
    // available slots rather than letting JSON parsing turn it into a blank 500.
    const rows = body ? JSON.parse(body) : [];
    if (!Array.isArray(rows)) throw new Error("Unexpected availability response");

    return NextResponse.json({
      slots: rows.map((row: { slot_time?: string }) => row.slot_time).filter(Boolean),
    });
  } catch (error) {
    console.error("Availability request failed", error);
    return NextResponse.json({ error: "Could not check availability. Please try again." }, { status: 503 });
  }
}
