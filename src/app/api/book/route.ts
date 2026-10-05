import { NextResponse } from "next/server";
import { hasSupabaseServiceRole, supabaseRpc } from "@/lib/supabase-server";

const required = ["service", "barber", "date", "time", "name", "phone"];

export async function POST(request: Request) {
  const body = await request.json();
  if (required.some((key) => !String(body[key] ?? "").trim())) return NextResponse.json({ error: "Please complete all required appointment details." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date) || !/^\d{2}:\d{2}$/.test(body.time)) return NextResponse.json({ error: "Choose a valid appointment time." }, { status: 400 });
  if (!hasSupabaseServiceRole()) return NextResponse.json({ error: "Online booking is being configured. Please call 2G to book." }, { status: 503 });

  const reference = `2G-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const result = await supabaseRpc("create_appointment", { p_service_slug: body.service, p_barber_slug: body.barber, p_customer_name: body.name.trim(), p_customer_phone: body.phone.trim(), p_customer_email: String(body.email ?? "").trim(), p_notes: String(body.notes ?? "").trim(), p_start_at: `${body.date}T${body.time}:00+03:00`, p_reference: reference });
  if (!result.ok) return NextResponse.json({ error: "That time is no longer available. Please choose another slot." }, { status: 409 });
  return NextResponse.json({ reference }, { status: 201 });
}
