# Análisis del prototipo

El prototipo de Brote se hizo en un día, sin pensar en escalabilidad. Vive en
el repo `brote_codigoabierto`, rama `claude`. Sirve como **referencia de
producto** (qué hace Brote y qué se sintió bien), no como base de código: Brote
se reconstruye desde cero con otro stack.

## Stack del prototipo

- Spring Boot 3.5 (Java 21) con H2 embebido.
- Frontend en HTML y JavaScript vanilla con ES modules, sin build ni
  dependencias. Unas 5,500 líneas, de las cuales unas 2,150 son un solo
  `style.css`.
- Los cursos no están en la base de datos: cada uno es una carpeta
  `data/courses/{id}/` con `manifest.json` y `lessons/*.json`.

## Dominio

### Curso (`manifest.json`)

```json
{
  "id": "git-esencial",
  "title": "Git esencial",
  "description": "...",
  "coverImage": "...",
  "author": "pedro",
  "language": "es",
  "version": 1,
  "lessons": [{ "id": "01-que-es-control-de-versiones", "title": "..." }],
  "gamification": { "points": true, "badges": true }
}
```

### Lección (`lessons/{id}.json`)

```json
{ "title": "Tu primer commit", "activities": [ { "type": "content", ... } ] }
```

### Actividades: 13 tipos

Cada actividad es un objeto con `type` y campos propios. Cualquier actividad
puede llevar `glossary: [{ term, definition }]`, que alimenta el glosario.

| `type` | Grupo | Campos (`?` = opcional) | Qué hace el alumno |
|---|---|---|---|
| `content` | Teoría | `title?`, `body`, `code?`, `bullets?` | Lee teoría (párrafos, código o diff, puntos clave) |
| `flashcard` | Teoría | `front`, `back` | Voltea una tarjeta de memoria |
| `multiple_choice` | Preguntas | `prompt`, `code?`, `options` (texto o `{icon, image, label}`), `answer` (índice) | Elige una opción |
| `open_question` | Preguntas | `prompt`, `solution` | Responde libre y se autoevalúa contra la solución |
| `fill_blank` | Preguntas | `text` (con `___`), `blanks: [{accepted: []}]` | Escribe en los espacios |
| `word_bank` | Preguntas | `text`, `bank`, `blanks` | Llena los espacios con palabras de un banco |
| `matching` | Preguntas | `pairs: [{left, right}]` | Empareja dos columnas |
| `categorize` | Preguntas | `prompt?`, `categories`, `items: [{text, category}]` | Clasifica elementos en columnas |
| `reorder` | Preguntas | `prompt`, `items` (en orden correcto) | Ordena una secuencia |
| `code_challenge` | Interactivos | `prompt`, `language`, `starter_code?`, `solution` | Escribe código y lo compara con la solución |
| `listen_and_repeat` | Interactivos | `expected_text`, `lang?`, `audio?` | Escucha (audio o síntesis de voz) y repite |
| `terminal_sim` | Git / Terminal | `prompt`, `cwd?`, `setup_output?`, `accepted`, `success_output?`, `hint?` | Escribe un comando en una terminal simulada |
| `commit_graph` | Git / Terminal | `prompt`, `commits: [{id, x, y, label, parents}]`, `answer` | Hace clic en el commit correcto de un grafo |

### Progreso

Una fila por lección completada (`course_id`, `lesson_id`, `completed_at`). No
hay usuarios: el progreso es global.

### Glosario

- Entradas **derivadas**: los `glossary` de las actividades de lecciones ya
  completadas. Se calculan, no se guardan.
- Entradas **propias**: términos que el alumno agrega a mano.
- El **orden** en que el alumno acomoda las entradas (arrastrando) se guarda.

### Creador de cursos

Editor en `/creator.html`:

- **Mapa del curso**: lecciones en orden, reordenables y con alta de lección nueva.
- **Lienzo de la lección**: las actividades como tarjetas en secuencia, más una
  **paleta** de tipos agrupados que se arrastran al lienzo.
- **Inspector**: formulario del bloque seleccionado, generado desde un esquema
  declarativo por tipo (`activitySchemas.js`). Los campos complejos caen a un
  editor de JSON crudo.
- **Vista previa**: renderiza el bloque con el mismo módulo que ve el alumno.
- API de escritura `/api/authoring/*` que escribe archivos a disco.

## Qué se hereda (como idea)

1. **Registro de actividades.** En el prototipo, cada tipo es un módulo con
   `render(container, actividad, alTerminar)` y agregar un tipo es un archivo
   más una línea en `registry.js`. En Brote: un componente por tipo y un
   registro `tipo → componente`, en web y móvil (principio IV).
2. **Esquema declarativo por tipo** para generar los formularios del editor.
3. **Vista previa con el componente real** del alumno.
4. **El formato JSON de curso** como base del formato de importación y
   exportación.
5. **El editor como secuencia ordenable**, no como lienzo libre x/y: el
   contenido de una lección es una lista ordenada.
6. **Los 4 cursos existentes** como datos de prueba, en
   `referencia/cursos-prototipo/`: `git-esencial` usa casi todos los tipos.
7. Las variables de diseño en `:root` (`--primary`, `--surface`, `--radius`,
   ...) como punto de partida de los tokens de la web.

## Qué no se hereda

| Problema del prototipo | En Brote |
|---|---|
| Sin usuarios: progreso global, cualquiera edita cualquier curso | Cuentas desde el MVP, cursos con autor (F01) |
| Archivos en disco como base de datos | PostgreSQL; actividades en JSONB |
| Contenido insertado con `innerHTML` sin escapar (XSS) | Contenido de usuario nunca como HTML sin sanear (principio III) |
| Los JSON de lección no se validan | El backend valida cada actividad contra el contrato |
| Un `style.css` de 2,150 líneas | CSS Modules por componente + tokens |
| Campos complejos del editor como JSON crudo | Formularios propios por tipo, cuando se especifique cada uno |
| Sin estados de carga ni error | Estados explícitos (principio V) |
| Nombres en inglés (`type`, `answer`) | Contrato en español (`tipo`, `respuesta`). Cómo se convierten los cursos del prototipo se decide en la spec de importación (F07) |
