# SOS Sismo Colombia — Plataforma ciudadana de ayuda

**🌐 En producción:** https://www.sossismocolombia.com.co/ · *(el despliegue original de Ushahidi, https://sos-sismo-colombia.ushahidi.io/, corresponde a las fases 0–1 y ya no es la cara pública)*

Plataforma abierta para que las personas afectadas por el sismo M 7,4 del 10 de agosto de 2026 (epicentro en San José del Palmar, Chocó) pidan ayuda con visibilidad pública, contacto protegido y verificación humana — y para que rescatistas y voluntarios verificados la encuentren y actúen.

*Open configuration for a citizen crisis-response deployment on Ushahidi. All docs are in Spanish; see `specs/` for the full specification.*

## Estado

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Lanzamiento: configurar el despliegue y difundir | 🔄 En curso — despliegue creado ✅, **configuración aplicada y auditada ✅** (10-ago-2026); faltan SMS y difusión (`specs/03-tasks.md`) |
| 1 | Operación diaria durante la emergencia | ⏳ |
| 2 | Evolución: autoalojado, híbrido estricto, automatización | 💤 Solo si la operación lo exige |

## Cómo funciona (resumen)

- Cualquier persona publica su solicitud **sin crear cuenta**, por web o por **SMS** a un número local (clave donde los datos móviles fallan).
- Todo se publica **al instante** con la marca «Sin verificar»; el equipo verifica por orden de gravedad.
- El **teléfono y la dirección exacta jamás son públicos**: solo los ven ayudantes que el equipo verificó personalmente (datos + llamada).
- La plataforma **nunca pide dinero** ni datos bancarios, y lo dice públicamente.

## Estructura del repositorio (spec-driven development)

```
├── AGENTS.md                    ← instrucciones para agentes de IA
├── specs/
│   ├── constitution.md          ← principios no negociables (léelo primero)
│   ├── 01-requirements.md       ← requisitos RF/RNF + backlog Fase 2
│   ├── 02-design.md             ← arquitectura, flujos, ADRs
│   └── 03-tasks.md              ← tareas con trazabilidad y responsables
├── config/
│   └── deployment-config.yml    ← FUENTE DE VERDAD de la configuración
├── docs/
│   └── guia-lanzamiento.md      ← procedimiento humano paso a paso
├── scripts/
│   └── aplicar_config.py        ← aplica el YAML vía API y audita privacidad
├── .vscode/                     ← extensiones y ajustes recomendados
└── .gitignore                   ← blinda el repo contra datos personales
```

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

## Que el directorio se encuentre

Desde el **14-ago-2026** el sitio está abierto a los buscadores (RF-38). Antes no lo estaba, y era correcto: el mapa publicaba nombres de personas desaparecidas. Retirados el mapa y los formularios, lo que se sirve son organizaciones — y un directorio que nadie encuentra no ayuda a nadie.

**La condición sigue en pie:** si la cara pública vuelve a servir un dato de una persona identificable, se cierra la indexación **antes** de publicarlo. Son tres piezas y van juntas: `web/app/robots.ts`, el `robots` de `web/app/layout.tsx` y la cabecera `X-Robots-Tag` de `web/next.config.mjs`.

El dominio canónico es **https://www.sossismocolombia.com.co** y vive en `web/lib/sitio.ts`. Se sobreescribe con una variable de entorno, que es lo único que hay que tocar si algún día cambia:

```bash
NEXT_PUBLIC_SITIO=https://www.sossismocolombia.com.co
```

**Va con `www` a propósito.** Las dos formas servirían la misma página, y para un buscador eso son dos sitios idénticos compitiendo entre sí; el canonical de cada página apunta a la variante con `www` y deja la otra declarada como copia. El apex (`sossismocolombia.com.co`, sin `www`) **debe redirigir** a esta en el proveedor — es lo que la gente teclea cuando le dictan la dirección por radio.

De ahí salen las URL absolutas del `sitemap.xml`, los `canonical`, la vista previa de enlace de WhatsApp (`web/app/opengraph-image.tsx`, generada en compilación) y los datos estructurados. **Las URLs retiradas llevan `noindex, follow` a propósito:** son cinco páginas casi idénticas y repartirían la relevancia que debe concentrarse en la portada.

Queda por hacer a mano: dar de alta el sitio en Search Console y enviar el sitemap (T-071), y comprobar la vista previa en un WhatsApp real antes de difundir (T-072) — WhatsApp cachea la tarjeta durante días, incluida la rota.

## Abrir en VS Code

1. Descomprime el proyecto.
2. VS Code → **File → Open Folder…** → selecciona `plataforma-ayuda-sismo-colombia`.
3. Acepta instalar las extensiones recomendadas (vista previa de Markdown, Mermaid y YAML).
4. Empieza por `specs/constitution.md` y sigue el orden de `AGENTS.md`.

## Contribuir

Flujo obligatorio (P8): **principio → requisito → diseño → tarea → implementación.** Ningún cambio de comportamiento entra sin su spec. Los detalles y reglas para agentes de IA están en `AGENTS.md`.

Repositorio público: **https://github.com/anduckia/plataforma-ayuda-sismo-colombia** — clónalo y propón cambios respetando ese flujo. El `.gitignore` ya excluye CSV, exportaciones y respaldos — **ningún dato de personas afectadas debe entrar jamás al repositorio.**

## Replicar en otra emergencia

1. Crea un despliegue en ushahidi.com (plan Basic, $0/mes).
2. Ajusta mapa, categorías y textos de `config/deployment-config.yml` a tu contexto.
3. Ejecuta `python scripts/aplicar_config.py --aplicar` (segundos) — o hazlo a mano con `docs/guia-lanzamiento.md` (60–90 min).
4. Consigue una SIM local y monta la pasarela SMS (guía §9).

## Licencia

Documentación y especificaciones: **CC BY 4.0** · Código futuro (Fase 2): **MIT** · Detalles en `LICENSE.md`.
