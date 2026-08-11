'use client';

import { useState } from 'react';
import {
  DEPARTAMENTOS, MUNICIPIOS, OTRO, componer, type Departamento,
} from '@/lib/municipios';

/**
 * Municipio de lista cerrada, en cascada (RF-21, ADR-020).
 *
 * Dos desplegables cortos en vez de uno de 125: en un teléfono, elegir
 * departamento primero deja listas de 12 a 42 opciones, que sí se recorren con
 * el pulgar. El backend sigue recibiendo el mismo campo de texto de siempre.
 */
export default function SelectorMunicipio({
  valor,
  alCambiar,
  idCampo,
}: {
  valor: string;
  alCambiar: (v: string) => void;
  idCampo: string;
}) {
  const [departamento, setDepartamento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [libre, setLibre] = useState('');
  const [detalle, setDetalle] = useState('');

  const esOtro = departamento === OTRO;
  const lista = !esOtro && departamento
    ? MUNICIPIOS[departamento as Departamento]
    : [];

  /** Recompone el valor entero en cada pulsación: el padre solo ve el string. */
  const emitir = (d: string, m: string, l: string, det: string) => {
    alCambiar(d === OTRO ? componer(l, '', det) : componer(m, d, det));
  };

  return (
    <div className="municipio">
      <div className="municipio__fila">
        <div>
          <label className="municipio__sub" htmlFor={idCampo}>Departamento</label>
          <select
            id={idCampo}
            value={departamento}
            onChange={(e) => {
              const d = e.target.value;
              setDepartamento(d);
              setMunicipio('');
              setLibre('');
              emitir(d, '', '', detalle);
            }}
          >
            <option value="">Elige…</option>
            {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
            <option value={OTRO}>{OTRO}</option>
          </select>
        </div>

        <div>
          <label className="municipio__sub" htmlFor={`${idCampo}-mun`}>Municipio</label>
          {esOtro ? (
            <input
              id={`${idCampo}-mun`}
              type="text"
              value={libre}
              placeholder="Escribe el municipio y el departamento"
              onChange={(e) => {
                setLibre(e.target.value);
                emitir(departamento, '', e.target.value, detalle);
              }}
            />
          ) : (
            <select
              id={`${idCampo}-mun`}
              value={municipio}
              disabled={!departamento}
              onChange={(e) => {
                setMunicipio(e.target.value);
                emitir(departamento, e.target.value, '', detalle);
              }}
            >
              <option value="">
                {departamento ? 'Elige…' : 'Elige primero el departamento'}
              </option>
              {lista.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
        </div>
      </div>

      {/*
        La lista cerrada ordena, pero sola perdería lo que más importa en zona
        rural: el nombre de la vereda. Sigue siendo texto libre, en el mismo
        campo y detrás del guion, para que el prefijo siga agrupando (RF-21).
      */}
      <div className="municipio__detalle">
        <label className="municipio__sub" htmlFor={`${idCampo}-det`}>
          Barrio, vereda o corregimiento <span className="municipio__opcional">(opcional)</span>
        </label>
        <input
          id={`${idCampo}-det`}
          type="text"
          value={detalle}
          placeholder="Ej.: vereda El Carmen"
          onChange={(e) => {
            setDetalle(e.target.value);
            emitir(departamento, municipio, libre, e.target.value);
          }}
        />
      </div>

      {valor && <p className="municipio__eco">Quedará escrito así: <strong>{valor}</strong></p>}
    </div>
  );
}
