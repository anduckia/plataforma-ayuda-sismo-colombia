#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Siembra y retira solicitudes de ENSAYO, para poder probar el mapa y la lista con
volumen antes de difundir.

    python scripts/ensayos.py listar     # qué ensayos hay ahora
    python scripts/ensayos.py sembrar    # crea los ensayos
    python scripts/ensayos.py borrar     # los retira

TODOS los datos son ficticios y obvios (P2): nombres inventados, teléfonos
000-000-0000, direcciones «FICTICIA». Nunca metas aquí datos de una persona real.

EL BORRADO SOLO TOCA LO QUE EMPIEZA POR «[ENSAYO]» en el título. Enumera lo que
va a borrar antes de hacerlo y no mira ninguna otra publicación. Esta salvaguarda
existe porque en la primera sesión se borraron por error publicaciones que no
eran de prueba.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts"))

try:
    import yaml
except ImportError:
    sys.exit("Falta PyYAML. Instala con:  pip install pyyaml")

for flujo in (sys.stdout, sys.stderr):
    try:
        flujo.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

from aplicar_config import Api, base_api, cargar_env, CONFIG  # noqa: E402

MARCA = "[ENSAYO]"

# Repartidos por la zona afectada, con urgencias variadas. Los dos primeros están
# a menos de 600 m entre sí a propósito: así se ve saltar el aviso de duplicado.
ENSAYOS = [
    {
        "titulo": "Casa colapsada, dos personas atrapadas",
        "detalle": "Se escuchan voces bajo el techo caído. Datos de prueba.",
        "apodo": "Familia ficticia A", "urgencia": "🔴 CRÍTICA: vidas en riesgo ahora",
        "personas": 2, "municipio": "Quibdó, Chocó", "lat": 5.6947, "lon": -76.6611,
        "necesita": ["Rescate — persona atrapada"],
        "vulnerables": ["Adultos mayores"],
    },
    {
        "titulo": "Vecinos atrapados en la misma cuadra",
        "detalle": "Reportado por otro vecino. Datos de prueba.",
        "apodo": "Vecino ficticio B", "urgencia": "🔴 CRÍTICA: vidas en riesgo ahora",
        "personas": 2, "municipio": "Quibdó, Chocó", "lat": 5.6951, "lon": -76.6608,
        "necesita": ["Rescate — persona atrapada"],
        "vulnerables": [],
    },
    {
        "titulo": "Herida en la pierna, necesita atención",
        "detalle": "Sangra y no puede caminar. Datos de prueba.",
        "apodo": "Persona ficticia C", "urgencia": "🟠 ALTA: necesito ayuda hoy",
        "personas": 1, "municipio": "Istmina, Chocó", "lat": 5.1593, "lon": -76.6855,
        "necesita": ["Atención médica / paramédicos", "Medicamentos"],
        "vulnerables": ["Heridos"],
    },
    {
        "titulo": "Sin agua ni comida desde ayer",
        "detalle": "Somos varias familias en la vereda. Datos de prueba.",
        "apodo": "Grupo ficticio D", "urgencia": "🟠 ALTA: necesito ayuda hoy",
        "personas": 14, "municipio": "San José del Palmar, Chocó", "lat": 4.8950, "lon": -76.2350,
        "necesita": ["Comida y agua"],
        "vulnerables": ["Bebés o niños"],
    },
    {
        "titulo": "Necesitamos dónde dormir esta noche",
        "detalle": "La casa quedó inhabitable. Datos de prueba.",
        "apodo": "Familia ficticia E", "urgencia": "🟡 MEDIA: puede esperar 1–2 días",
        "personas": 5, "municipio": "Pereira, Risaralda", "lat": 4.8087, "lon": -75.6906,
        "necesita": ["Refugio / alojamiento"],
        "vulnerables": ["Bebés o niños", "Adultos mayores"],
    },
    {
        "titulo": "Vía bloqueada por escombros",
        "detalle": "No entran ambulancias al barrio. Datos de prueba.",
        "apodo": "Junta ficticia F", "urgencia": "🟠 ALTA: necesito ayuda hoy",
        "personas": 60, "municipio": "Armenia, Quindío", "lat": 4.5339, "lon": -75.6811,
        "necesita": ["Maquinaria / remoción de escombros", "Transporte / evacuación"],
        "vulnerables": [],
    },
    {
        "titulo": "Medicamentos para presión y diabetes",
        "detalle": "Se perdieron con la casa. Datos de prueba.",
        "apodo": "Persona ficticia G", "urgencia": "🟡 MEDIA: puede esperar 1–2 días",
        "personas": 2, "municipio": "Manizales, Caldas", "lat": 5.0689, "lon": -75.5174,
        "necesita": ["Medicamentos"],
        "vulnerables": ["Adultos mayores"],
    },
    {
        "titulo": "Adulto mayor solo, necesita traslado",
        "detalle": "No tiene familiares en la zona. Datos de prueba.",
        "apodo": "Vecina ficticia H", "urgencia": "🟠 ALTA: necesito ayuda hoy",
        "personas": 1, "municipio": "Tuluá, Valle del Cauca", "lat": 4.0847, "lon": -76.1954,
        "necesita": ["Transporte / evacuación"],
        "vulnerables": ["Adultos mayores", "Personas con discapacidad"],
    },
]


