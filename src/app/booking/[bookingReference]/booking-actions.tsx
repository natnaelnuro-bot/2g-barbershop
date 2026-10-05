"use client";

import { useState } from "react";

export function BookingActions({ reference, status }: { reference: string; status: string }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  async function cancel() {
    const response = await fetch(`/api/booking/${reference}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
    const data = await response.json();
    setMessage(response.ok ? "Your appointment has been cancelled." : data.error ?? "Could not cancel this appointment.");
  }
  if (status === "cancelled") return <p className="form-error">This appointment has been cancelled.</p>;
  return <div className="booking-actions"><label htmlFor="cancel-phone">Need to cancel? Confirm your phone number.</label><div><input id="cancel-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+251 ..."/><button type="button" className="secondary-button" onClick={cancel}>Cancel booking</button></div>{message && <p className={message.includes("cancelled") ? "form-error" : ""}>{message}</p>}</div>;
}
