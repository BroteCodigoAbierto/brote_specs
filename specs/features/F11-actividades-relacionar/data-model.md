# Modelo de datos: F11 Actividades de relacionar

Sin tablas, columnas ni migraciones: las actividades viven en `leccion.actividades`
(JSONB), y la base no comprueba su forma. Lo que cambia es la entidad **Actividad**, que
gana cuatro tipos. El backend los valida con `validarActividades` antes de guardarlos
(`specs/02-modelo-datos.md`, "Actividad").

## Actividad: los cuatro tipos nuevos

Valen las reglas generales de F03 y F05: "no vacío" es que, recortado, tiene al menos un
carácter; un campo que el tipo no tiene se rechaza; las longitudes cuentan caracteres
Unicode. Los límites están en `LIMITES_ACTIVIDADES`.

| Tipo (`tipo`) | Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|---|
| `emparejar` | `consigna` | texto | no | Si está, no vacía, de hasta 500 |
| | `parejas` | lista de `{ izquierda, derecha }` | sí | Entre 3 y 8, en el orden del autor |
| | `parejas[].izquierda` | texto | sí | No vacío, de hasta 200. No se repite en su columna |
| | `parejas[].derecha` | texto | sí | No vacío, de hasta 200. No se repite en su columna |
| `clasificar` | `consigna` | texto | no | Si está, no vacía, de hasta 500 |
| | `categorias` | lista de textos | sí | Entre 2 y 4, en el orden del autor. Cada una no vacía, de hasta 100. No se repiten |
| | `elementos` | lista de `{ texto, categoria }` | sí | Entre 2 y 12 |
| | `elementos[].texto` | texto | sí | No vacío, de hasta 100. No se repite |
| | `elementos[].categoria` | entero | sí | Índice en `categorias`. Toda categoría tiene al menos un elemento |
| `ordenar` | `consigna` | texto | sí | No vacía, de hasta 500 |
| | `elementos` | lista de textos | sí | Entre 3 y 10, **en el orden correcto**. Cada uno no vacío, de hasta 200. No se repiten |
| `bancoPalabras` | `consigna` | texto | no | Si está, no vacía, de hasta 500 |
| | `texto` | texto | sí | De hasta 2000, con 1 a 10 `___` (`MARCA_ESPACIO`) |
| | `fichas` | lista de textos | sí | Entre 2 y 20. Cada una no vacía, de hasta 100. Se guardan recortadas. **Se pueden repetir** |
| | `espacios` | lista de `{ aceptadas }` | sí | Uno por cada `___`. Cada `aceptadas` tiene de 1 a 20 textos (`fichasMax`), y cada texto es el de una ficha |

### Reglas que cruzan campos

- **Repetidos**: se comparan recortados, respetando las mayúsculas, como las opciones de
  F05. Lo que se guarda conserva sus espacios al inicio (en `ordenar`, son la sangría de
  una línea de código). La excepción son las fichas, que se guardan recortadas.
- **Hay forma de llenar el banco**: tiene que existir una manera de darle a cada espacio
  una ficha que valga en él, sin usar una ficha dos veces (research.md, punto 5).
- **`aceptadas` en el banco**: la comparación es de texto exacto. La regla de completar
  espacios de que "la primera es la que se muestra" no aplica: la solución que se ve la
  calcula el cliente (research.md, punto 5).

### Preguntas

Los cuatro cuentan como preguntas: `CALIFICA_ACTIVIDAD` les pone `true`. Con eso los
cuentan el backend (F04), el reproductor y `ResultadoLeccion`, sin cambiar su código.

## Ejemplos

```json
{
  "tipo": "emparejar",
  "parejas": [
    { "izquierda": "git push", "derecha": "Sube tus commits locales al remoto" },
    { "izquierda": "git pull", "derecha": "Descarga y combina los commits nuevos del remoto" },
    { "izquierda": "git fetch", "derecha": "Descarga los commits nuevos sin combinarlos todavía" }
  ]
}
```

```json
{
  "tipo": "clasificar",
  "categorias": ["Tipo de dato", "Palabra clave"],
  "elementos": [
    { "texto": "int", "categoria": 0 },
    { "texto": "if", "categoria": 1 }
  ]
}
```

```json
{
  "tipo": "ordenar",
  "consigna": "Ordena las líneas para formar un programa que imprima 'Hola' si x es mayor que 5.",
  "elementos": ["if (x > 5) {", "    printf(\"Hola\");", "}"]
}
```

```json
{
  "tipo": "bancoPalabras",
  "texto": "Mis colores favoritos son ___ y ___.",
  "fichas": ["rojo", "azul", "verde"],
  "espacios": [{ "aceptadas": ["rojo", "azul"] }, { "aceptadas": ["rojo", "azul"] }]
}
```

## Lo que no cambia

- **Leccion**: mismas columnas. `version` sube al guardar, como en F05.
- **Progreso**: mismas reglas. `preguntas` tiene que ser el número que la lección tiene
  hoy, y ese número lo da `CALIFICA_ACTIVIDAD`.
- **Curso**: nada. Enviar a revisión (F06) no vuelve a comprobar cada actividad.

## Al cerrar

En `specs/02-modelo-datos.md`, "Actividad":

- La tabla gana estas filas.
- La lista de tipos que son preguntas pasa a siete.
- "Los otros 8 tipos del prototipo" pasa a cuatro.

En "Entidades previstas", la fila de los demás tipos deja fuera a F11.
