import { supabase, json, esUuid, esAdmin } from "../lib/util";

export default async (req: Request) => {
  if (req.method !== "GET") return json({ error: "Método no permitido" }, 405);
  if (!esAdmin(req)) return json({ error: "No autorizado" }, 401);
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    // detalle + línea de tiempo
    if (!esUuid(id)) return json({ error: "id inválido" }, 400);
    const [v, ev, ins] = await Promise.all([
      supabase
        .from("visitantes")
        .select("visitor_id,primera_visita,ultima_visita,primera_ruta,utm_source,utm_medium,utm_campaign,referrer,pais,departamento,ciudad,dispositivo,navegador,sistema")
        .eq("visitor_id", id)
        .maybeSingle(),
      supabase
        .from("eventos")
        .select("created_at,tipo,ruta,modulo,detalle,duracion_ms")
        .eq("visitor_id", id)
        .order("created_at", { ascending: true })
        .limit(500),
      supabase.from("inscripciones").select("id,nombre,celular,estado,created_at").eq("visitor_id", id).maybeSingle(),
    ]);
    if (!v.data) return json({ error: "No encontrado" }, 404);
    return json({ visitante: v.data, inscripcion: ins.data, eventos: ev.data ?? [] });
  }

  const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 500);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);
  const d = Date.parse(url.searchParams.get("desde") ?? "");
  const desde = new Date(Number.isNaN(d) ? Date.now() - 30 * 86_400_000 : d);

  const { data, error } = await supabase.rpc("admin_visitantes", {
    p_limit: limit,
    p_offset: offset,
    p_desde: desde.toISOString(),
  });
  if (error) {
    console.error("visitantes_error", error.code);
    return json({ error: "Error consultando" }, 500);
  }
  return json({ items: data ?? [], limit, offset });
};
