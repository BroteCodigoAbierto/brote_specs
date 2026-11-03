# API: F04 Registrar y consultar el progreso

**Plan**: [plan.md](../plan.md) · Tipos: [contrato.md](./contrato.md)

Base en desarrollo: `http://localhost:3000`. Respuestas en JSON. Los errores
usan `RespuestaError` (F01).

Todas las rutas son **con sesión** (cookie en la web; `X-Cliente: movil` y
`Authorization: Bearer` en el móvil, como en F01). Sin sesión válida
responden, antes de mirar los parámetros o el cuerpo:

```http
401
{ "error": "Tu sesión terminó. Vuelve a entrar." }
```

Cada alumno solo lee y escribe su propio progreso: el usuario sale siempre de
la sesión, nunca de la dirección ni del cuerpo.

---

## PUT /cursos/:idCurso/lecciones/:idLeccion/progreso: registrar una lección completada

**Quién**: con sesión. Cualquier usuario, sea o no autor del curso.

**Por qué PUT**: registra el estado de "mi progreso en esta lección", que es
uno solo; repetir la petición deja lo mismo (research.md, punto 4).

**Parámetros**: `idCurso` e `idLeccion` en la ruta. No se validan: un
identificador que no existe es un 404 como cualquier otro.

**Cuerpo** (`CuerpoProgresoLeccion`):

```json
{ "aciertos": 2, "preguntas": 3 }
```

**Proceso**, en este orden:

1. Valida la forma del cuerpo: un objeto con exactamente `aciertos` y
   `preguntas`, los dos enteros ≥ 0. Si no, 400.
2. Busca la lección con ese `id`, cuyo curso es `idCurso` y está publicado.
   Si no, 404 (lo mismo que `GET` de la lección en F03).
3. Cuenta las preguntas de la lección (`CALIFICA_ACTIVIDAD`). Si `preguntas`
   no es ese número, o `aciertos > preguntas`, 400 (research.md, punto 1).
4. `upsert` del progreso del usuario en esa lección, con `completadaEn` =
   ahora.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaProgresoLeccion` | Quedó registrado (la primera vez o al repetirla) |
| 400 | `{ "error": "El resultado no corresponde a la lección." }` | El cuerpo no tiene la forma de arriba, o no cuadra con la lección. No cambia nada |
| 400 | `{ "error": "El cuerpo de la petición no es JSON válido." }` | JSON mal formado (F01) |
| 404 | `{ "error": "Esta lección no existe o ya no está disponible." }` | La lección no existe, **o** es de otro curso, **o** su curso no existe o no está publicado: mismo estado y mismo cuerpo. No cambia nada |
| 401 | `{ "error": "Tu sesión terminó. Vuelve a entrar." }` | Sin sesión |
| 500 | `{ "error": "Error interno del servidor" }` | Fallo inesperado |

```http
PUT /cursos/0192f5e0-7c19-7e2f-b1a3-5d7e9c0f2a34/lecciones/0192f5e0-7c19-7f00-8a11-2b3c4d5e6f70/progreso
Content-Type: application/json

