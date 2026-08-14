# Guía de lanzamiento · Plataforma de ayuda — Sismo en Colombia

**🌐 Despliegue en producción:** https://sos-sismo-colombia.ushahidi.io/

**Objetivo:** tener al aire HOY una plataforma donde los afectados pidan ayuda con visibilidad pública, contacto protegido y verificación manual, replicable como proyecto abierto.

**Decisiones ya tomadas (co-creadas):**

| Tema | Decisión |
|---|---|
| Base | Ushahidi alojado por ellos (plan Basic, $0/mes, publicaciones ilimitadas) |
| Publicación | Instantánea, con etiqueta visible «Sin verificar»; tú verificas por orden de gravedad |
| Privacidad | Zona/barrio públicos · teléfono y dirección exacta solo para «Ayudantes verificados» (dar el número = dar consentimiento, explicado junto al campo) |
| SMS | SIM local colombiana + Android con la app SMSsync |
| Verificación de ayudantes | Nombre + organización + teléfono (tú llamas y confirmas) |

**Tiempo estimado:** 60–90 minutos. **Necesitas:** un correo, un navegador, y (para el paso 9) un teléfono Android con SIM local con SMS, cargador y buena señal.

---

## ⚡ Atajo: los pasos 2 a 7 ya están automatizados

`scripts/aplicar_config.py` aplica `config/deployment-config.yml` por la API y audita el resultado. **Ya se ejecutó sobre este despliegue el 10-ago-2026**, así que los pasos 2–7 están hechos; quedan como referencia para verificar a mano o para replicar en otra región.

```bash
pip install pyyaml
printf 'USHAHIDI_EMAIL=tu@correo\nUSHAHIDI_PASSWORD=tu-clave\n' > .env
python scripts/aplicar_config.py            # simulacro
python scripts/aplicar_config.py --aplicar  # aplica y audita
```

**Lo que sigue siendo tuyo y solo tuyo:** el paso 9 (SMS), el 12 (difusión), y **asignar a mano el rol «Ayudante verificado» tras la llamada de confirmación** — eso nunca se automatiza (ADR-005).

### Dos límites reales de la plataforma, verificados contra la API

1. **Un solo nivel de privacidad** (ADR-006). Ushahidi marca un campo como privado o público, sin grados. Quien tenga el permiso «Manage Posts» —el Equipo y los Ayudantes verificados— ve *todos* los campos privados, incluidos los de la encuesta «Quiero ayudar». Los ayudantes verán, pues, los datos de otros ayudantes. Díselo cuando les comuniques las 4 reglas.
2. **Sin emoji en nombres de categoría ni de encuesta** (ADR-007): la API los rechaza. Sí se conservan en etiquetas de campo, opciones (🔴 CRÍTICA, 🕐 Pendiente) y textos de ayuda, que es donde más ayudan a leer rápido.

---

## 1. Crear el despliegue (este paso solo puedes hacerlo tú)

1. Entra a **ushahidi.com** → «Create a Deployment» y regístrate con tu correo.
2. Elige el subdominio. Sugerencias: `sos-sismo-colombia`, `ayuda-sismo-co`, `sismo-colombia-2026`. Quedará como `tunombre.ushahidi.io`.
3. Plan: **Ushahidi Basic — $0/mes** (publicaciones ilimitadas, hasta 25 administradores/roles). Si en algún momento piden validación, aplica como iniciativa ciudadana/sin ánimo de lucro: ofrecen el plan gratis a organizaciones de base con presupuesto menor a 250 000 USD/año.
4. Usa una **contraseña fuerte y única**: esta cuenta controlará datos sensibles de víctimas.

---

## 2. Ajustes generales

- **Nombre visible:** p. ej. «SOS Sismo Colombia — Ayuda ciudadana».
- **Idioma:** español · **Zona horaria:** America/Bogota.
- **Mapa por defecto:** centra cerca de lat `5.0`, lng `-76.2` con un zoom que abarque Chocó, Valle del Cauca, Risaralda, Quindío y Caldas.
- **Publicación instantánea:** en Configuración, **desactiva la aprobación previa** de publicaciones («Require posts to be reviewed» o similar; el nombre exacto varía según versión — está en Settings → General o Surveys). Así todo sale al aire de inmediato y la verificación se marca con el campo del paso 4.
- **Descripción del sitio** (pega este texto):

