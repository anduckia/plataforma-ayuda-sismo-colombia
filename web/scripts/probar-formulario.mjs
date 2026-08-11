/** Prueba de interacción de T-033 y T-034 en un navegador real. */
import { chromium } from 'playwright';

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 360, height: 800 } });
const fallos = [];
const ok = (b, m) => { console.log(`${b ? '  ✓' : '  ✗'} ${m}`); if (!b) fallos.push(m); };

await pagina.goto('http://localhost:3000/pido-ayuda', { waitUntil: 'networkidle' });

console.log('T-033 · municipio en cascada');
const dep = pagina.locator('select').filter({ hasText: 'Chocó' }).first();
const municipio = pagina.locator('#c60-mun, select').nth(1);

// El municipio arranca deshabilitado hasta elegir departamento.
ok(await municipio.isDisabled(), 'el municipio arranca bloqueado');

await dep.selectOption('Risaralda');
await pagina.waitForTimeout(150);
ok(!(await municipio.isDisabled()), 'se desbloquea al elegir departamento');

const opciones = await municipio.locator('option').allTextContents();
ok(opciones.includes('Dosquebradas'), `Risaralda trae sus municipios (${opciones.length - 1})`);
ok(opciones.length - 1 === 14, `Risaralda tiene 14 municipios, trae ${opciones.length - 1}`);

await municipio.selectOption('Pereira');
await pagina.waitForTimeout(150);
let eco = await pagina.locator('.municipio__eco').textContent();
ok(eco.includes('Pereira, Risaralda'), `el valor compuesto es «${eco.split(':')[1]?.trim()}»`);

// La vereda no puede perderse por culpa de la lista cerrada.
await pagina.locator('.municipio__detalle input').fill('vereda El Carmen');
await pagina.waitForTimeout(150);
eco = await pagina.locator('.municipio__eco').textContent();
ok(eco.includes('Pereira, Risaralda — vereda El Carmen'),
   `conserva la vereda: «${eco.split(':')[1]?.trim()}»`);

// Cambiar de departamento no puede dejar pegado el municipio anterior.
await dep.selectOption('Chocó');
await pagina.waitForTimeout(150);
const tras = await municipio.locator('option').allTextContents();
ok(!tras.includes('Pereira'), 'al cambiar de departamento se limpia el municipio');
ok(tras.includes('San José del Palmar'), 'Chocó trae los suyos');

console.log('\nT-034 · bloque de acceso');
const detalles = pagina.locator('details.acceso');
ok(await detalles.count() === 1, 'existe el bloque plegable');
ok(!(await detalles.locator('summary').evaluate(
  (s) => s.parentElement.hasAttribute('open'))), 'arranca plegado');

await detalles.locator('summary').click();
await pagina.waitForTimeout(200);

for (const etiqueta of ['Cómo se llega', 'Punto de referencia comunitario',
                        '¿Hay dónde aterrizar cerca?', 'Tiempo desde el pueblo más cercano',
                        '¿La vía está bloqueada?']) {
  ok(await detalles.getByText(etiqueta, { exact: false }).count() > 0, `contiene «${etiqueta}»`);
}
ok(await detalles.getByText('Necesita helicóptero').count() > 0,
   'la opción del helicóptero está');

console.log('\nT-035 · categoría nueva');
ok(await pagina.getByText('Vía bloqueada / acceso').count() > 0,
   '«Vía bloqueada / acceso» aparece en ¿Qué necesitas?');

console.log('\nT-037 · frescura en portada');
await pagina.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await pagina.waitForTimeout(1200);
const fresco = await pagina.locator('.frescura').textContent().catch(() => null);
ok(!!fresco && /consultados hace/i.test(fresco), `marca de frescura: «${fresco?.trim()}»`);

await navegador.close();
console.log(fallos.length ? `\n${fallos.length} FALLO(S)` : '\nTodo correcto.');
process.exit(fallos.length ? 1 : 0);
