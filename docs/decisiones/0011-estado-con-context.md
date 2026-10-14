# 0011. Estado global con Context y useReducer

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Decisión

El estado global (sesión, tema, editor de cursos) usa lo que trae React: un
contexto por área (`SesionContext`, `TemaContext`, `EditorContext`) con
`useReducer` cuando hay varias acciones.

## Alternativas consideradas

- **Zustand**: suscripciones selectivas y menos código, útil para el editor.
- **Redux Toolkit**: estándar de la industria, con más ceremonia.

## Consecuencias

- El editor de cursos tiene muchos cambios seguidos; si los re-renderizados se
  vuelven un problema medible, se reconsidera con una decisión nueva.