def encuesta_pido_ayuda(api: Api) -> dict:
    lista = api.get("/api/v5/surveys").get("results") or []
    resumen = next((s for s in lista if s["name"] == "Pido ayuda"), None)
    if not resumen:
        sys.exit("No existe la encuesta «Pido ayuda». Corre antes scripts/aplicar_config.py.")
    return api.get(f"/api/v5/surveys/{resumen['id']}")["result"]


def titulos_de_ensayo(api: Api) -> list[dict]:
    datos = api.get("/api/v5/posts?status=all&limit=200")
    return [p for p in (datos.get("results") or [])
            if str(p.get("title") or "").startswith(MARCA)]


def sembrar(api: Api) -> None:
    enc = encuesta_pido_ayuda(api)
    tarea = enc["tasks"][0]
    campos = {f["label"]: f for f in tarea["fields"]}
    cats = {o["tag"]: o["id"] for o in (campos["¿Qué necesitas?"].get("options") or [])}

    def val(etiqueta: str, valor):
        f = campos[etiqueta]
        return {"id": f["id"], "type": f["type"], "input": f["input"],
                "label": etiqueta, "value": {"value": valor}}

    for e in ENSAYOS:
        campos_envio = [
            val("¿Para quién pides ayuda?", "Para otra persona"),
            val("Nombre o apodo", e["apodo"]),
            val("¿Qué necesitas?", [cats[c] for c in e["necesita"] if c in cats]),
            val("Urgencia", e["urgencia"]),
            val("¿Cuántas personas necesitan ayuda?", e["personas"]),
            val("Ubicación (punto en el mapa)", {"lat": e["lat"], "lon": e["lon"]}),
            val("Municipio y departamento", e["municipio"]),
            val("Dirección exacta y señas", "DIRECCIÓN FICTICIA 000 — dato de prueba"),
            val("Teléfono de contacto", "000-000-0000"),
            # Los llena el equipo, no quien publica: se mandan por código (ADR-011).
            val("Estado de la solicitud", campos["Estado de la solicitud"]["default"]),
            val("Verificación", campos["Verificación"]["default"]),
        ]
        if e["vulnerables"]:
            campos_envio.append(val("¿Hay personas vulnerables?", e["vulnerables"]))

        r = api.post("/api/v5/posts", {
            "form_id": enc["id"],
            "title": f"{MARCA} {e['titulo']}",
            "content": e["detalle"],
            "type": "report",
            "completed_stages": [tarea["id"]],
            "post_content": [{"id": tarea["id"], "fields": campos_envio}],
        })
        print(f"  sembrado #{(r.get('result') or {}).get('id')} · {e['municipio']} · {e['urgencia'][:2]}")


def borrar(api: Api) -> None:
    ensayos = titulos_de_ensayo(api)
    if not ensayos:
        print("  No hay ensayos que borrar.")
        return
    print(f"  Se van a borrar {len(ensayos)} publicación(es), todas con el prefijo «{MARCA}»:")
    for p in ensayos:
        print(f"    #{p['id']}  {p.get('title')}")
    print()
    for p in ensayos:
        api.delete(f"/api/v5/posts/{p['id']}")
        print(f"    borrado #{p['id']}")


def main() -> int:
    orden = sys.argv[1] if len(sys.argv) > 1 else ""
    if orden not in ("listar", "sembrar", "borrar"):
        print(__doc__)
        return 2

    cfg = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))
    api = Api(base_api(cfg["despliegue"]["url"]), simulacro=False)
    env = cargar_env()
    api.entrar(env["USHAHIDI_EMAIL"], env["USHAHIDI_PASSWORD"])

    if orden == "listar":
        ensayos = titulos_de_ensayo(api)
        print(f"{len(ensayos)} ensayo(s) en la plataforma:")
        for p in ensayos:
            print(f"  #{p['id']}  {p.get('title')}")
        total = api.get("/api/v5/posts?status=all&limit=200").get("count")
        print(f"\nPublicaciones totales (ensayos incluidos): {total}")
    elif orden == "sembrar":
        print(f"Sembrando {len(ENSAYOS)} solicitudes de ensayo (datos ficticios):")
        sembrar(api)
        print("\nListo. Míralas en /mapa. Para retirarlas:  python scripts/ensayos.py borrar")
    else:
        print("Retirando ensayos:")
        borrar(api)

    return 0


if __name__ == "__main__":
    sys.exit(main())
