# API: F06 Enviar un curso a revisión y publicarlo

**Plan**: [plan.md](./plan.md) · Tipos: [contrato.md](./contrato.md)

Base en desarrollo: `http://localhost:3000`. Respuestas en JSON. Los errores usan
`RespuestaError` (F01).

Todas las rutas son **con sesión** (cookie en la web, como en F01). Sin sesión válida
responden:

```http
401
{ "error": "Tu sesión terminó. Vuelve a entrar." }
```

El autor sale siempre de la sesión. Solo la web usa estas rutas (decisión 0003).
Aprobar, rechazar y retirar como administrador no pasan por la API: se hacen en la base
(decisión 0014; ver [data-model.md](../data-model.md)).

## Rutas nuevas

Ninguna lleva cuerpo. Las tres responden, si todo va bien:

| Estado | Cuerpo |
|---|---|
| 200 | `RespuestaCursoEnEditor`, con el curso en su estado nuevo |

Comprueban en este orden, con el curso bloqueado (research.md, punto 5): sesión (401),
curso (404), estado (409) y, al enviar, contenido (400). Ninguna respuesta de error
cambia nada.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 404 | `{ "error": "Este curso ya no existe." }` | El curso no existe **o** es de otra persona: mismo estado y mismo cuerpo |
| 409 | `{ "error": "El estado de este curso cambió en otro lugar." }` | El curso no está en el estado de partida de esa acción |
| 500 | `{ "error": "Error interno del servidor" }` | Fallo inesperado |

### POST /editor/cursos/:idCurso/revision: enviar a revisión

**Quién**: su autor, con el curso en borrador, con o sin rechazo.

**Proceso**: cuenta las lecciones y las vacías. Si cumple, escribe `revision =
'pendiente'` y `motivo_rechazo = NULL`.

Además de las respuestas comunes:

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 400 | `{ "error": "No se envió: el curso no tiene lecciones." }` | Sin lecciones |
| 400 | `{ "error": "No se envió: hay 1 lección sin actividades." }` | Una lección vacía |
| 400 | `{ "error": "No se envió: hay 2 lecciones sin actividades." }` | Dos o más lecciones vacías, con su número |

```json
{
  "curso": {
    "id": "0192f5e0-…",
    "titulo": "Huerto urbano",
    "descripcion": "Cultiva en poco espacio.",
    "estado": "enRevision",
    "revisionRechazada": false,
    "motivoRechazo": null,
    "lecciones": [
      { "id": "0192f5e1-…", "titulo": "Semillas", "posicion": 1, "cantidadActividades": 3 }
    ]
  }
}
```

### DELETE /editor/cursos/:idCurso/revision: retirar de revisión

**Quién**: su autor, con el curso en revisión.

**Proceso**: escribe `revision = NULL`. El curso queda en `"borrador"`.

### DELETE /editor/cursos/:idCurso/publicacion: retirar del catálogo

**Quién**: su autor, con el curso publicado.

**Proceso**: escribe `publicado = false`. El curso queda en `"borrador"`. El progreso de
sus alumnos no se toca.

No hay `POST` en `/publicacion`: el autor no puede publicar.

---

## Rutas que cambian

### GET /usuarios/yo/cursos

Cada curso gana `revisionRechazada`, y `estado` puede ser `"enRevision"`:

```json
{
  "cursos": [
    { "id": "…", "titulo": "Curso en revisión", "estado": "enRevision", "revisionRechazada": false, "cantidadLecciones": 1 },
    { "id": "…", "titulo": "Huerto urbano", "estado": "borrador", "revisionRechazada": true, "cantidadLecciones": 2 }
  ]
}
```

### GET /editor/cursos/:idCurso

**Quién**: su autor, en cualquier estado. **Deja de responder 403**: un curso en revisión
o publicado responde 200 con su `estado` (research.md, punto 7). Un curso ajeno o que no
existe sigue respondiendo el 404 de F05.

`curso` gana `estado`, `revisionRechazada` y `motivoRechazo`. También los devuelven
`POST /editor/cursos`, `PUT /editor/cursos/:idCurso` y `PUT .../lecciones-orden`, porque
responden el mismo tipo.

### GET /editor/cursos/:idCurso/lecciones/:idLeccion

Sigue respondiendo 403 si el curso no se edita, con un mensaje por estado:

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 403 | `{ "error": "Este curso está publicado y no se puede editar." }` | Curso publicado |
| 403 | `{ "error": "Este curso está en revisión y no se puede editar." }` | Curso en revisión |

### Rutas que escriben en `/editor/cursos/:idCurso...`

`PUT` y `DELETE` del curso; `POST .../lecciones`; `PUT .../lecciones-orden`; y `PUT` y
`DELETE` de una lección. Rechazan también un curso en revisión. Un curso rechazado se
escribe como cualquier borrador.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 403 | `{ "error": "Este curso está publicado y no se puede editar. Tus cambios no se guardaron." }` | Curso publicado |
| 403 | `{ "error": "Este curso está en revisión y no se puede editar. Tus cambios no se guardaron." }` | Curso en revisión |

## Rutas que no cambian

`GET /cursos`, `GET /cursos/:idCurso`, las lecciones de F03 y el progreso de F04 filtran
por `publicado`, así que ya tratan un curso en revisión como uno sin publicar.
