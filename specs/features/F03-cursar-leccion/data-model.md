# Modelo de datos: F03 Cursar una lección

**Plan**: [plan.md](./plan.md) · **Investigación**: [research.md](./research.md) (puntos 1, 5 y 6)

F03 no crea tablas. Le agrega a `leccion` (F02) la lista de sus actividades,
y define la entidad **Actividad**, que se guarda dentro de esa lista.

## Cambios

### Leccion: tabla `leccion` (modelo `Leccion`)

Se agrega una columna:

| Campo (Prisma) | Columna | Tipo | Obligatorio | Notas |
|---|---|---|---|---|
| `actividades` | `actividades` | `Json` (JSONB) | sí | Lista de `Actividad` en el orden de la lección. Por defecto `[]` (una lección sin actividades). Solo se escribe después de `validarActividades` (research.md, punto 5) |

Los demás campos de F02 (`id`, `idCurso`, `titulo`, `posicion`, `creadoEn`,
`actualizadoEn`) no cambian.

## Entidades

### Actividad (dentro de `leccion.actividades`)

Ejercicio o bloque de teoría de una lección. No tiene tabla ni `id`: es un
elemento de la lista, y su lugar en la lista es su orden. Cada una tiene un
`tipo` y los campos de ese tipo (tipos en [contracts/contrato.md](./contracts/contrato.md)).

| Tipo (`tipo`) | Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `teoria` | `titulo` | texto | no | Si está, no vacío |
| | `texto` | texto | sí | No vacío. Párrafos separados por un renglón en blanco |
| | `codigo` | texto | no | Si está, no vacío. Se respetan saltos de línea y sangría |
| | `puntosClave` | lista de textos | no | Si está, al menos uno; cada uno no vacío |
| `tarjeta` | `frente` | texto | sí | No vacío |
| | `reverso` | texto | sí | No vacío |
| `opcionMultiple` | `pregunta` | texto | sí | No vacía |
| | `codigo` | texto | no | Igual que en `teoria` |
| | `opciones` | lista de `{ texto }` o `{ simbolo }` | sí | Entre 2 y 9 (`LIMITES_ACTIVIDADES`); cada texto o símbolo no vacío |
| | `correcta` | entero | sí | Entre 0 y `opciones.length - 1`. Exactamente una correcta |
| `completarEspacios` | `texto` | texto | sí | Tiene al menos una `MARCA_ESPACIO` (`___`) |
| | `espacios` | lista de `{ aceptadas }` | sí | Tantos como marcas en `texto`. `aceptadas`: al menos una; cada una no vacía y de hasta 100 caracteres |
| `preguntaAbierta` | `pregunta` | texto | sí | No vacía |
| | `solucion` | texto | sí | No vacía |

- "No vacío" es: texto que, sin los espacios al inicio y al final, tiene al
  menos un carácter.
- Un campo que el tipo no tiene se rechaza.
- Los límites de longitud de cada texto los define F05 (editor). Los términos
  de glosario de cada actividad los agrega F09.

## Datos que no se guardan

Viven solo en el cliente, mientras la lección está abierta (spec, "Resultado
esperado"):

| Dato | Dónde | Regla |
|---|---|---|
| Orden mezclado de las opciones | Componente `OpcionMultiple` | Fisher-Yates al montar la actividad (research.md, punto 3) |
| Respuesta del alumno, resultado de cada actividad, aciertos | Reproductor y cada actividad | Se pierden al salir, recargar o cerrar la app |
| "Ya hizo algo" (para confirmar al salir) | Reproductor | Pasó de la primera actividad, o en ella eligió, escribió o volteó algo |

## Reglas

- Una lección solo sale por la API si su curso está publicado y es el de la
  dirección; si no, responde igual que una lección que no existe.
- Las actividades salen en el orden de la lista, completas (con sus
  respuestas): califica el cliente (research.md, punto 2).

## Migración

`prisma/migrations/<fecha>_f03_actividades/migration.sql`:

```sql
ALTER TABLE "leccion" ADD COLUMN "actividades" JSONB NOT NULL DEFAULT '[]';
```

Las lecciones que ya existen quedan sin actividades hasta correr
`npm run bd:sembrar`. Como en F01 y F02, si el usuario de la base no puede
crear la *shadow database*, la migración se genera con `prisma migrate diff`
y se aplica con `prisma migrate deploy`.

## Del modelo al contrato

| Contrato | Sale de |
|---|---|
| `DetalleLeccion.id`, `titulo`, `posicion` | `leccion.id`, `titulo`, `posicion` |
| `DetalleLeccion.actividades` | `leccion.actividades`, tal cual (ya validadas al guardarse) |

`idCurso`, `creadoEn` y `actualizadoEn` no viajan. `DetalleCurso` (F02) no
cambia: el detalle del curso sigue sin traer las actividades.
