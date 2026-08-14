import Retirado from '@/components/Retirado';

export const metadata = {
  title: 'El mapa ya no está — SOS Sismo Colombia',
  description:
    'Este sitio dejó de recibir solicitudes y ahora es un directorio de fuentes sobre el ' +
    'sismo. Aquí están los sitios que sí reciben.',
};

/**
 * El mapa se retiró con los formularios (RF-37). Su URL sigue viva porque
 * circuló durante los primeros días; era además la que más se compartía.
 */
export default function PaginaMapa() {
  return <Retirado que="El mapa de solicitudes" />;
}
