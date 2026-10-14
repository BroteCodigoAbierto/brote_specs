# 0004. TypeScript e identificadores en español

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Contexto

Hay tres repos que comparten tipos (13 tipos de actividad, cursos, lecciones,
respuestas de la API). El backend y el móvil ya estaban en TypeScript.

## Decisión

- **TypeScript estricto** en los tres repos.
- **Identificadores en español, sin acentos ni ñ** (`traerCursos`, `anio`),
  incluido el contrato y las tablas de la base. Lo que impone una librería
  conserva su nombre.
- El detalle está en `docs/estilo-codigo.md`.

## Alternativas consideradas

- **JavaScript**: menos ceremonia, pero un campo mal escrito en una actividad
  solo se descubriría en ejecución, y en otro repo.
- **Identificadores en inglés**: lo más común en open source, pero el proyecto
  se escribe y se presenta en español, como los trabajos de clase.

## Consecuencias

- Se usa **TypeScript 6.0** en los tres repos, no la 7: Expo 57 trae la 6.0 y
  `typescript-eslint` todavía no soporta la 7. Se sube cuando ambos la soporten.

- Se mezclan nombres en español con los de las librerías (`useState`,
  `traerCursos`). Es aceptado.
- Better Auth crea sus tablas con nombres en inglés; si se mapean a español o
  se dejan como excepción se decide en el plan de F01.
