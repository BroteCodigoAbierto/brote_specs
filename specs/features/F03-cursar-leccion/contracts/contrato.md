# Cambios al contrato: F03

**Versión**: `contrato/VERSION` pasa de `0.3.0` a `0.4.0` (menor: tipos y
constantes nuevos, nada se quita ni cambia).

Se agrega al final de `contrato/contrato.ts`:

```ts
// ---------------------------------------------------------------------------
// Lecciones y actividades (F03)
// ---------------------------------------------------------------------------

// Cada tipo de actividad es una variante identificada por `tipo`
// (constitución, principio IV). Agregar un tipo es: su variante aquí, su
// validación en el backend y su componente en la web y en el móvil.

export type ActividadTeoria = {
  tipo: "teoria";
  titulo?: string;
  texto: string; // párrafos separados por un renglón en blanco
  codigo?: string; // bloque de código; las líneas con +, - o @@ se leen como diff
  puntosClave?: string[];
};

export type ActividadTarjeta = {
  tipo: "tarjeta";
  frente: string;
  reverso: string;
};

// Una opción es un texto o un símbolo que se muestra en grande (p. ej. "あ").
export type OpcionRespuesta = { texto: string } | { simbolo: string };

export type ActividadOpcionMultiple = {
  tipo: "opcionMultiple";
  pregunta: string;
  codigo?: string;
  opciones: OpcionRespuesta[]; // en el orden del autor; los clientes las mezclan
  correcta: number; // índice en `opciones`
};

export type EspacioRespuesta = {
  aceptadas: string[]; // la primera es la que se muestra como respuesta esperada
};

export type ActividadCompletarEspacios = {
  tipo: "completarEspacios";
  texto: string; // cada MARCA_ESPACIO es un espacio, en orden
  espacios: EspacioRespuesta[]; // uno por cada MARCA_ESPACIO del texto
};

export type ActividadPreguntaAbierta = {
  tipo: "preguntaAbierta";
  pregunta: string;
  solucion: string;
};

export type Actividad =
  | ActividadTeoria
  | ActividadTarjeta
  | ActividadOpcionMultiple
  | ActividadCompletarEspacios
  | ActividadPreguntaAbierta;

export type TipoActividad = Actividad["tipo"];

// La lección que se cursa: lo del resumen más sus actividades, en orden.
export type DetalleLeccion = ResumenLeccion & {
  actividades: Actividad[];
};

export type RespuestaLeccion = {
  leccion: DetalleLeccion;
};

// Marca de un espacio dentro de ActividadCompletarEspacios.texto
export const MARCA_ESPACIO = "___";

// Longitudes en caracteres Unicode: Array.from(texto).length
export const LIMITES_ACTIVIDADES = {
  opcionesMin: 2,
  opcionesMax: 9, // en la web se eligen con las teclas 1 a 9
  respuestaEspacioMax: 100,
  respuestaAbiertaMax: 2000,
} as const;

export const MENSAJES_LECCION = {
  // mismo mensaje si la lección no existe, es de otro curso o su curso no está publicado
  leccionNoDisponible: "Esta lección no existe o ya no está disponible.",
} as const;
```

## Por qué así

- **Nombres de los tipos**: `teoria`, `tarjeta`, `opcionMultiple`,
  `completarEspacios` y `preguntaAbierta`, en `camelCase` como `enRevision`
  (`docs/estilo-codigo.md`). Los campos traducen los del prototipo
  (research.md, punto 6).
- **`OpcionRespuesta` sin discriminante**: un texto y un símbolo se
  distinguen con `"simbolo" in opcion`. Cuando lleguen las opciones con
  imagen, se agrega `{ imagen, descripcion }` a la unión sin tocar las otras
  dos.
- **`correcta` es un índice** en el orden del autor. Cada cliente mezcla las
  opciones al mostrarlas y compara con el índice original (research.md,
  punto 3).
- **`MARCA_ESPACIO` en lugar de partes**: el texto con `___` es como lo
  escribía el prototipo y como lo escribirá un autor en el editor (F05). El
  backend comprueba que haya tantas marcas como `espacios`.
- **Las respuestas viajan al cliente** (`correcta`, `aceptadas`,
  `solucion`): el cliente califica, sin pedir nada al servidor (research.md,
  punto 2).
- **Las actividades no tienen `id`**: se identifican por su lugar en la
  lección. Si F05 o F09 necesitan un identificador estable, lo agregan como
  campo opcional.
- **`DetalleLeccion` no trae el curso**: el cliente ya lo tiene en la
  dirección, y la pantalla no muestra datos del curso.
- `LIMITES_ACTIVIDADES` lo usan el backend (validación) y los clientes
  (`maxLength`). Los límites de longitud de cada texto los define F05.
- Los textos que solo muestran los clientes ("Comprobar", "¡Correcto!",
  "¿Salir de la lección?", ...) no van al contrato, igual que en F01 y F02.
  `leccionNoDisponible` sí va, porque es el cuerpo del 404.
