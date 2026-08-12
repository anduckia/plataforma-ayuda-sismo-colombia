#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auditoría de lo que ve un DESCONOCIDO (T-009, RF-20, P2).

    python scripts/auditar_publico.py            # audita el despliegue del YAML
    python scripts/auditar_publico.py --url https://otro.api.ushahidi.io

Por qué existe, aparte de `aplicar_config.py --solo-auditar`: aquella entra con
las credenciales de administrador y comprueba que las BANDERAS de privacidad
estén como manda el YAML. Eso no es lo que promete la portada. La portada
promete que «tu teléfono y tu dirección exacta nunca son públicos», y eso solo
se puede comprobar pidiéndolo como lo pediría cualquiera: SIN TOKEN.

Este script no lee el .env y no sabe ninguna contraseña, a propósito: así se
puede correr desde cualquier máquina, y lo que da por bueno es lo que de verdad
está expuesto. Termina con código 1 si encuentra una fuga.

NUNCA imprime el valor de un campo: solo etiquetas y recuentos. Una auditoría
que vuelca teléfonos en la consola —y en los registros de CI— es la fuga que
venía a buscar.
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("Falta PyYAML. Instala con:  pip install pyyaml")

RAIZ = Path(__file__).resolve().parent.parent
CONFIG = RAIZ / "config" / "deployment-config.yml"

for flujo in (sys.stdout, sys.stderr):
    try:
        flujo.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

PRIVADO = {"publico": False, "protegido": True, "solo_admin": True}

# Claves de la publicación que pueden traer el contacto de quien reporta. Las de
# SMS importan especialmente: cuando SMSSync entre, el número del remitente
# viaja pegado a la publicación, y de ahí sale la promesa de la portada.
CLAVES_DE_CONTACTO = ["contact", "contact_id", "values_phone", "message",
                      "data_source_message_id", "user", "user_id", "author_email",
                      "author_realname"]


