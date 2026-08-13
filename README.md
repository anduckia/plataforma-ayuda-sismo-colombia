# SOS Sismo Colombia — Plataforma ciudadana de ayuda

> ### 🟢 La plataforma está al aire y recibiendo solicitudes por los dos canales: web y SMS.

**🌐 En producción:** https://www.sossismocolombia.com.co/ · **📱 SMS:** 3148071191
**🔧 Backend (panel del equipo):** https://sos-sismo-colombia.ushahidi.io/

Plataforma abierta para que las personas afectadas por el sismo M 7,4 del 10 de agosto de 2026 (epicentro en San José del Palmar, Chocó) pidan ayuda con visibilidad pública, contacto protegido y verificación humana — y para que rescatistas y voluntarios verificados la encuentren y actúen.

*Open configuration and public front-end for a citizen crisis-response deployment on Ushahidi. All docs are in Spanish; see `specs/` for the full specification.*

## Estado

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Lanzamiento: configurar el despliegue y difundir | 🟢 **Operativa** — despliegue ✅, configuración aplicada y auditada ✅, cara pública al aire ✅, **canal SMS recibiendo ✅**; quedan respaldos y difusión |
| 1 | Operación diaria durante la emergencia | 🔄 En curso — entran solicitudes; el triaje es humano y continuo |
| 2 | Evolución: autoalojado, híbrido estricto, automatización | 💤 Solo si la operación lo exige |

**Lo que sigue abierto** (`specs/03-tasks.md`): respaldos cifrados fuera de Ushahidi (T-011) — hoy la mayor superficie de fuga y lo único enteramente en nuestras manos —, búsquedas guardadas de triaje (T-008) y difusión a PMU, organismos de socorro y emisoras (T-013, T-021). La revisión de los 72 h que decide si seguimos con Ushahidi o migramos es **T-019 (13-ago-2026)**.

## Cómo funciona (resumen)

- Cualquier persona publica su solicitud **sin crear cuenta**, por web o por **SMS al 3148071191** — el canal que funciona donde los datos móviles no llegan.
- Todo se publica **al instante** con la marca «Sin verificar»; el equipo verifica por orden de gravedad.
- **Verificar es meter la publicación en una colección**, no marcar un campo: el campo lo podía poner cualquiera con `curl`, y la insignia dejaba de significar nada (RF-17, ADR-017).
- El **teléfono y la dirección exacta jamás son públicos**: solo los ven ayudantes que el equipo verificó personalmente (datos + llamada).
- Las **ofertas no son cartelera pública**: «Quiero ayudar» y «Ofrezco recursos» entran a revisión y solo las ve el equipo. El mapa muestra únicamente las dos encuestas de auxilio, porque el mapa **es** la herramienta de triaje (RF-16, ADR-016).
- Una solicitud sin confirmar **dice cuánto lleva esperando**, pero eso nunca la apaga ni la baja de orden: la que más tiempo lleva sola es la que peor está (RF-23, ADR-021).
- Cuando otro canal sirve mejor —Cruz Roja para buscar familiares, informes de habitabilidad, donaciones— se **enlaza al oficial y no se transcribe ningún contacto de organización**, salvo las líneas nacionales de tres dígitos (RF-25, ADR-022).
- La plataforma **nunca pide dinero** ni datos bancarios, y lo dice públicamente.

## Los dos canales de entrada

**Web.** Cara pública propia (`web/`, ADR-010) sobre la API alojada. Cuatro formularios, mapa de triaje y salidas a los canales oficiales.

**SMS.** Una SIM local colombiana en un teléfono Android de guardia —fuera de la zona afectada y enchufado a corriente— reenvía cada mensaje por `POST /sms/smssync` con clave secreta. La víctima paga tarifa nacional y solo necesita señal de voz; quien necesita datos es **nuestro** teléfono (ADR-003). La pasarela no es la app SMSsync, que Android 14+ se niega a instalar por su `targetSdk` de 2017: es cualquier automatizador moderno que hable el mismo protocolo (**ADR-018**). El equipo estructura después cada SMS con categoría, urgencia y pin (T-103).

