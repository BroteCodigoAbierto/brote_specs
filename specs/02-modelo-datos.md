# Modelo de datos

> **Crece con cada feature.** Una entidad se escribe aquí completa cuando la
> spec que la usa se cierra (tarea de cierre de su `tasks.md`). Mientras, se
> lista abajo como prevista.

Convenciones:

- Nombres en español sin acentos (`idCurso`, `creadoEn`).
- Fechas como texto ISO 8601 en la API (`"2026-10-20T18:30:00Z"`).
- IDs como texto.

## Entidades definidas

_Ninguna todavía._

## Entidades previstas

Salen del prototipo (ver `docs/prototipo.md`). Sus campos se definen en la
spec de cada feature.

| Entidad | Qué representa | Feature |
|---|---|---|
| Usuario | Persona con cuenta: alumno y/o autor | F01 |
| Curso | Título, descripción, portada, idioma, autor, estado (borrador / en revisión / publicado), configuración de gamificación | F02, F05, F06 |
| Leccion | Lección ordenada dentro de un curso, con su lista de actividades | F03, F05 |
| Actividad | Ejercicio o bloque de teoría de una lección; una variante por tipo (13 en el prototipo) | F03, F05 |
| Progreso | Lección completada por un usuario | F04 |
| Puntos / Insignia | Recompensas de un usuario en un curso | F08 |
| EntradaGlosario | Término y definición, derivados de lecciones completadas o agregados por el alumno | F09 |
