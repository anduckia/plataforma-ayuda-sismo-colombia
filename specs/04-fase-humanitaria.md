# 04 · Cambio de fase: de rescate a necesidades humanitarias

**Fecha:** 13-ago-2026 (día 4) · **Estado:** propuesto, pendiente de implementar
**Cómo usar este documento:** es un anexo. Sus RF/ADR se integran a `01-requirements.md` y `02-design.md`, y sus tareas a `03-tasks.md`. Numeración ya verificada contra el repo (último usado: RF-26, ADR-024, T-048).

---

## 1. Contexto: por qué cambia todo

**La fase de búsqueda y rescate se cerró.** El 13 de agosto el ministro del Interior anunció que la fase de búsqueda y rescate fue superada y que no hay personas sepultadas bajo los escombros; la gobernadora del Chocó confirmó lo mismo para su departamento. El formulario actual está calibrado para el lunes 8:00 a.m.: la primera necesidad de la lista es «Rescate — persona atrapada» y la primera urgencia es «vidas en riesgo ahora».

**Consecuencia directa:** quien hoy tiene la casa agrietada y lleva tres noches durmiendo afuera abre el formulario, ve que habla de rescate y concluye «esto no es para mí». **Eso explica por qué nadie está llenando registros.** No es un problema de difusión: es que el producto apunta a un momento que ya pasó.

**La emergencia se movió a la fase humanitaria y va para semanas.** Balance UNGRD: 49.214 personas afectadas, 24.324 familias damnificadas, más de 54.000 viviendas destruidas o averiadas. En Manizales el alcalde estimó que las revisiones de habitabilidad tomarán un mes o más.

**El hueco nuevo lo describió OCHA:** no se conoce con precisión el número de damnificados, ni todos los lugares donde se han habilitado albergues, ni las necesidades. Es decir, la información que falta es exactamente la que esta plataforma puede producir.

**Evidencia del problema real — saturación y desajuste:**
- En un albergue de Manizales pidieron **priorizar otros elementos porque ya tienen suficiente comida**: lo que necesitan es agua, pañales y productos de aseo.
- En Quibdó hay familias pernoctando a la intemperie denunciando falta de ayudas concretas.
- En Pereira las organizaciones sociales montaron un campamento con ollas populares porque los albergues municipales están sobre capacidad.

Llega comida donde sobra comida y no llega agua donde falta agua. **Nadie en el país está preguntando qué NO se necesita.** Ese es el diferencial que esta plataforma puede tomar hoy.

**La mayoría de los afectados no está en albergues.** En Manizales el alcalde habló de 2.000 damnificados —posiblemente 4.000— y de 150 personas en el albergue del Coliseo Mayor: alrededor del 5 %. El otro 95 % duerme frente a su casa, donde un familiar, en campamentos espontáneos o en veredas que nadie ha visitado, y no aparece en ningún conteo. El formulario debe servirles a ellos igual que a un albergue.

**Principio operativo nuevo:** las víctimas casi nunca se autorregistran en la fase aguda. Quien reporta es un intermediario conectado (coordinador de albergue, presidente de JAC, párroco, docente, líder de cuadra) **o el propio equipo llenando el formulario por teléfono**. El formulario debe estar diseñado para que lo llene alguien que reporta por otros.

---

## 2. Requisitos nuevos

### RF-27 · Una solicitud puede ser de una familia, de un grupo o de un albergue (P1, P5)
**Historia:** como coordinador de albergue —o como vecino que reporta por su cuadra— quiero registrar la necesidad de un grupo de personas, sin que el formulario asuma que hablo de un solo hogar.

- El campo «¿Para quién pides ayuda?» DEBERÁ ofrecer tres opciones en lenguaje corriente: **«Para mí y mi familia» · «Para varias familias, mi cuadra o mi vereda» · «Para un albergue o refugio»**.
- NO DEBERÁ crearse un formulario nuevo ni una taxonomía de «tipos de asentamiento»: la evidencia de uso indica que el vocabulario técnico ahuyenta. Una pregunta, tres opciones.
- CUANDO se elija grupo o albergue, el campo «¿Cuántas personas necesitan ayuda?» DEBERÁ presentarse como el dato principal.
- El mapa DEBERÁ poder distinguir visualmente los reportes de grupo/albergue de los individuales (un reporte de 150 personas no pesa lo mismo que uno de 3).

### RF-28 · Se pregunta qué YA está cubierto (P1) — diferencial del proyecto
**Historia:** como equipo, quiero publicar de qué tiene suficiente cada sitio, para que las donaciones dejen de llegar repetidas a un lugar y de faltar en otro.

