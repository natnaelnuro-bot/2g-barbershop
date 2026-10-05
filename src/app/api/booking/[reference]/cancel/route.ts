import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseServiceRole, supabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest, context: { params: Promise<{ reference: string }> }) {
  if (!hasSupabaseServiceRole()) return NextResponse.json({ error: "Booking management is unavailable." }, { status: 503 });
  const { phone } = await request.json();
  const { reference } = await context.params;
  const select = "id,status,customers(phone)";
  const lookup = await supabaseServer(`appointments?reference=eq.${encodeURIComponent(reference.toUpperCase())}&select=${encodeURIComponent(select)}`);
  const [appointment] = await lookup.json();
  if (!appointment || appointment.customers?.phone?.replace(/\s/g, "") !== String(phone ?? "").replace(/\s/g, "")) return NextResponse.json({ error: "That phone number does not match this booking." }, { status: 403 });
  if (["completed", "cancelled", "no_show"].includes(appointment.status)) return NextResponse.json({ error: "This appointment can no longer be cancelled online." }, { status: 409 });
  const update = await supabaseServer(`appointments?id=eq.${appointment.id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: "cancelled", updated_at: new Date().toISOString() }) });
  if (!update.ok) return NextResponse.json({ error: "Could not cancel this appointment." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
