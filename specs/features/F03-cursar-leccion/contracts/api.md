# API: F03 Cursar una lección

**Plan**: [plan.md](../plan.md) · Tipos: [contrato.md](./contrato.md)

Base en desarrollo: `http://localhost:3000`. Respuestas en JSON. Los errores
usan `RespuestaError` (F01).

Una ruta nueva, **con sesión** (cookie en la web; `X-Cliente: movil` y
`Authorization: Bearer` en el móvil, como en F01). Sin sesión válida
responde:

```http
401
{ "error": "Tu sesión terminó. Vuelve a entrar." }
```

`GET /cursos/:idCurso` (F02) no cambia: el detalle del curso sigue sin traer
las actividades.

---

## GET /cursos/:idCurso/lecciones/:idLeccion: una lección para cursarla

**Quién**: con sesión. Cualquier usuario, sea o no autor del curso.

**Parámetros**: `idCurso` e `idLeccion` en la ruta. No se validan: un
identificador que no existe es un 404 como cualquier otro.

**Proceso**: busca la lección con ese `id` cuyo curso es `idCurso` y está
publicado (`publicado = true`). Devuelve su `id`, `titulo`, `posicion` y sus
actividades, en orden.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaLeccion` | La lección existe, es de ese curso y el curso está publicado |
| 404 | `{ "error": "Esta lección no existe o ya no está disponible." }` | La lección no existe, **o** es de otro curso, **o** su curso no existe o no está publicado: mismo estado y mismo cuerpo |
| 401 | `{ "error": "Tu sesión terminó. Vuelve a entrar." }` | Sin sesión (aunque los identificadores no existan) |
| 500 | `{ "error": "Error interno del servidor" }` | Fallo inesperado |

```http
GET /cursos/0192f5e0-7c19-7e2f-b1a3-5d7e9c0f2a34/lecciones/0192f5e0-7c19-7f00-8a11-2b3c4d5e6f70
```

```json
{
  "leccion": {
    "id": "0192f5e0-7c19-7f00-8a11-2b3c4d5e6f70",
    "titulo": "¿Qué es el control de versiones?",
    "posicion": 1,
    "actividades": [
      {
        "tipo": "teoria",
        "titulo": "El problema que resuelve Git",
        "texto": "Imagina que editas un archivo importante y, a mitad de camino, ...\n\nGit resuelve esto guardando \"fotografías\" (snapshots) completas de tu proyecto ...",
        "puntosClave": [
          "Sabes exactamente qué cambió y cuándo.",
          "Puedes volver a cualquier punto anterior sin perder el trabajo actual.",
          "Varias personas pueden trabajar sobre el mismo proyecto sin pisarse."
        ]
      },
      {
        "tipo": "tarjeta",
        "frente": "¿Qué es un repositorio (repo)?",
        "reverso": "La carpeta de tu proyecto una vez que Git empieza a llevar su historial. Vive junto a una carpeta oculta llamada .git."
      },
      {
        "tipo": "opcionMultiple",
        "pregunta": "¿Cuál de estas afirmaciones es correcta?",
        "opciones": [
          { "texto": "Un commit es una fotografía del proyecto en un momento dado" },
          { "texto": "Un commit borra el historial anterior" },
          { "texto": "Solo puede existir un commit por proyecto" }
        ],
        "correcta": 0
      }
    ]
  }
}
```

Las otras dos formas de actividad, como llegan de "Primeros pasos"
(Programación en C sencilla):

```json
{ "tipo": "completarEspacios", "texto": "___ main() {\n  return 0;\n}", "espacios": [{ "aceptadas": ["int"] }] }
```

```json
{ "tipo": "preguntaAbierta", "pregunta": "¿Por qué en C hay que declarar el tipo de una variable antes de usarla?", "solucion": "Porque C es un lenguaje de tipado estático: ..." }
```

Una opción con símbolo (Japonés sencillo, "Hiragana: las vocales"):

```json
{ "tipo": "opcionMultiple", "pregunta": "¿Cuál hiragana se lee 'a'?", "opciones": [{ "simbolo": "あ" }, { "simbolo": "い" }, { "simbolo": "う" }], "correcta": 0 }
```

Una lección sin actividades responde 200 con `"actividades": []`.

---

## Qué hace cada cliente con los errores

| Respuesta | Web | Móvil |
|---|---|---|
| 401 | `pedir()` avisa al `SesionContext` → "Entrar" con el aviso; después de entrar se regresa a la lección (F01) | `pedir()` avisa → "Entrar" con el aviso (F01) |
| 404 | Estado "No disponible", con "Ver cursos" | Igual |
| 5xx o `fetch` falla | "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." con "Reintentar" | Igual; si el teléfono no tiene conexión, "Sin conexión. Revisa tu conexión e inténtalo de nuevo." (F01). 15 s sin respuesta cuentan como servidor caído |

Después de recibir la lección, ningún cliente vuelve a llamar a la API hasta
salir de ella: comprobar, continuar y terminar no hacen peticiones.

## CORS

Sin cambios: es una petición `GET` con credenciales desde un origen ya
permitido.
