# Añadir campos y opciones a una encuesta viva

> **Estado: implementado el 11-ago-2026** (T-043). `scripts/aplicar_config.py`
> ya reconcilia de forma aditiva en `anadir_campos()`, y por esa vía entraron
> los 5 campos de acceso (T-034) y la categoría «Vía bloqueada / acceso»
> (T-035) sin borrar nada. Este documento se conserva porque explica **por qué**
> el script hace lo que hace y qué pasa si alguien lo cambia.

Comprobado contra el despliegue real el 11-ago-2026. Resumen en una línea:
**se puede, sin borrar nada, con un `PUT` de objeto completo.**

## El problema

T-034 (sección de acceso: 5 campos nuevos en «Pido ayuda») y T-035 (categoría
«Vía bloqueada / acceso» dentro de «¿Qué necesitas?») necesitan tocar encuestas
que ya existen en el despliegue. Y `aplicar_config.py` no sabe:

- `scripts/aplicar_config.py:366` — si la encuesta ya existe, **la salta entera**.
  Solo reconcilia `require_approval`. Ningún cambio de campos llega nunca.
- `scripts/aplicar_config.py:362` — la única vía que sí aplica campos es
  `--recrear-encuestas`, y esa hace `DELETE` de la encuesta **con todas sus
  publicaciones dentro**.

Esto ya bloqueó a T-023 una vez: la categoría «Iluminación / energía» se creó
en el despliegue (id 11) pero nunca entró en el campo «¿Qué necesitas?», porque
no había forma de modificar el campo sin borrar la encuesta.

## La comprobación

Encuesta desechable `[ENSAYO] campos vivos` (id 12), con una publicación dentro
(post 37) y un campo `radio` con opciones. Se releyó entera, se le añadió un
campo al final y una opción a un campo existente, y se hizo
`PUT /api/v5/surveys/{id}` con el objeto completo. Resultado:

```
3. PUT con campo y opción nuevos -> HTTP 200
4. estado después del PUT
   campos ahora: ['Qué pasa', 'Cuéntanos más', 'Urgencia ensayo', 'Cómo se llega']
   ¿ids de los campos viejos intactos?  True
   ¿campo nuevo presente?               True
   opciones de «Urgencia ensayo»:       ['Alta', 'Baja', 'Vía bloqueada']
   require_approval / hide_author:      False / True
   publicación 37 sigue viva:           True
   su valor «Urgencia ensayo»:          form_attribute_id 74 -> 'Alta'
```

Los cinco puntos que importaban salieron bien: los `id` de los campos viejos no
cambian (así que las respuestas ya guardadas siguen apuntando a su campo), el
campo nuevo entra, la opción nueva entra, la publicación anterior sobrevive con
su valor, y los ajustes de la encuesta no se resetean. La encuesta de ensayo se
borró al terminar; no quedó residuo.

**Condición imprescindible:** el `PUT` tiene que llevar el objeto **completo**
recién leído con `GET /api/v5/surveys/{id}`, no un parche. El propio script ya
avisa dos veces de que los `PUT` parciales resetean cosas
(`aplicar_config.py:204` y `:456`, con `default_view` como ejemplo).

## La trampa de las categorías

Un segundo ensayo, con un campo `tags` y una publicación dentro, destapó lo que
habría roto T-035: **la API lee las categorías como objetos completos
(`{id, tag, slug, …}`) y las escribe como ids a secas.** Reenviarle su propia
representación de lectura es exactamente lo que revienta con «Array to string
conversion» en `/posts` (ADR-016).

Por eso `_normalizar_opciones()` convierte los objetos a ids antes del `PUT`, y
`_clave_opcion()` compara por `id` cuando la opción es un objeto y por su texto
cuando es una cadena. Con la normalización puesta:

```
3. el GET devuelve las opciones como: dict
   tras normalizar: [10, 11]
4. PUT con la categoría nueva -> HTTP 200
5. ¿ids de campos intactos? True · categorías: [9, 10, 11] · publicación viva: True
```

Si alguien quita esa normalización, el síntoma no será un error claro: será una
encuesta que deja de aceptar el `PUT` o que pierde las categorías del campo.

## El cambio que hace falta en `aplicar_config.py`

