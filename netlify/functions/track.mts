import type { Context } from "@netlify/functions";
import { supabase, json, txt, esUuid, hashIp, esBot, parseUA, modulo } from "../lib/util";

const TIPOS = new Set([
  "page_view",
  "page_leave",
  "cta_click",
  "tool_start",
  "tool_complete",
  "form_start",
  "form_submit_ok",
  "form_submit_error",
  "whatsapp_click",
  "faq_open",
  "audio_play",
]);

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json({ ok: false }, 405);

  const raw = await req.text();
  if (raw.length > 10_000) return json({ ok: false }, 413);
  let b: any;
  try {
    b = JSON.parse(raw);
  } catch {
    return json({ ok: false }, 400);
  }

  const ua = req.headers.get("user-agent");
  if (esBot(ua)) return json({ ok: true }); // bots: se ignoran sin error
  if (!esUuid(b.visitorId)) return json({ ok: false }, 400);
  const sesionId = esUuid(b.sesionId) ? b.sesionId : null;

  const eventos = (Array.isArray(b.eventos) ? b.eventos : [])
    .slice(0, 20)
    .filter((e: any) => TIPOS.has(e?.tipo))
    .map((e: any) => {
      const ruta = txt(e.ruta, 200);
      const detalle = e.detalle && typeof e.detalle === "object" && JSON.stringify(e.detalle).length < 800 ? e.detalle : {};
      const dur = Number.isFinite(e.duracionMs) ? Math.max(0, Math.min(Math.round(e.duracionMs), 3_600_000)) : null;
      return { visitor_id: b.visitorId, sesion_id: sesionId, tipo: e.tipo, ruta, modulo: modulo(ruta), detalle, duracion_ms: dur };
    });
  if (!eventos.length) return json({ ok: true });

  const { dispositivo, navegador, sistema } = parseUA(ua);
  const geo = context.geo;

  // 1) crea al visitante la primera vez (conserva el origen de la PRIMERA visita)
  await supabase.from("visitantes").upsert(
    {
      visitor_id: b.visitorId,
      primera_ruta: txt(b.ruta ?? eventos[0].ruta, 200),
      utm_source: txt(b.utm_source, 60),
      utm_medium: txt(b.utm_medium, 60),
      utm_campaign: txt(b.utm_campaign, 60),
      referrer: txt(b.referrer, 200),
      pais: geo?.country?.code ?? null,
      departamento: geo?.subdivision?.name ?? null,
      ciudad: geo?.city ?? null,
      dispositivo,
      navegador,
      sistema,
      ip_hash: hashIp(context.ip ?? ""),
    },
    { onConflict: "visitor_id", ignoreDuplicates: true },
  );
  // 2) actualiza la última visita
  await supabase.from("visitantes").update({ ultima_visita: new Date().toISOString() }).eq("visitor_id", b.visitorId);

  const { error } = await supabase.from("eventos").insert(eventos);
  if (error) {
    console.error("track_error", error.code);
    return json({ ok: false }, 500);
  }
  return json({ ok: true });
};
