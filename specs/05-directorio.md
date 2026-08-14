# 05 · Cambio de rumbo: de recepción a directorio de información

**Fecha:** 13-ago-2026 (día 4) · **Estado:** propuesto, pendiente de implementar
**Cómo usar este documento:** es un anexo. Sus RF/ADR se integran a `01-requirements.md` y `02-design.md`, y sus tareas a `03-tasks.md`. Numeración continuada desde el anexo 04 (último usado: RF-31, ADR-025, T-058).

**Relación con el anexo 04:** el 04 recalibraba el formulario a la fase humanitaria. Este documento lo deja sin efecto en la cara pública: no se recalibra un formulario que se retira. Lo que el 04 aporta y sigue vivo es su lectura del momento — el hueco real es de **información dispersa**, no de recepción de registros.

---

## 1. Contexto: por qué cambia el producto

La plataforma nació el 10-ago para recibir solicitudes de ayuda. Cuatro días después **no hay ni una sola solicitud registrada**. El anexo 04 atribuyó el vacío a un desajuste de fase y propuso recalibrar el formulario. La evidencia de estos días apunta más abajo: el problema no es qué pregunta el formulario, es que **la gente afectada no se autorregistra y quien coordina no necesita otro formulario más**.

Lo que sí falta, y nadie tiene, es una **lista confiable de dónde está cada cosa**. Hay plataformas ciudadanas, canales oficiales, cuentas que documentan, formularios de voluntariado y grupos de coordinación, todos dispersos y sin un índice. Ese es el hueco que esta plataforma sí puede llenar hoy, con lo que ya tiene montado.

**El giro:** se retira la recepción de registros y la portada pasa a ser un directorio público de información sobre la emergencia.

**Qué NO hace el directorio:** no republica datos ajenos, no agrega estadísticas sobre otras plataformas, no compara fuentes ni las califica. Manda a la gente al lugar correcto y dice cuándo fue la última vez que alguien lo revisó.

**Quién lo lee** (en este orden de prioridad de diseño):
1. Una persona afectada buscando albergue, ayuda o a un familiar.
2. Alguien que quiere ayudar: llevar mercado, prestar un carro, ser voluntario.
3. Periodistas, alcaldías y organismos buscando el panorama.

Principalmente en móvil, con conexión mala.

---

## 2. Requisitos nuevos

### RF-32 · La portada es el directorio y se navega por tema (P1, P5)
**Historia:** como persona afectada quiero encontrar en un toque la sección de lo que necesito, sin leer la página entera.

- La portada DEBERÁ organizarse en **siete secciones temáticas**, en este orden: Albergues y dónde dormir · Ayuda humanitaria (agua, comida, aseo, salud) · Búsqueda de personas · Voluntariado y cómo ayudar · Vías, transporte y acceso · Información oficial y qué pasó · Quién está documentando la emergencia.
- El orden responde a urgencia de quien lee, no a volumen de fuentes: dormir y comer van antes que entender.
- DEBERÁ existir un **índice de temas** en la parte alta, con destino de anclaje directo a cada sección. Con ~30 fichas, sin índice la página es un rollo de 7.000 px.
- El índice DEBERÁ mostrar cuántas fuentes tiene cada tema, incluido **cero**.
- Cada sección DEBERÁ terminar con un regreso al índice. Medido en la maqueta: una ficha ocupa **347 px de alto en promedio a 375 px de ancho**, así que treinta fichas son una página de ~12.000 px. Sin el regreso, quien llega al fondo de una sección tiene que arrastrar el pulgar por toda la página para cambiar de tema.
- NO DEBERÁ haber buscador ni filtros: con este volumen es sobreingeniería.

**Nota sobre los conteos:** contar las fichas propias no es «agregar estadísticas sobre fuentes ajenas» (prohibido en el encargo). Es declarar el inventario de lo revisado, que es justo lo que sostiene la promesa de RF-35.

### RF-33 · Anatomía única de ficha (P5)
**Historia:** como lector quiero que todas las fichas contesten lo mismo en el mismo orden, para poder comparar de un vistazo.