Como el número del remitente llega a la publicación igual que por web, **cada cambio en la pasarela obliga a repetir la auditoría sin credenciales** (RF-20, abajo).

## Estructura del repositorio (spec-driven development)

```
├── AGENTS.md                        ← instrucciones para agentes de IA
├── specs/
│   ├── constitution.md              ← principios no negociables (léelo primero)
│   ├── 01-requirements.md           ← RF-01…RF-26, RNF y backlog de Fase 2
│   ├── 02-design.md                 ← arquitectura, flujos y 24 ADR
│   └── 03-tasks.md                  ← tareas con trazabilidad y responsables
├── config/
│   └── deployment-config.yml        ← FUENTE DE VERDAD de la configuración
├── web/                             ← cara pública propia (Next.js, ADR-010)
│   ├── app/                         ← portada, 4 formularios, mapa, enlaces, privacidad
│   ├── components/                  ← formulario, mapa, selectores, líneas de emergencia
│   ├── lib/                         ← API de Ushahidi, validación, municipios, frescura
│   └── scripts/                     ← revisión visual y prueba de formulario (Playwright)
├── scripts/
│   ├── aplicar_config.py            ← aplica el YAML vía API y audita privacidad
│   ├── auditar_publico.py           ← audita SIN credenciales lo que ve un desconocido
│   └── ensayos.py                   ← siembra y retira solicitudes de prueba
├── docs/
│   ├── guia-lanzamiento.md          ← procedimiento humano paso a paso
│   ├── senales-que-salvan.md        ← protocolo sin luz y sin internet, para emisoras
│   └── campos-en-encuesta-viva.md   ← añadir campos sin borrar las publicaciones
├── .vscode/                         ← extensiones y ajustes recomendados
└── .gitignore                       ← blinda el repo contra datos personales
```

## Dos caras sobre los mismos datos

El backend es **Ushahidi alojado** (ADR-001): ahí viven los datos, los roles, los campos protegidos y el panel donde el equipo tría. La cara que se difunde es **nuestra** (`web/`, ADR-010), porque el cliente de Ushahidi llega en inglés, pesado y genérico para alguien asustado con mala señal.

`web/` no duplica la configuración: **lee el esquema de las encuestas desde la API en vivo**, así que `config/deployment-config.yml` sigue mandando sobre las dos.

## Cara pública (`web/`)

Next.js + React, mapa Leaflet con teselas Humanitarian OSM (**sin claves de API**, ADR-009), sin webfonts. Páginas: `/` · `/pido-ayuda` · `/busco-familiar` · `/quiero-ayudar` · `/ofrezco-recursos` · `/mapa` · `/enlaces-oficiales` · `/privacidad`.

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción

npm run revisar    # abre las páginas en un navegador real (360 px y 1280 px) y reporta
                   # recursos rotos, errores de consola, texto cortado y desbordes
npm run probar     # prueba de interacción del formulario (municipio en cascada, acceso)
```

Variables opcionales en `web/.env.local` — las tres tienen valor por defecto:

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_USHAHIDI_API` | API del despliegue contra el que habla el front |
| `NEXT_PUBLIC_SMS` | Número SMS que se muestra en la portada |
| `NEXT_PUBLIC_CONTACTO` | Correo público para pedir borrado de datos (RF-19) |

Son variables `NEXT_PUBLIC_`: **se incrustan al compilar**, así que cambiarlas en Vercel no basta — hay que redesplegar.

`npm run revisar` y `npm run probar` terminan con código de salida 1 si encuentran algo, así que sirven en CI. Existen porque depurar el front leyendo el CSS compilado, en vez de mirar la página, nos costó varias vueltas (ADR-013).

## Aplicar la configuración automáticamente

En vez de 60–90 minutos de clics, `scripts/aplicar_config.py` deja el despliegue listo en segundos y **audita** que ningún campo protegido quedó público.

