// Pruebas funcionales de punta a punta sobre el build de producción, vía Chrome DevTools Protocol.
// Uso: npm run test:e2e   (requiere Google Chrome; ruta configurable con CHROME_BIN)
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = 'http://localhost:4400';
const OUT = mkdtempSync(join(tmpdir(), 'pasofirme-e2e-'));
const servidor = spawn(process.execPath, [new URL('./serve-dist.mjs', import.meta.url).pathname, 'dist/paso-firme-web/browser'], { stdio: 'ignore' });
const port = 9700 + Math.floor(Math.random() * 90);
const chrome = spawn(process.env.CHROME_BIN ?? 'google-chrome-stable', [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--force-prefers-reduced-motion',
  `--remote-debugging-port=${port}`, `--user-data-dir=${OUT}/e2e-${port}`, 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t;
for (let i = 0; i < 50 && !t; i++) { await sleep(200); try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((x) => x.type === 'page'); } catch {} }
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pend = new Map();
const errores = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') errores.push('EXCEPCIÓN: ' + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text));
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'assert'].includes(m.params.type)) errores.push(`console.${m.params.type}: ` + m.params.args.map((a) => a.value ?? a.description).join(' '));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
    const url = m.params.entry.url ?? '';
    if (!/\/images\//.test(url)) errores.push('LOG: ' + m.params.entry.text + ' ' + url);
  }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error('eval: ' + (r.result.exceptionDetails.exception?.description ?? expr));
  return r.result?.result?.value;
};
await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
// Las funciones de Netlify no existen en el servidor estático: se simulan y se registran las llamadas.
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
  window.__calls = [];
  const original = window.fetch.bind(window);
  window.fetch = (u, o) => {
    const url = String(u);
    if (!url.includes('/.netlify/functions/')) return original(u, o);
    const nombre = url.split('/').pop();
    window.__calls.push({ nombre, body: typeof o?.body === 'string' ? o.body : null });
    const cuerpo = nombre === 'conteo' ? { total: 25 } : { ok: true };
    return new Promise((r) => setTimeout(() => r(new Response(JSON.stringify(cuerpo), { status: nombre === 'inscripcion' ? 201 : 200, headers: { 'content-type': 'application/json' } })), nombre === 'inscripcion' ? 700 : 0));
  };
  navigator.sendBeacon = (u) => { window.__calls.push({ nombre: String(u).split('/').pop(), beacon: true, body: null }); return true; };