Toda ficha DEBERÁ presentar estos siete elementos, **siempre en este orden y sin excepciones**:

1. Nombre de la fuente
2. Etiqueta de tipo
3. Quién la hace (institución, colectivo, persona, «no identificado»)
4. Qué encuentras ahí — una frase concreta
5. Zona que cubre — solo si se sabe con certeza
6. Revisado el [fecha]
7. El canal, marcado como que sale del sitio

- Los elementos 5 y 6 DEBERÁN ocupar un único renglón de metadatos; el orden se conserva porque se leen de izquierda a derecha.
- Una ficha DEBERÁ tener **un canal principal** y PODRÁ tener **hasta dos secundarios**. El principal da la etiqueta de tipo de la ficha.
- Los canales secundarios DEBERÁN pintarse en orden canónico de plataforma, nunca en el orden en que se cargaron.
- La fecha de revisión cubre la ficha entera: **todos sus canales se revisaron ese día**.
- Cuando una organización tenga dos destinos con **propósitos distintos**, DEBERÁN ser fichas distintas, aunque sea la misma organización.
- La ficha completa NO DEBERÁ ser un enlace: con varios canales, el destino sería ambiguo.

### RF-34 · La fecha de revisión es la señal de confianza, y envejece sola (P3)
**Historia:** como lector quiero saber si alguien miró esto hace poco, sin tener que creerle a una insignia.

- Cada ficha DEBERÁ llevar fecha de revisión. **Sin fecha no se publica.**
- La fecha NO DEBERÁ dominar visualmente: una fecha que grita se lee como insignia, y en este proyecto ya se retiró una insignia de verificado por ser falsificable (RF-17…RF-20).
- El aspecto de la fecha DEBERÁ escalar con su antigüedad, y **solo con su antigüedad**:

| Antigüedad | Qué se lee | Tratamiento |
|---|---|---|
| 0–3 días | «Revisado el 13 de agosto» | Discreto, tinta suave |
| 4–7 días | «Revisado el 8 de agosto · hace 5 días» | Discreto, se añade lo transcurrido |
| 8+ días | «Revisado hace 12 días» | Color de alerta (`--alta`) |

- La antigüedad DEBERÁ calcularse en cada render del servidor, no en compilación: una página construida una vez congela el «hace 5 días» y miente al séptimo. Esto condiciona la estrategia de datos (ADR-026).
- NO DEBERÁ existir insignia de «verificado» de ninguna forma.
- La cabecera del directorio DEBERÁ declarar el estado agregado del inventario, incluido lo malo: si hay fichas sin revisar hace más de una semana, se dice ahí.

### RF-35 · Nombrar lo que falta (P5)
**Historia:** como lector quiero saber que buscaron y no encontraron, en vez de suponer que la sección está incompleta por descuido.

- Cada sección PODRÁ llevar una nota de vacío al final, con lenguaje concreto: qué se buscó, para qué zona, y que no se encontró fuente confiable.
- Una sección **sin ninguna ficha** DEBERÁ aparecer igual, con su nota. Esconderla rompe la promesa: el lector no puede distinguir «no hay» de «no miramos».
- La nota NO DEBERÁ parecer una ficha rota: sin etiqueta de tipo, sin fecha, sin canal, y con tratamiento visual distinto.
- La página NO DEBERÁ prometer «todo»: promete lo revisado.

### RF-36 · Cada sección se comparte por separado (P4)
**Historia:** como vecino quiero mandar por WhatsApp solo la parte de albergues, no la página entera.

- Cada sección DEBERÁ tener identificador estable y ancla propia.
- Cada sección DEBERÁ ofrecer una acción visible de compartir.
- La acción DEBERÁ funcionar **sin JavaScript** como enlace de anclaje; el compartir nativo del sistema es mejora progresiva.

