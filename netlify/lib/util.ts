import { createClient } from "@supabase/supabase-js";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

export const txt = (v: unknown, max = 120): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

export const esUuid = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export const hashIp = (ip: string) =>
  createHash("sha256")
    .update(ip + (process.env.IP_HASH_SALT ?? ""))
    .digest("hex")
    .slice(0, 32);

const safeEq = (a: string, b: string) => {
  const A = Buffer.from(a),
    B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
};

// ---------- Autenticación del admin ----------
const passwordConfigurada = () => (process.env.ADMIN_PASSWORD ?? "").length >= 12;

export const comprobarPassword = (p: string) => passwordConfigurada() && safeEq(p, process.env.ADMIN_PASSWORD!);

export function firmarToken(horas = 8): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + horas * 3_600_000 })).toString("base64url");
  const sig = createHmac("sha256", process.env.ADMIN_TOKEN_SECRET!).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function tokenValido(token: string): boolean {
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !process.env.ADMIN_TOKEN_SECRET) return false;
  const esperado = createHmac("sha256", process.env.ADMIN_TOKEN_SECRET).update(payload).digest("base64url");
  if (!safeEq(sig, esperado)) return false;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
  } catch {
    return false;
  }
}

/** Acepta  x-api-key: <ADMIN_PASSWORD>  (Postman)  o  Authorization: Bearer <token>  (panel) */
export function esAdmin(req: Request): boolean {
  if (!passwordConfigurada()) return false;
  const key = req.headers.get("x-api-key");
  if (key && safeEq(key, process.env.ADMIN_PASSWORD!)) return true;
  const auth = req.headers.get("authorization") ?? "";
  return auth.startsWith("Bearer ") && tokenValido(auth.slice(7));
}

// ---------- Analítica ----------
const BOT =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|telegram|curl|wget|python|axios|node-fetch|postman/i;
export const esBot = (ua: string | null) => !ua || BOT.test(ua);

export function parseUA(ua: string | null) {
  const s = ua ?? "";
  const dispositivo = /tablet|ipad/i.test(s) ? "tablet" : /mobi|android|iphone/i.test(s) ? "móvil" : "escritorio";
  const navegador = /edg\//i.test(s)
    ? "Edge"
    : /opr\/|opera/i.test(s)
      ? "Opera"
      : /chrome|crios/i.test(s)
        ? "Chrome"
        : /firefox|fxios/i.test(s)
          ? "Firefox"
          : /safari/i.test(s)
            ? "Safari"
            : "Otro";
  const sistema = /android/i.test(s)
    ? "Android"
    : /iphone|ipad|ios/i.test(s)
      ? "iOS"
      : /windows/i.test(s)
        ? "Windows"
        : /mac os/i.test(s)
          ? "macOS"
          : /linux/i.test(s)
            ? "Linux"
            : "Otro";
  return { dispositivo, navegador, sistema };
}

// Nombre legible de cada ruta. Ajusta si las rutas cambian.
const MODULOS: Record<string, string> = {
  "/": "Inicio",
  "/programa": "Cómo funciona",
  "/herramientas": "Herramientas",
  "/herramientas/autodiagnostico": "Autodiagnóstico",
  "/herramientas/caja-diaria": "¿Cuánto ganas de verdad?",
  "/herramientas/gota-a-gota": "Gota a gota vs. microcrédito",
  "/herramientas/simulador-tributario": "Simulador tributario",
  "/entidades": "Entidades",
  "/impacto": "Impacto",
  "/aprende": "Aprende",
  "/nosotros": "Nosotros",
  "/inscripcion": "Inscripción",
  "/privacidad": "Privacidad",
};
export function modulo(ruta: string | null): string {
  const p = (ruta ?? "/").split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return MODULOS[p] ?? p;
}

/** Rango de fechas desde query (?desde=ISO&hasta=ISO). `hasta` es exclusivo. Por defecto: últimos 30 días. */
export function rango(url: URL, diasDefecto = 30) {
  const h = Date.parse(url.searchParams.get("hasta") ?? "");
  const d = Date.parse(url.searchParams.get("desde") ?? "");
  const hasta = new Date(Number.isNaN(h) ? Date.now() + 60_000 : h);
  const desde = new Date(Number.isNaN(d) ? hasta.getTime() - diasDefecto * 86_400_000 : d);
  return { desde, hasta };
}
