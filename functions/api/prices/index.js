import { sb, json, preflight } from "../../_lib/supabase.js";

export async function onRequestGet({ env }) {
  try {
    const { base, headers } = sb(env);
    const r = await fetch(
      `${base}/app_config?key=eq.prices-config&select=value`,
      { headers }
    );
    if (!r.ok) throw new Error(`Supabase error ${r.status}: ${await r.text()}`);
    const rows = await r.json();
    return json(rows[0]?.value ?? {});
  } catch (err) {
    console.error("get-prices error:", err);
    // Match original behavior: fail soft with an empty object
    return json({}, 500);
  }
}

export async function onRequestOptions() {
  return preflight();
}
