# Cambios al contrato: F14

**Versión**: `contrato/VERSION` pasa de `0.10.0` a `0.11.0` (menor: tipos y constantes
nuevos, campos nuevos y, como el contrato todavía no llega a 1.0, tres cosas de F13 que se
mueven o cambian de nombre, abajo).

Al copiarlo, los tres repos dejan de compilar donde usaban `LIMITES_IMAGENES.pesoCursoMax`,
`pesoLeccionMax`, `MENSAJES_IMAGENES.cursoLleno`, `leccionPesada`, `esperarSubidas` y
`CursoEnEditor.pesoImagenes`, y en cada registro `tipo → componente` o `tipo → editor` que
no tenga `escucharRepetir`. Es lo que se busca: ningún texto se queda diciendo "imágenes" y
ningún cliente se queda sin el tipo nuevo.

## Nuevo: idiomas (F14)

En "Catálogo (F02)", antes de `ResumenCurso`:

```ts
// El idioma de un curso (F14): el de la voz que lee las frases de escuchar y repetir. Las
// etiquetas son de BCP 47, que entienden la voz y los lectores de pantalla.
export const IDIOMAS_CURSO = ["es", "en", "fr", "pt", "de", "it", "ja", "zh", "ko"] as const;

export type IdiomaCurso = (typeof IDIOMAS_CURSO)[number];

// Cómo se escribe en una lista o en "Idioma: {idioma}". Dentro de una frase, en minúsculas.
export const NOMBRE_IDIOMA: Record<IdiomaCurso, string> = {
  es: "Español",
  en: "Inglés",
  fr: "Francés",
  pt: "Portugués",
  de: "Alemán",
  it: "Italiano",
  ja: "Japonés",
  zh: "Chino",
  ko: "Coreano",
};

// La variante que se prefiere para la voz y para marcar la frase (spec F14, "Supuestos").
// Si el dispositivo no la tiene, cualquier voz del idioma.
export const ETIQUETA_VOZ: Record<IdiomaCurso, string> = {
  es: "es-MX",
  en: "en-US",
  fr: "fr-FR",
  pt: "pt-BR",
  de: "de-DE",
  it: "it-IT",
  ja: "ja-JP",
  zh: "zh-CN",
  ko: "ko-KR",
};
```

## Cambia: curso

```diff
 export type DetalleCurso = ResumenCurso & {
+  idioma: IdiomaCurso; // F14
   lecciones: LeccionDelCurso[];
 };
```

```diff
 // POST /editor/cursos y PUT /editor/cursos/:idCurso
 export type CuerpoDatosCurso = {
   titulo: string;
   descripcion: string;
   // F13, solo en el PUT: sin él la portada no cambia; null la quita
   idPortada?: string | null;
+  // F14: sin él no cambia; el POST sin él crea el curso en "es"
+  idioma?: IdiomaCurso;
 };
```

```diff
 export type CursoEnEditor = {
   id: string;
   titulo: string;
   descripcion: string;
+  idioma: IdiomaCurso; // F14
   estado: EstadoCurso;
   revisionRechazada: boolean;
   motivoRechazo: string | null;
   portada: Imagen | null; // F13
-  pesoImagenes: number; // F13: bytes de todas sus imágenes, hasta LIMITES_IMAGENES.pesoCursoMax
+  // F14: bytes de todas sus imágenes y sus audios, hasta LIMITES_ARCHIVOS.pesoCursoMax
+  pesoArchivos: number;
   lecciones: LeccionEnMapa[];
 };
```

## Nuevo: archivos y audios (F14)

Una sección después de "Imágenes (F13)":

