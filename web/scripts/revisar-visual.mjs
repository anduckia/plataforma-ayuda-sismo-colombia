/**
 * Revisión visual automática de la cara pública.
 *
 * Existe porque depurar el front a ciegas —leyendo el CSS compilado en vez de
 * mirar la página— nos costó varias vueltas el 10-ago-2026. Esto abre las
 * páginas en un navegador real con pantalla de teléfono barato y reporta lo que
 * un vistazo humano detectaría: recursos que fallan, errores de consola, texto
 * cortado, desbordes a lo ancho y áreas táctiles por debajo del mínimo.
 *
 *   npm run revisar                      # contra http://localhost:3000
 *   npm run revisar -- https://tu.app    # contra lo desplegado
 *
 * Termina con código 1 si encuentra algo, así que sirve en CI.
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const SALIDA = 'capturas';

/** Teléfono barato primero: es el dispositivo real de quien busca ayuda. */
const PANTALLAS = [
  { nombre: 'movil', width: 360, height: 800 },
  { nombre: 'escritorio', width: 1280, height: 900 },
];

/**
 * Las rutas retiradas siguen en la lista a propósito: circularon por radio y
 * WhatsApp, y que expliquen el cambio en vez de dar 404 es un requisito
 * (RF-37), así que se revisa como cualquier otra página.
 */
const RUTAS = [
  '/', '/privacidad',
  '/mapa', '/pido-ayuda', '/busco-familiar', '/quiero-ayudar', '/ofrezco-recursos',
];

/** Áreas táctiles: 52 px el canal principal, 44 px lo secundario. */
const MINIMOS = [
  { selector: '.canal, .aportar__via, .indice a', minimo: 52 },
  { selector: '.canal-otro, .seccion__compartir, .seccion__volver', minimo: 44 },
];

const problemas = [];
const anota = (ruta, pantalla, texto) => problemas.push(`${ruta} · ${pantalla}: ${texto}`);

await mkdir(SALIDA, { recursive: true });
const navegador = await chromium.launch();

for (const pantalla of PANTALLAS) {
  const ctx = await navegador.newContext({
    viewport: { width: pantalla.width, height: pantalla.height },
    deviceScaleFactor: 2,
    locale: 'es-CO',
  });

  for (const ruta of RUTAS) {
    const pagina = await ctx.newPage();
    const fallos = new Set();
    const errores = new Set();

    pagina.on('response', (r) => {
      if (r.status() >= 400) fallos.add(`${r.status()} ${r.url()}`);
    });
    pagina.on('requestfailed', (r) => fallos.add(`${r.failure()?.errorText} ${r.url()}`));
    pagina.on('pageerror', (e) => errores.add(e.message));
    pagina.on('console', (m) => { if (m.type() === 'error') errores.add(m.text()); });

    try {
      await pagina.goto(BASE + ruta, { waitUntil: 'networkidle', timeout: 60000 });
    } catch (e) {
      anota(ruta, pantalla.nombre, `no cargó: ${e.message.split('\n')[0]}`);
      await pagina.close();
      continue;
    }

    const nombre = `${SALIDA}/${pantalla.nombre}${ruta.replace(/\//g, '-') || '-inicio'}.png`;
    await pagina.screenshot({ path: nombre, fullPage: true });

    const hallazgos = await pagina.evaluate((minimos) => {
      const salida = { cortados: [], pequenos: [], desborde: null, sinH1: false, pesoTexto: 0 };

      for (const el of document.querySelectorAll('.tipo, .indice a, .canal, .canal-otro')) {
        if (el.scrollWidth > el.clientWidth + 1) {
          const t = (el.textContent || '').trim();
          salida.cortados.push(`«${t.slice(0, 38)}» (${el.clientWidth}px para ${el.scrollWidth}px)`);
        }
      }

      for (const { selector, minimo } of minimos) {
        for (const el of document.querySelectorAll(selector)) {
          const alto = Math.round(el.getBoundingClientRect().height);
          if (alto && alto < minimo) {
            const t = (el.textContent || '').trim();
            salida.pequenos.push(`«${t.slice(0, 30)}» mide ${alto}px, mínimo ${minimo}px`);
          }
        }
      }

      if (document.body.scrollWidth > window.innerWidth + 1) {
        salida.desborde = `${document.body.scrollWidth}px en una pantalla de ${window.innerWidth}px`;
      }

      // Jerarquía de encabezados de verdad: un h1 por página, ni cero ni tres.
      salida.sinH1 = document.querySelectorAll('h1').length !== 1;
      salida.pesoTexto = document.documentElement.outerHTML.length;
      return salida;
    }, MINIMOS);

    fallos.forEach((f) => anota(ruta, pantalla.nombre, `recurso falló → ${f}`));
    errores.forEach((e) => anota(ruta, pantalla.nombre, `error de consola → ${e.slice(0, 120)}`));
    hallazgos.cortados.forEach((c) => anota(ruta, pantalla.nombre, `texto cortado → ${c}`));
    hallazgos.pequenos.forEach((d) => anota(ruta, pantalla.nombre, `área táctil pequeña → ${d}`));
    if (hallazgos.desborde) anota(ruta, pantalla.nombre, `la página se desborda → ${hallazgos.desborde}`);
    if (hallazgos.sinH1) anota(ruta, pantalla.nombre, 'la página no tiene exactamente un h1');

    // P4 · Presupuesto: la página tiene que aparecer en 2G (RF-37, §4.8).
    if (pantalla.nombre === 'movil' && hallazgos.pesoTexto > 120_000) {
      anota(ruta, pantalla.nombre, `el HTML pesa ${Math.round(hallazgos.pesoTexto / 1024)} KB`);
    }

    await pagina.close();
  }
  await ctx.close();
}

await navegador.close();

console.log(`Revisadas ${RUTAS.length} rutas en ${PANTALLAS.length} pantallas contra ${BASE}`);
console.log(`Capturas en ${SALIDA}/\n`);

if (problemas.length === 0) {
  console.log('Sin problemas.');
  process.exit(0);
}

console.log(`${problemas.length} problema(s):`);
problemas.forEach((p) => console.log('  - ' + p));
process.exit(1);
