# brote_specs: instrucciones para el agente

Este repo es el hub de Brote: specs, modelo de datos, contrato y decisiones.
El código está en los repos hermanos (`../brote_backend_express`,
`../brote_web_react`, `../brote_mobile_expo`), a los que tienes acceso por
`.claude/settings.json`.

## Antes de hacer cualquier cosa

- Lee `.specify/memory/constitution.md`. Está por encima de cualquier plan.
- El trabajo se hace con los comandos `/speckit-*` (ver `docs/flujo-trabajo.md`).
  Solo corren cuando el usuario los invoca.
- Toda decisión técnica ya tomada está en `docs/decisiones/`. No la cambies
  sin preguntar; si hace falta, se escribe una decisión nueva.

## Reglas

- Todo en español: documentos con acentos; identificadores de código sin
  acentos ni ñ (`docs/estilo-codigo.md`).
- Toda interfaz sigue `docs/diseno.md` (sistema de diseño de vidrio): tokens,
  componentes, patrones de pantalla y reglas de las actividades interactivas.
  Lo que falte se agrega ahí primero.
- Las specs dicen QUÉ, no CÓMO: nada de librerías, tablas ni endpoints en
  `spec.md`.
- Las decisiones de diseño o de producto se le preguntan al usuario **una por
  una**, con la opción recomendada primero, antes de armar un plan.
- `contrato/contrato.ts` es la única copia que se edita; las de los repos se
  generan con `npm run contrato:copiar`.
- Lo que pidan las materias de la universidad va en `academico/materias.md`
  y nunca justifica cambiar la arquitectura.
- No hagas push ni abras PRs sin que el usuario lo pida.
- `.specify/` y `.claude/skills/` los administra Spec Kit; las adaptaciones
  van en `presets/brote/` (ver "Comandos de Spec Kit" en `docs/flujo-trabajo.md`).
