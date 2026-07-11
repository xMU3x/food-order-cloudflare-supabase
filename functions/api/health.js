// GET /api/health
// فحص سريع: بيتأكد إن الـ environment variables موجودة، وإن Supabase بيرد فعلاً.
// ملحوظة: بيرجع Boolean بس عشان مايكشفش أي مفاتيح سرية.
import { sb, json, preflight } from "../_lib/supabase.js";

export async function onRequestGet({ env }) {
  const result = {
    has_SUPABASE_URL: Boolean(env.SUPABASE_URL),
    has_SUPABASE_SERVICE_ROLE_KEY: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    has_SUPABASE_SECRET_KEY: Boolean(env.SUPABASE_SECRET_KEY),
    supabase_reachable: false,
    supabase_status: null,
    error: null,
  };

  try {
    const { base, headers } = sb(env);
    const r = await fetch(`${base}/app_config?select=key&limit=1`, { headers });
    result.supabase_status = r.status;
    result.supabase_reachable = r.ok;
    if (!r.ok) result.error = await r.text();
  } catch (err) {
    result.error = err.message;
  }

  return json(result);
}

export async function onRequestOptions() {
  return preflight();
}
