import { sb, json, preflight } from "../../_lib/supabase.js";

export async function onRequestPost({ request, env }) {
  try {
    const menuConfig = await request.json();
    if (
      !menuConfig ||
      !Array.isArray(menuConfig.breakfast) ||
      !Array.isArray(menuConfig.lunch)
    ) {
      return json({ error: "Invalid menu data" }, 400);
    }
    const { base, headers } = sb(env);
    const r = await fetch(`${base}/app_config?on_conflict=key`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify([
        {
          key: "menu-config",
          value: menuConfig,
          updated_at: new Date().toISOString(),
        },
      ]),
    });
    if (!r.ok) throw new Error(`Supabase error ${r.status}: ${await r.text()}`);
    return json({ ok: true });
  } catch (err) {
    console.error("save-menu error:", err);
    return json({ error: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return preflight();
}