En la rama `if actual:` de `encuestas()` (`:366`), en lugar de limitarse a
registrar «ya existe», hay que reconciliar los campos de forma **aditiva**:

1. `GET /api/v5/surveys/{id}` para traer el objeto vivo entero.
2. Por cada campo del YAML que no esté en el vivo (comparando por `label`),
   añadirlo a `tasks[0].fields` con la `priority` que le toque.
3. Por cada campo que sí exista y tenga `options`, unir las opciones nuevas del
   YAML a las que ya están, **sin quitar ninguna**: quitar una opción que ya usan
   publicaciones existentes deja esas respuestas colgando.
4. `PUT /api/v5/surveys/{id}` con el objeto completo modificado.
5. Nunca renombrar ni borrar campos por esta vía. Renombrar sigue exigiendo
   recrear la encuesta, y por eso existe el mecanismo `TEXTOS` del front
   (`web/lib/ushahidi.ts:167`): la etiqueta real se queda como está y se corrige
   solo de cara al público.

Con eso, `--recrear-encuestas` queda para lo que de verdad lo necesita (cambiar
etiquetas, quitar campos) y deja de ser la única puerta.

## Ventana abierta, pero se cierra

A 11-ago-2026 el despliegue tiene **2 publicaciones**: una `[EJEMPLO]` en «Pido
ayuda» (post 10) y un borrador sin encuesta (post 32). Mientras siga así,
`--recrear-encuestas` también sería survivable y es el atajo tentador.

No lo tomes como plan. El sitio ya está al aire en
https://www.sossismocolombia.com.co/ y el número de SMS **3148071191** ya se
difundió (T-012). En cuanto entre la primera solicitud real, recrear encuestas
pasa a ser destrucción de datos de gente que pidió auxilio. El camino aditivo es
el que hay que construir, y cuanto antes, porque es el único que sigue siendo
válido después del lanzamiento.

Nota para el front: recrear una encuesta le cambia el `id`, pero eso **no**
rompería la cara pública — `traerEncuesta()` y `encuestasDelMapa()` resuelven
por `name`, no por id fijo (`web/lib/ushahidi.ts:200` y `:265`). El problema de
recrear son las publicaciones, no el front.

## Detalles de implementación de T-034

Los cinco campos de acceso son todos opcionales y públicos, y van al final de
«Pido ayuda», después de «Otra forma de contacto (pública)» y antes de los dos
campos del equipo:

| Etiqueta | Tipo | Opciones |
|---|---|---|
| Cómo se llega | `opcion_unica` | Carretera · Solo por río · Solo a pie · Necesita helicóptero · No sé |
| Punto de referencia comunitario | `texto_corto` | — |
| ¿Hay dónde aterrizar cerca? | `opcion_unica` | Sí · No · No sé |
| Tiempo desde el pueblo más cercano | `texto_corto` | — |
| ¿La vía está bloqueada? | `opcion_unica` | Sí · No · No sé |

Dos cosas que no salen del YAML:

- **El agrupamiento bajo «Solo si tu zona es de difícil acceso» es del front.**
  Ushahidi no tiene grupos de campos en esta configuración. Hay que hacerlo en
  `web/components/Formulario.tsx`, envolviendo esos cinco campos por `label` en
  un `<details>` plegado. Si se dejan sueltos, alargan el formulario para todo el
  mundo justo donde más gente lo abandona.
- **«Punto de referencia comunitario» es público y es texto libre**, así que le
  aplica `revisarDatosEnPublico()` igual que a los demás. La ayuda del campo
  tiene que empujar hacia referencias comunitarias (la escuela, la cancha, la
  iglesia) y no hacia la dirección de casa, que es justo lo que P2 mantiene en el
  campo protegido.

## Reproducir el ensayo

El script está en el scratchpad de la sesión
(`ensayo_campos.py`) y lee las credenciales del entorno, nunca de un archivo
copiado (P2):

```sh
set -a && . ./.env && set +a && python ensayo_campos.py
```

Crea la encuesta, publica dentro, hace el `PUT`, comprueba y borra. Es seguro
repetirlo: limpia cualquier `[ENSAYO] campos vivos` que hubiera quedado antes.
