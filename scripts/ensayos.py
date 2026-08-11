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


# Búsquedas de familiar: salen en azul y sin urgencia, que es la otra mitad del
# mapa (RF-16). Nombres de pila inventados a propósito, y ninguno de menor.
BUSQUEDAS = [
    {
        "titulo": "Ficticia Pérez, 34 años",
        "detalle": "Chaqueta azul y jeans. Datos de prueba, persona inventada.",
        "edad": 34, "lat": 5.6890, "lon": -76.6580,
        "contacto": "Se le vio el martes en la tarde saliendo del trabajo. Prueba.",
        "parentesco": "Hermana",
    },
    {
        "titulo": "Ficticio Gómez, 61 años",
        "detalle": "Camisa blanca, sombrero. Datos de prueba, persona inventada.",
        "edad": 61, "lat": 4.8130, "lon": -75.6940,
        "contacto": "Última llamada el lunes por la noche. Prueba.",
        "parentesco": "Hijo",
    },
]

# La colección es la única señal de verificación que la cara pública reconoce
# (RF-17, ADR-017). Se marcan los dos primeros ensayos para poder ver en /mapa
# la diferencia entre una insignia de verdad y el resto.
COLECCION = "Verificadas por el equipo"
VERIFICAR_LOS_PRIMEROS = 2


def encuesta(api: Api, nombre: str) -> dict:
    lista = api.get("/api/v5/surveys").get("results") or []
    resumen = next((s for s in lista if s["name"] == nombre), None)
    if not resumen:
        sys.exit(f"No existe la encuesta «{nombre}». Corre antes scripts/aplicar_config.py.")
    return api.get(f"/api/v5/surveys/{resumen['id']}")["result"]


def id_coleccion(api: Api, nombre: str) -> int | None:
    for c in (api.get("/api/v5/collections").get("results") or []):
        if c["name"] == nombre:
            return c["id"]
    return None


def titulos_de_ensayo(api: Api) -> list[dict]:
    # Se pagina: con una sola página de 200, «borrar» dejaba ensayos vivos en
    # silencio en cuanto el despliegue crecía, y un ensayo vivo en el mapa es
    # una emergencia inventada.
    encontrados, pagina, ultima = [], 1, 1
    while pagina <= ultima:
        datos = api.get(f"/api/v5/posts?status=all&limit=200&page={pagina}")
        encontrados.extend(p for p in (datos.get("results") or [])
                           if str(p.get("title") or "").startswith(MARCA))
        ultima = (datos.get("meta") or {}).get("last_page") or 1
        pagina += 1
    return encontrados


def sembrar(api: Api) -> None:
    enc = encuesta(api, "Pido ayuda")
    tarea = enc["tasks"][0]
    campos = {f["label"]: f for f in tarea["fields"]}
    cats = {o["tag"]: o["id"] for o in (campos["¿Qué necesitas?"].get("options") or [])}

    def val(etiqueta: str, valor):
        f = campos[etiqueta]
        return {"id": f["id"], "type": f["type"], "input": f["input"],
                "label": etiqueta, "value": {"value": valor}}

    creados: list[int | None] = []
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
        creados.append((r.get("result") or {}).get("id"))
        print(f"  sembrado #{creados[-1]} · {e['municipio']} · {e['urgencia'][:2]}")

    sembrar_busquedas(api)
    verificar(api, creados[:VERIFICAR_LOS_PRIMEROS])
    sembrar_falsificacion(api, enc, tarea, campos)


