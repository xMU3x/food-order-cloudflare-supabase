import { sb, json, preflight } from "../../_lib/supabase.js";

export async function onRequestPost({ request, env }) {
  try {
    const prices = await request.json();
    const { base, headers } = sb(env);
    const r = await fetch(`${base}/app_config?on_conflict=key`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify([
        {
          key: "prices-config",
          value: prices,
          updated_at: new Date().toISOString(),
        },
      ]),
    });
    if (!r.ok) throw new Error(`Supabase error ${r.status}: ${await r.text()}`);
    return json({ ok: true });
  } catch (err) {
    console.error("save-prices error:", err);
    return json({ error: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return preflight();
}