> ⚠️ **¿Hay una vida en riesgo AHORA? Llama primero a la línea de emergencias 123.**
> Esta plataforma es ciudadana y complementa a los organismos de socorro: publica aquí tu solicitud —o la de otra persona que no pueda hacerlo— para que la ayuda sepa dónde ir. **Tu teléfono y tu dirección exacta NUNCA son públicos**: solo los ven ayudantes verificados por el equipo. **Nunca te pediremos dinero, claves ni números de cuenta.** Es gratuito. Hay réplicas: si tu casa está dañada, no vuelvas a entrar. Sin internet, envía un SMS al [NÚMERO — paso 9].

---

## 3. Categorías

Crea estas categorías (Configuración → Categorías):

🆘 Rescate — persona atrapada · 🚑 Atención médica / paramédicos · 💊 Medicamentos · 🍞 Comida y agua · 🏠 Refugio / alojamiento · 🚜 Maquinaria / remoción de escombros · 🚐 Transporte / evacuación · 👮 Seguridad / Policía · 🔍 Búsqueda de familiares · ❓ Otro

---

## 4. Encuesta 1 — «🆘 Pido ayuda»

Toda encuesta trae por defecto **Título** y **Descripción**; renombra sus etiquetas:
- Título → «¿Qué está pasando? (en una frase)»
- Descripción → «Cuéntanos más»

Agrega estos campos **en este orden**. La columna «¿Quién lo ve?» se configura campo por campo en la opción de visibilidad/privacidad de cada uno:

| # | Campo | Tipo | ¿Oblig.? | ¿Quién lo ve? | Texto de ayuda (pégalo tal cual) |
|---|---|---|---|---|---|
| 1 | ¿Para quién pides ayuda? | Opción única: Para mí / Para otra persona | Sí | Todos | — |
| 2 | Nombre o apodo | Texto corto | Sí | Todos | No necesitas tu nombre completo. |
| 3 | ¿Qué necesitas? | Casillas vinculadas a Categorías | Sí | Todos | Marca todas las que apliquen. |
| 4 | Urgencia | Opción única: 🔴 CRÍTICA: vidas en riesgo ahora / 🟠 ALTA: necesito ayuda hoy / 🟡 MEDIA: puede esperar 1–2 días | Sí | Todos | — |
| 5 | ¿Cuántas personas necesitan ayuda? | Número | Sí | Todos | — |
| 6 | ¿Hay personas vulnerables? | Casillas: Bebés o niños / Adultos mayores / Heridos / Personas con discapacidad / Embarazo | No | Todos | — |
| 7 | Ubicación (punto en el mapa) | Ubicación | Sí | Todos | Coloca el punto en tu BARRIO o VEREDA, no en tu casa exacta. La dirección precisa va en el siguiente campo y es privada. |
| 8 | Municipio y departamento | Texto corto | Sí | Todos | Ej.: San José del Palmar, Chocó. |
| 9 | Dirección exacta y señas | Texto largo | Sí | **Solo Ayudantes verificados y administradores** | Solo la verán ayudantes verificados por el equipo. Da señas claras: color de la casa, referencias, piso. |
| 10 | Teléfono de contacto | Texto corto | No | **Solo Ayudantes verificados y administradores** | Opcional. Solo lo verán ayudantes verificados por el equipo; si lo escribes, autorizas que te llamen. |
| 11 | Otra forma de contacto (pública) | Texto corto | No | Todos | Ej.: usuario de Instagram/X/Facebook, o el número de un familiar fuera de la zona. |
| 12 | Foto | Imagen | No | Todos | Solo si tu señal lo permite. |
| 13 | Estado de la solicitud | Opción única: 🕐 Pendiente (por defecto) / 🚧 En atención / ✅ Resuelta | Sí | Todos | Lo actualiza el equipo. |
| 14 | Verificación | Opción única: Sin verificar (por defecto) / ✔️ Verificada por el equipo | Sí | Todos | — |

**Nota técnica:** aunque los campos 13 y 14 son visibles para todos, solo quienes tengan permiso de gestionar publicaciones (tú y los ayudantes con ese permiso) pueden editarlos — la edición de publicaciones ajenas está restringida por rol.

---

## 5. Encuesta 2 — «🔍 Busco a un familiar»

Renombra los campos nativos y úsalos como los dos primeros de la tabla: **Título → «Nombre de la persona buscada»** (con su texto de ayuda) y **Descripción → «Descripción física y ropa»**. El resto se agregan como campos nuevos.

