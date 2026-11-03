import { supabase, json, txt, esUuid, esAdmin } from "../lib/util";

const ESTADOS = ["nuevo", "contactado", "visitado", "descartado"];
const COLUMNAS = [
  "created_at",
  "nombre",
  "celular",
  "canal_contacto",
  "municipio",
  "zona",
  "tipo_negocio",
  "actividad",
  "antiguedad",
  "necesidades",
  "horario",
  "estado",
  "notas",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "referrer",
  "visitor_id",
];

// Evita que Excel interprete una celda como fórmula (=, +, -, @)
const celda = (v: unknown) => {
  let s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export default async (req: Request) => {
  if (!esAdmin(req)) return json({ error: "No autorizado" }, 401);
  const url = new URL(req.url);

  if (req.method === "GET") {
    const csv = url.searchParams.get("formato") === "csv";
    const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 1000);
    const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

    let q = supabase.from("inscripciones").select("*", { count: "exact" }).order("created_at", { ascending: false });
    const estado = url.searchParams.get("estado");
    if (estado && ESTADOS.includes(estado)) q = q.eq("estado", estado);
    const d = url.searchParams.get("desde"),
      h = url.searchParams.get("hasta");
    if (d && !isNaN(Date.parse(d))) q = q.gte("created_at", new Date(d).toISOString());
    if (h && !isNaN(Date.parse(h))) q = q.lt("created_at", new Date(h).toISOString());
    const buscar = (url.searchParams.get("q") ?? "").replace(/[,()%*\\]/g, "").trim().slice(0, 60);
    if (buscar) q = q.or(`nombre.ilike.%${buscar}%,celular.ilike.%${buscar}%,zona.ilike.%${buscar}%`);
    q = csv ? q.limit(5000) : q.range(offset, offset + limit - 1);

    const { data, count, error } = await q;
    if (error) {
      console.error("insc_get", error.code);
      return json({ error: "Error consultando" }, 500);
    }

    if (csv) {
      const filas = [COLUMNAS.join(","), ...(data ?? []).map((r) => COLUMNAS.map((c) => celda((r as any)[c])).join(","))];
      return new Response("﻿" + filas.join("\r\n"), {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": 'attachment; filename="inscripciones.csv"',
          "cache-control": "no-store",
        },
      });
    }
    return json({ total: count ?? 0, devueltos: data?.length ?? 0, items: data });
  }

  if (req.method === "PATCH") {
    let b: any;
    try {
      b = await req.json();
    } catch {
      return json({ error: "JSON inválido" }, 400);
    }
    if (!esUuid(b.id)) return json({ error: "id inválido" }, 400);
    const cambios: Record<string, unknown> = {};
    if (b.estado !== undefined) {
      if (!ESTADOS.includes(b.estado)) return json({ error: "estado inválido" }, 400);
      cambios["estado"] = b.estado;
    }
    if (b.notas !== undefined) cambios["notas"] = txt(b.notas, 2000);
    if (!Object.keys(cambios).length) return json({ error: "Nada que actualizar" }, 400);
    const { data, error } = await supabase.from("inscripciones").update(cambios).eq("id", b.id).select().single();
    if (error) return json({ error: "No se pudo actualizar" }, 500);
    return json({ ok: true, item: data });
  }

  if (req.method === "DELETE") {
    // derecho de supresión (habeas data)
    const id = url.searchParams.get("id");
    if (!esUuid(id)) return json({ error: "id inválido" }, 400);
    const { error } = await supabase.from("inscripciones").delete().eq("id", id);
    if (error) return json({ error: "No se pudo borrar" }, 500);
    return json({ ok: true });
  }

  return json({ error: "Método no permitido" }, 405);
};
