import { sb, json, preflight } from "../../_lib/supabase.js";

export async function onRequestPost({ request, env }) {
  try {
    const order = await request.json();
    if (!order || !order.name || !order.type) {
      return json({ error: "Invalid order data" }, 400);
    }
    const { base, headers } = sb(env);

    // Mirror the original Netlify Blobs logic: remove any previous entry with
    // the same id, or the same name+type, then insert the fresh order.
    // Two separate DELETEs (instead of one OR filter) so Arabic names with
    // commas/parentheses can never break the PostgREST filter syntax.
    if (order.id !== undefined && order.id !== null) {
      const delById = await fetch(
        `${base}/orders?id=eq.${encodeURIComponent(order.id)}`,
        { method: "DELETE", headers }
      );
      if (!delById.ok)
        throw new Error(`Supabase delete-by-id error ${delById.status}`);
    }
    const delByNameType = await fetch(
      `${base}/orders?name=eq.${encodeURIComponent(
        order.name
      )}&type=eq.${encodeURIComponent(order.type)}`,
      { method: "DELETE", headers }
    );
    if (!delByNameType.ok)
      throw new Error(`Supabase delete-by-name-type error ${delByNameType.status}`);

    const insRes = await fetch(`${base}/orders`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify([
        {
          id: order.id,
          type: order.type,
          name: order.name,
          payload: order,
        },
      ]),
    });
    if (!insRes.ok)
      throw new Error(`Supabase insert error ${insRes.status}: ${await insRes.text()}`);

    return json({ ok: true });
  } catch (err) {
    console.error("save-order error:", err);
    return json({ error: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return preflight();
}
