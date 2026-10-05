"use client";

import { useEffect, useState } from "react";

type Appointment = { id: string; reference: string; starts_at: string; status: string; notes?: string; customers?: { full_name?: string; phone?: string }; services?: { name?: string; price_etb?: number }; barbers?: { name?: string } };
type Overview = { today: string; appointments: Appointment[]; stats: { bookings: number; expectedRevenue: number; activeBookings: number } };
const statuses = ["pending", "confirmed", "checked_in", "in_service", "completed", "cancelled", "no_show"];

export function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  async function load() {
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    if (response.status === 401) return window.location.assign("/admin/login");
    const data = await response.json();
    if (response.ok) setOverview(data); else setError(data.error ?? "Could not load the day.");
  }
  useEffect(() => { load(); }, []);
  async function updateStatus(id: string, status: string) {
    setSaving(id); setError("");
    const response = await fetch(`/api/admin/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setSaving("");
    if (response.ok) load(); else setError((await response.json()).error ?? "Could not save status.");
  }
  async function logout() { await fetch("/api/admin/login", { method: "DELETE" }); window.location.assign("/"); }
  if (!overview && !error) return <main className="dashboard"><p className="eyebrow">2G MANAGEMENT</p><h2>Loading today&apos;s chair list…</h2></main>;
  return <main className="dashboard"><div className="admin-heading"><div><p className="eyebrow">OWNER OVERVIEW · {overview?.today}</p><h2>Today at 2G</h2></div><button type="button" className="secondary-button" onClick={logout}>Sign out</button></div>{error && <p className="form-error">{error}</p>}{overview && <><div className="stats"><div className="stat"><b>{overview.stats.bookings}</b><span>Bookings today</span></div><div className="stat"><b>ETB {overview.stats.expectedRevenue.toLocaleString()}</b><span>Expected revenue</span></div><div className="stat"><b>{overview.stats.activeBookings}</b><span>Active appointments</span></div><div className="stat"><b>Live</b><span>Database connected</span></div></div><div className="admin-heading"><h3>Today&apos;s appointments</h3><button type="button" className="secondary-button" onClick={load}>Refresh</button></div><div className="table-wrap"><table className="table"><thead><tr><th>Guest</th><th>Service / barber</th><th>Time</th><th>Status</th></tr></thead><tbody>{overview.appointments.length ? overview.appointments.map((appointment) => <tr key={appointment.id}><td><b>{appointment.customers?.full_name ?? "Guest"}</b><br/><small>{appointment.customers?.phone}</small></td><td>{appointment.services?.name ?? "Service"}<br/><small>{appointment.barbers?.name ?? "Assigned barber"}</small></td><td>{new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Addis_Ababa" }).format(new Date(appointment.starts_at))}<br/><small>{appointment.reference}</small></td><td><select aria-label={`Status for ${appointment.reference}`} value={appointment.status} disabled={saving === appointment.id} onChange={(event) => updateStatus(appointment.id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>) : <tr><td colSpan={4}>No appointments scheduled today.</td></tr>}</tbody></table></div></>}</main>;
}
