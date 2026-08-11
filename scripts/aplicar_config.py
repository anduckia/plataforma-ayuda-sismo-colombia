#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Aplica config/deployment-config.yml a un despliegue Ushahidi vía API v5 (T-203, RF-F2-03).

Cubre T-002…T-007: ajustes generales, mapa, categorías, rol «Ayudante verificado»
y las tres encuestas con sus visibilidades.

Uso:
    python scripts/aplicar_config.py                 # simulacro: no escribe nada
    python scripts/aplicar_config.py --aplicar       # escribe en el despliegue
    python scripts/aplicar_config.py --solo-auditar  # solo verifica privacidad
    python scripts/aplicar_config.py --aplicar --recrear-encuestas   # borra y rehace

Credenciales: archivo .env local (USHAHIDI_EMAIL / USHAHIDI_PASSWORD). NUNCA en el repo.

Es idempotente: busca por nombre antes de crear. Al final audita la visibilidad de
cada campo y termina con código 1 si algún campo protegido quedó público (P2).
"""

from __future__ import annotations

import argparse
import json
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("Falta PyYAML. Instala con:  pip install pyyaml")

# Las etiquetas llevan emoji; la consola de Windows usa cp1252 por defecto.
for flujo in (sys.stdout, sys.stderr):
    try:
        flujo.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

RAIZ = Path(__file__).resolve().parent.parent
CONFIG = RAIZ / "config" / "deployment-config.yml"
ENV = RAIZ / ".env"

# Cliente OAuth público del cliente web de Ushahidi (no es un secreto).
CLIENT_ID = "ushahidiui"
CLIENT_SECRET = "35e7f0bca957836d05ca0492211b0ac707671261"

# tipo del YAML -> (input, type) de la API. Sondeado contra la API real (10-ago-2026).
TIPOS = {
    "texto_corto":         ("text",     "varchar"),
    "texto_largo":         ("textarea", "text"),
    "numero":              ("number",   "int"),
    "ubicacion":           ("location", "point"),
    "opcion_unica":        ("radio",    "varchar"),
    "casillas":            ("checkbox", "varchar"),
    "casillas_categorias": ("tags",     "tags"),
    # OJO: el cliente espera input "image", NO "upload". Con "upload" no encuentra
    # el tipo, obtiene null y revienta con «Cannot read properties of null
    # (reading 'hasCaption')» al abrir el formulario. Ver ADR-008.
    "imagen":              ("image",    "media"),
}

# Los campos de imagen necesitan config, o el cliente falla al renderizarlos.
CONFIG_IMAGEN = {"hasCaption": True, "maxUploadSize": 2}

# Ushahidi tiene UN solo nivel de privacidad por campo (response_private), que ven
# quienes tengan el permiso «Manage Posts». No existe visibilidad por rol campo a
# campo: la API acepta la clave `role` pero la descarta. Ver ADR-006 en 02-design.md.
PRIVADO = {"publico": False, "protegido": True, "solo_admin": True}


# --------------------------------------------------------------------------- utilidades

class Registro:
    def __init__(self, simulacro: bool):
        self.simulacro = simulacro
        self.cambios: list[str] = []

    def hecho(self, msg: str) -> None:
        self.cambios.append(msg)
        print(f"  {'[simulacro]' if self.simulacro else '[ok]'} {msg}")

    def igual(self, msg: str) -> None:
        print(f"  [=] {msg}")


def nombre_admitido(texto: str) -> str:
    """Ushahidi valida nombres de categoría y de encuesta contra /^[\\pL\\pN\\pP ]+$/u
    y devuelve 422 ante emoji (ADR-007). Deja pasar letras, números, puntuación y
    espacios; descarta lo demás. El YAML ya viene limpio: esto protege a quien lo
    replique con emoji en sus propias categorías."""
    limpio = "".join(c for c in texto if c == " " or unicodedata.category(c)[0] in "LNP")
    return " ".join(limpio.split())


def cargar_env() -> dict[str, str]:
    if not ENV.exists():
        sys.exit(f"No existe {ENV}. Crea un .env con USHAHIDI_EMAIL y USHAHIDI_PASSWORD.")
    datos = {}
    for linea in ENV.read_text(encoding="utf-8-sig").splitlines():
        linea = linea.strip()
        if linea and not linea.startswith("#") and "=" in linea:
            k, v = linea.split("=", 1)
            datos[k.strip()] = v.strip().strip('"').strip("'")
    faltan = [k for k in ("USHAHIDI_EMAIL", "USHAHIDI_PASSWORD") if not datos.get(k)]
    if faltan:
        sys.exit(f"Faltan variables en .env: {', '.join(faltan)}")
    return datos


class Api:
    """Cliente mínimo de la API v5 de Ushahidi."""

    def __init__(self, base: str, simulacro: bool):
        self.base = base.rstrip("/")
        self.simulacro = simulacro
        self.token = ""

    def _peticion(self, metodo: str, ruta: str, cuerpo=None, sin_token=False):
        datos = json.dumps(cuerpo).encode("utf-8") if cuerpo is not None else None
        cabeceras = {"Accept": "application/json", "Content-Type": "application/json"}
        if self.token and not sin_token:
            cabeceras["Authorization"] = "Bearer " + self.token
        req = urllib.request.Request(self.base + ruta, data=datos, method=metodo, headers=cabeceras)
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                crudo = r.read()
                return json.loads(crudo) if crudo else {}
        except urllib.error.HTTPError as e:
            detalle = e.read().decode("utf-8", "replace")[:600]
            raise SystemExit(f"\nERROR HTTP {e.code} en {metodo} {ruta}\n{detalle}\n")
        except urllib.error.URLError as e:
            raise SystemExit(f"\nERROR de red en {metodo} {ruta}: {e.reason}\n")

    def entrar(self, email: str, clave: str) -> None:
        d = self._peticion("POST", "/oauth/token", {
            "grant_type": "password", "client_id": CLIENT_ID, "client_secret": CLIENT_SECRET,
            "scope": "*", "username": email, "password": clave,
        }, sin_token=True)
        self.token = d["access_token"]

    def get(self, ruta: str):
        return self._peticion("GET", ruta)

    # Las escrituras respetan el modo simulacro.
    def post(self, ruta: str, cuerpo):
        if self.simulacro:
            return {"result": {"id": None, **(cuerpo if isinstance(cuerpo, dict) else {})}}
        return self._peticion("POST", ruta, cuerpo)

    def put(self, ruta: str, cuerpo):
        if self.simulacro:
            return {"result": cuerpo}
        return self._peticion("PUT", ruta, cuerpo)

    def delete(self, ruta: str):
        if self.simulacro:
            return {}
        return self._peticion("DELETE", ruta)


def base_api(url_publica: str) -> str:
    """https://x.ushahidi.io/ -> https://x.api.ushahidi.io"""
    host = urllib.parse.urlparse(url_publica).netloc or url_publica.strip("/ ")
    if ".api." in host:
        return "https://" + host
    sub, _, dominio = host.partition(".")
    return f"https://{sub}.api.{dominio}"


