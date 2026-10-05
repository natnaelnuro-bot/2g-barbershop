"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader, Footer } from "@/components/site-header";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await response.json(); setLoading(false);
    if (response.ok) router.replace("/admin"); else setError(data.error ?? "Could not sign in.");
  }
  return <><SiteHeader/><main className="admin-login"><form className="booking-content" onSubmit={submit}><p className="eyebrow">2G MANAGEMENT</p><h1>Owner sign in</h1><p>Use the owner password configured for 2G Barbershop.</p><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required/>{error && <p className="form-error">{error}</p>}<button className="gold-button" disabled={loading}>{loading ? "Signing in…" : "Sign in ↗"}</button></form></main><Footer/></>;
}
