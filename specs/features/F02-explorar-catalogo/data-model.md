# Modelo de datos: F02 Explorar el catálogo de cursos publicados

**Plan**: [plan.md](./plan.md) · **Investigación**: [research.md](./research.md) (puntos 1, 3 y 5)

Primeras tablas propias de Brote, en español y `snake_case` (la excepción en
inglés de F01 es solo para las tablas de Better Auth). Esta feature define
de Curso y Leccion solo lo que usa: F03 agrega las actividades de la lección,
y F05/F06 los límites del título y la descripción y el dato de la revisión.

## Entidades

### Curso: tabla `curso` (modelo Prisma `Curso`)

| Campo (Prisma) | Columna | Tipo | Obligatorio | Notas |
|---|---|---|---|---|
| `id` | `id` | texto | sí | `@default(uuid(7))`. Clave primaria |
| `titulo` | `titulo` | texto | sí | Sus límites de longitud los define F05 |
| `descripcion` | `descripcion` | texto | sí | Puede tener saltos de línea. Límites en F05 |
| `publicado` | `publicado` | booleano | sí | Por defecto `false`. Solo `true` se ve en el catálogo y el detalle. Lo cambia el administrador en la base (decisión 0014) |
| `idAutor` | `id_autor` | texto | sí | → `user.id`. `onDelete: Restrict` (borrar cuentas está fuera del MVP). Índice |
| `creadoEn` | `creado_en` | fecha y hora | sí | Por defecto `now()`. Desempata el orden |
| `actualizadoEn` | `actualizado_en` | fecha y hora | sí | `@updatedAt` |

Relaciones: un curso tiene un autor (`autor`) y muchas lecciones
(`lecciones`). El modelo `User` de F01 gana el campo de relación `cursos
Curso[]`, que no crea ninguna columna.

### Leccion: tabla `leccion` (modelo `Leccion`)

| Campo (Prisma) | Columna | Tipo | Obligatorio | Notas |
|---|---|---|---|---|
| `id` | `id` | texto | sí | `@default(uuid(7))`. Clave primaria |
| `idCurso` | `id_curso` | texto | sí | → `curso.id`, `onDelete: Cascade` |
| `titulo` | `titulo` | texto | sí | Sus límites los define F05 |
| `posicion` | `posicion` | entero | sí | 1, 2, 3, ... dentro del curso. **Única** por curso: `@@unique([idCurso, posicion])` (ese índice también sirve para buscar las lecciones de un curso) |
| `creadoEn` | `creado_en` | fecha y hora | sí | Por defecto `now()` |
| `actualizadoEn` | `actualizado_en` | fecha y hora | sí | `@updatedAt` |

Las actividades de la lección (columna JSONB) llegan con F03.

## Datos que no se guardan

Se calculan al responder o en cada cliente:

| Dato | Dónde | Regla |
|---|---|---|
| `cantidadLecciones` | Backend, en la consulta | Número de lecciones del curso |
| Clave de orden | Backend, en la consulta | `regexp_replace(lower(unaccent(titulo)), '^[^[:alnum:]]+', '')`, comparada con `COLLATE "C"` (research.md, punto 3) |
| Nombre del autor | Backend, en la consulta | `user.name` actual |
| Portada (inicial y color) | Web y móvil | research.md, punto 7 |

## Reglas

- Solo los cursos con `publicado = true` salen por la API, en el catálogo y en
  el detalle, para cualquier usuario, incluido su autor.
- Orden del catálogo: clave de orden, luego `creado_en` y luego `id`.
- Un curso con `publicado = false` y uno que no existe dan la misma respuesta.

## Migración

`prisma/migrations/<fecha>_f02_cursos/migration.sql`:

1. `CREATE EXTENSION IF NOT EXISTS unaccent;` (se agrega a mano al principio
   del SQL generado: Prisma no la escribe).
2. Tablas `curso` y `leccion`, el índice de `id_autor`, el único de
   `(id_curso, posicion)` y las dos llaves foráneas.

Como en F01, si el usuario de la base no puede crear la *shadow database*, la
migración se genera con `prisma migrate diff` desde la base actual hacia el
esquema, y se aplica con `prisma migrate deploy`.

## Del modelo al contrato

| Contrato | Sale de |
|---|---|
| `ResumenCurso.id`, `titulo`, `descripcion` | `curso.id`, `titulo`, `descripcion` |
| `ResumenCurso.autor` | `{ id: user.id, nombre: user.name }` |
| `ResumenCurso.cantidadLecciones` | Conteo de `leccion` del curso |
| `DetalleCurso.lecciones[]` | `{ id, titulo, posicion }` de `leccion`, ordenadas por `posicion` |

`publicado`, `creadoEn` y `actualizadoEn` no viajan: el cliente solo recibe
cursos publicados, y las fechas solo sirven para ordenar.