```ts
// ---------------------------------------------------------------------------
// Archivos y audios (F14)
// ---------------------------------------------------------------------------

// Lo que comparten imágenes y audios (antes en LIMITES_IMAGENES y MENSAJES_IMAGENES).
export const LIMITES_ARCHIVOS = {
  pesoCursoMax: 200 * 1024 * 1024,
  pesoLeccionMax: 25 * 1024 * 1024, // el alumno los trae todos al abrirla
} as const;

export const MENSAJES_ARCHIVOS = {
  cursoLleno: "Este curso ya tiene 200 MB de archivos. Quita alguno y guarda para hacer espacio.",
  leccionPesada: "Los archivos de esta lección pesan más de 25 MB. Quita alguno.",
  esperarSubidas: "Espera a que terminen de subir los archivos.",
} as const;

export const FORMATOS_AUDIO = ["mp3", "m4a", "wav"] as const;

export type FormatoAudio = (typeof FORMATOS_AUDIO)[number];

// El que manda la web y con el que se sirve.
export const TIPO_MIME_AUDIO: Record<FormatoAudio, string> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
};

// Lo que acepta la subida: los navegadores no se ponen de acuerdo en cómo llamar a un M4A
// o a un WAV. El formato que cuenta es el de los bytes.
export const TIPOS_MIME_AUDIO_SUBIDA = [
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
] as const;

// Un audio de un curso, sin sus bytes.
export type Audio = {
  id: string;
  formato: FormatoAudio;
  duracion: number; // milisegundos
  peso: number; // bytes, ya sin sus datos ocultos
};

// POST /editor/cursos/:idCurso/audios
export type RespuestaAudio = {
  audio: Audio;
};

// GET /audios/:idAudio
export const RUTA_AUDIOS = "/audios";

export const LIMITES_AUDIOS = {
  pesoMax: 5 * 1024 * 1024, // el archivo que elige el autor
  duracionMax: 30_000, // ms; se compara redondeada a décimas
  grabacionMax: 30_000, // ms; lo que se graba el alumno
} as const;

export const MENSAJES_AUDIOS = {
  formatoInvalido: "Elige un audio MP3, M4A o WAV.",
  audioPesado: "El audio puede pesar hasta 5 MB.",
  audioLargo: "El audio puede durar hasta 30 segundos.",
  audioIlegible: "No se pudo leer el audio. Elige otro.",
  subidaFallida: "No se pudo subir el audio. Inténtalo de nuevo.",
  audioNoEsta: "Este audio ya no está. Elige otro.",
  audioNoDisponible: "Este audio no existe o ya no está disponible.",
  // al cursar
  sinCargar: "No se pudo cargar el audio",
  noSono: "No se pudo reproducir la frase. Inténtalo de nuevo.",
  sinVoz: "Este dispositivo no tiene una voz en {idioma} para leer la frase. Puedes instalar una en sus ajustes.", // {idioma} en minúsculas
  sinPermiso: "Brote no tiene permiso para usar el micrófono. Puedes seguir sin grabarte.",
  permitirWeb: "Para grabarte, permite el micrófono en los ajustes del navegador.",
  permitirMovil: "Para grabarte, permite el micrófono en los ajustes del teléfono.",
  sinMicrofono: "No se encontró un micrófono. Puedes seguir sin grabarte.",
} as const;
```

## Cambia: imágenes (F13)

```diff
 export const LIMITES_IMAGENES = {
   pesoMax: 10 * 1024 * 1024,
   pesoGifMax: 5 * 1024 * 1024,
   ladoMax: 1600,
-  pesoCursoMax: 200 * 1024 * 1024,
-  pesoLeccionMax: 25 * 1024 * 1024, // el alumno las trae todas al abrirla
   imagenesTeoriaMax: 5,
   textoAlternativoMax: 200,
 } as const;

 export const MENSAJES_IMAGENES = {
   ...
-  cursoLleno: "Este curso ya tiene 200 MB de imágenes. Quita alguna y guarda para hacer espacio.",
-  leccionPesada: "Las imágenes de esta lección pesan más de 25 MB. Quita alguna.",
   subidaFallida: "No se pudo subir la imagen. Inténtalo de nuevo.",
-  esperarSubidas: "Espera a que terminen de subir las imágenes.",
   ...
 } as const;
```

## Nuevo: la actividad escuchar y repetir

Después de `ActividadGrafoCommits`:

```ts
// Escuchar y repetir (F14): oye la frase (su audio o la voz del dispositivo, en el idioma
// del curso), la dice, se graba si quiere y se autoevalúa.
export type ActividadEscucharRepetir = {
  tipo: "escucharRepetir";
  frase: string; // de una línea
  mostrarTexto: boolean; // false: el alumno la ve al comprobar
  audio?: Audio; // sin él, la voz del dispositivo
};
```

```diff
 export type Actividad =
   | ...
   | ActividadTerminalSimulada
-  | ActividadGrafoCommits;
+  | ActividadGrafoCommits
+  | ActividadEscucharRepetir;
```

```diff
 // La lección que se cursa: lo del resumen más sus actividades, en orden.
 export type DetalleLeccion = ResumenLeccion & {
+  idioma: IdiomaCurso; // F14: el de su curso
   actividades: Actividad[];
 };
```

```diff
 export const CONSIGNA_POR_DEFECTO = { ... } as const;
+
+// Escuchar y repetir no lleva consigna del autor (F14).
+export const CONSIGNA_ESCUCHAR_REPETIR = "Escucha y repite.";
+
+// "Más lento" (F14), con la voz y con el audio propio.
+export const VELOCIDAD_LENTA = 0.6;
```

```diff
 export const LIMITES_ACTIVIDADES = {
   ...
   explicacionMax: 500,
+  // escuchar y repetir (F14)
+  fraseMax: 200,
 } as const;
```

```diff
 export const CALIFICA_ACTIVIDAD: Record<TipoActividad, boolean> = {
   ...
   grafoCommits: true,
+  escucharRepetir: true,
 };
```

`MENSAJES_EDITOR` no cambia: la frase vacía usa `campoObligatorio`.
