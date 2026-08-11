'use client';

import { useEffect, useState } from 'react';
import { hace } from '@/lib/frescura';
import { API } from '@/lib/ushahidi';

/**
 * «Consultado hace X · última solicitud hace Y» (RF-24).
 *
 * Se calcula **en el navegador** a propósito. Una marca de tiempo renderizada
 * en el servidor y servida desde la caché de la CDN afirma una frescura que no
 * tiene: diría «hace 30 segundos» sobre una página de hace seis horas, que es
 * exactamente la mentira que este componente viene a evitar.
 *
 * Sin props se busca la fecha él solo, después de pintar, para no meter una
 * llamada de red en el camino crítico de la portada — que es la página que abre
 * alguien con mala señal.
 */
export default function Frescura({
  consultadoEn,
  ultimaSolicitud,
}: {
  consultadoEn?: string;
  ultimaSolicitud?: string | null;
} = {}) {
  const autonomo = consultadoEn === undefined;

  const [consulta, setConsulta] = useState<number | null>(
    autonomo ? null : new Date(consultadoEn).getTime(),
  );
  const [ultima, setUltima] = useState<string | null>(ultimaSolicitud ?? null);
  const [ahora, setAhora] = useState<number>(() => Date.now());

  // Un reloj lento: lo que se mide son minutos y horas, no segundos.
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!autonomo) return;
    let vivo = true;
    (async () => {
      try {
        const r = await fetch(
          `${API}/api/v5/posts?limit=1&order=desc&orderby=post_date`,
          { headers: { Accept: 'application/json' }, cache: 'no-store' },
        );
        if (!r.ok) throw new Error();
        const d = await r.json();
        if (!vivo) return;
        setUltima(d.results?.[0]?.post_date ?? null);
        setConsulta(Date.now());
      } catch {
        // Sin dato no se inventa nada: es mejor no decir nada que mentir.
      }
    })();
    return () => { vivo = false; };
  }, [autonomo]);

  if (consulta === null) return null;

  const cuandoConsulta = hace(consulta, ahora);
  const cuandoUltima = ultima ? hace(ultima, ahora) : null;

  return (
    <p className="frescura" role="status">
      <span className="frescura__punto" aria-hidden="true" />
      Datos consultados <strong>{cuandoConsulta}</strong>
      {cuandoUltima && <> · última solicitud recibida {cuandoUltima}</>}
    </p>
  );
}
