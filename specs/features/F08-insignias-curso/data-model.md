# Modelo de datos: F08 Insignias por curso completado

Al cerrar la feature se integra a `specs/02-modelo-datos.md` (Curso y la entidad nueva
Insignia; sale "Puntos / Insignia" de "Entidades previstas").

## Curso (cambia)

| Campo (contrato) | Columna (`curso`) | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `daInsignia` (`CursoEnEditor`, `CuerpoDatosCurso?`) | `da_insignia` | booleano | sí | Por defecto `false`, también en los cursos que ya existían. Lo cambia su autor en un borrador, con los datos del curso. No viaja al catálogo ni al detalle |

## Insignia (nueva)

Que un usuario completó un curso que daba insignia. Tabla `insignia`.

| Campo (contrato) | Columna | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| — | `id_usuario` | texto | sí | → `user.id`, `ON DELETE CASCADE` |
| `idCurso` | `id_curso` | texto | sí | → `curso.id`, `ON DELETE CASCADE`: eliminar el curso borra sus insignias |
| `ganadaEn` | `ganada_en` | fecha | sí | Por defecto, el momento de crearla. Ordena "Mis insignias" (la más reciente primero) |
| `titulo`, `idPortada` | — | — | — | No se guardan: salen del curso al responder |

- Llave primaria `(id_usuario, id_curso)`: una por usuario y curso. Índice en `id_curso`.
- Se crea solo al registrar una lección completada (F04) de un curso con
  `da_insignia = true`, cuando el usuario tiene `progreso` en todas las lecciones del curso.
- No se borra si el curso cambia `da_insignia`, agrega lecciones o deja de estar publicado.

## Migración `f08_insignias`

- `ALTER TABLE curso ADD COLUMN da_insignia BOOLEAN NOT NULL DEFAULT false`.
- `CREATE TABLE insignia (...)` con su llave, el índice y las dos llaves foráneas.
