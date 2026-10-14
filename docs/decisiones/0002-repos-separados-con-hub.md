# 0002. Repos separados con `brote_specs` como hub

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Contexto

Brote tiene backend, web y móvil en repos separados dentro de la organización
BroteCodigoAbierto. Casi toda feature atraviesa los tres, y Spec Kit está
pensado para un solo proyecto.

## Decisión

Un cuarto repo, `brote_specs`, es la fuente de verdad del producto: Spec Kit,
constitución, specs, modelo de datos, navegación, contrato y decisiones. Los
repos de código implementan y cada uno tiene un `CLAUDE.md` que apunta aquí.
Claude Code se abre en `brote_specs` con acceso a los repos hermanos.

## Alternativas consideradas

- **Spec Kit en cada repo**: tres constituciones, tres numeraciones de
  features, y una feature como "cursar una lección" quedaría partida en tres
  specs que se desincronizan.
- **Monorepo**: resolvería el contrato con un paquete interno, pero los repos
  ya existen separados.

## Consecuencias

- Una feature tiene una sola spec y ramas con el mismo nombre en cada repo.
- Los PRs de una feature son varios (uno por repo) y se integran juntos.
- Los cuatro repos deben clonarse uno junto al otro.
