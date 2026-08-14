/**
 * Revisión de las fuentes publicadas: enlaces muertos y fichas vencidas (§5).
 *
 *   npm run revisar-fuentes                      # contra http://localhost:3000
 *   npm run revisar-fuentes -- https://tu.app    # contra lo desplegado
 *
 * Va aparte de la validación que corre al pintar la página porque comprobar
 * que un enlace está vivo es una petición de red por ficha, y eso no se hace
 * mientras alguien espera a que cargue.
 *
 * Lee la página YA RENDERIZADA en vez de los datos de origen, a propósito:
 * así comprueba lo que de verdad le llega al lector, no lo que creemos haber
 * cargado. Si una ficha se cayó por la validación, aquí no aparece — y esa
 * ausencia también es información.
 *
 * Un enlace muerto no tumba el build (termina con código 1 para CI, pero la
 * página sigue publicándose): media hora con una ficha rota es mejor que media
 * hora con el directorio entero caído.
 */

import { chromium } from 'playwright';

const BASE = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');

/** A partir de aquí la ficha se pinta en alerta y hay que volver a mirarla. */
const DIAS_VENCIDA = 7;

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });

const { fichas, temasVacios } = await pagina.evaluate(() => ({
  fichas: [...document.querySelectorAll('.ficha')].map((f) => ({
    id: f.id,
    nombre: f.querySelector('.ficha__nombre')?.textContent?.trim() ?? '(sin nombre)',
    revisado: f.querySelector('time')?.getAttribute('datetime') ?? null,
    enlaces: [...f.querySelectorAll('a[href^="http"]')].map((a) => a.href),
  })),
  temasVacios: [...document.querySelectorAll('.seccion')]
    .filter((s) => !s.querySelector('.ficha'))
    .map((s) => s.querySelector('h2')?.textContent?.trim() ?? s.id),
}));

await navegador.close();

const hoy = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

const dias = (iso) =>
  Math.round((Date.parse(`${hoy}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)) / 86_400_000);

/**
 * HEAD primero porque es la petición barata; si el servidor no lo admite se
 * reintenta con GET. Muchos sitios institucionales responden 405 a HEAD, y
 * reportarlos como caídos mandaría al equipo a revisar enlaces que están bien.
 */
async function estaVivo(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(15000) });
      if (r.ok) return null;
      if (method === 'GET') return `respondió ${r.status}`;
    } catch (e) {
      if (method === 'GET') return e.name === 'TimeoutError' ? 'no respondió a tiempo' : 'no se pudo alcanzar';
    }
  }
  return null;
}

const vencidas = [];
const muertos = [];

for (const f of fichas) {
  if (f.revisado && dias(f.revisado) > DIAS_VENCIDA) {
    vencidas.push(`${f.nombre} — sin revisar hace ${dias(f.revisado)} días`);
  }
  for (const url of f.enlaces) {
    const fallo = await estaVivo(url);
    if (fallo) muertos.push(`${f.nombre} → ${url} (${fallo})`);
  }
}

console.log(`${fichas.length} ficha(s) publicadas en ${BASE}\n`);

if (temasVacios.length) {
  // No es un error: un tema sin fuentes hay que NOMBRARLO, no esconderlo
  // (RF-35). Se lista para que alguien escriba la nota de qué se buscó.
  console.log(`Temas sin ninguna fuente (${temasVacios.length}):`);
  temasVacios.forEach((t) => console.log('  · ' + t));
  console.log('');
}

if (vencidas.length) {
  console.log(`Fichas vencidas (${vencidas.length}):`);
  vencidas.forEach((v) => console.log('  - ' + v));
  console.log('');
}

if (muertos.length) {
  console.log(`Enlaces que no responden (${muertos.length}):`);
  muertos.forEach((m) => console.log('  - ' + m));
  console.log('');
}

if (!vencidas.length && !muertos.length) {
  console.log('Todas las fichas están al día y todos los enlaces responden.');
  process.exit(0);
}
process.exit(1);
