# Constitución del proyecto

Estos principios gobiernan toda especificación, tarea, configuración y línea de código futura. Un cambio que viole un principio se rechaza, sin importar quién lo proponga (humano o agente de IA).

## P1 · Las personas primero
Cada decisión se evalúa con una sola pregunta: ¿acerca ayuda real a una persona afectada más rápido y con menos riesgo? La velocidad de lanzamiento vale más que la perfección técnica.

## P2 · Privacidad no negociable
- El **teléfono** y la **dirección exacta** de una persona afectada jamás son públicos: solo los ve el equipo y los ayudantes verificados.
- Escribir el teléfono en el formulario **es** el consentimiento, y se explica en lenguaje claro junto al campo.
- Datos mínimos: nunca se piden cédulas, claves ni datos bancarios.
- Menores de edad: sin apellidos ni fotos de rostro en lo público.
- Al cierre de la emergencia se anonimiza el histórico y se eliminan los datos de contacto.
- **Ningún dato personal entra a este repositorio** (ver `.gitignore`): los respaldos CSV viven fuera del repo.

## P3 · Verificación humana, visibilidad inmediata
- Toda solicitud es visible al instante con la marca **«Sin verificar»**; el equipo verifica en orden de gravedad (críticas primero).
- Todo ayudante es verificado por **el equipo** antes de acceder a datos protegidos: entrega nombre + organización + teléfono, y el equipo lo llama y confirma. Ningún acceso a datos protegidos se otorga de forma automática.

## P4 · Funciona con mala conexión
La zona afectada tiene datos intermitentes. La página se mantiene liviana (fotos opcionales, sin video) y el **SMS es un canal de primera clase**, no un extra.

## P5 · Español claro
Todo texto visible al público está en español simple, sin tecnicismos, pensado para leerse en un celular con estrés y batería baja.

## P6 · Sin dinero de por medio
La plataforma nunca pide, recibe ni gestiona dinero, y lo declara públicamente. Es la vacuna contra las estafas post-desastre.

## P7 · Abierto y replicable
Todo queda documentado para que otra región u otro país replique el despliegue en horas. Documentación CC BY 4.0; código futuro MIT.

## P8 · Los specs mandan (spec-driven development)
El flujo de trabajo es: `constitution.md` → `01-requirements.md` → `02-design.md` → `03-tasks.md` → implementación (configuración de la plataforma o código). Un cambio de comportamiento se escribe primero en los specs y después se implementa. Cada tarea traza a un requisito (RF/RNF) y cada requisito traza a un principio.
