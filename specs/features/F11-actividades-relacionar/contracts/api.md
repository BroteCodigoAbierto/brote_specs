# API: F11 Actividades de relacionar

**Sin rutas nuevas.** Las rutas de F03, F04 y F05 no cambian de forma: `actividades` ya
viaja como una lista de `Actividad`, y esa unión gana cuatro variantes
([contrato.md](./contrato.md)).

## Rutas que llevan los tipos nuevos

| Método | Ruta | Quién puede | Qué cambia |
|---|---|---|---|
| GET | `/cursos/:idCurso/lecciones/:idLeccion` | Con sesión | La lección publicada puede traer los cuatro tipos, con sus respuestas (research de F03, punto 2) |
| GET | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor | Igual, para abrirla en el lienzo |
| PUT | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Acepta los cuatro tipos y los valida |
| PUT | `/cursos/:idCurso/lecciones/:idLeccion/progreso` | Con sesión | Sin cambio de forma. `preguntas` cuenta también estos tipos |

## PUT de la lección

Cuerpo: `CuerpoGuardarLeccion`, igual que en F05.

```json
{
  "titulo": "Uno",
  "version": 1,
  "actividades": [
    {
      "tipo": "bancoPalabras",
      "texto": "La semilla necesita ___",
      "fichas": [" agua ", "sal"],
      "espacios": [{ "aceptadas": ["agua"] }]
    }
  ]
}
```

- **Se guarda recortado**: `fichas` y `aceptadas` (`" agua "` queda `"agua"`), como el
  título de la teoría en F05. La comparación entre ellos ya es sobre lo recortado.
- **Respuestas**: las de F05. Una actividad inválida no guarda nada y la lección queda
  como estaba:

  ```json
  { "error": "Revisa los datos marcados.", "campos": { "actividades.0": "actividad 1 (emparejar): parejas: entre 3 y 8" } }
  ```

  `400`, con el índice de la actividad que falló. El texto del campo es para quien
  desarrolla: el editor solo usa el índice para seleccionar la actividad.

### Qué rechaza cada tipo

| Tipo | Se rechaza |
|---|---|
| `emparejar` | `parejas` fuera de 3 a 8; un lado vacío o de más de 200; un texto repetido en una columna; un campo que no sea `izquierda` o `derecha`; `consigna` vacía o de más de 500 |
| `clasificar` | `categorias` fuera de 2 a 4; `elementos` fuera de 2 a 12; textos vacíos o de más de 100; una categoría o un elemento repetido; `categoria` que no sea un índice de `categorias`; una categoría sin elementos; `consigna` vacía o de más de 500 |
| `ordenar` | Sin `consigna`; `elementos` fuera de 3 a 10; un elemento vacío, repetido o de más de 200 |
| `bancoPalabras` | `texto` vacío, de más de 2000, sin `___` o con más de 10; `fichas` fuera de 2 a 20; una ficha vacía o de más de 100; un número de `espacios` distinto al de `___`; un espacio sin `aceptadas`; una aceptada que no sea una ficha; que no haya forma de llenar todos los espacios con cada ficha una sola vez; `consigna` vacía o de más de 500; más de 20 textos en un `aceptadas` |
| Cualquier otro | Un tipo que no exista (por ejemplo, `retoCodigo`): `actividad N (retoCodigo): tipo desconocido` |

## Errores sin cambios

`401` sin sesión, `403` con el curso publicado o en revisión, `404` con un curso o una
lección que no existe o es ajena, y `409` con una versión más nueva. Detalle en
`specs/features/F05-crear-editar-curso/contracts/api.md`.