# --------------------------------------------------------------------------- pasos

def ajustes_generales(api: Api, cfg: dict, reg: Registro) -> None:
    """T-002 · RF-02, RNF-02, RNF-03"""
    d = cfg["despliegue"]
    sitio = api.get("/api/v5/config/site")["result"]
    deseado = {
        "name": d["nombre"],
        "description": " ".join(d["descripcion_publica"].split()),
        "language": d["idioma"],
        "timezone": d["zona_horaria"],
    }
    difs = {k: v for k, v in deseado.items() if sitio.get(k) != v}
    if difs:
        api.put("/api/v5/config/site", deseado)
        reg.hecho(f"Ajustes del sitio: {', '.join(difs)}")
    else:
        reg.igual("Ajustes del sitio ya correctos")

    mapa = api.get("/api/v5/config/map")["result"]
    vista = dict(mapa.get("default_view") or {})
    quiero = {
        "lat": float(d["mapa"]["centro"]["lat"]),
        "lon": float(d["mapa"]["centro"]["lng"]),
        "zoom": int(d["mapa"].get("zoom", 7)),
    }
    if any(vista.get(k) != v for k, v in quiero.items()):
        vista.update(quiero)
        api.put("/api/v5/config/map", {"default_view": vista})
        reg.hecho(f"Mapa centrado en {quiero['lat']}, {quiero['lon']} (zoom {quiero['zoom']})")
    else:
        reg.igual("Mapa ya centrado")