- El formulario DEBERÁ incluir el campo **«¿Qué ya tienen cubierto? (para que no les manden más de eso)»**, con la misma lista de opciones que «¿Qué necesitas?», opcional y **público**.
- El mapa y las exportaciones DEBERÁN mostrar este campo junto a las necesidades.
- Nota de implementación: en Ushahidi va como campo de casillas independiente, **no** vinculado a Categorías (las categorías alimentan el filtro del mapa y no deben mezclar necesidad con excedente).

### RF-29 · Detector de vacíos: ¿ya los visitó alguna entidad? (P1, P3)
**Historia:** como enlace de un organismo, quiero ver en qué sitios no ha estado nadie, para priorizar ahí.

- El formulario DEBERÁ incluir **«¿Ya los visitó alguna entidad?»** con opciones **Sí / No / No sé** y un campo libre corto **«¿Cuándo y quién?»**, opcional y público.
- El reporte periódico al equipo y a los organismos DEBERÁ poder filtrarse por «No» — es el dato que OCHA reporta como faltante.

### RF-30 · Categorías y urgencia calibradas a la fase humanitaria (P1, P5)
- La lista de necesidades DEBERÁ reordenarse y ampliarse para la fase actual (ver §4). Las de fase aguda —«Rescate — persona atrapada» y «Maquinaria / remoción de escombros»— DEBERÁN bajar al final de la lista, no eliminarse.
- La urgencia DEBERÁ recalibrarse: mientras «CRÍTICA» signifique «vidas en riesgo ahora», todo el mundo marca crítica y el triaje se vuelve inútil. Nueva escala en §4.
- El aviso del 123 se mantiene arriba y sin cambios (RNF-06).
- **Bug abierto:** la categoría «Iluminación / energía» quedó especificada pero **no está aplicada** ni en `config/deployment-config.yml` ni en el formulario en producción (verificado el 13-ago en `/pido-ayuda`).

### RF-31 · Menos fricción para quien reporta por otros (P1, P4, P5)
- **«Dirección exacta y señas» DEBERÁ dejar de ser obligatorio.** Un coordinador que reporta por 150 personas no tiene «señas de la casa», y exigirlo bloquea el registro y genera desconfianza. Con el pin del mapa, el municipio y el barrio basta.
- **«Nombre o apodo» DEBERÁ dejar de ser obligatorio.**
- **«Otra forma de contacto (pública)» DEBERÁ retirarse:** su texto de advertencia es más largo que su utilidad y es un riesgo de privacidad (publica contactos de terceros).
- El formulario completo DEBERÍA poder llenarse en menos de 2 minutos en un celular con batería baja.

---

## 3. Decisión de arquitectura

| ADR | Decisión | Alternativas descartadas | Razón y consecuencia |
|---|---|---|---|
| 025 | **Girar el formulario existente a la fase humanitaria**, ampliando «¿Para quién?» a tres opciones y añadiendo «qué ya está cubierto» y «¿los visitó alguna entidad?» | (a) Crear un formulario separado «Reporte de albergue»; (b) crear un formulario «grupo afectado» con tipología de asentamientos; (c) no cambiar nada | (a) y (b) fragmentan la entrada y obligan a la gente a clasificarse antes de pedir ayuda — vocabulario técnico que ahuyenta. Un solo formulario con una pregunta ampliada cubre familia, cuadra, vereda y albergue. (c) deja el producto apuntando a una fase cerrada. Consecuencia: el mapa mezcla escalas muy distintas (3 personas vs 150), por eso RF-27 exige distinguirlas visualmente. |

---

## 4. Especificación de campos (fuente para `deployment-config.yml` y el front)

### 4.1 «¿Para quién pides ayuda?» — reemplaza las dos opciones actuales
```
Para mí y mi familia
Para varias familias, mi cuadra o mi vereda
Para un albergue o refugio
```

### 4.2 «Urgencia» — reemplaza la escala actual
```
🔴 HOY — no tenemos agua, no tenemos dónde dormir, o hay alguien enfermo sin sus medicamentos
🟠 ESTA SEMANA — lo que tenemos se nos acaba en 2 o 3 días
🟡 PUEDE ESPERAR — por ahora tenemos lo básico
```
Texto de apoyo bajo el campo: «Si hay una vida en riesgo en este momento, llama al 123.»

