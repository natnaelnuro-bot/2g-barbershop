const url = process.env.SUPABASE_URL ?? "https://lpceyongjvowvnvxrmdj.supabase.co";

export function hasSupabaseServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function supabaseServer(path: string, init: RequestInit = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("The booking database is not configured.");

  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  return fetch(`${url}/rest/v1/${path}`, { ...init, headers, cache: "no-store" });
}

export async function supabaseRpc(name: string, body: unknown) {
  return supabaseServer(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
}
