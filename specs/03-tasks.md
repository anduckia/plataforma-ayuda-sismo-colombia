# 03 · Tareas

Cada tarea traza a requisitos (RF/RNF) y a la sección de la guía (`docs/guia-lanzamiento.md`) que explica el cómo. **Responsable:** 👤 solo humano (credenciales) · 🤝 humano siguiendo la guía, con apoyo del agente.

## Fase 0 · Lanzamiento (hoy)

- [x] **T-001** 👤 Crear el despliegue en ushahidi.io — *Hecho 10-ago-2026:* https://sos-sismo-colombia.ushahidi.io/ · (RF-12 · Guía §1)
- [ ] **T-002** 🤝 Ajustes generales: nombre, español, zona horaria, mapa centrado, descripción con aviso de privacidad, **publicación instantánea activada** · (RF-02, RNF-02, RNF-03 · Guía §2)
- [ ] **T-003** 🤝 Crear las 10 categorías · (RF-01 · Guía §3)
- [ ] **T-004** 🤝 Encuesta «🆘 Pido ayuda»: 14 campos con visibilidades según `config/deployment-config.yml` · (RF-01…RF-04, RF-06 · Guía §4)
- [ ] **T-005** 🤝 Encuesta «🔍 Busco a un familiar» · (RF-07 · Guía §5)
- [ ] **T-006** 🤝 Encuesta «🤝 Quiero ayudar» con todos los campos solo-admin · (RF-08 · Guía §6)
- [ ] **T-007** 🤝 Crear rol «Ayudante verificado» y aplicarlo a los campos protegidos · (RF-03, RF-08 · Guía §7)
- [ ] **T-008** 🤝 Búsquedas guardadas de verificación («🔴 Críticas sin verificar», «Pendientes por municipio», «Resueltas hoy») · (RF-05 · Guía §8)
- [ ] **T-009** 👤 SMS: conseguir Android + SIM local, activar SMSSync en Fuentes de datos, instalar APK, conectar Sync URL + clave, respuesta automática, **probar con un SMS real** · (RF-09 · Guía §9)
- [ ] **T-010** 🤝 Prueba de punta a punta: crear solicitud de ensayo → verificarla → «En atención» → «Resuelta» → archivarla · (RF-02, RF-05, RF-06 · Guía §14)
- [ ] **T-011** 👤 Probar exportación CSV y definir las dos ubicaciones de respaldo (fuera del repo) · (RF-11, P2 · Guía §10)
- [ ] **T-012** 👤 Reemplazar `[NUMERO_SMS]` en la descripción del sitio y en los textos de difusión cuando exista el número · (RF-09 · Guía §12)
- [ ] **T-013** 👤 Difusión: enviar el texto de WhatsApp a PMU (Bogotá, Cali, Armenia, Quibdó), UNGRD, Cruz Roja, Defensa Civil, Bomberos, alcaldías afectadas y emisoras locales (que lean el número SMS al aire) · (RF-10, P1 · Guía §12)

## Fase 1 · Operación diaria (mientras dure la emergencia)

- [ ] **T-101** 👤 Ritual de verificación: Críticas → Altas → Medias, cada pocas horas · (RF-05 · Guía §8)
- [ ] **T-102** 👤 Llamar y dar de alta a cada ayudante que se registre; comunicar las 4 reglas; revocar ante incumplimiento · (RF-08 · Guía §7)
- [ ] **T-103** 👤 Estructurar los SMS entrantes: categoría, urgencia, pin · (RF-09 · Guía §9)
- [ ] **T-104** 👤 Exportar CSV mínimo 2 veces al día a las dos ubicaciones seguras · (RF-11)
- [ ] **T-105** 🤝 Anonimizar contacto de solicitudes Resueltas con más de 48 h · (P2)
- [ ] **T-106** 🤝 Publicar este repositorio en GitHub (público) para réplica; confirmar que `.gitignore` excluye todo dato personal · (RF-12, P7) — *Preparado 10-ago-2026:* auditoría sin datos personales ✅ · `.gitignore` reforzado ✅ · git inicializado con commit inicial ✅ · 👤 falta crear el repositorio público en GitHub y hacer push

## Fase 2 · Evolución (solo si la operación lo exige)

- [ ] **T-201** 🤝 Especificar en detalle RF-F2-01 (híbrido estricto) antes de escribir código · (P8)
- [ ] **T-202** 🤝 Despliegue autoalojado Docker + Cloudflare con importación de CSV · (RF-F2-02)
- [ ] **T-203** 🤝 Automatizar la aplicación de `deployment-config.yml` vía API de Ushahidi · (RF-F2-03)
- [ ] **T-204** 🤝 Script de anonimización para cierre de emergencia · (RF-F2-04)

## Regla de trabajo (P8)

Ninguna tarea nueva sin requisito; ningún requisito nuevo sin principio. Si durante la ejecución la interfaz real difiere de la guía, se corrige **primero** la guía o el YAML, y luego se marca la tarea.