def categorias(api: Api, cfg: dict, reg: Registro) -> dict[str, int]:
    """T-003 · RF-01"""
    actuales = {c["tag"]: c["id"] for c in (api.get("/api/v5/categories").get("results") or [])}
    ids: dict[str, int] = {}
    for bruto in cfg["categorias"]:
        nombre = nombre_admitido(bruto)
        if nombre != bruto:
            print(f"  [!] «{bruto}» → «{nombre}» (ADR-007: sin emoji)")
        if nombre in actuales:
            ids[nombre] = actuales[nombre]
            reg.igual(f"Categoría «{nombre}»")
        else:
            r = api.post("/api/v5/categories", {"tag": nombre, "type": "category"})
            ids[nombre] = (r.get("result") or {}).get("id")
            reg.hecho(f"Categoría «{nombre}»")
    return ids


def rol_ayudante(api: Api, cfg: dict, reg: Registro) -> None:
    """T-007 · RF-03, RF-08 — la asignación a personas sigue siendo manual (ADR-005)."""
    spec = next((r for r in cfg["roles"] if r.get("tipo") == "personalizado"), None)
    if not spec:
        return
    nombre = spec["id"]
    existentes = {r["name"]: r for r in (api.get("/api/v5/roles").get("results") or [])}
    cuerpo = {
        "name": nombre,
        "display_name": "Ayudante verificado",
        "description": "Verificado por teléfono por el equipo. Ve los campos protegidos "
                       "y actualiza el estado de las solicitudes.",
        # «Manage Posts» es el permiso que habilita ver respuestas privadas y editar estado.
        "permissions": ["Manage Posts"],
    }
    if nombre in existentes:
        api.put(f"/api/v5/roles/{existentes[nombre]['id']}", cuerpo)
        reg.igual(f"Rol «{nombre}» ya existe (permisos reafirmados)")
    else:
        api.post("/api/v5/roles", cuerpo)
        reg.hecho(f"Rol «{nombre}» creado con permiso «Manage Posts»")


def _campo(spec: dict, prioridad: int, visib_forzada: str | None, ids_cat: dict[str, int]) -> dict:
    tipo = spec["tipo"]
    if tipo not in TIPOS:
        raise SystemExit(f"Tipo desconocido en el YAML: «{tipo}» (campo «{spec['etiqueta']}»)")
    entrada, tipo_api = TIPOS[tipo]
    visib = visib_forzada or spec.get("visibilidad", "publico")
    if visib not in PRIVADO:
        raise SystemExit(f"Visibilidad desconocida: «{visib}» (campo «{spec['etiqueta']}»)")
    campo = {
        "label": spec["etiqueta"],
        "instructions": spec.get("ayuda"),
        "input": entrada,
        "type": tipo_api,
        "required": bool(spec.get("obligatorio", False)),
        "priority": prioridad,
        "response_private": PRIVADO[visib],
        "default": spec.get("defecto"),
    }
    if tipo == "casillas_categorias":
        campo["options"] = [i for i in ids_cat.values() if i is not None]
    elif "opciones" in spec:
        campo["options"] = list(spec["opciones"])
    if tipo == "imagen":
        campo["config"] = dict(CONFIG_IMAGEN)
    return campo


