# Modelo de datos: F12 Actividades de código y terminal

Sin tablas, columnas ni migraciones: las actividades viven en `leccion.actividades`
(JSONB), y la base no comprueba su forma. Lo que cambia es la entidad **Actividad**, que
gana tres tipos. El backend los valida con `validarActividades` antes de guardarlos
(`specs/02-modelo-datos.md`, "Actividad").

## Actividad: los tres tipos nuevos

Valen las reglas generales de F03, F05 y F11: "no vacío" es que, recortado, tiene al menos
un carácter; un campo que el tipo no tiene se rechaza; las longitudes cuentan caracteres
Unicode. Los límites están en `LIMITES_ACTIVIDADES`. "De una línea" es que no tiene `\n`
ni `\r`.

| Tipo (`tipo`) | Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `retoCodigo` | `consigna` | texto | sí | No vacía, de hasta 500 (`consignaMax`) |
| | `lenguaje` | texto | sí | Uno de `LENGUAJES_CODIGO`: `c`, `css`, `html`, `javascript`, `python`, `sql`, `bash` u `otro` |
| | `codigoInicial` | texto | no | Si está, no vacío, de hasta 2000 (`codigoMax`) |
| | `solucion` | texto | sí | No vacía, de hasta 2000 (`solucionMax`) |
| `terminalSimulada` | `consigna` | texto | sí | No vacía, de hasta 500 |
| | `carpeta` | texto | no | Si está, no vacía, de una línea, de hasta 100. Se guarda recortada |
| | `salidaPrevia` | texto | no | Si está, no vacía, de hasta 2000 |
| | `comandos` | lista de textos | sí | Entre 1 y 10. Cada uno no vacío, de una línea, de hasta 200. Se guardan recortados. No se repiten (ver abajo). El primero es el que se muestra como respuesta correcta |
| | `salidaAcierto` | texto | no | Si está, no vacía, de hasta 2000 |
| | `pista` | texto | no | Si está, no vacía, de hasta 500 |
| `grafoCommits` | `consigna` | texto | sí | No vacía, de hasta 500 |
| | `commits` | lista de `{ nombre, padres }` | sí | Entre 2 y 10, **del más antiguo al más nuevo**. A lo más 6 columnas (ver abajo) |
| | `commits[].nombre` | texto | sí | No vacío, de una línea, de hasta 4. Se guarda recortado. No se repite |
| | `commits[].padres` | lista de enteros | sí | Índices en `commits`, menores que el del commit. El primero tiene `[]`; los demás, uno o dos, distintos |
| | `ramas` | lista de `{ nombre, commit }` | sí | Entre 0 y 4, en el orden del autor (ordena las filas) |
| | `ramas[].nombre` | texto | sí | No vacío, de una línea, de hasta 20. Se guarda recortado. No se repite. No es `HEAD` |
| | `ramas[].commit` | entero | sí | Índice en `commits` |
| | `head` | `{ rama }` o `{ commit }` | no | Un solo campo: un índice en `ramas` o en `commits` |
| | `respuesta` | entero | sí | Índice en `commits` |
| | `explicacion` | texto | no | Si está, no vacía, de hasta 500 |

### Reglas que cruzan campos

- **Repetidos**: se comparan recortados, respetando las mayúsculas, como las opciones de
  F05. Los comandos, además, con cada racha de espacios contada como uno y con `“ ” „ ‟`
  como `"`, `‘ ’ ‚ ‛` como `'`, `—` como `--` y `…` como `...` (`normalizarComando`,
  research.md, punto 6): `git init` y `git  init` son el mismo, `git commit -m "Uno"` y
  `git commit -m “Uno”` también, y `git init` y `Git init`, no. Los comandos se guardan
  como los escribió el autor (solo recortados).
- **`HEAD` como nombre de rama**: se compara recortado y respetando las mayúsculas: `head`
  sí se acepta, como en Git.
- **Columnas**: el primer commit va en la columna 0 y cada uno de los demás, en 1 más la
  mayor columna de sus padres. La mayor columna más uno no pasa de 6
  (`columnasGrafoMax`, research.md, punto 2).
- **Lo que se guarda recortado**: la carpeta, los comandos y los nombres de commits y
  ramas. Los demás textos, tal como se escribieron, con su sangría (F05): `codigoInicial`,
  `solucion` y las salidas suelen ser código.

### Lo que no se guarda

- Las filas y las columnas del grafo: las calcula cada cliente con `acomodarGrafo`.
- Lo que escribe el alumno, el commit que elige y su autoevaluación (F03).

### Preguntas

Los tres cuentan como preguntas: `CALIFICA_ACTIVIDAD` les pone `true`. Con eso los cuentan
el backend (F04), el reproductor y `ResultadoLeccion`, sin cambiar su código.

## Ejemplos

```json
{
  "tipo": "retoCodigo",
  "consigna": "Escribe una función 'esPar' en C que reciba un entero y devuelva 1 si es par, 0 si no.",
  "lenguaje": "c",
  "codigoInicial": "int esPar(int n) {\n  \n}",
  "solucion": "int esPar(int n) {\n  return n % 2 == 0;\n}"
}
```

```json
{
  "tipo": "terminalSimulada",
  "consigna": "Confirma los cambios preparados con el mensaje \"Primer commit\".",
  "carpeta": "~/proyectos/mi-app",
  "comandos": ["git commit -m \"Primer commit\"", "git commit -m 'Primer commit'"],
  "salidaAcierto": "[main (root-commit) a1b2c3d] Primer commit\n 2 files changed, 10 insertions(+)",
  "pista": "El comando es: git commit -m \"mensaje\""
}
```

```json
{
  "tipo": "grafoCommits",
  "consigna": "¿Qué commit une el trabajo de las dos ramas?",
  "commits": [
    { "nombre": "c1", "padres": [] },
    { "nombre": "c2", "padres": [0] },
    { "nombre": "c3", "padres": [1] },
    { "nombre": "c4", "padres": [1] },
    { "nombre": "c5", "padres": [2, 3] }
  ],
  "ramas": [
    { "nombre": "main", "commit": 4 },
    { "nombre": "feature", "commit": 3 }
  ],
  "head": { "rama": 0 },
  "respuesta": 4,
  "explicacion": "c5 es un merge: tiene dos padres, c3 y c4."
}
```

Con `acomodarGrafo`, este grafo queda así (columna, fila): `c1` (0, 0), `c2` (1, 0), `c3`
(2, 0), `c5` (3, 0) y `c4` (2, 1).

## Lo que no cambia

- **Leccion**: mismas columnas. `version` sube al guardar, como en F05.
- **Progreso**: mismas reglas. `preguntas` tiene que ser el número que la lección tiene
  hoy, y ese número lo da `CALIFICA_ACTIVIDAD`.
- **Curso**: nada. Enviar a revisión (F06) no vuelve a comprobar cada actividad.

## Al cerrar

En `specs/02-modelo-datos.md`, "Actividad":

- El título pasa a "Actividad (F03, F05, F11, F12)" y la tabla gana estas filas.
- La lista de tipos que son preguntas pasa a diez.
- "Los otros 4 tipos del prototipo" pasa a uno: escuchar y repetir (F14).
- Una nota sobre los commits por índice, del más antiguo al más nuevo, y que el acomodo no
  se guarda.

En "Entidades previstas", la fila de los demás tipos queda solo con F14.
