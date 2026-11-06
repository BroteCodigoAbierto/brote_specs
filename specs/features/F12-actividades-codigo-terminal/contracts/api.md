# API: F12 Actividades de código y terminal

**Sin rutas nuevas.** Las rutas de F03, F04 y F05 no cambian de forma: `actividades` ya
viaja como una lista de `Actividad`, y esa unión gana tres variantes
([contrato.md](./contrato.md)).

## Rutas que llevan los tipos nuevos

| Método | Ruta | Quién puede | Qué cambia |
|---|---|---|---|
| GET | `/cursos/:idCurso/lecciones/:idLeccion` | Con sesión | La lección publicada puede traer los tres tipos, con sus respuestas: la solución, los comandos aceptados y el commit correcto (research de F03, punto 2) |
| GET | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor | Igual, para abrirla en el lienzo |
| PUT | `/editor/cursos/:idCurso/lecciones/:idLeccion` | Su autor, sin publicar | Acepta los tres tipos y los valida |
| PUT | `/cursos/:idCurso/lecciones/:idLeccion/progreso` | Con sesión | Sin cambio de forma. `preguntas` cuenta también estos tipos |

## PUT de la lección

Cuerpo: `CuerpoGuardarLeccion`, igual que en F05.

```json
{
  "titulo": "Uno",
  "version": 1,
  "actividades": [
    {
      "tipo": "terminalSimulada",
      "consigna": "Inicia un repositorio.",
      "carpeta": "  ~/semillas  ",
      "comandos": ["  git init  "]
    },
    {
      "tipo": "grafoCommits",
      "consigna": "¿Cuál es el primer commit?",
      "commits": [{ "nombre": " c1 ", "padres": [] }, { "nombre": "c2", "padres": [0] }],
      "ramas": [{ "nombre": " main ", "commit": 1 }],
      "respuesta": 0
    }
  ]
}
```

- **Se guarda recortado**: `carpeta`, `comandos`, `commits[].nombre` y `ramas[].nombre`
  (`"  git init  "` queda `"git init"`), como las fichas en F11. Los repetidos ya se comparan
  sobre lo recortado. `codigoInicial`, `solucion` y las salidas se guardan tal como llegan.
- **Respuestas**: las de F05. Una actividad inválida no guarda nada y la lección queda como
  estaba:

  ```json
  { "error": "Revisa los datos marcados.", "campos": { "actividades.0": "actividad 1 (grafoCommits): commits: hasta 6 columnas" } }
  ```

  `400`, con el índice de la actividad que falló. El texto del campo es para quien
  desarrolla: el editor solo usa el índice para seleccionar la actividad.

### Qué rechaza cada tipo

| Tipo | Se rechaza |
|---|---|
| `retoCodigo` | Sin `consigna` o de más de 500; `lenguaje` que no esté en `LENGUAJES_CODIGO` (también `"CSS"` o `"Otro"`); `codigoInicial` vacío o de más de 2000; sin `solucion` o de más de 2000 |
| `terminalSimulada` | Sin `consigna` o de más de 500; `carpeta` vacía, de más de 100 o con un salto de línea; `comandos` fuera de 1 a 10; un comando vacío, de más de 200, con un salto de línea o repetido (también si solo cambian los espacios); `salidaPrevia` o `salidaAcierto` vacía o de más de 2000; `pista` vacía o de más de 500 |
| `grafoCommits` | Sin `consigna` o de más de 500; `commits` fuera de 2 a 10; un nombre vacío, de más de 4, con un salto de línea o repetido; `padres` que no sea una lista de enteros; el primer commit con padres; otro sin padres o con más de dos; dos padres iguales; un padre que no sea un índice menor que el del commit; más de 6 columnas; `ramas` que no sea una lista o con más de 4; un nombre de rama vacío, de más de 20, repetido o `HEAD`; `ramas[].commit` que no sea un índice de `commits`; `head` con otra forma que `{ rama }` o `{ commit }`, o con un índice que no exista; `respuesta` que no sea un índice de `commits`; `explicacion` vacía o de más de 500 |
| Cualquier otro | Un tipo que no exista (por ejemplo, `escucharRepetir`): `actividad N (escucharRepetir): tipo desconocido` |

En los tres, un campo que el tipo no tiene (por ejemplo, `x` en un commit) también se
rechaza.

## Errores sin cambios

`401` sin sesión, `403` con el curso publicado o en revisión, `404` con un curso o una
lección que no existe o es ajena, y `409` con una versión más nueva. Detalle en
`specs/features/F05-crear-editar-curso/contracts/api.md`.