### RF-37 · Se retira la recepción de registros (P1, P2)
- Los cuatro formularios y el mapa DEBERÁN retirarse de la cara pública.
- Sus URLs NO DEBERÁN responder 404 en silencio: las de los formularios se difundieron por WhatsApp y radio, y habrá gente llegando con enlaces de hace días. DEBERÁN explicar el cambio y llevar al directorio.
- La dependencia `leaflet` DEBERÁ salir del paquete: es la carga más pesada del sitio y ya no tiene función.
- La plataforma sigue sin pedir, recibir ni gestionar dinero, y DEBERÁ seguir declarándolo (P6).

### RF-38 · El directorio se indexa (revierte RF-19)
- `robots.ts` y la metadata DEBERÁN permitir indexación.
- **Condición previa, no negociable:** la reversión solo procede una vez retirado el mapa y confirmado que no queda ningún dato personal servido por la cara pública. RF-19 se estableció porque el mapa publicaba nombres de personas desaparecidas, incluidos menores; el motivo desaparece cuando desaparece el mapa, no antes.
- Un directorio que quiere ser encontrado necesita estar indexado: es el único de los canales de difusión que no depende de que alguien lo reenvíe.

> **✅ Condición previa confirmada — 14-ago-2026.** Auditoría ruta por ruta de la cara pública: `/` sirve organizaciones, sus canales y líneas institucionales (`01 8000…`); `/mapa` y las cuatro URLs de formularios son páginas fijas de `components/Retirado`; `/privacidad` es texto fijo. No hay rutas de API, ni mapa, ni formularios, ni ningún campo que reciba datos. **Ningún dato de persona identificable.** Reversión aplicada en las tres capas que la sostenían: `app/robots.ts`, el `robots` de `app/layout.tsx` y la cabecera `X-Robots-Tag` de `next.config.mjs`.

**Lo que la reversión trae consigo.** Levantar el bloqueo es condición necesaria pero no suficiente: sin esto, el sitio es indexable y aun así no lo encuentra nadie.

- El sitio DEBERÁ declarar un **dominio canónico** en un solo lugar (`lib/sitio.ts`, sobreescribible con `NEXT_PUBLIC_SITIO`). Open Graph, sitemap, canonical y datos estructurados necesitan URL absolutas; tres copias del dominio son tres copias que se desincronizan.
- El canónico es **`https://www.sossismocolombia.com.co`**, con `www`. Las dos variantes servirían la misma página, y para un buscador eso son dos sitios idénticos compitiendo entre sí. La variante que NO es canónica DEBERÁ redirigir a la que sí lo es: un canonical apuntando a una URL que no responde es peor que no tenerlo (T-074).
- Cada página indexable DEBERÁ declarar **su propio `canonical`**. NUNCA en el layout: la metadata del layout se hereda, y un canonical global apuntando a `/` le diría a Google que `/privacidad` es una copia.
- El sitio DEBERÁ publicar **`sitemap.xml`** con las páginas indexables, y `robots.txt` DEBERÁ apuntar a él. Las URLs retiradas NO DEBERÁN entrar en el sitemap.
- Las cinco URLs retiradas DEBERÁN llevar **`noindex, follow`**: son contenido delgado y casi idéntico entre sí, y repartirían entre seis URLs la relevancia que debe concentrarse en el directorio. `follow` conserva el valor de los enlaces viejos hacia la portada.
- El sitio DEBERÁ tener **vista previa de enlace** (Open Graph + Twitter Card) con imagen generada en compilación. No es cosmética: la difusión principal es WhatsApp, y ahí un enlace sin tarjeta es una línea azul que en un grupo con cien mensajes no toca nadie.
- El sitio DEBERÁ publicar **datos estructurados** (`NGO`, `WebSite`, `CollectionPage` con `ItemList`) que describan **solo lo que ya está en pantalla**. Marcar lo que no se ve es lo que hace que te penalicen.
- El `H1` y la entradilla DEBERÁN contener las palabras con las que se busca esto («sismo», «Colombia»), sin convertirse en una ristra de términos. Ver §6.
- El idioma DEBERÁ declararse como **`es-CO`**, no `es`: el sitio habla de municipios, líneas y una emergencia colombianas.

