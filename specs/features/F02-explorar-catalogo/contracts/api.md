# API: F02 Explorar el catálogo de cursos publicados

**Plan**: [plan.md](../plan.md) · Tipos: [contrato.md](./contrato.md)

Base en desarrollo: `http://localhost:3000`. Respuestas en JSON. Los errores
usan `RespuestaError` (F01).

Las dos rutas son **con sesión** (cookie en la web; `X-Cliente: movil` y
`Authorization: Bearer` en el móvil, como en F01). Sin sesión válida
responden:

```http
401
{ "error": "Tu sesión terminó. Vuelve a entrar." }
```

---

## GET /cursos: catálogo y búsqueda

**Quién**: con sesión. Cualquier usuario ve lo mismo, sea o no autor de
algún curso.

**Parámetros** (en la dirección; todos opcionales):

| Parámetro | Qué es | Reglas |
|---|---|---|
| `q` | Texto de búsqueda | Se le quitan los espacios al inicio y al final. Vacío, solo espacios, ausente o que no es texto (p. ej. `?q=a&q=b`): sin filtro. Más de 100 caracteres Unicode: 400 |
| `despues` | Cursor: el `siguiente` de la respuesta anterior, sin cambiarlo | Si no se puede leer: 400. Sin él, se empieza desde el primer curso |

Cualquier otro parámetro se ignora (p. ej. `?limite=50`: siguen siendo 10).

**Proceso**:

1. Solo cursos con `publicado = true`.
2. Si hay `q`: se parte en palabras por los espacios. Un curso entra si
   **cada** palabra aparece en su título, su descripción o el nombre de su
   autor (en cualquiera, sin importar mayúsculas, acentos ni ñ/n, y aunque
   sea parte de una palabra). Los `%` y `_` del texto se buscan literalmente.
3. Orden: título normalizado (sin mayúsculas, sin acentos, sin signos al
   inicio), luego fecha de creación y luego `id` (research.md, punto 3).
4. Con `despues`: solo los cursos que van después de esa posición en el orden.
5. Hasta **10** cursos. `siguiente` es el cursor del décimo si quedan más
   cursos; si no, `null`.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaCatalogo` | Siempre que la petición es válida, aunque no haya cursos (`cursos: []`, `siguiente: null`) |
| 400 | `{ "error": "La búsqueda puede tener hasta 100 caracteres." }` | `q`, ya recortado, tiene más de 100 caracteres |
| 400 | `{ "error": "No se pudieron cargar más cursos. Vuelve a buscar." }` | `despues` no es un cursor válido |
| 401 | `{ "error": "Tu sesión terminó. Vuelve a entrar." }` | Sin sesión |
| 500 | `{ "error": "Error interno del servidor" }` | Fallo inesperado |

```http
GET /cursos?q=sencill
```

```json
{
  "cursos": [
    {
      "id": "0192f5e0-7c1a-7d3b-9a41-3f2c8e6b1d20",
      "titulo": "Japonés sencillo",
      "descripcion": "Tus primeros pasos en japonés: hiragana, saludos, números y cómo presentarte. Sin conocimientos previos.",
      "autor": { "id": "Xk2c...", "nombre": "Equipo Brote" },
      "cantidadLecciones": 4
    },
    {
      "id": "0192f5e0-7c1b-7a10-8f55-6b0d2a9c4e11",
      "titulo": "Programación en C sencilla",
      "descripcion": "Los fundamentos de C: variables, condicionales, funciones, arrays y punteros, con retos de código en cada lección.",
      "autor": { "id": "Xk2c...", "nombre": "Equipo Brote" },
      "cantidadLecciones": 4
    }
  ],
  "siguiente": null
}
```

Con 25 cursos publicados, sin `q`:

```http
GET /cursos                       → 10 cursos, "siguiente": "WyJjdXJzby..."
GET /cursos?despues=WyJjdXJzby... → 10 cursos, "siguiente": "WyJjdXJzby..."
GET /cursos?despues=...           → 5 cursos,  "siguiente": null
```

Con `q`, el cliente manda la misma `q` junto con `despues`: el cursor marca
la posición en el orden, no recuerda la búsqueda.

## GET /cursos/:idCurso: detalle de un curso

**Quién**: con sesión.

**Proceso**: busca el curso con ese `id` y `publicado = true`, con su autor y
sus lecciones ordenadas por `posicion`.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaCurso` | El curso existe y está publicado |
| 404 | `{ "error": "Este curso no existe o ya no está disponible." }` | No existe, **o** existe pero no está publicado: mismo estado y mismo cuerpo |
| 401 | `{ "error": "Tu sesión terminó. Vuelve a entrar." }` | Sin sesión |
| 500 | `{ "error": "Error interno del servidor" }` | Fallo inesperado |

```json
{
  "curso": {
    "id": "0192f5e0-7c19-7e2f-b1a3-5d7e9c0f2a34",
    "titulo": "Git esencial",
    "descripcion": "Aprende Git desde cero: commits, ramas y remotos, con una terminal simulada y grafos de commits interactivos.",
    "autor": { "id": "Xk2c...", "nombre": "Equipo Brote" },
    "cantidadLecciones": 6,
    "lecciones": [
      { "id": "0192f5e0-...", "titulo": "¿Qué es el control de versiones?", "posicion": 1 },
      { "id": "0192f5e0-...", "titulo": "Tu primer commit", "posicion": 2 },
      { "id": "0192f5e0-...", "titulo": "Viajar en el tiempo: historial y diffs", "posicion": 3 },
      { "id": "0192f5e0-...", "titulo": "Ramas: trabajar en paralelo", "posicion": 4 },
      { "id": "0192f5e0-...", "titulo": "Remotos: compartir tu trabajo", "posicion": 5 },
      { "id": "0192f5e0-...", "titulo": "Resolviendo conflictos", "posicion": 6 }
    ]
  }
}
```

Un curso publicado sin lecciones responde 200 con `"cantidadLecciones": 0` y
`"lecciones": []`.

---

## Qué hace cada cliente con los errores

| Respuesta | Web | Móvil |
|---|---|---|
| 401 | `pedir()` avisa al `SesionContext` → "Entrar" con el aviso (F01) | Igual |
| 404 del detalle | Estado "No disponible" | Igual |
| 400 | No debería ocurrir: el buscador corta en 100 y el cursor viene del servidor. Si ocurre, se muestra como error, con "Reintentar" | Igual |
| 5xx o `fetch` falla | "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." | Igual; si el teléfono no tiene conexión, "Sin conexión. Revisa tu conexión e inténtalo de nuevo." (F01) |

## CORS

Sin cambios: son peticiones `GET` con credenciales desde un origen ya
permitido.
