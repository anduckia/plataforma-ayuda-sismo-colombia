/**
 * Revisión visual automática de la cara pública.
 *
 * Existe porque depurar el front a ciegas —leyendo el CSS compilado en vez de
 * mirar la página— nos costó varias vueltas el 10-ago-2026. Esto abre las
 * páginas en un navegador real con pantalla de teléfono barato y reporta lo que
 * un vistazo humano detectaría: recursos que fallan, errores de consola, texto
 * cortado, desbordes a lo ancho y controles descuadrados.
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

/** Teléfono barato primero: es el dispositivo real de quien pide ayuda. */
const PANTALLAS = [
  { nombre: 'movil', width: 360, height: 800 },
  { nombre: 'escritorio', width: 1280, height: 900 },
];

const RUTAS = [
  '/', '/pido-ayuda', '/busco-familiar', '/quiero-ayudar', '/ofrezco-recursos', '/mapa',
  '/enlaces-oficiales',
];

/** Todo lo que se toca en una fila debe medir lo mismo (ver --alto-control). */
const ALTO_CONTROL = 52;

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
    pagina.on('requestfailed', (r) => {
      // Las teselas que se cancelan al desplazarse no son un fallo real.
      if (!r.url().includes('tile.openstreetmap')) {
        fallos.add(`${r.failure()?.errorText} ${r.url()}`);
      }
    });
    pagina.on('pageerror', (e) => errores.add(e.message));
    pagina.on('console', (m) => { if (m.type() === 'error') errores.add(m.text()); });

    try {
      await pagina.goto(BASE + ruta, { waitUntil: 'networkidle', timeout: 60000 });
      await pagina.waitForTimeout(2500);   // que Leaflet pida sus teselas
    } catch (e) {
      anota(ruta, pantalla.nombre, `no cargó: ${e.message.split('\n')[0]}`);
      await pagina.close();
      continue;
    }

    const nombre = `${SALIDA}/${pantalla.nombre}${ruta.replace(/\//g, '-') || '-inicio'}.png`;
    await pagina.screenshot({ path: nombre, fullPage: true });

    const hallazgos = await pagina.evaluate((altoEsperado) => {
      const salida = { cortados: [], descuadrados: [], desborde: null, mapaVacio: false };

      for (const el of document.querySelectorAll('input, button, .campo__etiqueta, legend')) {
        if (el.scrollWidth > el.clientWidth + 1) {
          const t = (el.value || el.placeholder || el.textContent || '').trim();
          salida.cortados.push(`«${t.slice(0, 38)}» (${el.clientWidth}px para ${el.scrollWidth}px)`);
        }
      }

      for (const el of document.querySelectorAll(
        'input[type=text], input[type=number], .boton--secundario')) {
        const alto = Math.round(el.getBoundingClientRect().height);
        if (alto && Math.abs(alto - altoEsperado) > 1) {
          const t = (el.placeholder || el.textContent || el.id || '').trim();
          salida.descuadrados.push(`«${t.slice(0, 30)}» mide ${alto}px, no ${altoEsperado}px`);
        }
      }

      if (document.body.scrollWidth > window.innerWidth + 1) {
        salida.desborde = `${document.body.scrollWidth}px en una pantalla de ${window.innerWidth}px`;
      }

      const mapa = document.querySelector('.leaflet-container');
      if (mapa) {
        const cargadas = document.querySelectorAll('.leaflet-tile-loaded').length;
        salida.mapaVacio = cargadas === 0;
      }
      return salida;
    }, ALTO_CONTROL);

    fallos.forEach((f) => anota(ruta, pantalla.nombre, `recurso falló → ${f}`));
    errores.forEach((e) => anota(ruta, pantalla.nombre, `error de consola → ${e.slice(0, 120)}`));
    hallazgos.cortados.forEach((c) => anota(ruta, pantalla.nombre, `texto cortado → ${c}`));
    hallazgos.descuadrados.forEach((d) => anota(ruta, pantalla.nombre, `control descuadrado → ${d}`));
    if (hallazgos.desborde) anota(ruta, pantalla.nombre, `la página se desborda → ${hallazgos.desborde}`);
    if (hallazgos.mapaVacio) anota(ruta, pantalla.nombre, 'el mapa no cargó ninguna tesela');

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