---

## 3. Decisiones de arquitectura

| ADR | Decisión | Alternativas descartadas | Razón y consecuencia |
|---|---|---|---|
| 026 | **Salir de Ushahidi en la cara pública.** Las fuentes viven en una hoja de cálculo con validación fila por fila, servida con revalidación en el servidor | (a) Ushahidi como CMS de fuentes; (b) archivo tipado en el repo con despliegue por cambio; (c) base de datos con panel propio | (a) obliga a renderizar la portada contra una API externa y modela reportes con ubicación, no fuentes; el único papel que le quedaría es el de CMS, y para eso es una herramienta cara. (b) es más auditable, pero **lo que más se toca es subir la fecha de revisión**, y si eso exige un despliegue la fecha se pudre — y con ella el producto entero (RF-34). (c) sin panel no la edita nadie del equipo; con panel es construir un CMS para 30 fichas. Consecuencia: una edición mala puede publicarse sin revisión humana, mitigado con validación por fila que falla cerrado (§5). |
| 027 | **El color vive en la sección, no en la ficha** | (a) Banda de color por tipo en cada ficha; (b) banda por tema en cada ficha | Con nueve tipos, nueve colores no significan nada y obligan a una leyenda. (b) repite en 30 fichas lo que el encabezado ya dijo. El color hace trabajo estructural donde segmenta —el encabezado de sección— y las fichas quedan idénticas entre sí, que es literalmente lo que el encargo pide. Consecuencia: la etiqueta de tipo tiene que sostenerse sola como texto. |
| 028 | **Los encabezados van en tinta; el color solo en la regla** | Encabezados de sección en el color del tema | Dos de los siete colores no alcanzan 4,5:1 sobre blanco como texto. Poniéndolos solo en la regla aplica el umbral de 3:1 de elemento no textual, que todos pasan, y el texto conserva contraste máximo. |

---

## 4. Diseño de la página

Móvil primero. Todo lo que sigue describe la vista de 360–430 px; el escritorio es la misma columna con más aire.

### 4.1 Estructura, de arriba abajo

| # | Bloque | Nota |
|---|---|---|
| 1 | **Banda de «¿este enlace es tuyo?»** | Cambiado el 14-ago-2026: era el aviso de la línea 123. Ver RNF-06 revisado — el 123 se conserva en las URLs retiradas de los formularios, no en el directorio. |
| 2 | Barra con el nombre del sitio | El nombre cambia (§6). |
| 3 | H1 + una frase de qué es y qué no es | |
| 4 | **Estado del directorio** | Inventario honesto: cuántas fuentes, cuándo se revisaron, cuántas llevan demasiado. |
| 5 | **Índice de temas** | Siete destinos, rejilla de dos columnas, con conteo. |
| 6 | **Las siete secciones** | Encabezado + fichas + nota de vacío. |
| 7 | Cómo aportar una fuente que falta | Correo del equipo + DM de Instagram y Facebook. |
| 8 | Pie | Sin dinero de por medio; complementa a los organismos, no los reemplaza. |

El bloque 4 va **antes** del índice a propósito: es la declaración de lo que este sitio promete. Quien no lea nada más, lee eso.

### 4.2 El índice

Rejilla de **dos columnas**, cada destino ≥ 52 px, etiqueta corta y conteo debajo. En una columna, siete destinos ocupan más de una pantalla y empujan todo el contenido fuera de vista; en dos, el índice cabe y la primera sección empieza sin scroll adicional.

Las etiquetas del índice son cortas («Albergues», «Info oficial»); el nombre completo del tema lo lleva el encabezado de la sección. Un tema en cero se pinta igual, con su cero.

El índice no es una comodidad: es lo que hace navegable una página de 12.000 px sin recurrir a filtros ni buscador, que están descartados. Junto con el regreso al índice al final de cada sección y el compartir por sección (RF-36), forma el único sistema de navegación del directorio.