### 4.3 «¿Qué necesitas?» — lista reordenada (también es la lista de Categorías)
```
Agua potable
Comida
Dónde dormir (carpa, colchoneta, cobijas)
Aseo e higiene (pañales, toallas higiénicas, jabón)
Medicamentos de enfermedades crónicas (tensión, diabetes, epilepsia)
Atención médica
Leche de fórmula y alimentación infantil
Refugio / alojamiento
Iluminación / energía          ← BUG: hoy no existe
Transporte / evacuación
Apoyo psicológico
Vía bloqueada / acceso
Seguridad / Policía
Búsqueda de familiares
Maquinaria / remoción de escombros
Rescate — persona atrapada
Otro
```
Cambios respecto a hoy: se separa «Comida y agua» en dos (en Manizales sobraba comida y faltaba agua); se añaden aseo, dónde dormir, crónicos, leche de fórmula, apoyo psicológico e iluminación; «Rescate» y «Maquinaria» bajan al final. Si la lista supera lo escaneable en móvil, agrupar visualmente (Supervivencia / Salud / Logística) sin cambiar los valores.

### 4.4 Campos nuevos
| Campo | Tipo | Oblig. | Visibilidad | Texto de ayuda |
|---|---|---|---|---|
| ¿Qué ya tienen cubierto? | Casillas (misma lista de 4.3) | No | Público | Para que no les manden más de eso. |
| ¿Ya los visitó alguna entidad? | Opción única: Sí / No / No sé | No | Público | Alcaldía, Cruz Roja, Defensa Civil, Ejército, alguna fundación. |
| ¿Cuándo y quién? | Texto corto | No | Público | Solo si marcaste «Sí». |

### 4.5 Campos que cambian de obligatoriedad o se retiran
| Campo | Hoy | Debe quedar |
|---|---|---|
| Dirección exacta y señas | Obligatorio 🔒 | **Opcional** 🔒 |
| Nombre o apodo | Obligatorio | **Opcional** |
| Otra forma de contacto (pública) | Opcional, público | **Retirado** |
| Foto | Opcional | Opcional (sin cambios) |

---

## 5. Tareas

- [ ] **T-049** 🤝 **Bug:** añadir la categoría «Iluminación / energía», que quedó especificada pero no aplicada (verificar con `--solo-auditar` que quede en el despliegue y en el front) · (RF-30)
- [ ] **T-050** 🤝 YAML: aplicar §4.1 a §4.5 en `config/deployment-config.yml` y correr `aplicar_config.py --aplicar` · (RF-27…RF-31)
- [ ] **T-051** 🤝 Front `/pido-ayuda`: tres opciones en «¿Para quién?»; cuando sea grupo o albergue, destacar «¿cuántas personas?» · (RF-27)
- [ ] **T-052** 🤝 Front: campos «¿Qué ya tienen cubierto?» y «¿Ya los visitó alguna entidad?» + «¿Cuándo y quién?» · (RF-28, RF-29)
- [ ] **T-053** 🤝 Front: nueva escala de urgencia y lista de necesidades reordenada · (RF-30)
- [ ] **T-054** 🤝 Front: dirección y nombre opcionales; retirar «Otra forma de contacto (pública)» · (RF-31)
- [ ] **T-055** 🤝 Mapa: distinguir visualmente los reportes de grupo/albergue de los individuales y mostrar «ya cubierto» en la ficha · (RF-27, RF-28)
- [ ] **T-056** 🤝 Exportación abierta: incluir las columnas nuevas (para quién, ya cubierto, visitado por entidad) en el CSV/GeoJSON público y en el diccionario de datos · (RF-28, RF-29)
- [ ] **T-057** 👤 Prueba de punta a punta con los tres tipos de solicitud (familia, cuadra, albergue) antes de difundir · (RF-27)
- [ ] **T-058** 👤 Sembrar los primeros 20 registros llamando a albergues y líderes: el equipo llena el formulario por ellos, no se les pide que entren al sitio · (RF-27, P1)

**Orden sugerido si no cabe todo:** T-049 → T-050 → T-052 → T-051 → T-053. Los campos de RF-28 y RF-29 son el diferencial; el resto es calibración.

---

## 6. Lo que NO cambia

- El aviso del 123 arriba y la subordinación a los canales oficiales (RNF-06).
- Teléfono y dirección siguen protegidos; el consentimiento sigue siendo llenar el campo (ADR-004).
- La verificación de ayudantes sigue siendo humana, por llamada (ADR-005).
- La plataforma sigue sin pedir ni gestionar dinero (P6).
- «Rescate» y «Maquinaria» se conservan en la lista: las réplicas continúan y un colapso tardío sigue siendo posible.
