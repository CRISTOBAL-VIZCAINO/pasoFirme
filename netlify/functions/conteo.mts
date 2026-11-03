import { supabase, json } from "../lib/util";

export default async () => {
  const { count, error } = await supabase.from("inscripciones").select("id", { count: "exact", head: true });
  if (error) return json({ error: "No disponible" }, 503);
  return json({ total: count ?? 0 }, 200, { "cache-control": "public, max-age=60" });
};
