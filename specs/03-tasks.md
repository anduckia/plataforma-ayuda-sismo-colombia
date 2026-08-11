# 03 · Tareas

Cada tarea traza a requisitos (RF/RNF) y a la sección de la guía (`docs/guia-lanzamiento.md`) que explica el cómo. **Responsable:** 👤 solo humano (credenciales) · 🤝 humano siguiendo la guía, con apoyo del agente. **Estado:** `[x]` hecha · `[~]` parcial · `[ ]` pendiente.

## Fase 0 · Lanzamiento (hoy)

- [x] **T-001** 👤 Crear el despliegue en ushahidi.io — *Hecho 10-ago-2026:* https://sos-sismo-colombia.ushahidi.io/ · (RF-12 · Guía §1)
- [x] **T-002** 🤝 Ajustes generales · (RF-02, RNF-02, RNF-03 · Guía §2) — *Hecho 10-ago-2026 vía `scripts/aplicar_config.py`*: nombre, es, America/Bogota, mapa 5.0/-76.2 z7, descripción con aviso, publicación instantánea ✅, autor oculto ✅
- [x] **T-003** 🤝 Crear las 10 categorías · (RF-01 · Guía §3) — *Hecho 10-ago-2026 vía `scripts/aplicar_config.py`* · sin emoji (ADR-007)
- [x] **T-004** 🤝 Encuesta «Pido ayuda» · (RF-01…RF-04, RF-06 · Guía §4) — *Hecho 10-ago-2026 vía `scripts/aplicar_config.py`*: 16 campos (14 + Título y Descripción nativos), 2 protegidos ✅
- [x] **T-005** 🤝 Encuesta «Busco a un familiar» · (RF-07 · Guía §5) — *Hecho 10-ago-2026 vía `scripts/aplicar_config.py`*: 9 campos, 1 protegido ✅
- [x] **T-006** 🤝 Encuesta «Quiero ayudar» · (RF-08 · Guía §6) — *Hecho 10-ago-2026 vía `scripts/aplicar_config.py`*: 8 campos, 6 protegidos ✅ · Título/Descripción nativos públicos por diseño (ADR-006)
- [x] **T-007** 🤝 Rol «Ayudante verificado» · (RF-03, RF-08 · Guía §7) — *Hecho 10-ago-2026 vía `scripts/aplicar_config.py`* con permiso «Manage Posts». **Asignarlo a personas sigue siendo manual tras la llamada (ADR-005).**
- [ ] **T-008** 🤝 Búsquedas guardadas de verificación («🔴 Críticas sin verificar», «Pendientes por municipio», «Resueltas hoy») · (RF-05 · Guía §8)
- [ ] **T-009** 👤 SMS: conseguir Android + SIM local, activar SMSSync en Fuentes de datos, instalar APK, conectar Sync URL + clave, respuesta automática, **probar con un SMS real** · (RF-09 · Guía §9)
- [~] **T-010** 🤝 Prueba de punta a punta · (RF-02, RF-05, RF-06 · Guía §14) — *Ciclo verificado por API el 10-ago-2026:* ensayo con datos ficticios creado → publicado al instante → verificado → «En atención» → «Resuelta» → archivado (deja de ser visible; 0 publicaciones públicas). **Comprobado además que un anónimo NO recibe dirección ni teléfono ✅.** Falta la pasada humana por el navegador (llenar el formulario como lo haría un afectado).
- [ ] **T-011** 👤 Probar exportación CSV y definir las dos ubicaciones de respaldo (fuera del repo) · (RF-11, P2 · Guía §10)
- [ ] **T-012** 👤 Reemplazar `[NUMERO_SMS]` en la descripción del sitio y en los textos de difusión cuando exista el número · (RF-09 · Guía §12)
- [ ] **T-013** 👤 Difusión: enviar el texto de WhatsApp a PMU (Bogotá, Cali, Armenia, Quibdó), UNGRD, Cruz Roja, Defensa Civil, Bomberos, alcaldías afectadas y emisoras locales (que lean el número SMS al aire) · (RF-10, P1 · Guía §12)