` });

let ok = 0, fail = 0;
const fallos = [];
function check(nombre, cond, detalle = '') {
  if (cond) { ok++; } else { fail++; fallos.push(`✘ ${nombre} ${detalle}`); }
  console.log(`${cond ? '✔' : '✘'} ${nombre}${cond ? '' : '  → ' + detalle}`);
}
async function viewport(w, h = 900) { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 }); }
async function abrir(path) { await send('Page.navigate', { url: BASE + path }); await waitFor('document.querySelector("app-footer") && document.querySelector("main h1")', 8000); await sleep(400); }
async function waitFor(expr, ms = 4000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(expr)) return true; } catch {} await sleep(100); } return false; }
const txt = (sel) => ev(`(document.querySelector(${JSON.stringify(sel)})?.textContent ?? '').replace(/\\s+/g,' ').replace(/\\u00a0/g,' ').trim()`);
const setVal = (sel, v, evt = 'input') => ev(`(()=>{const el=document.querySelector(${JSON.stringify(sel)}); el.value=${JSON.stringify(String(v))}; el.dispatchEvent(new Event(${JSON.stringify(evt)},{bubbles:true})); el.dispatchEvent(new Event('blur',{bubbles:true})); return true;})()`);
const click = (sel) => ev(`(()=>{const el=document.querySelector(${JSON.stringify(sel)}); if(!el) throw new Error('no existe ${sel.replace(/'/g, '')}'); el.click(); return true;})()`);
const tick = () => sleep(250);
// Hace clic en la opción (label) cuyo texto visible coincide, como lo haría una persona.
const clickTexto = (sel, texto) => ev(`(()=>{const el=[...document.querySelectorAll(${JSON.stringify(sel)})].find(l=>l.textContent.trim()===${JSON.stringify(texto)}); if(!el) throw new Error('no existe '+${JSON.stringify(texto)}); (el.querySelector('input')??el).click(); return true;})()`);
// Angular asigna [value] como propiedad, no como atributo: se busca por propiedad.
const clickVal = (sel, v) => ev(`(()=>{const el=[...document.querySelectorAll(${JSON.stringify(sel)})].find(i=>i.value===${JSON.stringify(String(v))}); if(!el) throw new Error('no existe opción '+${JSON.stringify(String(v))}); el.click(); return true;})()`);
const cop = (s) => s.replace(/ /g, ' ');

await viewport(1280);

// ─────────────────────────── 1. Todas las rutas (enlace directo / recarga) ───────────────────────────
console.log('\n## 1. Rutas, títulos y meta descripción');
const rutas = {
  '/': 'Paso Firme · Tu negocio, con paso firme',
  '/programa': 'Cómo funciona · Paso Firme',
  '/herramientas': 'Herramientas gratuitas · Paso Firme',
  '/herramientas/caja-diaria': '¿Cuánto gana de verdad tu negocio? · Paso Firme',
  '/herramientas/gota-a-gota': 'Gota a gota vs. microcrédito · Paso Firme',
  '/herramientas/simulador-tributario': 'Simulador tributario pedagógico · Paso Firme',
  '/herramientas/autodiagnostico': 'Autodiagnóstico de tu negocio · Paso Firme',
  '/entidades': 'Para entidades aliadas · Paso Firme',
  '/impacto': 'Impacto y SROI · Paso Firme',
  '/aprende': 'Aprende · Paso Firme',
  '/nosotros': 'Nosotros · Paso Firme',
  '/inscripcion': 'Quiero que me visiten · Paso Firme',
  '/privacidad': 'Tratamiento de datos personales · Paso Firme',
  '/ruta-que-no-existe': 'Página no encontrada · Paso Firme',
};
const descripciones = new Set();
for (const [ruta, titulo] of Object.entries(rutas)) {
  await abrir(ruta);
  const h1 = await txt('main h1');
  const title = await ev('document.title');
  const desc = await ev('document.querySelector("meta[name=description]").content');
  descripciones.add(desc);
  check(`${ruta} carga con un único h1`, !!h1 && (await ev('document.querySelectorAll("h1").length')) === 1, `h1="${h1}"`);
  check(`${ruta} título de pestaña`, title === titulo, `obtuvo "${title}"`);
}
check('Cada página tiene su propia meta descripción', descripciones.size >= 13, `${descripciones.size} distintas`);
await abrir('/ruta-que-no-existe');
check('Ruta inexistente muestra la página 404', (await txt('main h1')) === 'Este paso no existe');

// ─────────────────────────── 2. Enlaces internos y anclas ───────────────────────────
console.log('\n## 2. Enlaces internos, anclas y externos');
const conocidas = Object.keys(rutas).filter((r) => r !== '/ruta-que-no-existe');
const enlaces = new Map();
for (const ruta of conocidas) {
  await abrir(ruta);
  const hrefs = await ev(`[...document.querySelectorAll('a[href]')].map(a => ({href: a.getAttribute('href'), text: a.textContent.trim().slice(0,40), target: a.target}))`);
  for (const h of hrefs) if (!enlaces.has(h.href)) enlaces.set(h.href, { desde: ruta, ...h });
}
const externos = [];
for (const [href, info] of enlaces) {
  if (/^(https?:|mailto:)/.test(href)) { externos.push(href); continue; }
  const url = new URL(href, BASE + info.desde);
  const destino = url.pathname;
  check(`Enlace «${info.text}» (${href}) apunta a una ruta existente`, conocidas.includes(destino), `desde ${info.desde}`);
  if (url.hash) {
    await abrir(destino);
    const existe = await ev(`!!document.getElementById(${JSON.stringify(url.hash.slice(1))})`);
    check(`Ancla ${href} existe en el destino`, existe);
  }
}
check('Enlaces de WhatsApp bien formados', externos.filter((h) => h.startsWith('https://wa.me/')).every((h) => /^https:\/\/wa\.me\/\d+\?text=.+/.test(h)), externos.join(' | '));
check('Sin enlaces mailto con correos de prueba', !externos.some((h) => /example/.test(h)));
await abrir('/');
check('Enlaces externos abren en pestaña nueva con rel=noopener', await ev(`[...document.querySelectorAll('a[href^="https://"]')].every(a => a.target === '_blank' && a.rel.includes('noopener'))`));

// Navegación SPA real con clic + ancla
await abrir('/');
await click('a[href="/programa#humano-ia"]');
await waitFor('location.pathname === "/programa"');
await sleep(600);
check('Clic en «Así repartimos el trabajo» navega a /programa#humano-ia', (await ev('location.pathname + location.hash')) === '/programa#humano-ia');
check('…y desplaza la página hasta la sección', await ev(`(()=>{const r=document.getElementById('humano-ia').getBoundingClientRect(); return r.top < 200 && r.top > -50;})()`), `top=${await ev(`Math.round(document.getElementById('humano-ia').getBoundingClientRect().top)`)}`);
await click('a.btn--light[href="/programa#requisitos"]');
await sleep(600);
check('Botón «¿Quién puede participar?» lleva a #requisitos en la misma página', await ev(`(()=>{const r=document.getElementById('requisitos').getBoundingClientRect(); return r.top < 200 && r.top > -50;})()`));
await click('header a[href="/aprende"]');
await waitFor('location.pathname === "/aprende"');
await sleep(300);
check('Al navegar a otra página se vuelve arriba', (await ev('window.scrollY')) < 5, `scrollY=${await ev('scrollY')}`);
check('Menú marca la página activa (aria-current)', (await ev(`document.querySelector('.desktop-nav a[aria-current="page"]')?.textContent.trim()`)) === 'Aprende');

// ─────────────────────────── 3. Menú móvil ───────────────────────────
console.log('\n## 3. Menú móvil');
await viewport(375, 800);
await abrir('/');
check('Botón de menú visible en móvil', await ev(`getComputedStyle(document.querySelector('.menu-toggle')).display !== 'none'`));
check('Menú del escritorio oculto en móvil', await ev(`getComputedStyle(document.querySelector('.desktop-nav')).display === 'none'`));
check('Menú móvil cerrado e inerte al inicio', await ev(`document.querySelector('#mobile-menu').hasAttribute('inert') && !document.querySelector('#mobile-menu').classList.contains('is-open')`));
await click('.menu-toggle'); await tick();
check('Abre el menú (aria-expanded=true, visible, bloquea scroll)', await ev(`document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='true' && document.querySelector('#mobile-menu').classList.contains('is-open') && !document.querySelector('#mobile-menu').hasAttribute('inert') && document.body.style.overflow==='hidden'`));
await click('#mobile-menu a[href="/herramientas"]');
await waitFor('location.pathname === "/herramientas"'); await sleep(300);
check('Al elegir una opción navega y cierra el menú', await ev(`location.pathname==='/herramientas' && !document.querySelector('#mobile-menu').classList.contains('is-open') && document.body.style.overflow===''`));
await click('.menu-toggle'); await tick();
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await tick();
check('La tecla Escape cierra el menú', await ev(`!document.querySelector('#mobile-menu').classList.contains('is-open') && document.body.style.overflow===''`));
await viewport(1280);

// ─────────────────────────── 4. Inicio: hero, confianza, calculadora, mitos y carrusel ───────────────────────────
console.log('\n## 4. Inicio: hero, confianza, calculadora, mitos y carrusel');
await abrir('/');
check('Hero: botón principal «Quiero que me visiten»', (await txt('.hero .btn--primary')).startsWith('Quiero que me visiten'));
check('Hero: sin el chip inventado del 84 %', !(await txt('.hero')).includes('84'));
await setVal('#h-vendi', 200000); await setVal('#h-gaste', 90000); await tick();
check('Mini-interacción del hero: «Te quedaron $ 110.000»', cop(await txt('.mini-out')).includes('$ 110.000'), cop(await txt('.mini-out')));
check('Franja de confianza: «Lo que nunca hacemos» con 3 compromisos', (await ev(`document.querySelectorAll('.trust-card--never li').length`)) === 3);
check('Franja de confianza nombra a UNAB y UNIMINUTO', (await txt('.trust-org')).includes('UNAB') && (await txt('.trust-org')).includes('UNIMINUTO'));
check('Cifras: «7 de cada 10» y $1.200.000 (ejemplo)', (await txt('.figures')).includes('de cada 10') && cop(await txt('.figures')).includes('$1.200.000') && (await txt('.figures')).includes('Es un ejemplo'));
check('Línea de tiempo con 4 hitos (Día 1 → Día 90)', (await ev(`document.querySelectorAll('.timeline .hito').length`)) === 4 && (await txt('.timeline')).includes('Día 90'));
check('Tabla comparativa gota a gota vs. Paso Firme (3 filas)', (await ev(`document.querySelectorAll('.compare tbody tr').length`)) === 3);
await ev(`document.querySelector('app-caja-rapida').scrollIntoView()`); await sleep(500);
await setVal('#cr-ventas', 230000); await setVal('#cr-merc', 80000); await setVal('#cr-gastos', 10000); await setVal('#cr-casa', 100000); await tick();
check('Calculadora del inicio: ganancia $ 140.000 y semáforo verde', cop(await txt('app-caja-rapida .big strong')) === '$ 140.000' && (await ev(`!!document.querySelector('.result--verde')`)), cop(await txt('app-caja-rapida .big strong')));
check('Calculadora del inicio: enlace de WhatsApp para compartir', await ev(`[...document.querySelectorAll('app-caja-rapida a')].some(a => a.href.startsWith('https://wa.me/?text='))`));
await setVal('#cr-casa', 200000); await tick();
check('Calculadora del inicio: si saca de más, semáforo rojo', await ev(`!!document.querySelector('.result--rojo')`));
check('Mitos: acordeón de 3 preguntas cerradas', (await ev(`document.querySelectorAll('.acordeon details').length`)) === 3 && (await ev(`[...document.querySelectorAll('.acordeon details')].every(d => !d.open)`)));
await click('.acordeon summary'); await tick();
check('Mitos: al tocar se abre la realidad', await ev(`document.querySelector('.acordeon details').open`));
const dot = `[...document.querySelectorAll('app-photo-carousel .dot')].findIndex(d=>d.classList.contains('is-active'))`;
await ev(`document.querySelector('app-photo-carousel').scrollIntoView()`); await sleep(800);
check('Carrusel con 6 fotos rotuladas «Imagen ilustrativa»', (await ev(`document.querySelectorAll('app-photo-carousel .slide').length`)) === 6 && (await ev(`document.querySelectorAll('app-photo-carousel .ilustrativa').length`)) >= 1);
check('Las 6 fotos del territorio cargan (sin espacio reservado)', (await ev(`document.querySelectorAll('app-photo-carousel .placeholder').length`)) === 0);
check('Con movimiento reducido no hay autoplay ni botón de pausa', await ev(`!document.querySelector('app-photo-carousel [aria-label*="carrusel"]')`));
await click('app-photo-carousel [aria-label="Foto siguiente"]'); await sleep(400);
check('Flecha «siguiente» avanza a la foto 2', (await ev(dot)) === 1);
await click('app-photo-carousel [aria-label="Foto anterior"]'); await sleep(400);
await click('app-photo-carousel [aria-label="Foto anterior"]'); await sleep(400);
check('«Anterior» desde la primera va a la última', (await ev(dot)) === 5);
await click('app-photo-carousel .dot:nth-child(3)'); await sleep(400);
check('Punto 3 lleva a la foto 3', (await ev(dot)) === 2 && (await ev(`document.querySelector('app-photo-carousel .dot:nth-child(3)').getAttribute('aria-current')`)) === 'true');

// Sin jerga en el inicio ni en la inscripción (lista Q6 del rediseño)
const jerga = /originaci|scoring|risk-as|sroi|soberan|microtaller|consultor s[eé]nior|\bRST\b|\bRUI\b|Sisb[eé]n IV|phygital/i;
const textoInicio = await ev(`document.querySelector('main').innerText`);
check('Inicio sin jerga (originación, scoring, SROI, microtalleres, RST, RUI…)', !jerga.test(textoInicio), (textoInicio.match(jerga) ?? [''])[0]);
await abrir('/inscripcion');
check('Inscripción sin jerga', !jerga.test(await ev(`document.querySelector('main').innerText`)));
await abrir('/');

// Tamaño del inicio (criterios de aceptación del rediseño)
await viewport(1280); await abrir('/'); await sleep(600);
const altoEscritorio = await ev(`document.documentElement.scrollHeight`);
const caracteres = await ev(`document.querySelector('main').innerText.replace(/\\s+/g,' ').length`);
check(`Inicio en escritorio ≤ 5.500 px (mide ${altoEscritorio})`, altoEscritorio <= 5500);
check(`Inicio con ≤ 4.500 caracteres de texto (tiene ${caracteres})`, caracteres <= 4500);
await viewport(390, 844); await abrir('/'); await sleep(600);
const altoMovil = await ev(`document.documentElement.scrollHeight`);
check(`Inicio en celular ≤ 9.500 px (mide ${altoMovil})`, altoMovil <= 9500);
check('Sin desborde horizontal en celular', await ev(`document.documentElement.scrollWidth <= window.innerWidth`));
check('Botón principal visible sin hacer scroll en celular', await ev(`document.querySelector('.hero .btn--primary').getBoundingClientRect().top < window.innerHeight`));
await viewport(1280);

// ─────────────────────────── 5. Calculadora de caja diaria ───────────────────────────
console.log('\n## 5. Calculadora «¿Cuánto gana de verdad tu negocio?»');
await abrir('/herramientas/caja-diaria');
await setVal('#ventas', 230000); await setVal('#costo', 40); await setVal('#gastos', 10000); await setVal('#casa', 100000); await setVal('#deuda', 0); await tick();
check('Ganancia real = $ 128.000', cop(await txt('.tool-result .result-big')) === '$ 128.000', await txt('.tool-result .result-big'));
check('Margen real 56%', (await txt('.tool-result')).includes('Margen real: 56%'));
check('Semáforo verde', await ev(`!!document.querySelector('.verdict--verde')`));
check('Texto del deslizador se actualiza ($40 de cada $100)', (await txt('.value-echo')) === '$40 de cada $100 vendidos');
await setVal('#casa', 200000); await setVal('#deuda', 15000); await tick();
check('Si saca más de lo que gana: semáforo rojo', await ev(`!!document.querySelector('.verdict--rojo')`));
check('Muestra la fila de cuota de préstamos cuando hay deuda', (await txt('.tool-result')).includes('Cuota de préstamos'));
await clickTexto('.choice', '5 días'); await tick();
check('Cambiar a 5 días recalcula la pérdida semanal (87.000×5 = 435.000)', cop(await txt('.verdict--rojo')).includes('$ 435.000'), cop(await txt('.verdict--rojo')));
await setVal('#ventas', ''); await tick();
check('Campo vacío no rompe el cálculo (sin NaN)', !(await txt('.tool-result')).includes('NaN'));

// ─────────────────────────── 6. Gota a gota ───────────────────────────
console.log('\n## 6. Calculadora gota a gota vs. microcrédito');
await abrir('/herramientas/gota-a-gota');
await setVal('#monto', 500000); await setVal('#plazo', 1); await setVal('#tinf', 20); await setVal('#tfor', 2); await setVal('#dias', 25); await tick();
check('Ahorro = $ 90.000', cop(await txt('.tool-result .result-big')) === '$ 90.000', await txt('.tool-result .result-big'));
check('Cuota diaria gota a gota $ 24.000', cop(await txt('.tool-result')).includes('$ 24.000'));
check('«10,0 veces más» intereses', (await txt('.tool-result')).includes('10,0 veces más'));
check('Plazo en singular: «1 mes»', (await txt('.value-echo')) === '1 mes');
await setVal('#plazo', 12); await tick();
check('Plazo plural: «12 meses» y la barra informal al 100%', (await txt('.value-echo')) === '12 meses' && (await ev(`document.querySelector('.bar-fill--coral').style.width`)) === '100%');

// ─────────────────────────── 7. Simulador tributario ───────────────────────────
console.log('\n## 7. Simulador tributario');
await abrir('/herramientas/simulador-tributario');
await setVal('#ventasMes', 5000000); await tick();
check('Ingresos anuales $ 60.000.000', cop(await txt('.tool-result .result-big')) === '$ 60.000.000');
check('RST tienda 1,2% = $ 720.000', cop(await txt('.scenarios')).includes('$ 720.000'), cop(await txt('.scenarios')));
await setVal('#actividad', 'comidas', 'change'); await tick();
check('Cambiar a «Comidas» carga la tarifa 3,4% en el campo', (await ev(`document.querySelector('#trst').value`)) === '3.4');
check('…y recalcula el RST: $ 2.040.000', cop(await txt('.scenarios')).includes('$ 2.040.000'), cop(await txt('.scenarios')));
await setVal('#ventasMes', 7000000); await tick();
check('Con $84M al año (>1.400 UVT) avisa que debe declarar renta', (await txt('.flags')).includes('tendrías que declarar renta'));
await click('.advanced summary'); await tick();
await setVal('#uvt', 50000); await tick();
check('Editar la UVT recalcula la sanción mínima ($ 500.000)', cop(await txt('.verdict--rojo')).includes('$ 500.000'));

// ─────────────────────────── 8. Autodiagnóstico ───────────────────────────
console.log('\n## 8. Autodiagnóstico');
await abrir('/herramientas/autodiagnostico');
check('«Siguiente» deshabilitado sin respuesta', await ev(`[...document.querySelectorAll('.quiz-nav button')][1].disabled`));
check('«Anterior» deshabilitado en la primera', await ev(`[...document.querySelectorAll('.quiz-nav button')][0].disabled`));
for (let i = 0; i < 8; i++) {
  // Responde «Sí» a todo excepto las preguntas de riesgo (4 y 7), que se responden «No».
  const valor = i === 3 || i === 6 ? 'no' : 'si';
  await clickTexto('.answer', valor === 'si' ? 'Sí' : 'No'); await tick();
  if (i === 2) {
    await click('.quiz-nav button:first-child'); await tick();
    const marcada = await ev(`[...document.querySelectorAll('.answer')].find(l=>l.textContent.trim()==='Sí').querySelector('input').checked`);
    check('«Anterior» conserva la respuesta dada', marcada);
    await click('.quiz-nav button:last-child'); await tick();
    await clickTexto('.answer', 'Sí'); await tick();
  }
  await click('.quiz-nav button:last-child'); await tick();
}
await waitFor(`!!document.querySelector('.results')`);
check('Respuestas ideales → 100 de 100 y «Tu negocio va con paso firme»', (await txt('.summary h2')) === 'Tu negocio va con paso firme' && (await txt('.score span')) === '100');
check('Muestra las 3 dimensiones', (await ev(`document.querySelectorAll('.dim').length`)) === 3);
check('El foco va al resultado', await ev(`document.activeElement.id === 'diagnostico-foco'`));
await click('.results .actions button'); await tick();
check('«Volver a empezar» reinicia en la pregunta 1 sin respuestas', (await txt('.quiz .eyebrow')).startsWith('Pregunta 1 de 8') && !(await ev(`[...document.querySelectorAll('.answers input')].some(i=>i.checked)`)));

// ─────────────────────────── 9. Inscripción ───────────────────────────
console.log('\n## 9. Formulario de inscripción');
await abrir('/inscripcion');
await ev(`localStorage.clear()`);
await click('form button[type=submit]'); await tick();
const nErrores = await ev(`document.querySelectorAll('form .error').length`);
check('Enviar vacío muestra los 4 obligatorios (nombre, celular, zona, autorización)', nErrores === 4, `${nErrores} errores`);
check('El foco va al primer campo inválido (nombre)', await ev(`document.activeElement.id === 'nombre'`));
check('Los campos inválidos tienen aria-invalid=true', await ev(`document.querySelector('#nombre').getAttribute('aria-invalid')==='true'`));
await setVal('#nombre', 'Marta Pérez'); await setVal('#celular', '12345'); await tick();
check('Celular inválido muestra su error', (await txt('#celular-err')).includes('10 dígitos'));
await setVal('#celular', '3001234567'); await tick();
check('Celular válido quita el error', !(await ev(`!!document.querySelector('#celular-err')`)));
await setVal('#municipio', 'Barranquilla', 'change');
await setVal('#zona', 'Paseo Bolívar', 'change');
await setVal('#tipo', 'Puesto fijo', 'change');
await setVal('#actividad', 'Jugos y frutas');
await click('input[formcontrolname=antiguedad][value="menos-1"]'); await tick();
check('Antigüedad «menos de 1 año» muestra el aviso', (await txt('form')).includes('El piloto prioriza negocios con al menos un año'));
await click('input[formcontrolname=antiguedad][value="mas-3"]'); await tick();
check('…y lo oculta al cambiar', !(await txt('form')).includes('El piloto prioriza negocios'));
await clickTexto('.checkbox', 'Salir del gota a gota');
await click('form button[type=submit]'); await tick();
check('Sin autorización de datos no se envía', !!(await ev(`document.querySelector('form')`)) && (await txt('form')).includes('Necesitamos tu autorización'));
await click('input[formcontrolname=autorizacion]'); await tick();
await click('form button[type=submit]'); await tick();
check('Muestra «Enviando…» y deshabilita el botón', (await txt('form button[type=submit]')) === 'Enviando…' && (await ev(`document.querySelector('form button[type=submit]').disabled`)));
await waitFor(`!!document.querySelector('.success')`, 3000);
check('Envío exitoso: mensaje de confirmación', (await txt('.success h2')).includes('Te contactamos pronto por WhatsApp'));
const envio = await ev(`(() => { const c = window.__calls.filter(x => x.nombre === 'inscripcion'); return c.length ? JSON.parse(c[c.length - 1].body) : null; })()`);
check('Se envía una sola vez a la función «inscripcion»', (await ev(`window.__calls.filter(x => x.nombre === 'inscripcion').length`)) === 1);
check('El envío lleva nombre, celular y consentimiento', envio?.nombre === 'Marta Pérez' && envio?.celular === '3001234567' && envio?.consentimiento === true, JSON.stringify(envio));
check('El envío lleva visitorId, sesionId y versión de política', /^[0-9a-f-]{36}$/.test(envio?.visitorId ?? '') && /^[0-9a-f-]{36}$/.test(envio?.sesionId ?? '') && !!envio?.versionPolitica);
check('El envío lleva el campo trampa vacío y el tiempo de llenado', envio?.website === '' && typeof envio?.tiempoMs === 'number' && envio.tiempoMs > 0);
check('Las necesidades viajan como lista de textos', Array.isArray(envio?.necesidades) && envio.necesidades.includes('Salir del gota a gota'));
check('Sin radicado ni aviso de «versión de demostración»', !(await txt('.success')).includes('radicado') && !(await txt('.success')).includes('demostración'));
await click(".success button.btn--outline"); await tick();
check('«Anotar otro negocio» vuelve al formulario limpio', (await ev(`document.querySelector('#nombre')?.value`)) === '' && (await ev(`document.querySelectorAll('form .error').length`)) === 0);

// ─────────────────────────── 9b. Analítica y contador ───────────────────────────
console.log('\n## 9b. Analítica propia y contador público');
await abrir('/inscripcion');
check('El formulario tiene el campo trampa fuera de pantalla y sin foco por teclado', await ev(`(() => { const i = document.querySelector('#website'); return i.tabIndex === -1 && i.closest('.hp').getBoundingClientRect().left < -1000; })()`));
await abrir('/');
await click('header a[href="/programa"]'); await waitFor('location.pathname === "/programa"'); await sleep(500);
await click('header a[href="/herramientas"]'); await waitFor('location.pathname === "/herramientas"'); await sleep(500);
await click('header a[href="/aprende"]'); await waitFor('location.pathname === "/aprende"'); await sleep(500);
await sleep(2200);
const eventos = await ev(`window.__calls.filter(c => c.nombre === 'track' && c.body).flatMap(c => JSON.parse(c.body).eventos)`);
const vistas = eventos.filter((e) => e.tipo === 'page_view').map((e) => e.ruta);
check('Navegar por 4 páginas registra page_view de cada una', ['/', '/programa', '/herramientas', '/aprende'].every((r) => vistas.includes(r)), vistas.join(','));
check('Al salir de cada página se registra page_leave con duración', eventos.filter((e) => e.tipo === 'page_leave' && e.duracionMs > 0).length >= 3);
const cuerpoTrack = await ev(`window.__calls.filter(c => c.nombre === 'track' && c.body).map(c => c.body).join('')`);
check('La analítica envía visitorId y sesionId (UUID)', /"visitorId":"[0-9a-f-]{36}"/.test(cuerpoTrack) && /"sesionId":"[0-9a-f-]{36}"/.test(cuerpoTrack));
check('La analítica NO envía lo escrito en el formulario (nombre, celular)', !/Marta|3001234567/.test(cuerpoTrack));
// Clics medidos
await abrir('/');
await click('.hero .btn--primary'); await waitFor('location.pathname === "/inscripcion"'); await sleep(2200);
const ctas = await ev(`window.__calls.filter(c => c.nombre === 'track' && c.body).flatMap(c => JSON.parse(c.body).eventos).filter(e => e.tipo === 'cta_click').map(e => e.detalle.cta)`);
check('El botón principal del inicio registra cta_click «inscribete_hero»', ctas.includes('inscribete_hero'), ctas.join(','));
// Formulario: empezar y enviar con error
await ev(`document.querySelector('#nombre').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))`); await sleep(2200);
await click('form button[type=submit]'); await sleep(2200);
const formEv = await ev(`window.__calls.filter(c => c.nombre === 'track' && c.body).flatMap(c => JSON.parse(c.body).eventos).filter(e => e.tipo.startsWith('form_')).map(e => e.tipo + ':' + (e.detalle?.motivo ?? ''))`);
check('Primer foco registra form_start y enviar vacío form_submit_error:validacion', formEv.includes('form_start:') && formEv.includes('form_submit_error:validacion'), formEv.join(','));
// Herramienta
await abrir('/herramientas/caja-diaria');
await setVal('#ventas', 230000); await sleep(4600);
const tool = await ev(`window.__calls.filter(c => c.nombre === 'track' && c.body).flatMap(c => JSON.parse(c.body).eventos).filter(e => e.tipo.startsWith('tool_')).map(e => e.tipo + ':' + e.detalle.tool + ':' + (e.detalle.resultado ?? ''))`);
check('Calculadora: tool_start y tool_complete con categoría (sin montos)', tool.some((t) => t.startsWith('tool_start:caja-diaria')) && tool.some((t) => /^tool_complete:caja-diaria:(verde|amarillo|rojo)$/.test(t)), tool.join(','));
check('Los eventos de herramienta no incluyen montos', !/230000/.test(await ev(`window.__calls.filter(c => c.nombre === 'track' && c.body).map(c => c.body).join('')`)));
// Contador público
await abrir('/');
check('Contador público: con 25 inscritos se muestra', await waitFor(`document.querySelector('app-contador-inscritos')?.textContent.includes('25')`, 3000));
// Modo interno: el equipo no cuenta como visita
await send('Page.navigate', { url: BASE + '/programa?interno=1' }); await waitFor('document.querySelector("main h1")', 8000); await sleep(500);
await click('header a[href="/aprende"]'); await waitFor('location.pathname === "/aprende"'); await sleep(2200);
check('Con ?interno=1 no se registra ninguna visita', (await ev(`window.__calls.filter(c => c.nombre === 'track').length`)) === 0);
await send('Page.navigate', { url: BASE + '/?interno=0' }); await waitFor('document.querySelector("main h1")', 8000); await sleep(500);

// ─────────────────────────── 10. Formulario de entidades ───────────────────────────
console.log('\n## 10. Formulario de entidades');
await abrir('/entidades');
await click('#contacto-entidad button[type=submit]'); await tick();
check('Enviar vacío muestra errores', (await ev(`document.querySelectorAll('#contacto-entidad .error').length`)) >= 5);
await setVal('#org', 'Microfinanciera Ejemplo'); await setVal('#tipoE', 'Microfinanciera', 'change'); await setVal('#nombreE', 'Ana Gómez');
await setVal('#correo', 'ana@'); await tick();
check('Correo inválido muestra error', (await txt('#contacto-entidad')).includes('Escribe un correo válido'));
await setVal('#correo', 'ana@ejemplo.co'); await setVal('#msg', 'Queremos participar en el piloto.');
await click('#contacto-entidad input[formcontrolname=autorizacion]');
await click('#contacto-entidad button[type=submit]');
await waitFor(`(document.querySelector('#contacto-entidad [role=status]')?.textContent ?? '').includes('PF-E-')`, 3000);
check('Envío exitoso con radicado PF-E-…', (await txt('#contacto-entidad [role=status]')).includes('PF-E-'));

// ─────────────────────────── 11. Aprende ───────────────────────────
console.log('\n## 11. Aprende');
await abrir('/aprende');
await click('.myth'); await tick();
check('Tocar un mito revela la realidad (aria-pressed=true)', await ev(`document.querySelector('.myth').getAttribute('aria-pressed')==='true' && document.querySelector('.myth').textContent.includes('La realidad')`));
await click('.myth'); await tick();
check('Tocar de nuevo lo voltea', await ev(`document.querySelector('.myth').getAttribute('aria-pressed')==='false'`));
await setVal('#buscar', 'uvt'); await tick();
check('Buscar «uvt» filtra a 1 término', (await ev(`document.querySelectorAll('.term').length`)) === 1 && (await txt('.term dt')) === 'UVT');
await setVal('#buscar', 'sisben'); await tick();
check('La búsqueda ignora tildes («sisben» encuentra «Sisbén»)', (await txt('.term dt')) === 'Sisbén IV / RUI');
await setVal('#buscar', 'RUT'); await tick();
check('La búsqueda ignora mayúsculas («RUT»)', (await ev(`[...document.querySelectorAll('.term dt')].some(d=>d.textContent==='RUT')`)));
await setVal('#buscar', 'zzzz'); await tick();
check('Sin resultados muestra un mensaje', (await txt('#lista-glosario')).includes('No encontramos esa palabra'));
check('La primera pregunta frecuente viene abierta', await ev(`document.querySelector('.accordion details').open && !document.querySelectorAll('.accordion details')[1].open`));

// ─────────────────────────── 12. Nosotros ───────────────────────────
console.log('\n## 12. Nosotros');
await abrir('/nosotros');
await ev(`document.querySelector('.team').scrollIntoView()`); await sleep(1500);
check('Equipo: 5 integrantes con su foto', (await ev(`document.querySelectorAll('.member').length`)) === 5 && (await ev(`document.querySelectorAll('.member img').length`)) === 5);
check('Carrusel del equipo con 4 fotos', (await ev(`document.querySelectorAll('app-photo-carousel .slide').length`)) === 4);

// ─────────────────────────── 13. Accesibilidad básica ───────────────────────────
console.log('\n## 13. Accesibilidad básica en todas las páginas');
for (const ruta of conocidas) {
  await abrir(ruta);
  const r = await ev(`(()=>{
    const sinAlt = [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length;
    const sinNombre = [...document.querySelectorAll('button, a[href]')].filter(b => !(b.textContent.trim() || b.getAttribute('aria-label'))).length;
    const sinLabel = [...document.querySelectorAll('input:not([type=radio]):not([type=checkbox]), select, textarea')].filter(i => !(i.id && document.querySelector('label[for="'+i.id+'"]')) && !i.getAttribute('aria-label')).length;
    const ids = [...document.querySelectorAll('[id]')].map(e=>e.id); const dup = ids.filter((v,i)=>ids.indexOf(v)!==i);
    const saltos = (()=>{ let prev=1, bad=0; for (const h of document.querySelectorAll('main h1, main h2, main h3, main h4')) { const n=+h.tagName[1]; if (n>prev+1) bad++; prev=n; } return bad; })();
    return { sinAlt, sinNombre, sinLabel, dup, saltos, lang: document.documentElement.lang, skip: !!document.querySelector('.skip-link[href="#contenido"]') };
  })()`);
  check(`${ruta} a11y: imágenes con alt, botones/enlaces con nombre, campos con etiqueta, ids únicos`, r.sinAlt === 0 && r.sinNombre === 0 && r.sinLabel === 0 && r.dup.length === 0 && r.lang === 'es-CO' && r.skip, JSON.stringify(r));
  check(`${ruta} a11y: jerarquía de encabezados sin saltos`, r.saltos === 0, `saltos=${r.saltos}`);
}

console.log('\n## 14. Errores de consola / JavaScript durante toda la prueba');
const unicos = [...new Set(errores)];
check('Sin errores de JavaScript ni de consola', unicos.length === 0, '\n   ' + unicos.join('\n   '));

console.log(`\n==== RESULTADO: ${ok} pruebas OK, ${fail} fallidas ====`);
if (fallos.length) console.log(fallos.join('\n'));
ws.close(); chrome.kill(); servidor.kill();
setTimeout(() => { rmSync(OUT, { recursive: true, force: true }); process.exit(fail ? 1 : 0); }, 300);