### 4.3 Anatomía visual de la ficha

```
Nombre de la fuente   [tipo]        ← el tipo cae a la misma línea si cabe
Quién la hace
Qué encuentras ahí, en una frase.
Zona · Revisado el 13 de agosto     ← renglón único de metadatos
┌──────────────────────────────┐
│  dominio.gov.co            ↗ │    ← canal principal, ≥ 52 px
└──────────────────────────────┘
[ canal 2 ]  [ canal 3 ]            ← opcionales, ≥ 44 px
```

**Cuatro tamaños de texto en toda la ficha**, no más: nombre (1,1875 rem) · cuerpo y canal principal (1,0625 rem) · quién y zona (0,9375 rem) · tipo y fecha (0,8125 rem). El ritmo interno usa **tres separaciones** y son las mismas en todas las fichas: de ahí sale que quince fichas se lean como un sistema y no como quince recuadros.

**El canal principal muestra el destino, nunca una etiqueta genérica.** El dominio (`ungrd.gov.co`) o el usuario (`@cuenta en Instagram`), más la marca de que sale del sitio. Nunca «Ver más» ni «Ir al sitio». En un contexto donde la suplantación es rutinaria, saber a dónde vas antes de tocar es la mitad del trabajo de la ficha.

**Los canales secundarios son visiblemente subordinados**: más pequeños, en una sola fila. Si envuelven a un segundo renglón, es que sobran — de ahí el tope de dos.

### 4.4 Tratamiento de las etiquetas de tipo

Nueve tipos: Página · Mapa · Formulario · Documento o boletín · Instagram · Facebook · X · TikTok · Grupo de WhatsApp · Línea telefónica.

**Un solo tratamiento para todas**: píldora de borde fino, tinta, 0,8125 rem, peso 650. Sin color, sin ícono, sin mayúsculas.

Se evaluó y se descartó marcar aparte los tres tipos que cuestan algo al lector (línea telefónica, grupo de WhatsApp, formulario). El argumento a favor era real —tocar ahí no es gratis, se llama, se entra a un grupo, se llena algo— pero cualquier jerarquía dentro de las etiquetas empieza a leerse como juicio sobre la fuente, y el encargo prohíbe juzgar a otras plataformas. El texto de la etiqueta ya dice lo que cuesta.

### 4.5 Cómo se ve la fecha sin dominar

Comparte renglón con la zona, en el tamaño más pequeño de la ficha y en tinta suave, justo encima del canal. Es lo último que se lee antes de decidir si tocar.

Que sea discreta **es** el diseño: la fuerza de la fecha no está en su peso visual, está en que **envejece sola**. A los tres días, sin que nadie toque nada, la ficha empieza a decir que nadie volvió a mirar. Una insignia no puede hacer eso — por eso una insignia se puede falsificar y una fecha no.

Marcado semántico con `<time datetime="AAAA-MM-DD">`, y el texto lleva la fecha absoluta además de la relativa mientras la relativa sea corta: «hace 5 días» sin fecha obliga al lector a calcular.

### 4.6 La nota de lo que falta

Al final de la sección, borde discontinuo, sin píldora de tipo, sin fecha, sin canal. La discontinuidad del borde es lo que impide leerla como ficha rota. Texto concreto, nunca de relleno: nombra qué se buscó y para qué zona.

### 4.7 Escala y ritmo

Una escala de separación estricta —0,25 / 0,5 / 0,75 / 1 / 1,5 / 2 / 3 rem— y nada fuera de ella. Con fuentes del sistema, el ritmo vertical y la escala son **toda** la calidad tipográfica disponible; en cuanto las separaciones se eligen a ojo, treinta fichas se ven baratas y no hay fuente que lo arregle.

Se conserva el lenguaje existente: contraste máximo, cuerpo grande, áreas táctiles de 52 px, casi nada de movimiento, `prefers-reduced-motion` respetado.

### 4.8 Presupuesto de carga

Sale `leaflet` (~150 KB) y salen el cliente del formulario, el selector de ubicación y sus estilos. El directorio no tiene un solo componente de cliente: es HTML y CSS.

