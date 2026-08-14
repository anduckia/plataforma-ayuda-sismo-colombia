import Retirado from '@/components/Retirado';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'El mapa ya no está',
  description:
    'Este sitio dejó de recibir solicitudes y ahora es un directorio de fuentes sobre el ' +
    'sismo. Aquí están los sitios que sí reciben.',
  alternates: { canonical: '/mapa' },
  /*
    Fuera del índice, pero se siguen los enlaces (RF-38).

    Esta página y las cuatro de los formularios dicen todas lo mismo con dos
    palabras de diferencia. Indexarlas repartiría entre seis URLs la relevancia
    que queremos concentrada en el directorio, y quien busca «mapa sismo
    Colombia» aterrizaría en una página que le dice que no hay mapa. Con
    `follow` la reputación de los enlaces viejos sí llega a la portada, que es
    justo lo que queremos que herede.
  */
  robots: { index: false, follow: true },
};

/**
 * El mapa se retiró con los formularios (RF-37). Su URL sigue viva porque
 * circuló durante los primeros días; era además la que más se compartía.
 */
export default function PaginaMapa() {
  return <Retirado que="El mapa de solicitudes" />;
}
