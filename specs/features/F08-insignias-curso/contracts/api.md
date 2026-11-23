# API: F08 Insignias por curso completado

Todas piden sesión (cookie en la web, `Authorization: Bearer` en el móvil). Sin sesión:
401. Los errores tienen la forma de siempre: `{ error, campos? }`.

## PUT /cursos/:idCurso/lecciones/:idLeccion/progreso (cambia)

Igual que en F04 (cuerpo, validaciones y errores). Lo nuevo es la respuesta:

- **200** `RespuestaProgresoLeccion`:

  ```json
  {
    "progreso": { "aciertos": 3, "preguntas": 4, "completadaEn": "2026-11-22T22:10:00.000Z" },
    "insigniaNueva": {
      "idCurso": "…",
      "titulo": "Insignia rápida",
      "idPortada": null,
      "ganadaEn": "2026-11-22T22:10:00.000Z"
    }
  }
  ```

  `insigniaNueva` es `null` si el curso no da insignia, si al alumno todavía le faltan
  lecciones o si ya la tenía.

## GET /usuarios/yo/insignias (nuevo)

Las insignias de quien llama.

- **200** `RespuestaInsignias`: `{ "insignias": InsigniaCurso[] }`, de `ganadaEn` más
  reciente a más antigua (desempate por `idCurso`). Incluye cursos que ya no están
  publicados. Lista vacía si no tiene ninguna.
- **401**: sin sesión.

## POST /editor/cursos y PUT /editor/cursos/:idCurso (cambian)

El cuerpo `CuerpoDatosCurso` acepta `daInsignia` (booleano, opcional):

- Sin él, no cambia; el `POST` sin él crea el curso con `false`.
- Si no es booleano: **400** `{ "error": "Revisa los datos marcados.", "campos": { "daInsignia": MENSAJES_EDITOR.datosInvalidos } }`.
- En un curso en revisión o publicado, el `PUT` responde lo mismo que hoy (no se edita, F06).

## GET /editor/cursos/:idCurso (cambia)

`CursoEnEditor` trae `daInsignia: boolean`. Lo mismo en las respuestas del `POST` y el
`PUT` de arriba.
