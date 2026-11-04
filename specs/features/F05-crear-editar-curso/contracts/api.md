# API: F05 Crear y editar un curso

**Plan**: [plan.md](../plan.md) · Tipos: [contrato.md](./contrato.md)

Base en desarrollo: `http://localhost:3000`. Respuestas en JSON. Los errores usan
`RespuestaError` (F01).

Todas las rutas son **con sesión** (cookie en la web, como en F01). Sin sesión
válida responden, antes de mirar los parámetros o el cuerpo:

```http
401
{ "error": "Tu sesión terminó. Vuelve a entrar." }
```

El autor sale siempre de la sesión, nunca de la dirección ni del cuerpo. Solo la
web usa estas rutas: el móvil no tiene editor (decisión 0003).

## Respuestas comunes de `/editor/cursos/:idCurso...`

Las comprobaciones van en este orden: sesión (401), forma del cuerpo (400), curso
(404 o 403), lección (404) y versión (409). Ninguna respuesta de error cambia nada
(research.md, punto 6).

| Estado | Cuerpo al abrir (`GET`) | Cuerpo al escribir | Cuándo |
|---|---|---|---|
| 404 | `{ "error": "Este curso no existe o ya no está disponible." }` | `{ "error": "Este curso ya no existe. Tus cambios no se guardaron." }` | El curso no existe **o** es de otra persona: mismo estado y mismo cuerpo |
| 403 | `{ "error": "Este curso ya está publicado y por ahora no se puede editar." }` | `{ "error": "Este curso ya está publicado y por ahora no se puede editar. Tus cambios no se guardaron." }` | El curso es de quien llama y está publicado |
| 404 | `{ "error": "Esta lección no existe o ya no está disponible." }` | `{ "error": "Esta lección ya no existe. Tus cambios no se guardaron." }` | En las rutas de una lección: no existe o es de otro curso |
| 500 | `{ "error": "Error interno del servidor" }` | Igual | Fallo inesperado |

Los errores de datos son siempre:

```http
400
{ "error": "Revisa los datos marcados.", "campos": { "titulo": "Este campo es obligatorio." } }
```

---

## GET /usuarios/yo/cursos: los cursos que creé

**Quién**: con sesión. Devuelve los de quien pregunta, publicados o no.

**Proceso**: orden por `actualizado_en`, de la más reciente a la más antigua y, si
empatan, por `id`. Sin paginar (spec, "Supuestos").

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaCursosDelAutor` | Siempre que hay sesión; `"cursos": []` si no ha creado ninguno |

```json
{
  "cursos": [
    { "id": "0192f5e0-…", "titulo": "Huerto urbano", "estado": "borrador", "cantidadLecciones": 0 },
    { "id": "0192f5e1-…", "titulo": "Git esencial", "estado": "publicado", "cantidadLecciones": 6 }
  ]
}
```

---

## POST /editor/cursos: crear un curso

**Cuerpo** (`CuerpoDatosCurso`):

```json
{ "titulo": "Huerto urbano", "descripcion": "Cultiva en poco espacio." }
```

**Proceso**: valida el cuerpo. Crea el curso con `publicado = false`, sin lecciones
y con quien llama como autor.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 201 | `RespuestaCursoEnEditor` | Creado |
| 400 | Errores por campo (`titulo`, `descripcion`) | Vacío o más largo que su límite |

---

## GET /editor/cursos/:idCurso: abrir el mapa del curso

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaCursoEnEditor` | Es un borrador de quien llama |
| 403, 404 | Ver "Respuestas comunes" | |

```json
{
  "curso": {
    "id": "0192f5e0-7c19-7e2f-b1a3-5d7e9c0f2a34",
    "titulo": "Huerto urbano",
    "descripcion": "Cultiva en poco espacio.",
    "lecciones": [
      { "id": "0192f5e0-7c19-7f00-8a11-2b3c4d5e6f70", "titulo": "Semillas", "posicion": 1, "cantidadActividades": 3 }
    ]
  }
}
```

---

## PUT /editor/cursos/:idCurso: guardar los datos del curso

**Cuerpo**: `CuerpoDatosCurso`. Reemplaza los dos campos.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaCursoEnEditor` | Guardado |
| 400 | Errores por campo | Como al crear |
| 403, 404 | Ver "Respuestas comunes" | |

Si se cambia en dos pestañas, queda lo último que se guardó (spec, "Supuestos").

---

## DELETE /editor/cursos/:idCurso: eliminar un curso

**Proceso**: borra el curso. Sus lecciones y el progreso de ellas se borran en
cascada (data-model.md).

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 204 | Sin cuerpo | Eliminado |
| 403, 404 | Ver "Respuestas comunes" | Un curso publicado no se elimina |

---

## POST /editor/cursos/:idCurso/lecciones: agregar una lección

**Cuerpo** (`CuerpoNuevaLeccion`): `{ "titulo": "Semillas" }`.

**Proceso**: valida el título. Con el curso bloqueado, la agrega al final, sin
actividades y con `version = 1`.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 201 | `RespuestaLeccionEnMapa` | Agregada |
| 400 | Errores por campo (`titulo`) | Vacío o más largo que su límite |
| 400 | `{ "error": "Un curso puede tener hasta 100 lecciones." }` | Ya tiene 100 |
| 403, 404 | Ver "Respuestas comunes" | |

---

## PUT /editor/cursos/:idCurso/lecciones-orden: reordenar las lecciones

**Por qué esa ruta**: no cuelga de `/lecciones/` para no confundirse con
`/lecciones/:idLeccion`.

**Cuerpo** (`CuerpoOrdenLecciones`):

```json
{ "idsLecciones": ["0192f5e0-…c", "0192f5e0-…a", "0192f5e0-…b"] }
```

**Proceso**: con el curso bloqueado, comprueba que la lista tiene exactamente las
lecciones del curso, cada una una vez, y renumera (research.md, punto 3). No cambia
la `version` de ninguna lección.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaCursoEnEditor` | Reordenado |
| 400 | `{ "error": "Revisa los datos marcados." }` | `idsLecciones` no es una lista de textos |
| 409 | `{ "error": "El orden no coincide con las lecciones del curso." }` | Sobra, falta o se repite alguna: otra pestaña las cambió |
| 403, 404 | Ver "Respuestas comunes" | |