def _construir_encuesta(spec: dict, ids_cat: dict[str, int], ocultar_autor: bool) -> dict:
    forzada = spec.get("visibilidad_de_todos_los_campos")
    nativos = spec.get("campos_nativos", {})
    campos: list[dict] = []

    # Toda encuesta exige Título y Descripción nativos, y son SIEMPRE públicos.
    t = nativos.get("titulo", {})
    campos.append({
        "label": t.get("etiqueta", "Título"), "instructions": t.get("ayuda"),
        "input": "text", "type": "title", "required": True, "priority": 1,
        "response_private": False, "default": None,
    })
    d = nativos.get("descripcion", {})
    campos.append({
        "label": d.get("etiqueta", "Descripción"), "instructions": d.get("ayuda"),
        "input": "textarea", "type": "description",
        "required": bool(d.get("obligatorio", False)), "priority": 2,
        "response_private": False, "default": None,
    })
    for i, c in enumerate(spec.get("campos", []), start=3):
        campos.append(_campo(c, i, forzada, ids_cat))

    return {
        "name": nombre_admitido(spec["titulo"]),
        "description": " ".join((spec.get("nota_publica") or spec["titulo"]).split()),
        "type": "report",
        "require_approval": False,      # RF-02: publicación instantánea
        "everyone_can_create": True,
        "hide_author": ocultar_autor,   # P2: no exponer el nombre de quien publica
        "disabled": False,
        "tasks": [{
            "label": "Post", "priority": 0, "required": True, "type": "post",
            "show_when_published": True, "task_is_internal_only": False,
            "fields": campos,
        }],
    }


def encuestas(api: Api, cfg: dict, ids_cat: dict[str, int], reg: Registro, recrear: bool) -> None:
    """T-004, T-005, T-006 · RF-01…RF-08"""
    existentes = {s["name"]: s for s in (api.get("/api/v5/surveys").get("results") or [])}
    ocultar_autor = bool(cfg["despliegue"].get("ocultar_autor", True))

    for spec in cfg["encuestas"].values():
        cuerpo = _construir_encuesta(spec, ids_cat, ocultar_autor)
        nombre = cuerpo["name"]
        n_campos = len(cuerpo["tasks"][0]["fields"])
        actual = existentes.get(nombre)

        if actual and recrear:
            api.delete(f"/api/v5/surveys/{actual['id']}")
            reg.hecho(f"Encuesta «{nombre}» eliminada para recrearla")
            actual = None

        if actual:
            reg.igual(f"Encuesta «{nombre}» ya existe (id {actual['id']}) — usa "
                      f"--recrear-encuestas para rehacerla desde el YAML")
            if actual.get("require_approval"):
                api.put(f"/api/v5/surveys/{actual['id']}", {**actual, "require_approval": False})
                reg.hecho(f"  publicación instantánea activada en «{nombre}»")
        else:
            api.post("/api/v5/surveys", cuerpo)
            protegidos = sum(1 for f in cuerpo["tasks"][0]["fields"] if f["response_private"])
            reg.hecho(f"Encuesta «{nombre}»: {n_campos} campos ({protegidos} protegidos)")

    # La encuesta de ejemplo que trae el despliegue no debe verse en producción.
    ejemplo = existentes.get("Basic Post")
    if ejemplo and not ejemplo.get("disabled"):
        api.put(f"/api/v5/surveys/{ejemplo['id']}", {**ejemplo, "disabled": True})
        reg.hecho("Encuesta de ejemplo «Basic Post» desactivada")


# --------------------------------------------------------------------------- auditoría

