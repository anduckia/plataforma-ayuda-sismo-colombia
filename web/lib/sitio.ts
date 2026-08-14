/**
 * Identidad del sitio hacia afuera: lo que ven los buscadores y las vistas
 * previas de WhatsApp (RF-38).
 *
 * El dominio vive aquí y en un solo sitio más —la variable de entorno— porque
 * Open Graph, el sitemap, los canonical y los datos estructurados necesitan URL
 * ABSOLUTAS: un enlace relativo en una etiqueta `og:` no lo resuelve nadie.
 * Cuando se registre un dominio propio se cambia `NEXT_PUBLIC_SITIO` y no hace
 * falta tocar el código.
 *
 * OJO con la barra final: `new URL('/mapa', base)` con base terminada en `/`
 * funciona, pero el canonical acabaría con doble barra. Se normaliza aquí.
 *
 * **Con `www` y no sin él.** Las dos formas sirven la misma página, y para un
 * buscador eso son dos sitios distintos con contenido idéntico compitiendo
 * entre sí. La que se escriba aquí es la que gana: el canonical de cada página
 * apunta a esta, y la otra queda declarada como copia. Cambiarla exige
 * redirigir la variante perdedora en el proveedor, o el canonical estará
 * señalando a una URL que no responde.
 */
export const SITIO = (
  process.env.NEXT_PUBLIC_SITIO?.trim() ||
  'https://www.sossismocolombia.com.co'
).replace(/\/+$/, '');

export const NOMBRE = 'SOS Sismo Colombia';

/**
 * La frase que describe el sitio, en un solo lugar.
 *
 * Se usa en la descripción de la portada, en Open Graph y en los datos
 * estructurados. Si se escribe tres veces, a la tercera edición ya dicen tres
 * cosas distintas y el buscador se queda con la que menos nos conviene.
 */
export const DESCRIPCION =
  'Dónde encontrar voluntariado, centros de acopio, donaciones, búsqueda de ' +
  'personas, vías y canales oficiales tras el sismo en Colombia. Cada fuente ' +
  'dice quién la hace y cuándo se revisó.';