**Medido sobre el build de producción, con gzip:**

| | Peso | Bloquea |
|---|---|---|
| HTML de la portada | 4,2 KB | sí |
| CSS | 2,1 KB | sí |
| Runtime de React (asíncrono, no hace nada) | 103 KB | no |
| Polyfills (`noModule`: solo navegadores sin módulos ES) | 39 KB | no |

**Lo que hace falta para leer el directorio son 6,3 KB.** Ese es el número que responde a «tiene que aparecer en 2G»: la página se lee entera, con todos sus enlaces funcionando, antes de que llegue un byte de JavaScript, y sigue funcionando igual si no llega nunca.

**Lo que no se cumple:** una primera versión de este documento fijó el objetivo en «página completa por debajo de 50 KB». El total real es de ~145 KB porque Next envía el runtime de React aunque no haya nada que hidratar, y en App Router no hay forma soportada de desactivarlo. Se deja escrito en vez de ajustar el objetivo al resultado: son ~103 KB de datos móviles que el lector paga sin recibir nada a cambio, y en una zona afectada eso es saldo de un plan prepago.

**Decisión pendiente (T-070):** si esos 103 KB pesan más que la comodidad de mantenerlo en Next, el directorio no necesita framework — es una página estática sin estado. Es una decisión de coste, no de diseño, y no bloquea el lanzamiento.

---

## 5. Validación de datos (falla cerrado por ficha)

Una fila que no pase **no se pinta, y el resto de la página sí**. Bloquean:

- Falta la fecha de revisión, o está en el futuro.
- Falta la comprobación de que la cuenta es quien dice ser.
- Usuario o enlace mal formados; enlace que responde muerto.
- Más de dos canales secundarios.
- Identificador repetido.

Avisan sin bloquear: fichas sin revisar hace más de N días, y temas sin ninguna ficha — porque un tema vacío hay que **nombrarlo** en la página (RF-35), no esconderlo.

**Comprobación de identidad obligatoria en el dato, no en la buena intención.** Cada ficha guarda cómo se confirmó que la cuenta es quien dice ser; es un campo interno que nunca se pinta. No se puede cargar una cuenta sin escribir cómo se comprobó. Y no se lista la cuenta personal de un particular como si fuera una organización: la expone a un volumen de mensajes que no pidió.

**Cuentas sí, publicaciones no.** Se listan cuentas que documentan con constancia. No se copian ofertas individuales: mueren en horas, trasladan a la persona a una audiencia que no eligió, y convierten al sitio en aval de gente desconocida.

---

## 6. Decisión abierta: el nombre

«SOS Sismo Colombia» promete recepción de auxilio. Quien llega buscando dónde dormir y lee «SOS» supone que va a llenar algo. **El nombre y la promesa de la portada tienen que cambiar, y no es una decisión de diseño sino del equipo.**

Tres direcciones, no tres nombres cerrados:

1. **Nombrar la función** — que el nombre diga «directorio» o «dónde está cada cosa». Ventaja: nadie llega equivocado. Riesgo: genérico, difícil de dictar por radio.
2. **Conservar la marca y cambiar la promesa** — mismo nombre, bajada nueva. Ventaja: los enlaces que ya circulan por WhatsApp siguen significando lo mismo. Riesgo: «SOS» sigue prometiendo auxilio directo.
3. **Nombre nuevo, corto, dictable** — optimizado para decirse por radio y teclearse mal. Riesgo: se pierde lo poco que se haya difundido en cuatro días.

Recomendación: **2 para lanzar, 1 o 3 cuando haya evidencia de que la gente llega equivocada.** Cambiar de nombre el mismo día que se cambia de producto duplica el riesgo, y el nombre es lo más barato de revertir.

---

## 7. Tareas