{ "aciertos": 2, "preguntas": 2 }
```

```json
{
  "progreso": {
    "aciertos": 2,
    "preguntas": 2,
    "completadaEn": "2026-11-03T18:30:00.000Z"
  }
}
```

Una lección sin preguntas se registra con `{ "aciertos": 0, "preguntas": 0 }`.

---

## GET /cursos/:idCurso: detalle del curso (cambia)

Lo de F02, y además cada lección trae `progreso`: el de quien pregunta, o
`null` si no la ha completado (`DetalleCurso` con `LeccionDelCurso`). Los
estados y errores no cambian (200, 404, 401, 500).

```json
{
  "curso": {
    "id": "0192f5e0-7c19-7e2f-b1a3-5d7e9c0f2a34",
    "titulo": "Git esencial",
    "descripcion": "Aprende Git desde cero: …",
    "autor": { "id": "…", "nombre": "Ana Autora" },
    "cantidadLecciones": 6,
    "lecciones": [
      {
        "id": "0192f5e0-7c19-7f00-8a11-2b3c4d5e6f70",
        "titulo": "¿Qué es el control de versiones?",
        "posicion": 1,
        "progreso": { "aciertos": 2, "preguntas": 2, "completadaEn": "2026-11-03T18:30:00.000Z" }
      },
      {
        "id": "0192f5e0-7c19-7f01-9b22-3c4d5e6f7081",
        "titulo": "Tu primer commit",
        "posicion": 2,
        "progreso": null
      }
    ]
  }
}
```

---

## GET /usuarios/yo/cursos-empezados: cursos que empecé

**Quién**: con sesión. Devuelve los de quien pregunta.

**Proceso**: los cursos **publicados** en los que el usuario completó al
menos una lección, con cuántas completó y cuándo fue la última. Orden:
`ultimoAvanceEn` de más reciente a más antiguo y, si empatan, `id`. Sin
paginar (spec, "Supuestos").

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaCursosEmpezados` | Siempre que hay sesión; `"cursos": []` si no ha empezado ninguno |
| 401 | `{ "error": "Tu sesión terminó. Vuelve a entrar." }` | Sin sesión |
| 500 | `{ "error": "Error interno del servidor" }` | Fallo inesperado |

```json
{
  "cursos": [
    {
      "id": "0192f5e0-7c19-7e2f-b1a3-5d7e9c0f2b99",
      "titulo": "Japonés sencillo",
      "descripcion": "Tus primeros pasos en japonés: …",
      "autor": { "id": "…", "nombre": "Ana Autora" },
      "cantidadLecciones": 4,
      "leccionesCompletadas": 1,
      "ultimoAvanceEn": "2026-11-03T18:42:10.000Z"
    },
    {
      "id": "0192f5e0-7c19-7e2f-b1a3-5d7e9c0f2a34",
      "titulo": "Git esencial",
      "descripcion": "Aprende Git desde cero: …",
      "autor": { "id": "…", "nombre": "Ana Autora" },
      "cantidadLecciones": 6,
      "leccionesCompletadas": 2,
      "ultimoAvanceEn": "2026-11-03T18:35:02.000Z"
    }
  ]
}
```

Va bajo `/usuarios/yo` porque es "lo mío", como `GET /usuarios/yo` (F01).
`/usuarios/yo/cursos` queda libre para los cursos que creo (F05).

---

## Qué hace cada cliente con los errores

### Al guardar (pantalla de lección completada)

| Respuesta | Web | Móvil |
|---|---|---|
| 200 | "Progreso guardado" | Igual |
| 401 | `pedir()` avisa al `SesionContext` → "Entrar" con el aviso (F01) | Igual |
| 404 | "Esta lección ya no está disponible. Tu progreso no se guardó.", sin "Reintentar" | Igual |
| 400 | "No se pudo guardar tu progreso." con "Reintentar" (no debería pasar: el cliente cuenta igual que el servidor) | Igual |
| 5xx o `fetch` falla | "No se pudo guardar tu progreso." con "Reintentar" | Igual; si el teléfono no tiene conexión, "Sin conexión. Tu progreso no se guardó.". 15 s sin respuesta cuentan como servidor caído |

### Al cargar (detalle, Mis cursos, Mi panel)

Como el detalle en F02: 401 → "Entrar"; 5xx o `fetch` falla → "No se pudo
conectar con Brote. Inténtalo de nuevo en un momento." con "Reintentar" (y,
en el móvil sin conexión, "Sin conexión. Revisa tu conexión e inténtalo de
nuevo.").

## CORS

Sin cambios. `PUT` es el primer uso de ese método, pero el CORS de
`src/app.ts` ya lo permite (`GET, POST, PUT, PATCH, DELETE, OPTIONS`), con
`Content-Type` y credenciales.
