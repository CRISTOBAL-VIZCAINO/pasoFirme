import { supabase, json, esAdmin, rango } from "../lib/util";

export default async (req: Request) => {
  if (req.method !== "GET") return json({ error: "Método no permitido" }, 405);
  if (!esAdmin(req)) return json({ error: "No autorizado" }, 401);

  const { desde, hasta } = rango(new URL(req.url));
  const { data, error } = await supabase.rpc("admin_dashboard", {
    p_desde: desde.toISOString(),
    p_hasta: hasta.toISOString(),
  });
  if (error) {
    console.error("dashboard_error", error.code);
    return json({ error: "Error consultando" }, 500);
  }
  return json(data);
};
