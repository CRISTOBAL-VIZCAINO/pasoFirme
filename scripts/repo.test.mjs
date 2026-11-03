// Pruebas de consistencia del repositorio (sin dependencias): `npm run test:repo`.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';

const RAIZ = new URL('..', import.meta.url).pathname;
const IGNORAR = new Set(['node_modules', '.git', 'dist', '.angular', 'package-lock.json']);
const TEXTO = /\.(ts|html|mjs|mts|md|json|toml|scss|svg|txt|webmanifest)$/;
const propio = new URL(import.meta.url).pathname;

function archivos(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    if (IGNORAR.has(nombre)) return [];
    const ruta = join(dir, nombre);
    return statSync(ruta).isDirectory() ? archivos(ruta) : TEXTO.test(nombre) ? [ruta] : [];
  });
}
const todos = archivos(RAIZ).filter((f) => f !== propio);
const leer = (f) => readFileSync(f, 'utf8');
const rel = (f) => relative(RAIZ, f);

test('no queda el número de relleno 570000000000', () => {
  assert.deepEqual(todos.filter((f) => leer(f).includes('570000000000')).map(rel), []);
});

test('todo enlace wa.me con número usa 573206486123', () => {
  const malos = [];
  for (const f of todos) {
    for (const m of leer(f).matchAll(/wa\.me\/(\d+)/g)) {
      // El panel antepone 57 al celular de cada inscrito: no es el número oficial.
      const delPanel = rel(f).startsWith('src/app/features/admin/') && m[1] === '57';
      const delEjemploE2e = rel(f) === 'scripts/e2e.mjs' && m[1] === '573001234567'; // celular de prueba de un inscrito
      if (m[1] !== '573206486123' && !delPanel && !delEjemploE2e) malos.push(`${rel(f)}: ${m[0]}`);
    }
  }
  assert.deepEqual(malos, []);
});

test('ningún archivo de src escribe el número a mano (salvo contacto.ts)', () => {
  const con = todos.filter((f) => rel(f).startsWith('src/') && !f.endsWith('core/contacto.ts') && !f.endsWith('core/contacto.spec.ts') && /573206486123|320 648 6123/.test(leer(f)));
  assert.deepEqual(con.map(rel), []);
});

test('netlify.toml: sin redirecciones hacia /.netlify/ y con la regla del SPA y los headers del panel', () => {
  const toml = leer(join(RAIZ, 'netlify.toml'));
  const redirects = [...toml.matchAll(/\[\[redirects\]\]([\s\S]*?)(?=\n\[\[|$)/g)].map((m) => m[1]);
  assert.equal(redirects.length, 1, 'solo debe existir la regla del SPA');
  assert.match(redirects[0], /from\s*=\s*"\/\*"/);
  assert.match(redirects[0], /to\s*=\s*"\/index\.html"/);
  assert.match(redirects[0], /status\s*=\s*200/);
  assert.ok(!/\/\.netlify\//.test(redirects.join('\n')), 'ninguna redirección debe apuntar a /.netlify/');
  assert.ok(!/(from|to)\s*=\s*"\/\.netlify/.test(toml), 'netlify.toml no debe redirigir /.netlify/*');
  assert.match(toml, /for\s*=\s*"\/admin"/);
  assert.match(toml, /for\s*=\s*"\/admin\/\*"/);
});

test('las funciones de Netlify no dependen de ninguna regla del SPA', () => {
  // Las rutas /.netlify/functions/* las atiende Netlify antes de aplicar redirecciones: el cliente solo las llama por esa ruta.
  const funciones = readdirSync(join(RAIZ, 'netlify/functions')).filter((f) => f.endsWith('.mts'));
  assert.ok(funciones.length > 0);
  const toml = leer(join(RAIZ, 'netlify.toml'));
  assert.match(toml, /\[functions\][\s\S]*directory\s*=\s*"netlify\/functions"/);
  const usos = todos.filter((f) => rel(f).startsWith('src/')).flatMap((f) => [...leer(f).matchAll(/\/\.netlify\/functions\/([\w-]+)/g)].map((m) => m[1]));
  for (const nombre of usos) assert.ok(funciones.includes(`${nombre}.mts`), `falta la función ${nombre}`);
});
