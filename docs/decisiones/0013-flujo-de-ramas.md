# 0013. Ramas feature → dev → main con PR

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Decisión

- Ramas `feature/F03-nombre-corto` desde `dev`, con el mismo nombre en cada
  repo que toque la feature.
- Commits `F03: descripción`.
- PR a `dev` en cada repo; `dev` pasa a `main` en cada entrega.

## Alternativas consideradas

- **feature → main**: más simple, pero sin un lugar para integrar las features
  antes de entregarlas.
- **Merge local sin PR**: se pierde el registro de qué se integró y por qué.

## Consecuencias

- Spec Kit no crea las ramas (su extensión de git no está instalada); las crea
  `/speckit-implement` o la persona, siguiendo esta convención.
