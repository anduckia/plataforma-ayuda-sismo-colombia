# 01 · Requisitos

**Estado:** aprobado (decisiones co-creadas el 10-ago-2026) · **Fase actual:** 1 (Ushahidi alojado)

## Actores

| Actor | Descripción |
|---|---|
| **Afectado** | Persona que necesita ayuda o reporta por otra. No necesita cuenta. Puede tener conexión muy mala o solo SMS. |
| **Buscador** | Persona que busca a un familiar desaparecido. |
| **Ayudante verificado** | Rescatista, brigadista o voluntario que el equipo verificó. Tiene cuenta y rol especial. |
| **Equipo** | Administradores de la plataforma. Verifican solicitudes y ayudantes, moderan, respaldan datos. |

## Requisitos funcionales — Fase 1

### RF-01 · Solicitar ayuda sin barreras (P1, P4)
**Historia:** como Afectado, quiero publicar mi solicitud en menos de 3 minutos y sin crear cuenta, para que la ayuda me encuentre.
- CUANDO un Afectado envía el formulario «Pido ayuda» con los campos obligatorios, EL SISTEMA DEBERÁ crear la publicación sin exigir registro.
- CUANDO el formulario carga, EL SISTEMA DEBERÁ pedir como obligatorios únicamente: qué pasa, qué necesita, urgencia, cuántas personas, ubicación aproximada, municipio y dirección exacta (protegida).
- La foto DEBERÁ ser siempre opcional.

### RF-02 · Publicación instantánea con marca de verificación (P1, P3)
- CUANDO se crea una solicitud, EL SISTEMA DEBERÁ publicarla de inmediato con el campo Verificación = **«Sin verificar»**.
- CUANDO el Equipo confirma una solicitud, EL SISTEMA DEBERÁ permitir cambiar Verificación a **«Verificada por el equipo»**, visible para todos.

### RF-03 · Contacto protegido por rol (P2)
- MIENTRAS un visitante no autenticado o un usuario sin rol vea una solicitud, EL SISTEMA DEBERÁ ocultar los campos **Teléfono** y **Dirección exacta y señas**.
- CUANDO un Ayudante verificado o el Equipo vea la misma solicitud, EL SISTEMA DEBERÁ mostrar esos campos.
- El campo Teléfono DEBERÁ ser opcional y llevar junto a él el texto de consentimiento definido en `config/deployment-config.yml`.

### RF-04 · Ubicación en dos niveles (P2)
- El pin público del mapa DEBERÁ instruir ubicarse a nivel de **barrio o vereda**, nunca la casa exacta.
- La dirección precisa DEBERÁ capturarse en un campo protegido (RF-03).

### RF-05 · Cola de verificación por gravedad (P3)
**Historia:** como Equipo, quiero ver primero las solicitudes críticas sin verificar, para no dejar vidas esperando.
- EL SISTEMA DEBERÁ permitir búsquedas guardadas que filtren por Urgencia y estado de Verificación.
- CUANDO una solicitud resulte falsa o duplicada, EL SISTEMA DEBERÁ permitir archivarla sin borrarla (rastro auditable).

### RF-06 · Ciclo de vida de la solicitud (P1)
- Toda solicitud DEBERÁ tener Estado: **Pendiente** (defecto) → **En atención** → **Resuelta**, visible para todos.
- Solo el Equipo y los Ayudantes verificados (con permiso de gestionar publicaciones) DEBERÁN poder cambiarlo, para evitar duplicar esfuerzos.

### RF-07 · Búsqueda de familiares (P2, P5)
- EL SISTEMA DEBERÁ ofrecer un formulario separado «Busco a un familiar» con estado Buscando/Localizada.
- CUANDO la persona buscada sea menor de edad, el formulario DEBERÁ instruir: solo nombre de pila y **sin foto pública**.
- La página DEBERÁ recomendar registrar el caso también en el programa de Restablecimiento del Contacto entre Familiares de la Cruz Roja Colombiana (complemento, no reemplazo).

### RF-08 · Registro y verificación de ayudantes por el equipo (P3)
**Historia:** como Equipo, queremos verificar nosotros mismos a cada ayudante, para que los datos protegidos solo lleguen a manos confiables.
- EL SISTEMA DEBERÁ ofrecer el formulario «Quiero ayudar» cuyos campos **nunca son públicos**: nombre completo, organización, teléfono, municipios de acción, qué ofrece y correo de su cuenta.
- **Límite conocido de la plataforma (ADR-006):** esos campos quedan visibles para el Equipo *y* para los Ayudantes verificados, porque Ushahidi ofrece un único nivel de privacidad. Es aceptable —son datos de ayudantes adultos que se registraron voluntariamente— y así se les comunica en las reglas.
- El Título y la Descripción nativos de esa encuesta **sí son públicos** y no pueden protegerse: DEBERÁN estar etiquetados para que nadie escriba allí datos personales.
- CUANDO un ayudante se registre, EL EQUIPO DEBERÁ llamarlo, confirmar nombre y organización (con dato contrastable si dice pertenecer a una entidad) y solo entonces asignarle el rol «Ayudante verificado».
- EL SISTEMA NO DEBERÁ otorgar el rol ni el acceso a campos protegidos de forma automática bajo ninguna circunstancia.
- CUANDO un ayudante incumpla las reglas de confidencialidad, EL EQUIPO DEBERÁ poder revocarle el rol de inmediato.

### RF-09 · Canal SMS (P4)
- EL SISTEMA DEBERÁ recibir solicitudes por SMS a un número local colombiano mediante un Android con la app SMSsync como pasarela.
- CUANDO llegue un SMS, EL SISTEMA DEBERÁ crearlo como publicación y responder automáticamente confirmando la recepción y pidiendo municipio, barrio y número de personas.
- El Equipo DEBERÁ estructurar manualmente los SMS entrantes (categoría, urgencia, pin).