class Anonimo:
    """Cliente sin token. No hay `entrar()` a propósito."""

    def __init__(self, base: str):
        self.base = base.rstrip("/")

    def get(self, ruta: str):
        req = urllib.request.Request(
            self.base + ruta, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=45) as r:
            return json.loads(r.read() or b"{}")

    def codigo(self, ruta: str, metodo: str = "GET", cuerpo=None) -> int:
        """El código HTTP a secas, para comprobar lo que DEBE estar cerrado."""
        datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
        req = urllib.request.Request(
            self.base + ruta, data=datos, method=metodo,
            headers={"Accept": "application/json", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.status
        except urllib.error.HTTPError as e:
            return e.code
        except urllib.error.URLError:
            return 0


def base_api(url_publica: str) -> str:
    host = urllib.parse.urlparse(url_publica).netloc or url_publica.strip("/ ")
    if ".api." in host:
        return "https://" + host
    sub, _, dominio = host.partition(".")
    return f"https://{sub}.api.{dominio}"


def etiquetas_protegidas(cfg: dict) -> dict[str, set[str]]:
    """Por encuesta, qué etiquetas declara el YAML que no deben salir."""
    salida: dict[str, set[str]] = {}
    for spec in cfg["encuestas"].values():
        forzada = spec.get("visibilidad_de_todos_los_campos")
        salida[spec["titulo"]] = {
            c["etiqueta"] for c in spec.get("campos", [])
            if PRIVADO[forzada or c.get("visibilidad", "publico")]
        }
    return salida


def main() -> int:
    p = argparse.ArgumentParser(description="Audita el despliegue como un desconocido")
    p.add_argument("--url", help="base de la API; por defecto, la del YAML")
    args = p.parse_args()

    cfg = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))
    api = Anonimo(args.url or base_api(cfg["despliegue"]["url"]))
    print(f"Auditando SIN CREDENCIALES: {api.base}\n")

    fallos: list[str] = []
    # Lo que esta pasada NO ha podido comprobar. Va aparte de los fallos porque
    # no es una fuga, pero no puede desaparecer del veredicto: una auditoría que
    # da por bueno lo que no miró miente igual que un mapa incompleto (RF-18).
    sin_probar: list[str] = []
    protegidas_por_encuesta = etiquetas_protegidas(cfg)
    # Una etiqueta puede ser protegida en una encuesta y pública en otra
    # («Qué ofreces» lo es). Se comprueba por encuesta, nunca por nombre suelto.
    protegidas_por_id: dict[int, set[str]] = {}

    # ---------------------------------------------------------- 1. encuestas
    print("=== 1. Encuestas ===")
    encuestas = api.get("/api/v5/surveys").get("results") or []
    por_nombre = {s["name"]: s for s in encuestas}
    for titulo, etiquetas in protegidas_por_encuesta.items():
        s = por_nombre.get(titulo)
        if not s:
            print(f"  ✗ el anónimo no ve «{titulo}»")
            fallos.append(f"falta o no es visible la encuesta «{titulo}»")
            continue
        protegidas_por_id[s["id"]] = etiquetas

    # Se recorre lo que devuelve la PLATAFORMA, no lo que declara el YAML: una
    # encuesta que nadie especificó es una que nadie ha revisado. Así apareció
    # «Basic Post» (id 1), la que trae Ushahidi de fábrica: viva, visible al
    # anónimo y la única del despliegue con `hide_author: false` (T-045, RF-20).
    nuestras = set(protegidas_por_encuesta)
    de_fabrica = {e["nombre"] for e in (cfg.get("encuestas_de_fabrica") or [])}
    for s in encuestas:
        titulo = s.get("name")
        estado = "solo la ve el equipo" if s.get("require_approval") else "publica al instante"
        if titulo in nuestras:
            print(f"  · «{titulo}» (id {s.get('id')}) — {estado}")
        elif titulo in de_fabrica:
            # Declarada y consentida: viene con el despliegue y no se puede
            # borrar sin llevarse sus publicaciones (ADR-019, RNF-04).
            print(f"  · «{titulo}» (id {s.get('id')}) — de fábrica, fuera de uso")
        else:
            print(f"  ✗ «{titulo}» (id {s.get('id')}) — {estado}  ← NO está en el YAML")
            fallos.append(
                f"la encuesta «{titulo}» (id {s.get('id')}) está viva y visible sin cuenta "
                f"y el YAML no la declara: nadie ha revisado qué publica ni qué expone")
        if s.get("hide_author") is False:
            fallos.append(f"«{titulo}» (id {s.get('id')}) no oculta el autor (P2)")

    # ------------------------------------------------- 2. campos protegidos
    print("\n=== 2. ¿Se filtra algún campo protegido? ===")
    publicaciones: list[dict] = []
    pagina, ultima = 1, 1
    while pagina <= ultima:
        d = api.get(f"/api/v5/posts?limit=200&page={pagina}&order=desc&orderby=post_date")
        publicaciones.extend(d.get("results") or [])
        ultima = (d.get("meta") or {}).get("last_page") or 1
        pagina += 1
    print(f"  {len(publicaciones)} publicaciones visibles sin cuenta")

    vacios = expuestos = 0
    for post in publicaciones:
        protegidas = protegidas_por_id.get(post.get("form_id"), set())
        for tarea in (post.get("post_content") or []):
            for campo in (tarea.get("fields") or []):
                if campo.get("label") not in protegidas:
                    continue
                if campo.get("value") in (None, "", [], {}):
                    vacios += 1
                else:
                    expuestos += 1
                    fallos.append(
                        f"FUGA: publicación {post.get('id')} expone «{campo.get('label')}»")
    print(f"  {vacios} campos protegidos llegaron vacíos (bien)")
    print(f"  {expuestos} campos protegidos llegaron CON VALOR"
          f"{' ← FUGA' if expuestos else ''}")

    # ------------------------------------- 3. el contacto de quien reporta
    print("\n=== 3. ¿Viaja el contacto de quien reporta? (canal SMS) ===")
    for clave in CLAVES_DE_CONTACTO:
        con_dato = [p.get("id") for p in publicaciones
                    if p.get(clave) not in (None, "", [], {})]
        if con_dato:
            print(f"  ✗ «{clave}» viene con contenido en {len(con_dato)} publicaciones")
            fallos.append(f"FUGA: «{clave}» expuesto al anónimo en "
                          f"{len(con_dato)} publicaciones (P2)")
        else:
            print(f"  ✓ «{clave}» vacío en todas")
    if not any(p.get("source") == "sms" for p in publicaciones):
        print("  [!] Todavía no hay ninguna publicación por SMS: esto NO prueba que el\n"
              "      canal SMS sea seguro. Manda un SMS de prueba y vuelve a auditar\n"
              "      ANTES de difundir el número.")
        sin_probar.append("el canal SMS: no hay ninguna publicación con source=sms")

    # ------------------------------------------- 4. lo que debe estar cerrado
    print("\n=== 4. Lo que un desconocido NO debería poder hacer ===")
    cerrado = {
        ("GET", "/api/v5/users"): "el listado de cuentas",
        ("GET", "/api/v5/roles"): "los roles",
        ("GET", "/api/v5/contacts"): "la agenda de contactos",
    }
    for (metodo, ruta), que in cerrado.items():
        c = api.codigo(ruta, metodo)
        ok = c in (401, 403)
        print(f"  {'✓' if ok else '✗'} {metodo} {ruta} → {c}  ({que})")
        if not ok:
            fallos.append(f"{metodo} {ruta} responde {c} a un anónimo: expone {que}")

    if publicaciones:
        pid = publicaciones[0]["id"]
        for metodo in ("PUT", "DELETE"):
            cuerpo = {"title": "comprobación de auditoría"} if metodo == "PUT" else None
            c = api.codigo(f"/api/v5/posts/{pid}", metodo, cuerpo)
            ok = c in (401, 403)
            print(f"  {'✓' if ok else '✗'} {metodo} /api/v5/posts/{pid} → {c}  "
                  f"(editar o borrar publicaciones ajenas)")
            if not ok:
                fallos.append(f"un anónimo puede {metodo} publicaciones ajenas (responde {c})")
    else:
        # Sin publicaciones visibles no hay contra qué probarlo, y callarlo sería
        # dar por auditado lo que no se ha mirado. Se avisa, como con el SMS.
        print("  [!] No hay ninguna publicación visible, así que NO se ha comprobado\n"
              "      que un desconocido no pueda editar ni borrar publicaciones ajenas.\n"
              "      Vuelve a auditar en cuanto entre la primera solicitud real.")
        sin_probar.append("que un desconocido no pueda editar ni borrar publicaciones "
                          "ajenas: no hay ninguna publicación visible contra la que probarlo")

    # ------------------------------------------------ 5. señal de verificación
    print("\n=== 5. La insignia de verificación (RF-17) ===")
    esperadas = [c["nombre"] for c in (cfg.get("colecciones") or [])]
    vivas = {c["name"]: c["id"] for c in (api.get("/api/v5/collections").get("results") or [])}
    for nombre in esperadas:
        if nombre in vivas:
            en_col = sum(1 for p in publicaciones if vivas[nombre] in (p.get("sets") or []))
            print(f"  ✓ colección «{nombre}» (id {vivas[nombre]}) · "
                  f"{en_col} publicaciones verificadas")
        else:
            print(f"  ✗ falta la colección «{nombre}»")
            fallos.append(f"falta la colección «{nombre}»: el mapa no podrá verificar nada")
    c = api.codigo(f"/api/v5/collections/{next(iter(vivas.values()), 1)}/posts",
                   "POST", {"post_id": publicaciones[0]["id"]} if publicaciones else {})
    ok = c in (401, 403, 422)
    print(f"  {'✓' if ok else '✗'} un anónimo NO puede meterse en una colección → {c}")
    if not ok:
        fallos.append(f"un anónimo puede meterse en la colección (responde {c}): "
                      f"la insignia verde deja de valer")

    # --------------------------------------------------------------- veredicto
    print("\n" + "=" * 68)
    if fallos:
        print("✗ AUDITORÍA PÚBLICA FALLIDA — no difundas el enlace todavía:\n")
        for f in fallos:
            print(f"   - {f}")
        return 1
    print("✓ Un desconocido no ve ningún dato protegido y no puede darse la insignia\n"
          "  de verificado.")
    if sin_probar:
        print("\n  [!] Esta pasada NO ha comprobado:")
        for s in sin_probar:
            print(f"   - {s}")
        print("  Verde no significa «todo probado»: significa «nada de lo que se pudo\n"
              "  mirar está mal». Vuelve a auditar cuando exista lo que falta.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
