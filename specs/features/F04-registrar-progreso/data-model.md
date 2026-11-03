# Modelo de datos: F04 Registrar y consultar el progreso

**Plan**: [plan.md](./plan.md) · **Investigación**: [research.md](./research.md) (puntos 1 a 3 y 6)

F04 crea una tabla, `progreso`, y no cambia las de F01 a F03.

## Entidades

### Progreso: tabla `progreso` (modelo `Progreso`)

Que un alumno completó una lección, con el resultado de la última vez. Hay a
lo sumo uno por alumno y lección: repetir la lección reemplaza el resultado y
la fecha (spec, "Una lección, un registro").

| Campo (Prisma) | Columna | Tipo | Obligatorio | Notas |
|---|---|---|---|---|
| `idUsuario` | `id_usuario` | texto | sí | → `user.id`; se borra con el usuario. Parte de la clave primaria |
| `idLeccion` | `id_leccion` | texto | sí | → `leccion.id`; se borra con la lección (y así con su curso). Parte de la clave primaria |
| `aciertos` | `aciertos` | entero | sí | Entre 0 y `preguntas` |
| `preguntas` | `preguntas` | entero | sí | Las preguntas que tenía la lección al completarla (research.md, punto 2). 0 en una lección sin preguntas |
| `completadaEn` | `completada_en` | fecha | sí | La última vez que la completó. La pone el servidor, no el cliente. Ordena los cursos empezados |
| `creadoEn` | `creado_en` | fecha | sí | La primera vez que la completó. No viaja por la API |

- **Clave primaria**: `(id_usuario, id_leccion)`. No hay `id` propio: el par
  ya identifica el registro, y es lo que usa el `upsert` (research.md,
  punto 3).
- **Índice**: `id_leccion`, para el borrado en cascada desde `leccion` y para
  traer el progreso de las lecciones de un curso. La clave primaria ya sirve
  para buscar por usuario.
- No tiene `actualizado_en`: `completada_en` es justamente la fecha del
  último cambio.
- El curso no se guarda: sale de la lección. Así el progreso no puede
  apuntar a un curso distinto del de su lección.

## Reglas

- Solo se escribe al completar una lección de un curso publicado, con el
  curso de la dirección (las mismas reglas que abrirla en F03).
- Antes de escribir, el servidor cuenta las preguntas de la lección con
  `CALIFICA_ACTIVIDAD` y rechaza el resultado si `preguntas` no coincide o si
  `aciertos > preguntas` (research.md, punto 1).
- Escribir es un `upsert`: si ya existe, cambian `aciertos`, `preguntas` y
  `completadaEn`; `creadoEn` se queda. Dos escrituras casi al mismo tiempo
  dejan la última.
- Cada alumno lee solo sus filas: todas las consultas filtran por el
  `idUsuario` de la sesión.
- **Lecciones completadas de un curso**: las filas del alumno cuyas lecciones
  son de ese curso. Como la fila se borra con la lección, cuenta solo
  lecciones que el curso tiene hoy.
- **Curso empezado**: un curso publicado con al menos una fila del alumno.
  Los cursos sin publicar no aparecen, pero sus filas se quedan: si el curso
  se vuelve a publicar, el progreso sigue ahí.

## Del modelo al contrato

| Contrato | Sale de |
|---|---|
| `ProgresoLeccion.aciertos`, `preguntas` | `progreso.aciertos`, `preguntas` |
| `ProgresoLeccion.completadaEn` | `progreso.completada_en`, en ISO 8601 |
| `LeccionDelCurso.progreso` | La fila del alumno de esa lección, o `null` |
| `CursoEmpezado` (lo de `ResumenCurso`) | Igual que en el catálogo de F02: `curso`, su autor y la cuenta de sus lecciones |
| `CursoEmpezado.leccionesCompletadas` | Cuántas filas del alumno hay en lecciones del curso |
| `CursoEmpezado.ultimoAvanceEn` | La `completada_en` más reciente de esas filas |

`idUsuario` y `creadoEn` no viajan: el alumno es siempre el de la sesión.

## Migración

`prisma/migrations/<fecha>_f04_progreso/migration.sql`, generada por Prisma a
partir de este modelo:

```prisma
model Progreso {
  idUsuario    String   @map("id_usuario")
  usuario      User     @relation(fields: [idUsuario], references: [id], onDelete: Cascade)
  idLeccion    String   @map("id_leccion")
  leccion      Leccion  @relation(fields: [idLeccion], references: [id], onDelete: Cascade)
  aciertos     Int
  preguntas    Int
  completadaEn DateTime @default(now()) @map("completada_en")
  creadoEn     DateTime @default(now()) @map("creado_en")

  @@id([idUsuario, idLeccion])
  @@index([idLeccion])
  @@map("progreso")
}
```

`User` gana `progresos Progreso[]` y `Leccion` gana `progresos Progreso[]`.
Ninguno de los dos crea columnas.

Además, una restricción `CHECK` escrita a mano en la migración, para que la
base tampoco acepte un resultado imposible:

```sql
ALTER TABLE "progreso"
  ADD CONSTRAINT "progreso_resultado_valido"
  CHECK ("aciertos" >= 0 AND "aciertos" <= "preguntas");
```

Como en F01 a F03, si el usuario de la base no puede crear la *shadow
database*, la migración se genera con `prisma migrate diff` y se aplica con
`prisma migrate deploy`.

## Datos de prueba

`npm run bd:sembrar` no crea progreso. Como borra y vuelve a crear los cursos
de las cuentas `@brote.test`, también borra en cascada el progreso de esos
cursos: después de sembrar, las dos cuentas de prueba empiezan sin progreso.
