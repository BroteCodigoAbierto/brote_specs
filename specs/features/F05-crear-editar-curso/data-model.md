# Modelo de datos: F05 Crear y editar un curso

**Plan**: [plan.md](./plan.md) · **Investigación**: [research.md](./research.md) (puntos 2 a 5 y 19)

F05 no crea tablas. Agrega una columna, `leccion.version`, y fija los límites
que F02 y F03 dejaron pendientes. El idioma del curso no entra: lo define F07
(aclaración de la spec).

## Entidades

### Curso: tabla `curso` (F02)

Sin columnas nuevas. Lo nuevo son sus reglas de escritura:

| Campo (contrato) | Columna | Reglas nuevas |
|---|---|---|
| `titulo` | `titulo` | De 1 a 100 caracteres. Se guarda recortado |
| `descripcion` | `descripcion` | De 1 a 1000 caracteres. No vacía. Se guarda tal como se escribió |
| — | `publicado` | Solo se lee: `true` impide cualquier cambio. Lo sigue cambiando un administrador en la base (decisión 0014) |
| `estado` | — | No se guarda: `"publicado"` si `publicado`, si no `"borrador"` |
| — | `id_autor` | Quien lo crea, siempre el de la sesión. No cambia |
| — | `actualizado_en` | Ordena "Cursos que creé". Se actualiza también al cambiar sus lecciones (research.md, punto 5) |

Un curso tiene hasta 100 lecciones.

### Leccion: tabla `leccion` (F02, F03)

| Campo (contrato) | Columna | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `titulo` | `titulo` | texto | sí | De 1 a 100 caracteres. Se guarda recortado |
| `posicion` | `posicion` | entero | sí | 1, 2, 3, ... sin huecos. Se renumera al reordenar y al eliminar, en dos pasos (research.md, punto 3) |
| `actividades` | `actividades` | JSONB | sí | Hasta 50. Se escribe entera al guardar, después de validarla |
| `version` | `version` | entero | sí | **Nueva.** Por defecto 1. Sube 1 cada vez que se guarda la lección; agregarla, reordenar o renumerar no la cambian (research.md, punto 4) |

### Actividad: dentro de `leccion.actividades` (F03)

La forma no cambia. Se agregan los límites de la spec, con los nombres de
`LIMITES_ACTIVIDADES` ([contrato.md](./contracts/contrato.md)):

| Tipo | Campo | Límite | Constante |
|---|---|---|---|
| `teoria` | `titulo` | 100 | `tituloMax` |
| | `texto` | 5000 | `textoMax` |
| | `codigo` | 2000 | `codigoMax` |
| | `puntosClave` | Hasta 10, de hasta 200 | `puntosClaveMax`, `puntoClaveMax` |
| `tarjeta` | `frente` | 200 | `frenteMax` |
| | `reverso` | 1000 | `reversoMax` |
| `opcionMultiple` | `pregunta` | 500 | `preguntaMax` |
| | `codigo` | 2000 | `codigoMax` |
| | `opciones` | De 2 a 9. Texto de hasta 200, símbolo de hasta 4 | `opcionesMin`, `opcionesMax`, `opcionTextoMax`, `opcionSimboloMax` |
| `completarEspacios` | `texto` | 2000, con 1 a 20 `___` | `textoEspaciosMax`, `espaciosMax` |
| | `espacios[].aceptadas` | De 1 a 10, de hasta 100 | `aceptadasMax`, `respuestaEspacioMax` |
| `preguntaAbierta` | `pregunta` | 500 | `preguntaMax` |
| | `solucion` | 2000 | `solucionMax` |

Reglas nuevas de `opcionMultiple`:

- Todas las opciones son `{ texto }` o todas `{ simbolo }`.
- Dos opciones no pueden ser iguales. Se comparan recortadas, respetando las
  mayúsculas.

Las longitudes cuentan caracteres Unicode, con `Array.from(texto).length`, como
el resto del contrato.

## Lo que cambia con el borrado

Las relaciones ya existen, así que no hay nada que migrar:

- Eliminar un curso borra sus lecciones (`Leccion.curso`, en cascada) y el
  progreso de esas lecciones (`Progreso.leccion`, en cascada).
- Eliminar una lección borra su progreso.
- Un curso que estuvo publicado y se retiró puede tener progreso de alumnos, que
  se borra con él (aclaración de la spec).

## Estados de un curso

```text
                 crea el autor
                      │
                      ▼
     ┌──────────► borrador ──── el autor elimina ───► (no existe)
     │                │
     │                │  un administrador, en la base
     │                ▼
     └──────────  publicado   (no se edita ni se elimina hasta F06)
   un administrador, en la base
```

F06 agrega `enRevision` a `EstadoCurso`.

## Del modelo al contrato

| Contrato | Sale de |
|---|---|
| `CursoDelAutor.estado` | `curso.publicado` |
| `CursoDelAutor.cantidadLecciones` | La cuenta de sus lecciones |
| `CursoEnEditor` | `curso` y sus lecciones por `posicion` |
| `LeccionEnMapa.cantidadActividades` | `jsonb_array_length(leccion.actividades)` (research.md, punto 17) |
| `LeccionEnEditor` | `leccion`, con `version` |

`id_autor`, `publicado` y las fechas no viajan en los tipos del editor.

## Migración

`prisma/migrations/<fecha>_f05_version_leccion/migration.sql`, generada por Prisma
a partir de este cambio en `Leccion`:

```prisma
model Leccion {
  // ... lo de F02 a F04
  // sube cada vez que se guarda la lección; reordenar no la cambia (spec F05)
  version Int @default(1)
}
```

Las lecciones que ya existen quedan con `version = 1`. Como en F01 a F04, si el
usuario de la base no puede crear la *shadow database*, la migración se genera con
`prisma migrate diff` y se aplica con `prisma migrate deploy`.

## Datos de prueba

`npm run bd:sembrar` agrega dos cuentas sin cursos y dos borradores
(research.md, punto 19). Como borra y vuelve a crear los cursos de las cuentas
`@brote.test`, también quita los cursos creados a mano durante la validación.