---

## GET /editor/cursos/:idCurso/lecciones/:idLeccion: abrir el lienzo

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaLeccionEnEditor` | Es una lección de un borrador de quien llama |
| 403, 404 | Ver "Respuestas comunes" | |

```json
{
  "leccion": {
    "id": "0192f5e0-7c19-7f00-8a11-2b3c4d5e6f70",
    "titulo": "Semillas",
    "posicion": 1,
    "version": 3,
    "actividades": [
      { "tipo": "tarjeta", "frente": "¿Qué es germinar?", "reverso": "Que la semilla empiece a crecer." }
    ]
  }
}
```

---

## PUT /editor/cursos/:idCurso/lecciones/:idLeccion: guardar la lección

**Por qué PUT**: reemplaza el título y todas las actividades; repetir la petición con
`reemplazar` deja lo mismo.

**Cuerpo** (`CuerpoGuardarLeccion`):

```json
{
  "titulo": "Semillas",
  "version": 3,
  "actividades": [
    { "tipo": "tarjeta", "frente": "¿Qué es germinar?", "reverso": "Que la semilla empiece a crecer." }
  ]
}
```

**Proceso**, en este orden:

1. Valida la forma: un objeto con `titulo`, `actividades` y `version`, y
   `reemplazar` opcional; ningún campo más. `version` es un entero ≥ 1.
2. Valida el título y cada actividad, con las reglas de F03 y los límites de
   F05, y que haya hasta 50 actividades. Recorta el título de la lección y el de
   cada teoría.
3. Con el curso bloqueado, comprueba el curso y la lección.
4. Si `version` no es la actual y no viene `reemplazar: true`, responde 409.
5. Guarda el título y las actividades, sube `version` y actualiza el curso.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 200 | `RespuestaLeccionEnEditor` | Guardada, con la `version` nueva |
| 400 | `{ "error": "Revisa los datos marcados.", "campos": { "titulo": "…" } }` | Título vacío o largo |
| 400 | `{ "error": "Revisa los datos marcados.", "campos": { "actividades.2": "…" } }` | La actividad con ese índice (desde 0) no es válida. Se informa la primera |
| 400 | `{ "error": "Revisa los datos marcados.", "campos": { "actividades": "Una lección puede tener hasta 50 actividades." } }` | Más de 50 |
| 400 | `{ "error": "Revisa los datos marcados." }` | El cuerpo no tiene la forma de arriba |
| 409 | `{ "error": "Se guardó una versión más nueva de esta lección." }` | Paso 4 |
| 403, 404 | Ver "Respuestas comunes" | |

Una actividad de un tipo que no existe en el contrato no es válida. Hoy solo existen
los cinco básicos.

---

## DELETE /editor/cursos/:idCurso/lecciones/:idLeccion: eliminar una lección

**Proceso**: con el curso bloqueado, borra la lección (y su progreso, en cascada) y
renumera las que quedan.

| Estado | Cuerpo | Cuándo |
|---|---|---|
| 204 | Sin cuerpo | Eliminada |
| 403, 404 | Ver "Respuestas comunes" | |

---

## Qué hace la web con los errores

### Al cargar (panel, mapa y lienzo)

| Respuesta | Qué se ve |
|---|---|
| 401 | `pedir()` avisa al `SesionContext` → "Entrar" con el aviso (F01). Al entrar, de vuelta a esa pantalla |
| 403 | "Este curso ya está publicado y por ahora no se puede editar." con "Ver curso" |
| 404 | El `error` de la respuesta, con "Ir a Mi panel" |
| 5xx o `fetch` falla | "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." con "Reintentar" |

### Al escribir

| Respuesta | Qué se ve |
|---|---|
| 401 | Como al cargar. Si era un formulario, la lección o una acción del mapa, lo capturado se guarda en la copia y se recupera al volver a entrar (research.md, punto 15) |
| 400 con `campos` | En un formulario, cada error en su campo. En la lección, `Aviso` "Revisa los datos marcados." y, si hay `actividades.N`, esa actividad seleccionada |
| 403, 404 | El `error` de la respuesta, en un `Aviso`. Lo capturado sigue en pantalla |
| 409 de versión | La pregunta "Esta lección cambió en otro lugar". "Reemplazar" repite el `PUT` con `reemplazar: true` |
| 409 de orden | "No se pudo guardar el nuevo orden.", y se vuelve a pedir la lista |
| 5xx o `fetch` falla | El mensaje de esa acción (spec, "Estados de la pantalla") |

## CORS

Sin cambios: `src/app.ts` ya permite `GET, POST, PUT, PATCH, DELETE, OPTIONS`, con
`Content-Type` y credenciales. `DELETE` es el primer uso de ese método.