| Campo | Tipo | ¿Oblig.? | ¿Quién lo ve? | Texto de ayuda |
|---|---|---|---|---|
| Nombre de la persona buscada | Texto corto | Sí | Todos | Si es menor de edad, escribe solo el nombre de pila. |
| Edad aproximada | Número | No | Todos | — |
| Descripción física y ropa | Texto largo | No | Todos | — |
| Último lugar donde se le vio (mapa) | Ubicación | Sí | Todos | Punto aproximado. |
| Detalles del último contacto | Texto largo | No | Todos | Fecha, hora, con quién estaba. |
| Foto | Imagen | No | Todos | **Si es menor de edad, NO publiques foto**: el equipo te contactará para gestionarla en privado. |
| Tu parentesco | Texto corto | No | Todos | — |
| Tu teléfono | Texto corto | No | **Solo Ayudantes verificados y administradores** | Solo lo verán ayudantes verificados. |
| Estado de la búsqueda | Opción única: 🔍 Buscando (por defecto) / ✅ Localizada | Sí | Todos | — |

**Complemento oficial:** recomienda en la página registrar también el caso en el programa de **Restablecimiento del Contacto entre Familiares de la Cruz Roja Colombiana**. Esta plataforma suma visibilidad; no reemplaza los canales oficiales.

---

## 6. Encuesta 3 — «🤝 Quiero ayudar» (registro de ayudantes)

**Todos los campos de esta encuesta: visibles SOLO para administradores.**

**Excepción técnica (P2):** el Título y la Descripción nativos de toda encuesta son públicos y no se pueden proteger. Renómbralos para que nadie escriba ahí datos personales: Título → «Título público (ej.: “Ofrezco rescate — Quibdó”)» con ayuda «NO escribas aquí tu nombre completo ni tu teléfono: van abajo, en campos que solo ve el equipo»; Descripción → «Detalles públicos de lo que ofreces (sin datos personales)».

| Campo | Tipo | ¿Oblig.? |
|---|---|---|
| Nombre completo | Texto corto | Sí |
| Organización (o «voluntario independiente») | Texto corto | Sí |
| Teléfono | Texto corto | Sí |
| Municipios donde puedes actuar | Texto corto | Sí |
| Qué ofreces | Casillas: Rescate / Médico / Transporte / Maquinaria / Alimentos / Refugio / Comunicaciones / Otro | Sí |
| Correo con el que creaste tu cuenta aquí | Texto corto | Sí |

---

## 7. Rol «Ayudante verificado» y verificación de ayudantes

1. Configuración → **Roles** → crea el rol **«Ayudante verificado»**.
2. Vuelve a los campos protegidos de las encuestas 1 y 2 y marca este rol en «¿Quién puede ver este campo?».
3. **Permisos del rol:** activa la gestión/edición de publicaciones para que puedan actualizar el Estado (En atención / Resuelta). Trade-off honesto: con ese permiso también podrían editar otros campos; es aceptable en una red pequeña que tú verificaste. Si la red crece o hay abusos, retira el permiso y centraliza los cambios de estado.

**Flujo de verificación (decisión tomada: nombre + organización + teléfono):**
1. La persona llena «Quiero ayudar» y crea su cuenta en la plataforma.
2. Tú la **llamas** al teléfono que dejó y confirmas nombre y organización. Si dice pertenecer a una entidad (Cruz Roja, Defensa Civil, Bomberos…), pide un dato contrastable: que te escriban desde un canal institucional o el nombre de su coordinador de turno.
3. Configuración → **Usuarios** → busca su correo → asígnale el rol «Ayudante verificado».
4. Respóndele con las 4 reglas: **(a)** direcciones y teléfonos son confidenciales — prohibido sacarlos de la operación; **(b)** al tomar un caso, cámbialo a «En atención»; **(c)** al terminarlo, «Resuelta»; **(d)** jamás pedir dinero ni datos bancarios a los afectados.

---

## 8. Tu flujo diario de verificación de solicitudes

- Crea **búsquedas guardadas**: «🔴 Críticas sin verificar» (Urgencia = Crítica + Verificación = Sin verificar), «Pendientes por municipio», «Resueltas hoy».
- Orden de trabajo: Críticas → Altas → Medias.
- Cómo verificar: llama si dejó teléfono; cruza pin, municipio y descripción; si hay un ayudante en la zona, pídele confirmación.
- Verificada → **añade la publicación a la colección «Verificadas por el equipo»** (en la publicación: *Add to collection*). Es lo único que enciende la insignia verde en el mapa público.

> **Cambió el gesto de verificar (ADR-017).** Antes bastaba con poner el campo 14 en «✔️ Verificada por el equipo». Ese campo **ya no significa nada para el público**: se comprobó que cualquiera puede enviárselo a sí mismo con `curl`, sin cuenta, y la plataforma lo guarda. La cara pública ahora solo mira la colección, porque meter algo ahí requiere estar autenticado.
>
> Puedes seguir usando el campo 14 para tus búsquedas guardadas —para eso sirve— pero **si no metes la publicación en la colección, en el mapa seguirá saliendo «Sin verificar»**. Y al revés: no metas nada en la colección «por si acaso». Estar ahí significa que alguien del equipo llamó y el caso es real.
- Falsa o broma → **no la borres**: pásala a estado de revisión/archivada (queda rastro).
- Duplicada → conserva la más completa y archiva la otra.

