'use client';

import { usePathname } from 'next/navigation';

/**
 * El bloque de líneas del pie, menos donde sobra.
 *
 * `/enlaces-oficiales` ya lo lleva completo y con notas en el cuerpo: repetirlo
 * abajo dejaba la misma lista dos veces en la misma pantalla, y un sitio que se
 * repite se lee como un sitio descuidado justo donde pide que se confíe en sus
 * números.
 */
export default function PieLineas({ children }: { children: React.ReactNode }) {
  return usePathname() === '/enlaces-oficiales' ? null : <>{children}</>;
}
