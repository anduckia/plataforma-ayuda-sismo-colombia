# Instrucciones para agentes de IA

Este repositorio sigue **spec-driven development**. Si eres un agente de código (Claude Code, Copilot u otro), trabaja así:

## Orden de lectura obligatorio
1. `specs/constitution.md` — principios que no puedes violar.
2. `specs/01-requirements.md` — qué debe hacer el sistema (RF/RNF) y el backlog de Fase 2.
3. `specs/02-design.md` — arquitectura, flujos y decisiones (ADR).
4. `specs/03-tasks.md` — qué está pendiente y quién es responsable.
5. `config/deployment-config.yml` — fuente de verdad de la configuración.
6. `docs/guia-lanzamiento.md` — procedimiento humano paso a paso.

## Reglas de trabajo
- **Specs primero (P8):** ningún cambio de comportamiento sin actualizar antes el requisito, el diseño y la tarea correspondientes. Si detectas una discrepancia entre la interfaz real de Ushahidi y la guía, corrige primero la guía/YAML.
- **Privacidad intocable (P2):** nunca propongas hacer públicos el teléfono o la dirección exacta, nunca agregues campos de cédula o datos bancarios, y nunca generes ni copies al repositorio datos de personas reales (ni siquiera como "ejemplo"). Usa datos ficticios obvios en pruebas.
- **Verificación humana (P3, ADR-005):** no automatices la aprobación de ayudantes ni el acceso a campos protegidos.
- **Idioma (P5):** todo texto visible al público en español claro y simple.
- **Tareas con ícono 👤** requieren credenciales o acciones que solo un humano puede ejecutar: prepara el trabajo, pero no intentes hacerlas tú.
- **Código de Fase 2:** licencia MIT, y solo tras especificar (T-201 antes que cualquier implementación del híbrido estricto).
- Ante ambigüedad entre specs, pregunta al equipo en lugar de asumir.

## Contexto operativo
Emergencia real: sismo M 7,4 en Colombia (10-ago-2026). Prioriza cambios que aceleren la llegada de ayuda (P1); rechaza refactorizaciones cosméticas mientras dure la emergencia.