- [x] **T-014** 🤝 Cara pública propia (`web/`, Next.js) con los 3 formularios, mapa Leaflet + Humanitarian OSM y aviso de privacidad · (RF-01…RF-08, ADR-010, ADR-011) — *Hecho 10-ago-2026:* lee el esquema de la API en vivo, publica anónimo (201), oculta «Estado»/«Verificación» y los envía por código. Falta subir a Vercel (T-015).
- [ ] **T-015** 👤 Desplegar `web/` en Vercel y decidir qué enlace se difunde · (P1)
- [ ] **T-016** 🤝 Subida de fotos en el front propio (requiere multipart a `/api/v5/media`) · (RF-01)
- [ ] **T-017** 🤝 Aplicar el parche del 11-ago: `python scripts/aplicar_config.py --aplicar` para crear la categoría «Iluminación / energía», la encuesta «Ofrezco recursos» y la descripción con la línea 123 · (RF-14, RNF-06, ADR-015)
- [ ] **T-018** 🤝 Front: banner de la línea 123 **arriba** en la portada y formulario `/ofrezco-recursos` ocultando «Estado del recurso» según ADR-011 · (RF-14, RF-15, RNF-06)
- [ ] **T-021** 👤 Difundir «Señales que salvan» (`docs/senales-que-salvan.md`) a emisoras y grupos: es el protocolo que funciona sin luz y sin internet · (P4, RF-10)
- [ ] **T-022** 🤝 Arreglar los textos de `/quiero-ayudar` (RF-15): explicar el propósito arriba, cambiar «correo con el que creaste tu cuenta» por «correo — ahí te enviaremos el acceso cuando te verifiquemos», y cambiar el pie «se publica de inmediato» por «tus datos solo los ve el equipo; te llamaremos». Además, meta-descripción propia por página · (RF-15, P5)
- [x] **T-020** 🤝 Validación de entrada y aviso de duplicados en el front · (RF-13, ADR-014) — *Hecho 10-ago-2026:* `web/lib/validacion.ts`. Probado en navegador real: punto en Europa bloquea; punto en Bogotá avisa; teléfono en campo público avisa; junto a dos ensayos en Quibdó salta el aviso de duplicado. Además `scripts/ensayos.py` siembra y retira solicitudes de prueba (solo borra las que empiezan por `[ENSAYO]`).
- [ ] **T-019** 👤 **Revisión del backend a las 72 h — 13-ago-2026** · (ADR-013) — decidir si seguimos con Ushahidi o migramos a Postgres propio. **Se migra si se cumple cualquiera:** (a) el equipo no usó el panel para triar; (b) el SMS quedó descartado; (c) 2+ rarezas nuevas bloquearon la operación. Si toca migrar: specs primero (P8).

## Fase 1 · Operación diaria (mientras dure la emergencia)

- [ ] **T-101** 👤 Ritual de verificación: Críticas → Altas → Medias, cada pocas horas · (RF-05 · Guía §8)
- [ ] **T-102** 👤 Llamar y dar de alta a cada ayudante que se registre; comunicar las 4 reglas; revocar ante incumplimiento · (RF-08 · Guía §7)
- [ ] **T-103** 👤 Estructurar los SMS entrantes: categoría, urgencia, pin · (RF-09 · Guía §9)
- [ ] **T-104** 👤 Exportar CSV mínimo 2 veces al día a las dos ubicaciones seguras · (RF-11)
- [ ] **T-105** 🤝 Anonimizar contacto de solicitudes Resueltas con más de 48 h · (P2)
- [x] **T-106** 🤝 Publicar este repositorio en GitHub (público) para réplica; confirmar que `.gitignore` excluye todo dato personal · (RF-12, P7) — *Hecho 10-ago-2026:* https://github.com/anduckia/plataforma-ayuda-sismo-colombia · auditoría sin datos personales ✅ · `.gitignore` reforzado ✅

## Fase 2 · Evolución (solo si la operación lo exige)

- [ ] **T-201** 🤝 Especificar en detalle RF-F2-01 (híbrido estricto) antes de escribir código · (P8)
- [ ] **T-202** 🤝 Despliegue autoalojado Docker + Cloudflare con importación de CSV · (RF-F2-02)
- [x] **T-203** 🤝 Automatizar la aplicación de `deployment-config.yml` vía API de Ushahidi · (RF-F2-03) — *Adelantada y hecha el 10-ago-2026 (P1):* `scripts/aplicar_config.py` idempotente, con simulacro por defecto y auditoría de privacidad que falla con código 1. Credenciales en `.env` local (nunca en el repo). Cubrió T-002…T-007.
- [ ] **T-204** 🤝 Script de anonimización para cierre de emergencia · (RF-F2-04)

## Regla de trabajo (P8)

Ninguna tarea nueva sin requisito; ningún requisito nuevo sin principio. Si durante la ejecución la interfaz real difiere de la guía, se corrige **primero** la guía o el YAML, y luego se marca la tarea.
