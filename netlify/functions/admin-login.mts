import type { Context } from "@netlify/functions";
import { supabase, json, txt, hashIp, comprobarPassword, firmarToken } from "../lib/util";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json({ ok: false }, 405);

  const ipHash = hashIp(context.ip ?? "");
  const hace15 = new Date(Date.now() - 15 * 60_000).toISOString();
  const { count } = await supabase
    .from("admin_accesos")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("exito", false)
    .gte("created_at", hace15);
  if ((count ?? 0) >= 5) return json({ ok: false, error: "Demasiados intentos. Espera 15 minutos." }, 429);

  let b: any;
  try {
    b = await req.json();
  } catch {
    return json({ ok: false }, 400);
  }

  const ok = typeof b.password === "string" && comprobarPassword(b.password);
  await supabase.from("admin_accesos").insert({
    ip_hash: ipHash,
    exito: ok,
    user_agent: txt(req.headers.get("user-agent"), 200),
  });
  if (!ok) {
    await new Promise((r) => setTimeout(r, 500)); // frena la fuerza bruta
    return json({ ok: false, error: "Contraseña incorrecta." }, 401);
  }
  return json({ ok: true, token: firmarToken(8), expiraEnHoras: 8 });
};