- [ ] **T-059** 🤝 Retirar mapa y formularios de la cara pública; las URLs viejas explican el cambio y llevan al directorio; sacar `leaflet` · (RF-37)
- [ ] **T-060** 🤝 Esquema de fuentes con canal principal y hasta dos secundarios, más validación por fila que falla cerrado · (RF-33, §5)
- [ ] **T-061** 🤝 Hoja de cálculo de fuentes + ingesta con revalidación en servidor · (ADR-026)
- [ ] **T-062** 🤝 Portada: siete secciones, índice con conteos, bloque de estado del directorio · (RF-32, RF-34)
- [ ] **T-063** 🤝 Componente de ficha con la anatomía de §4.3 y la escala de §4.7 · (RF-33)
- [ ] **T-064** 🤝 Fecha de revisión con los tres estados de antigüedad, calculada en servidor · (RF-34)
- [ ] **T-065** 🤝 Notas de vacío por sección, incluida la sección en cero · (RF-35)
- [ ] **T-066** 🤝 Compartir por sección: ancla sin JS, compartir nativo como mejora; regreso al índice al final de cada sección · (RF-32, RF-36)
- [x] **T-067** 👤 Revertir la indexación — **solo después** de confirmar que no queda dato personal servido · (RF-38) — *Hecho 14-ago-2026:* condición confirmada por auditoría ruta por ruta; levantadas las tres capas (`robots.ts`, metadata del layout, `X-Robots-Tag`), más canonical por página, `sitemap.xml`, Open Graph con imagen generada, datos estructurados y `noindex, follow` en las cinco URLs retiradas
- [ ] **T-071** 👤 Dar de alta el sitio en Google Search Console y Bing Webmaster Tools, enviar el sitemap y pedir indexación de `/` · (RF-38) — el sitio estuvo bloqueado meses; sin esto, el rastreador puede tardar semanas en volver a pasar
- [ ] **T-072** 👤 Comprobar la vista previa del enlace en un WhatsApp real antes de difundir · (RF-38) — WhatsApp cachea la tarjeta; si la primera vez sale rota, sale rota durante días
- [x] **T-073** 👤 Registrar un dominio propio y fijarlo como canónico · (RF-38) — *Hecho 14-ago-2026:* `https://www.sossismocolombia.com.co`, con `www` por decisión de canonical (§7.1)
- [ ] **T-074** 👤 Redirigir el apex `sossismocolombia.com.co` (sin `www`) al canónico · (RF-38) — hoy **no resuelve**: quien teclee la dirección que le dictaron por radio, sin el `www`, no llega a ninguna parte
- [ ] **T-075** 👤 Reescribir `docs/senales-que-salvan.md` para el directorio · (RF-37) — el guion de radio sigue diciendo «repórtala aquí» y «regístralas en Ofrezco recursos», y esos formularios se retiraron; se leyó al aire, así que corregirlo es urgente
- [ ] **T-068** 👤 Decidir el nombre y la promesa de portada · (§6)
- [ ] **T-069** 👤 Cargar y comprobar las primeras fuentes: cada cuenta verificada como quien dice ser, con la comprobación escrita · (§5)
- [ ] **T-070** 🤝 Decidir si se sacan los ~103 KB de runtime de React sirviendo el directorio como página estática sin framework · (§4.8) — no bloquea el lanzamiento

**Orden si no cabe todo:** T-060 → T-062 → T-063 → T-064 → T-059. El esquema y la ficha son el producto; la ingesta desde hoja puede esperar a que las primeras fuentes estén cargadas a mano.

---

## 8. Lo que no cambia

- La subordinación a los organismos de socorro, declarada en el pie de todas las páginas (RNF-06). *El aviso del 123 en la cabecera sí cambió el 14-ago-2026: ver RNF-06 revisado.*
- Ningún dato personal de particulares en la página (P2).
- La plataforma no pide, recibe ni gestiona dinero, y lo declara (P6).
- Español claro, sin tecnicismos (P5).
- Sin webfonts, fuentes del sistema, la página aparece en 2G (P4).
- No se juzga a otras plataformas: se describe qué cubre cada una en términos neutros y verificables, nunca comparativos.