### RF-10 · Página liviana (P4)
- La portada y el formulario DEBERÁN funcionar en conexiones 2G/3G inestables: sin video, fotos opcionales y comprimidas.

### RF-11 · Respaldo de datos (P2, P7)
- EL EQUIPO DEBERÁ exportar los datos a CSV al menos 2 veces al día y guardarlos en dos ubicaciones **fuera de este repositorio**.

### RF-12 · Replicabilidad (P7)
- Este repositorio DEBERÁ contener todo lo necesario (specs + guía + configuración) para que un tercero replique el despliegue en horas sin ayuda del equipo original.

### RF-13 · Validación de entrada y aviso de duplicados (P1, P2, P3)
**Historia:** como Equipo, queremos que la cola llegue con datos utilizables, para no gastar rescates en solicitudes imposibles de atender.
- EL SISTEMA DEBERÁ **impedir publicar** cuando el punto del mapa caiga fuera de Colombia, cuando el número de personas no sea un entero positivo, o cuando el primer campo no contenga una frase legible.
- EL SISTEMA DEBERÁ **avisar sin impedir** cuando: el punto caiga dentro de Colombia pero fuera de los cinco departamentos afectados; el teléfono no tenga formato colombiano; se escriban números largos o datos bancarios en un campo público; o se publiquen más de 3 solicitudes en 10 minutos desde el mismo navegador.
- CUANDO exista una solicitud publicada a menos de **600 m** y con menos de **24 h**, EL SISTEMA DEBERÁ mostrarla antes de publicar y dejar que quien reporta decida si es la misma.
- **Límite explícito:** `POST /api/v5/posts` acepta publicaciones anónimas sin token, así que cualquiera puede saltarse estas comprobaciones. NO son un control de seguridad: sirven para que quien actúa de buena fe entregue datos utilizables. Contra la falsedad deliberada actúan la etiqueta «Sin verificar», la cola de verificación (RF-05) y el archivado con rastro.
- Ninguna validación DEBERÁ impedir publicar a quien tenga una necesidad real (P1): en la duda, se avisa y se deja seguir.

## Requisitos no funcionales

- **RNF-01 Disponibilidad:** la infraestructura la opera Ushahidi (plan Basic alojado); el canal SMS actúa como contingencia de captura si la web se degrada.
- **RNF-02 Idioma:** todo texto público en español claro (P5).
- **RNF-03 Anti-fraude:** el sitio declara visiblemente que nunca se pide dinero ni datos bancarios (P6).
- **RNF-04 Auditabilidad:** nada se borra durante la emergencia; lo inválido se archiva.
- **RNF-05 Costo:** operación en $0/mes durante la Fase 1 (plan Basic + SIM local con SMS).
- **RNF-06 Subordinación a los canales oficiales:** toda cara pública DEBERÁ abrir con «⚠️ ¿Vida en riesgo AHORA? Llama al 123» —arriba, antes de los formularios— y presentarse como complemento de los organismos de socorro, nunca como sustituto.

### RF-14 · Mapa de recursos ofrecidos (P1)
**Historia:** como Equipo, queremos ver en el mismo mapa quién ofrece maquinaria, energía, iluminación o transporte y dónde, para cruzar necesidad↔recurso sin cadenas de WhatsApp.
- EL SISTEMA DEBERÁ ofrecer el formulario «Ofrezco recursos», sin cuenta, con nombre y teléfono del oferente **protegidos** (RF-03).
- Cada recurso DEBERÁ tener Estado —🟢 Disponible (defecto) → 🔵 Asignado → ⚪ Retirado— para evitar el doble despacho, oculto en el front y enviado por código (ADR-011).
- El formulario DEBERÁ mostrar de forma visible la regla de seguridad: **la maquinaria solo entra a un punto de rescate cuando un organismo de socorro lo solicita**.
- Las necesidades DEBERÁN incluir la categoría «Iluminación / energía».

### RF-15 · Cara pública propia (P1, P4, P5)
**Historia:** como Afectado con mala señal y con miedo, quiero una página mínima, en castellano, que cargue y me deje pedir ayuda en un minuto.
- La cara pública DEBERÁ publicar de forma anónima contra la API y no mostrar jamás campos protegidos.
- DEBERÁ ocultar «Estado» y «Verificación» y enviarlos por código con su valor por defecto (ADR-011).
- Sus URLs DEBERÁN poder dictarse por radio: `/pido-ayuda`, `/busco-familiar`, `/quiero-ayudar`, `/ofrezco-recursos`.
- Cada página DEBERÁ tener su propia meta-descripción (hoy las tres comparten la de «Pido ayuda»).
- «Quiero ayudar» DEBERÁ explicar su propósito —entrar al equipo verificado tras una llamada— y no pedir «el correo con el que creaste tu cuenta», porque en esta cara nadie crea cuenta.

## Backlog — Fase 2 (no bloquea el lanzamiento)

- **RF-F2-01 Híbrido estricto:** publicar automáticamente solo las urgencias críticas/altas y retener las medias hasta verificación (requiere autoalojar y modificar código).
- **RF-F2-02 Autoalojado resiliente:** despliegue Docker propio detrás de Cloudflare, con importación de los CSV de la Fase 1.
- **RF-F2-03 Configuración automatizada:** aplicar `config/deployment-config.yml` vía API de Ushahidi para replicar despliegues en minutos.
- **RF-F2-04 Anonimización asistida:** script que limpie contactos de solicitudes Resueltas y del cierre de la emergencia.
