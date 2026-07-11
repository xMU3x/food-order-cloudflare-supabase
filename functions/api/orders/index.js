import { sb, json, preflight } from "../../_lib/supabase.js";

export async function onRequestGet({ env }) {
  try {
    const { base, headers } = sb(env);
    const r = await fetch(`${base}/orders?select=payload&order=id.asc`, {
      headers,
    });
    if (!r.ok) throw new Error(`Supabase error ${r.status}: ${await r.text()}`);
    const rows = await r.json();
    return json(rows.map((row) => row.payload));
  } catch (err) {
    console.error("get-orders error:", err);
    return json({ error: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return preflight();
}