def sembrar_busquedas(api: Api) -> None:
    """La otra mitad del mapa: los puntos azules (RF-16)."""
    enc = encuesta(api, "Busco a un familiar")
    tarea = enc["tasks"][0]
    campos = {f["label"]: f for f in tarea["fields"]}

    def val(etiqueta: str, valor):
        f = campos[etiqueta]
        return {"id": f["id"], "type": f["type"], "input": f["input"],
                "label": etiqueta, "value": {"value": valor}}

    for b in BUSQUEDAS:
        r = api.post("/api/v5/posts", {
            "form_id": enc["id"],
            "title": f"{MARCA} {b['titulo']}",
            "content": b["detalle"],
            "type": "report",
            "completed_stages": [tarea["id"]],
            "post_content": [{"id": tarea["id"], "fields": [
                val("Edad aproximada", b["edad"]),
                val("Último lugar donde se le vio (mapa)", {"lat": b["lat"], "lon": b["lon"]}),
                val("Detalles del último contacto", b["contacto"]),
                val("Tu parentesco", b["parentesco"]),
                val("Tu teléfono", "000-000-0000"),
                val("Estado de la búsqueda", campos["Estado de la búsqueda"]["default"]),
            ]}],
        })
        print(f"  sembrada búsqueda #{(r.get('result') or {}).get('id')} · {b['titulo']}")


def verificar(api: Api, ids: list[int]) -> None:
    """Mete ensayos en la colección: así es como se verifica de verdad (RF-17)."""
    col = id_coleccion(api, COLECCION)
    if col is None:
        print(f"  [!] No existe la colección «{COLECCION}»: ningún ensayo saldrá "
              f"verificado. Corre antes scripts/aplicar_config.py --aplicar")
        return
    for pid in ids:
        if pid is None:
            continue
        api.post(f"/api/v5/collections/{col}/posts", {"post_id": pid})
        print(f"  verificado #{pid} (metido en «{COLECCION}»)")


def sembrar_falsificacion(api: Api, enc: dict, tarea: dict, campos: dict) -> None:
    """
    El ensayo que prueba el arreglo de ADR-017: una publicación que se rellena a
    sí misma «✔️ Verificada por el equipo», como haría cualquiera con curl.

    Tiene que salir en /mapa como SIN VERIFICAR. Si algún día aparece con la
    insignia verde, es que la cara pública volvió a mirar el campo en vez de la
    colección, y la insignia dejó de valer para nada.
    """
    def val(etiqueta: str, valor):
        f = campos[etiqueta]
        return {"id": f["id"], "type": f["type"], "input": f["input"],
                "label": etiqueta, "value": {"value": valor}}

    r = api.post("/api/v5/posts", {
        "form_id": enc["id"],
        "title": f"{MARCA} Intento de auto-verificación — debe salir SIN VERIFICAR",
        "content": "Ensayo de seguridad (ADR-017). Esta publicación se envía a sí misma "
                   "el campo «Verificación» en verde. En /mapa tiene que verse «Sin "
                   "verificar»: la insignia sale de la colección, no del campo.",
        "type": "report",
        "completed_stages": [tarea["id"]],
        "post_content": [{"id": tarea["id"], "fields": [
            val("¿Para quién pides ayuda?", "Para otra persona"),
            val("Nombre o apodo", "Ensayo de seguridad"),
            val("Urgencia", "🔴 CRÍTICA: vidas en riesgo ahora"),
            val("¿Cuántas personas necesitan ayuda?", 1),
            val("Ubicación (punto en el mapa)", {"lat": 5.7100, "lon": -76.6400}),
            val("Municipio y departamento", "ENSAYO, Chocó"),
            val("Dirección exacta y señas", "DIRECCIÓN FICTICIA 000 — dato de prueba"),
            val("Estado de la solicitud", campos["Estado de la solicitud"]["default"]),
            # Lo que intenta el atacante:
            val("Verificación", "✔️ Verificada por el equipo"),
        ]}],
    })
    print(f"  sembrado #{(r.get('result') or {}).get('id')} · intento de auto-verificación "
          f"(debe verse «Sin verificar»)")


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
        print(f"Sembrando {len(ENSAYOS)} solicitudes y {len(BUSQUEDAS)} búsquedas de "
              f"ensayo, más el intento de auto-verificación (todo ficticio):")
        sembrar(api)
        print("\nListo. Míralas en /mapa. Para retirarlas:  python scripts/ensayos.py borrar")
    else:
        print("Retirando ensayos:")
        borrar(api)

    return 0


if __name__ == "__main__":
    sys.exit(main())
