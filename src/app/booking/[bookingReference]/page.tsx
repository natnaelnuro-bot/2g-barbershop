import Link from "next/link";
import { Footer, SiteHeader } from "@/components/site-header";
import { hasSupabaseServiceRole, supabaseServer } from "@/lib/supabase-server";
import { BookingActions } from "./booking-actions";

type Booking = { reference: string; starts_at: string; ends_at: string; status: string; customers?: { full_name?: string; phone?: string }; services?: { name?: string; price_etb?: number; duration_minutes?: number }; barbers?: { name?: string } };

export default async function Confirm({ params }: { params: Promise<{ bookingReference: string }> }) {
  const { bookingReference } = await params;
  let booking: Booking | undefined;
  if (hasSupabaseServiceRole()) {
    const select = "reference,starts_at,ends_at,status,customers(full_name,phone),services(name,price_etb,duration_minutes),barbers(name)";
    const result = await supabaseServer(`appointments?reference=eq.${encodeURIComponent(bookingReference.toUpperCase())}&select=${encodeURIComponent(select)}`);
    if (result.ok) [booking] = await result.json();
  }
  const date = booking ? new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Addis_Ababa" }).format(new Date(booking.starts_at)) : "";
  const time = booking ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Addis_Ababa" }).format(new Date(booking.starts_at)) : "";
  return <><SiteHeader/><main className="booking-shell"><div className="confirmation"><p className="eyebrow">{booking ? "APPOINTMENT CONFIRMED" : "BOOKING REFERENCE"}</p><h1>{booking ? "See you at 2G." : "We could not find that appointment."}</h1><p className="ref">REFERENCE · {bookingReference.toUpperCase()}</p>{booking ? <><div className="booking-summary"><p><b>{booking.services?.name}</b> · ETB {Number(booking.services?.price_etb ?? 0).toLocaleString()}</p><p>{date} · {time}</p><p>With {booking.barbers?.name ?? "your 2G barber"} · {booking.services?.duration_minutes} minutes</p><p>{booking.customers?.full_name} · {booking.customers?.phone}</p><p>2G Barbershop · Bole, Addis Ababa</p></div><BookingActions reference={booking.reference} status={booking.status}/></> : <p>Please double-check the link, or contact 2G with your booking reference.</p>}<div className="hero-actions"><Link href="/book" className="gold-button">Book another visit ↗</Link><Link href="/contact" className="ghost-button">Contact 2G</Link></div></div></main><Footer/></>;
}