---

## 9. SMS con SIM local (Android + SMSsync)

Con las intermitencias de datos reportadas en Chocó, Valle, Risaralda, Quindío y Caldas, **el SMS puede ser la única vía para quien más lo necesita**.

**Materiales:** un Android (sirve casi cualquiera) con SIM colombiana con SMS activo, enchufado a corriente, con señal estable, y modo «No molestar» apagado. Idealmente un teléfono dedicado solo a esto.

**Pasos:**
1. En la plataforma: Configuración → **Fuentes de datos (Data Sources)** → **SMSSync** → actívalo. Copia la **Sync URL** y define una **clave secreta**.
2. En el Android: instala **SMSsync**. Por problemas con Play Store, Ushahidi publica el APK oficial v3.1.1 en GitHub: `https://github.com/ushahidi/SMSSync/releases/download/v3.1.1/smssync-withAnalyticsRelease-v3.1.1-RELEASE.apk` (habilita «instalar de origen desconocido» solo para esta instalación).
3. En SMSsync: agrega la **Sync URL** con la **misma clave secreta**, inicia el servicio y activa **Auto Sync**. Configura la respuesta automática: «Recibimos tu mensaje y ya es visible para los equipos de ayuda. Si puedes, envía otro SMS con: municipio, barrio y cuántas personas son.»
4. **Prueba** desde otro celular y confirma que el SMS aparece como publicación en la plataforma.

**Formato a difundir:** «Sin internet, envía un SMS al **[NÚMERO]**: AYUDA + qué necesitas + cuántas personas + municipio y barrio.»

**Realidad operativa:** los SMS entran como texto libre; tú (o un ayudante de confianza) deben ponerles categoría, urgencia y punto en el mapa. Reserva tiempo para esa tarea.

---

## 10. Disponibilidad, tráfico y copias de seguridad

- El hosting y el escalado corren por cuenta de Ushahidi — por eso este camino permite lanzar hoy.
- Mantén la página liviana: fotos opcionales, nada de videos.
- Difunde **siempre** el número SMS junto al enlace: es tu canal de contingencia si la web se satura o los datos fallan.
- **Respaldo:** exporta los datos a CSV **mínimo 2 veces al día** (Configuración → Exportar) y guárdalos en dos lugares (tu equipo + una nube).
- Si el tráfico o las necesidades superan el servicio: escribe al equipo de Ushahidi (han acompañado despliegues de crisis) y existe el **plan B autoalojado**: la plataforma es open source (`github.com/ushahidi/platform`), corre en Docker y puede ponerse detrás de Cloudflare, importando tus CSV. Si llegamos ahí, lo montamos juntos.

---

## 11. Privacidad y protección (no negociables)

- **Mínimos datos:** nunca pidas cédula, claves ni datos bancarios a los afectados — y dilo públicamente en el sitio («nunca te los pediremos»). Las estafas post-desastre empiezan exactamente por ahí.
- **Menores de edad:** sin apellidos ni fotos de rostro en lo público.
- Al marcar una solicitud como **Resuelta**, considera borrar o anonimizar su dirección y teléfono.
- **Al cierre de la emergencia:** exporta un histórico anonimizado y elimina los datos de contacto de la plataforma.
- Revoca de inmediato el rol a cualquier ayudante que incumpla las reglas.
- **Peticiones de borrado:** llegan al correo de `NEXT_PUBLIC_CONTACTO`, publicado en `/privacidad`. Alguien tiene que leer ese buzón todos los días. Es un derecho (Ley 1581 de 2012), no un favor: si alguien pide que quitemos el nombre de su familiar, se quita.
- **El sitio se indexa desde el 14-ago-2026** (RF-38). Estuvo fuera de los buscadores mientras hubo mapa: el nombre de una persona desaparecida no debe quedar colgado en Google después de que aparezca. Retirados el mapa y los formularios, lo que se sirve son organizaciones, y un directorio que nadie encuentra no ayuda a nadie. **La condición se mantiene en pie: si el sitio vuelve a servir un dato de una persona identificable, se cierra la indexación ANTES de publicarlo.** Esa decisión pasa por spec (P8) y no por un `robots.txt`.

### Antes de cada difusión: la auditoría del desconocido

```bash
python scripts/auditar_publico.py
```