def auditar(api: Api, cfg: dict) -> int:
    """Relee el despliegue y compara la visibilidad real contra el YAML (P2)."""
    print("\n=== AUDITORÍA DE PRIVACIDAD (P2) ===")
    reales = {s["name"]: s for s in (api.get("/api/v5/surveys").get("results") or [])}
    fallos: list[str] = []

    for _, spec in cfg["encuestas"].items():
        nombre = nombre_admitido(spec["titulo"])
        s = reales.get(nombre)
        if not s:
            print(f"\n  ✗ FALTA la encuesta «{nombre}»")
            fallos.append(f"falta «{nombre}»")
            continue

        detalle = api.get(f"/api/v5/surveys/{s['id']}")["result"]
        campos = {f["label"]: f for t in detalle.get("tasks", []) for f in t.get("fields", [])}
        forzada = spec.get("visibilidad_de_todos_los_campos")
        print(f"\n  {nombre} — {len(campos)} campos · "
              f"aprobación previa: {'SÍ ✗' if detalle.get('require_approval') else 'no ✓'}")
        if detalle.get("require_approval"):
            fallos.append(f"«{nombre}» exige aprobación previa (rompe RF-02)")

        for c in spec.get("campos", []):
            etiqueta = c["etiqueta"]
            esperado = PRIVADO[forzada or c.get("visibilidad", "publico")]
            real = campos.get(etiqueta)
            if real is None:
                print(f"    ✗ falta el campo «{etiqueta}»")
                fallos.append(f"«{nombre}» → falta «{etiqueta}»")
                continue
            ok = bool(real.get("response_private")) == esperado
            marca = "🔒" if esperado else "👁"
            print(f"    {'✓' if ok else '✗'} {marca} {etiqueta}")
            if not ok:
                fallos.append(f"«{nombre}» → «{etiqueta}» debería ser "
                              f"{'privado' if esperado else 'público'}")

    sitio = api.get("/api/v5/config/site")["result"]
    print(f"\n  Sitio: «{sitio.get('name')}» · idioma {sitio.get('language')} · "
          f"zona {sitio.get('timezone')}")
    # OJO: /roles devuelve permissions=null; hay que pedir cada rol por separado.
    roles = {r["name"]: r["id"] for r in (api.get("/api/v5/roles").get("results") or [])}
    print(f"  Roles: {', '.join(roles)}")
    if "ayudante_verificado" not in roles:
        fallos.append("falta el rol «ayudante_verificado»")
    else:
        detalle_rol = api.get(f"/api/v5/roles/{roles['ayudante_verificado']}")["result"]
        permisos = detalle_rol.get("permissions") or []
        print(f"  Permisos de «ayudante_verificado»: {', '.join(permisos) or 'ninguno'}")
        if "Manage Posts" not in permisos:
            fallos.append("«ayudante_verificado» sin «Manage Posts»: no vería los campos "
                          "protegidos ni podría cambiar el estado (RF-03, RF-06)")

    if fallos:
        print("\n  ✗ AUDITORÍA FALLIDA:")
        for f in fallos:
            print(f"     - {f}")
        return 1
    print("\n  ✓ Auditoría correcta: visibilidades y publicación instantánea según el YAML.")
    return 0


# --------------------------------------------------------------------------- main

def main() -> int:
    p = argparse.ArgumentParser(description="Aplica deployment-config.yml a Ushahidi (T-203)")
    p.add_argument("--aplicar", action="store_true",
                   help="escribe de verdad (sin esta bandera solo simula)")
    p.add_argument("--solo-auditar", action="store_true", help="no escribe, solo verifica")
    p.add_argument("--recrear-encuestas", action="store_true",
                   help="borra y rehace las encuestas existentes desde el YAML")
    args = p.parse_args()

    cfg = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))
    simulacro = not args.aplicar or args.solo_auditar

    api = Api(base_api(cfg["despliegue"]["url"]), simulacro)
    env = cargar_env()
    api.entrar(env["USHAHIDI_EMAIL"], env["USHAHIDI_PASSWORD"])
    print(f"Conectado a {api.base}")
    if simulacro and not args.solo_auditar:
        print("MODO SIMULACRO — no se escribe nada. Añade --aplicar para ejecutar.\n")

    if not args.solo_auditar:
        reg = Registro(simulacro)
        print("\n[T-002] Ajustes generales y mapa");      ajustes_generales(api, cfg, reg)
        print("\n[T-003] Categorías");                    ids = categorias(api, cfg, reg)
        print("\n[T-007] Rol «Ayudante verificado»");     rol_ayudante(api, cfg, reg)
        print("\n[T-004…T-006] Encuestas")
        encuestas(api, cfg, ids, reg, args.recrear_encuestas)
        print(f"\n{len(reg.cambios)} cambio(s) {'simulados' if simulacro else 'aplicados'}.")

    if simulacro and not args.solo_auditar:
        return 0
    return auditar(api, cfg)


if __name__ == "__main__":
    sys.exit(main())
