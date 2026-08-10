# SOS Sismo Colombia — Plataforma ciudadana de ayuda

**🌐 En producción:** https://sos-sismo-colombia.ushahidi.io/

Plataforma abierta para que las personas afectadas por el sismo M 7,4 del 10 de agosto de 2026 (epicentro en San José del Palmar, Chocó) pidan ayuda con visibilidad pública, contacto protegido y verificación humana — y para que rescatistas y voluntarios verificados la encuentren y actúen.

*Open configuration for a citizen crisis-response deployment on Ushahidi. All docs are in Spanish; see `specs/` for the full specification.*

## Estado

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Lanzamiento: configurar el despliegue y difundir | 🔄 En curso — despliegue creado ✅, configuración pendiente (`specs/03-tasks.md`) |
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
├── .vscode/                     ← extensiones y ajustes recomendados
└── .gitignore                   ← blinda el repo contra datos personales
```

## Abrir en VS Code

1. Descomprime el proyecto.
2. VS Code → **File → Open Folder…** → selecciona `plataforma-ayuda-sismo-colombia`.
3. Acepta instalar las extensiones recomendadas (vista previa de Markdown, Mermaid y YAML).
4. Empieza por `specs/constitution.md` y sigue el orden de `AGENTS.md`.

## Contribuir

Flujo obligatorio (P8): **principio → requisito → diseño → tarea → implementación.** Ningún cambio de comportamiento entra sin su spec. Los detalles y reglas para agentes de IA están en `AGENTS.md`.

Para publicarlo: `git init`, primer commit y súbelo como repositorio público. El `.gitignore` ya excluye CSV, exportaciones y respaldos — **ningún dato de personas afectadas debe entrar jamás al repositorio.**

## Replicar en otra emergencia

1. Crea un despliegue en ushahidi.com (plan Basic, $0/mes).
2. Aplica `config/deployment-config.yml` siguiendo `docs/guia-lanzamiento.md` (60–90 min).
3. Ajusta mapa, categorías y textos a tu contexto.
4. Consigue una SIM local y monta la pasarela SMS (guía §9).

## Licencia

Documentación y especificaciones: **CC BY 4.0** · Código futuro (Fase 2): **MIT** · Detalles en `LICENSE.md`.