No pide credenciales a propósito: comprueba lo que ve **cualquiera**, que es lo que promete la portada. Si termina con «AUDITORÍA PÚBLICA FALLIDA», **no difundas el enlace** hasta arreglarlo. `aplicar_config.py --solo-auditar` no sustituye a esto: aquella entra como administrador y solo mira que las banderas estén bien puestas.

---

## 12. Lanzamiento y difusión

**Texto para WhatsApp (pégalo y completa):**

> 🆘 SISMO COLOMBIA — Si necesitas ayuda (rescate, médicos, comida, refugio) o buscas a un familiar, repórtalo aquí: **https://sos-sismo-colombia.ushahidi.io/**. Sin internet, envía un SMS al **[NÚMERO]** con: AYUDA + qué necesitas + cuántas personas + municipio y barrio. Tu teléfono y dirección exacta NO se publican. Es gratuito. Comparte 🙏

**A quién enviarlo primero:** los Puestos de Mando Unificado activados (Bogotá, Cali, Armenia y Quibdó), la UNGRD, Cruz Roja Colombiana, Defensa Civil, Bomberos, las alcaldías de los municipios afectados en Chocó, Caldas, Valle del Cauca, Risaralda y Quindío, y las **emisoras comunitarias y de radio locales** — la radio funciona cuando internet no: pide que lean el número SMS al aire.

Antes de la difusión masiva, pide a 2–3 personas de confianza que prueben el formulario de punta a punta.

---

## 13. Código abierto y réplica

La plataforma (Ushahidi) ya es software libre. Nuestro aporte abierto es **esta configuración documentada**: sube esta guía a un repositorio público de GitHub (nombre sugerido: `plataforma-ayuda-sismo-colombia`, licencia sugerida para la guía: CC BY 4.0) para que cualquier región del país —o cualquier país— la replique en horas.

---

## 14. Checklist de lanzamiento

- [x] Despliegue creado en ushahidi.io con plan Basic ($0)
- [x] Español, mapa centrado, descripción y aviso de privacidad
- [x] 10 categorías creadas
- [x] Encuesta «Pido ayuda» con los 14 campos y visibilidades correctas
- [x] Encuesta «Busco a un familiar»
- [x] Encuesta «Quiero ayudar» con campos protegidos
- [x] Rol «Ayudante verificado» creado con permiso «Manage Posts»
- [x] Publicación instantánea activada (sin aprobación previa)
- [x] Ciclo de vida probado por API: ensayo → verificada → en atención → resuelta → archivada
- [x] Comprobado que un visitante anónimo **no** recibe dirección ni teléfono
- [x] Colección «Verificadas por el equipo» creada; la insignia del mapa sale de ahí y no del campo (ADR-017)
- [x] Comprobado que un anónimo **no** puede auto-verificarse, ni editar o borrar publicaciones ajenas
- [x] `scripts/auditar_publico.py` en verde
- [x] ~~Sitio fuera de los buscadores~~ y página `/privacidad` con canal de borrado — el bloqueo se levantó el 14-ago-2026 con la condición de RF-38 confirmada
- [ ] **Sitio dado de alta en Google Search Console, sitemap enviado** (T-071) — estuvo bloqueado meses; sin pedirlo, el rastreador tarda semanas en volver
- [ ] **Vista previa del enlace comprobada en un WhatsApp real** (T-072) — WhatsApp cachea la tarjeta durante días, incluida la rota
- [ ] **`NEXT_PUBLIC_CONTACTO` configurado en Vercel** — sin esto, `/privacidad` enseña un marcador y el canal de borrado no existe
- [ ] **Pasada humana por el navegador** (llenar el formulario como un afectado)
- [ ] Búsquedas guardadas de verificación (T-008 — se crean desde la interfaz)
- [ ] SMSsync instalado, conectado y probado con un SMS real (T-009)
- [ ] **Tras el primer SMS real:** volver a correr `auditar_publico.py` y confirmar que el número del remitente no sale al público
- [ ] Rotar la contraseña de administrador (está en claro en `.env` y es la cuenta superadministradora)
- [ ] Retirar los ensayos antes de difundir: `python scripts/ensayos.py borrar`
- [ ] Exportación CSV probada y dos ubicaciones de respaldo definidas (T-011)
- [ ] Número SMS real reemplazando `[NUMERO_SMS]` (T-012)
- [ ] Difusión enviada a PMU, organizaciones y emisoras (T-013)

---

*Si algún paso no coincide con lo que ves en pantalla (la interfaz cambia entre versiones), dime exactamente qué ves y lo ajustamos sobre la marcha.*
