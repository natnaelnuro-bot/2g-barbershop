"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { barbers, services } from "@/lib/data";

const labels = ["Service", "Barber", "Date & time", "Your details", "Confirm"];

export function BookingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [service, setService] = useState(services[0].id);
  const [barber, setBarber] = useState("any");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const chosen = services.find((item) => item.id === service)!;

  useEffect(() => {
    if (!date) return;
    setTime(""); setSlots([]); setMessage("");
    fetch(`/api/availability?date=${date}&service=${service}&barber=${barber}`)
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => ok ? setSlots(data.slots ?? []) : setMessage(data.error ?? "Could not check availability."))
      .catch(() => setMessage("Could not check availability. Please try again."));
  }, [date, service, barber]);

  function next() {
    if (step === 3 && (!date || !time)) return setMessage("Choose an available time to continue.");
    if (step === 4 && (!name.trim() || !phone.trim())) return setMessage("Enter your name and phone number to continue.");
    setMessage(""); setStep((current) => Math.min(5, current + 1));
  }

  async function confirm() {
    setSubmitting(true); setMessage("");
    try {
      const response = await fetch("/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ service, barber, date, time, name, phone, email, notes }) });
      const data = await response.json();
      if (response.ok) router.push(`/booking/${data.reference}`);
      else setMessage(data.error ?? "This time is no longer available.");
    } catch { setMessage("Could not create your booking. Please try again."); }
    finally { setSubmitting(false); }
  }

  return <main className="booking-shell"><div className="booking-box"><aside className="booking-aside"><p className="eyebrow">BOOK WITH 2G</p><h2>Your next<br/>best look.</h2><ol className="steps">{labels.map((label, index) => <li className={step === index + 1 ? "active" : ""} key={label}><span className="step-number">0{index + 1}</span>{label}</li>)}</ol></aside><section className="booking-content">
    {step === 1 && <><h1>Choose a service</h1><p>What are we taking care of today?</p><div className="choice-grid">{services.map((item) => <button type="button" className={`choice ${service === item.id ? "selected" : ""}`} key={item.id} onClick={() => setService(item.id)}><strong>{item.name}</strong><span>{item.duration} min · ETB {item.price}</span></button>)}</div></>}
    {step === 2 && <><h1>Choose your barber</h1><p>Select a specific barber or let us choose the first available match.</p><div className="choice-grid"><button type="button" className={`choice ${barber === "any" ? "selected" : ""}`} onClick={() => setBarber("any")}><strong>Any available barber</strong><span>First great fit, earliest time</span></button>{barbers.map((item) => <button type="button" className={`choice ${barber === item.id ? "selected" : ""}`} key={item.id} onClick={() => setBarber(item.id)}><strong>{item.name}</strong><span>{item.specialty}</span></button>)}</div></>}
    {step === 3 && <><h1>Find your time</h1><p>Monday–Saturday, 9:00 AM–8:00 PM. Available slots are checked live.</p><div className="form-row"><div><label htmlFor="booking-date">Date</label><input id="booking-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} min={new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Addis_Ababa" })}/></div></div>{date && <div className="choice-grid availability-slots">{slots.map((slot) => <button type="button" className={`choice ${time === slot ? "selected" : ""}`} key={slot} onClick={() => setTime(slot)}><strong>{slot}</strong><span>Available</span></button>)}{!message && slots.length === 0 && <p>Checking available times…</p>}</div>}</>}
    {step === 4 && <><h1>Your details</h1><p>Guest bookings are welcome. We only use this information to manage your appointment.</p><div className="form-row"><div><label htmlFor="customer-name">Full name</label><input id="customer-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name"/></div><div><label htmlFor="customer-phone">Phone number</label><input id="customer-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+251 ..." autoComplete="tel"/></div></div><label htmlFor="customer-email">Email <small>(optional)</small></label><input id="customer-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" autoComplete="email"/><label htmlFor="booking-notes">Notes <small>(optional)</small></label><textarea id="booking-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything your barber should know?" rows={3}/></>}
    {step === 5 && <><h1>Ready when you are.</h1><p>Please check your appointment before confirming.</p><div className="choice selected"><strong>{chosen.name}</strong><span>{date} · {time} · {barber === "any" ? "Any available barber" : barbers.find((item) => item.id === barber)?.name}</span><p style={{ marginTop: 14 }}>Estimated total: <b>ETB {chosen.price}</b></p><p>{name} · {phone}</p></div></>}
    {message && <p className="form-error" role="alert">{message}</p>}
    <div className="booking-nav">{step > 1 ? <button type="button" className="secondary-button" onClick={() => { setMessage(""); setStep((current) => current - 1); }}>Back</button> : <span/>}{step < 5 ? <button type="button" className="gold-button" onClick={next}>Continue ↗</button> : <button type="button" className="gold-button" disabled={submitting} onClick={confirm}>{submitting ? "Confirming…" : "Confirm booking ↗"}</button>}</div>
  </section></div></main>;
}
