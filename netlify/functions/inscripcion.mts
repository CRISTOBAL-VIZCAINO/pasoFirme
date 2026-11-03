import type { Context } from "@netlify/functions";
import { supabase, json, txt, esUuid, hashIp } from "../lib/util";

// Celular colombiano: 10 dígitos que empiezan por 3 (acepta +57 / 57 al inicio)
function normalizarCelular(v: unknown): string | null {
  const d = String(v ?? "")
    .replace(/\D/g, "")
    .replace(/^57(?=3\d{9}$)/, "");
  return /^3\d{9}$/.test(d) ? d : null;
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json({ ok: false, error: "Método no permitido" }, 405);

  let b: any;
  try {
    b = await req.json();
  } catch {
    return json({ ok: false, error: "JSON inválido" }, 400);
  }

  // Anti-spam: campo trampa oculto + tiempo mínimo de llenado (a los bots les decimos "ok")
  if (b.website) return json({ ok: true });
  if (typeof b.tiempoMs === "number" && b.tiempoMs < 2000) return json({ ok: true });

  const nombre = txt(b.nombre, 100);
  const celular = normalizarCelular(b.celular);
  if (!nombre || nombre.length < 2) return json({ ok: false, error: "Escribe tu nombre." }, 400);
  if (!celular) return json({ ok: false, error: "Revisa tu celular (10 dígitos)." }, 400);
  if (b.consentimiento !== true) return json({ ok: false, error: "Necesitamos tu autorización de datos." }, 400);

  // Liga la inscripción con el visitante solo si ese visitante existe
  let visitorId: string | null = null;
  if (esUuid(b.visitorId)) {
    const { data } = await supabase.from("visitantes").select("visitor_id").eq("visitor_id", b.visitorId).maybeSingle();
    visitorId = data ? b.visitorId : null;
  }

  const row = {
    nombre,
    celular,
    canal_contacto: txt(b.canal, 30),
    municipio: txt(b.municipio, 80),
    zona: txt(b.zona, 120),
    tipo_negocio: txt(b.tipo, 80),
    actividad: txt(b.actividad, 120),
    antiguedad: txt(b.antiguedad, 40),
    necesidades: Array.isArray(b.necesidades) ? b.necesidades.slice(0, 8).map((n: unknown) => txt(n, 60)).filter(Boolean) : [],
    horario: txt(b.horario, 60),
    consentimiento: true,
    consentimiento_at: new Date().toISOString(),
    version_politica: txt(b.versionPolitica, 20),
    visitor_id: visitorId,
    sesion_id: esUuid(b.sesionId) ? b.sesionId : null,
    utm_source: txt(b.utm_source, 60),
    utm_medium: txt(b.utm_medium, 60),
    utm_campaign: txt(b.utm_campaign, 60),
    referrer: txt(b.referrer, 200),
    ip_hash: hashIp(context.ip ?? ""),
    user_agent: txt(req.headers.get("user-agent"), 200),
  };

  // Si el celular ya existe no duplica ni lo revela: responde igual de "ok"
  const { error } = await supabase.from("inscripciones").upsert(row, { onConflict: "celular", ignoreDuplicates: true });
  if (error) {
    console.error("inscripcion_error", error.code); // sin datos personales en logs
    return json({ ok: false, error: "No pudimos guardar tu inscripción. Intenta de nuevo." }, 500);
  }
  return json({ ok: true }, 201);
};