```bash
pip install pyyaml
printf 'USHAHIDI_EMAIL=tu@correo\nUSHAHIDI_PASSWORD=tu-clave\n' > .env   # .env está en .gitignore

python scripts/aplicar_config.py                 # simulacro: no escribe nada
python scripts/aplicar_config.py --aplicar       # aplica y audita
python scripts/aplicar_config.py --solo-auditar  # solo verifica
```

Es idempotente (busca por nombre antes de crear) y termina con código de salida 1 si la auditoría de privacidad falla, así que sirve en CI. **Las credenciales viven solo en tu `.env` local, nunca en el repositorio.**

Añade campos y opciones a una encuesta **sin borrarla**, releyéndola entera y reenviando el objeto completo (ADR-019). Dos trampas de la API que el script ya sortea, y que romperían el despliegue si alguien las deshace: un `PUT` parcial a `/api/v5/config/*` **vacía lo que no viaja en el cuerpo**, y las categorías se leen como objetos pero se escriben como ids. El detalle está en `docs/campos-en-encuesta-viva.md`.

## Auditar lo que ve un desconocido

`aplicar_config.py` entra como administrador y comprueba que las **banderas** de privacidad estén como manda el YAML. Eso no es lo que promete la portada: la portada promete que tu teléfono y tu dirección exacta nunca son públicos, y eso solo se comprueba pidiéndolo **sin token**, como lo pediría cualquiera (RF-20).

```bash
python scripts/auditar_publico.py                          # el despliegue del YAML
python scripts/auditar_publico.py --url https://otro.api.ushahidi.io
```

No lee el `.env` y no sabe ninguna contraseña, a propósito. **Nunca imprime el valor de un campo**, solo etiquetas y recuentos: una auditoría que vuelca teléfonos en la consola —y en los registros de CI— es la fuga que venía a buscar. Falla ante cualquier encuesta viva no declarada en el YAML, y **declara en el veredicto lo que esta pasada no pudo comprobar** en vez de darlo por bueno.

Para probar el mapa y la lista con volumen antes de difundir, `scripts/ensayos.py` siembra y retira solicitudes ficticias. **El borrado solo toca lo que empieza por `[ENSAYO]`** y enumera lo que va a borrar antes de hacerlo.

## Abrir en VS Code

1. Descomprime el proyecto.
2. VS Code → **File → Open Folder…** → selecciona `plataforma-ayuda-sismo-colombia`.
3. Acepta instalar las extensiones recomendadas (vista previa de Markdown, Mermaid y YAML).
4. Empieza por `specs/constitution.md` y sigue el orden de `AGENTS.md`.

## Contribuir

Flujo obligatorio (P8): **principio → requisito → diseño → tarea → implementación.** Ningún cambio de comportamiento entra sin su spec. Los detalles y reglas para agentes de IA están en `AGENTS.md`.

Repositorio público: **https://github.com/anduckia/plataforma-ayuda-sismo-colombia** — clónalo y propón cambios respetando ese flujo. El `.gitignore` ya excluye CSV, exportaciones, respaldos y capturas — **ningún dato de personas afectadas debe entrar jamás al repositorio.** En pruebas, datos ficticios obvios (P2).

## Replicar en otra emergencia

1. Crea un despliegue en ushahidi.com (plan Basic, $0/mes).
2. Ajusta mapa, categorías y textos de `config/deployment-config.yml` a tu contexto.
3. Ejecuta `python scripts/aplicar_config.py --aplicar` (segundos) — o hazlo a mano con `docs/guia-lanzamiento.md` (60–90 min).
4. Comprueba desde fuera con `python scripts/auditar_publico.py`.
5. Cambia la lista de municipios de `web/lib/municipios.ts` (hoy los 125 de Chocó, Valle, Risaralda, Quindío y Caldas) y despliega `web/` con `NEXT_PUBLIC_USHAHIDI_API` apuntando a tu API.
6. Consigue una SIM local y monta la pasarela SMS con un automatizador que hable el protocolo SMSSync (guía §9, ADR-018).

## Licencia

Documentación y especificaciones: **CC BY 4.0** · Código (`web/`, `scripts/`): **MIT** · Detalles en `LICENSE.md`.
