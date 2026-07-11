import { sb, json, preflight } from "../../_lib/supabase.js";

export async function onRequestPost({ env }) {
  try {
    const { base, headers } = sb(env);
    // id is always a positive timestamp (Date.now()), so id=gte.0 matches every row.
    const r = await fetch(`${base}/orders?id=gte.0`, {
      method: "DELETE",
      headers,
    });
    if (!r.ok) throw new Error(`Supabase error ${r.status}: ${await r.text()}`);
    return json({ ok: true });
  } catch (err) {
    console.error("clear-orders error:", err);
    return json({ error: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return preflight();
}
