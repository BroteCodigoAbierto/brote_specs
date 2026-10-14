# 0014. Publicación con revisión manual

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Contexto

Cualquier usuario puede crear cursos. Hace falta algún filtro antes de que un
curso sea público.

## Decisión

- Estados: `borrador → en revisión → publicado`.
- El autor envía su curso a revisión desde la web.
- La aprobación la hace un administrador cambiando `publicado` a `true`
  **directamente en la base de datos**. No hay pantalla de moderación en el MVP.
- Solo los cursos publicados aparecen en el catálogo.

## Alternativas consideradas

- **Borrador → publicado** sin revisión.
- **Publicado al guardar**: un alumno podría ver una lección a medio editar.

## Consecuencias

- Qué pasa al editar un curso ya publicado (si vuelve a revisión, si los
  alumnos ven la versión anterior) se decide en la spec de F06.
- Una pantalla de moderación es una feature futura.
