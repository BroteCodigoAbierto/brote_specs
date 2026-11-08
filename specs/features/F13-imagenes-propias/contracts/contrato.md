# Cambios al contrato: F13

**Versión**: `contrato/VERSION` pasa de `0.9.0` a `0.10.0` (menor: tipos y constantes
nuevos, y campos nuevos en tipos que ya existen; nada se quita).

Al copiarlo, los tres repos dejan de compilar donde leen `izquierda`, `derecha`, los
elementos de ordenar o de clasificar, y las opciones, como si siempre fueran texto: es lo
que se busca, para que ningún lugar se quede sin mostrar imágenes.

## Nuevo: imágenes (F13)

Una sección nueva, antes de "Lecciones y actividades (F03)", porque las actividades la
usan:

```ts
// ---------------------------------------------------------------------------
// Imágenes (F13)
// ---------------------------------------------------------------------------

export const FORMATOS_IMAGEN = ["jpeg", "png", "webp", "gif"] as const;

export type FormatoImagen = (typeof FORMATOS_IMAGEN)[number];

export const TIPO_MIME_IMAGEN: Record<FormatoImagen, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

// Una imagen subida a un curso. Nunca cambia: otro archivo es otra imagen.
export type Imagen = {
  id: string;
  formato: FormatoImagen;
  ancho: number; // px
  alto: number; // px
  peso: number; // bytes
};

// Una imagen dentro de una actividad. Al guardar, el servidor reescribe los datos de
// Imagen con los suyos; el texto alternativo es del autor.
export type ImagenActividad = Imagen & {
  textoAlternativo?: string;
};

// POST /editor/cursos/:idCurso/imagenes
export type RespuestaImagen = {
  imagen: Imagen;
};

// GET RUTA_IMAGENES/:idImagen trae los bytes
export const RUTA_IMAGENES = "/imagenes";

// Lugar de una imagen dentro de ActividadTeoria.texto
export const MARCA_IMAGEN = "[imagen]";

// Pesos en bytes (MB de 1024 × 1024); longitudes en caracteres Unicode
export const LIMITES_IMAGENES = {
  pesoMax: 10 * 1024 * 1024, // JPEG, PNG y WebP, antes y después de reducirlos
  pesoGifMax: 5 * 1024 * 1024,
  ladoMax: 1600, // la web reduce las que no son GIF a esto
  pesoCursoMax: 200 * 1024 * 1024,
  pesoLeccionMax: 25 * 1024 * 1024, // el alumno las trae todas al abrirla
  imagenesTeoriaMax: 5,
  textoAlternativoMax: 200,
} as const;

export const MENSAJES_IMAGENES = {
  formatoInvalido: "Elige una imagen JPEG, PNG, WebP o GIF.",
  portadaGif: "La portada puede ser JPEG, PNG o WebP.",
  imagenPesada: "La imagen puede pesar hasta 10 MB.",
  gifPesado: "Un GIF puede pesar hasta 5 MB.",
  imagenIlegible: "No se pudo leer la imagen. Elige otra.",
  imagenGrande: "La imagen puede medir hasta 1600 px por lado.", // solo sin la web
  // solo sin la web: el editor le quita los datos ocultos y deja quieta una animación
  imagenSinPreparar: "La imagen trae datos ocultos o una animación. Súbela desde el editor de Brote.",
  cursoLleno: "Este curso ya tiene 200 MB de imágenes. Quita alguna y guarda para hacer espacio.",
  leccionPesada: "Las imágenes de esta lección pesan más de 25 MB. Quita alguna.",
  subidaFallida: "No se pudo subir la imagen. Inténtalo de nuevo.",
  esperarSubidas: "Espera a que terminen de subir las imágenes.",
  imagenFalta: "Elige una imagen.",
  imagenRepetida: "Esta imagen está repetida.",
  imagenNoEsta: "Esta imagen ya no está. Elige otra.",
  demasiadasImagenes: "El texto puede tener hasta 5 imágenes.",
  imagenesDeMas: "Hay más imágenes que marcas [imagen] en el texto. Quita las que sobran.",
  sinCargar: "No se pudo cargar la imagen",
  // GET /imagenes/:idImagen: mismo mensaje si no existe o no se puede ver
  imagenNoDisponible: "Esta imagen no existe o ya no está disponible.",
} as const;
```

## Cambia: las actividades

```diff
 export type ActividadTeoria = {
   tipo: "teoria";
   titulo?: string;
-  texto: string; // párrafos separados por un renglón en blanco
+  texto: string; // párrafos separados por un renglón en blanco; cada MARCA_IMAGEN, una imagen
   codigo?: string; // bloque de código; las líneas con +, - o @@ se leen como diff
   puntosClave?: string[];
+  imagenes?: ImagenActividad[]; // F13: una por cada MARCA_IMAGEN del texto, en orden
 };
```

```diff
-// Una opción es un texto o un símbolo que se muestra en grande (p. ej. "あ").
-export type OpcionRespuesta = { texto: string } | { simbolo: string };
+// Una opción es un texto, un símbolo que se muestra en grande (p. ej. "あ") o, desde F13,
+// una imagen. Todas las de una pregunta son de la misma forma.
+export type OpcionRespuesta = { texto: string } | { simbolo: string } | { imagen: ImagenActividad };

 export type ActividadOpcionMultiple = {
   tipo: "opcionMultiple";
   pregunta: string;
+  imagen?: ImagenActividad; // F13: la de la pregunta
   codigo?: string;
```

```diff
+// Un elemento de relacionar: un texto o, desde F13, una imagen. Toda una columna de
+// emparejar, y todos los elementos de ordenar, son de la misma forma.
+export type ContenidoElemento = string | ImagenActividad;
+
 export type ParejaEmparejar = {
-  izquierda: string;
-  derecha: string;
+  izquierda: ContenidoElemento;
+  derecha: ContenidoElemento;
 };
```

```diff
-export type ElementoClasificar = {
-  texto: string;
-  categoria: number; // índice en `categorias`
-};
+// Todos de texto o, desde F13, todos de imagen.
+export type ElementoClasificar =
+  | { texto: string; categoria: number } // índice en `categorias`
+  | { imagen: ImagenActividad; categoria: number };
```

```diff
 export type ActividadOrdenar = {
   tipo: "ordenar";
   consigna: string;
-  elementos: string[]; // en el orden correcto; los clientes los mezclan
+  elementos: ContenidoElemento[]; // en el orden correcto; los clientes los mezclan
 };
```

## Cambia: los cursos

```diff
 export type ResumenCurso = {
   id: string;
   titulo: string;
   descripcion: string;
   autor: AutorCurso;
   cantidadLecciones: number;
+  idPortada: string | null; // F13: sin ella, la portada generada
 };
```

```diff
 export type CursoDelAutor = {
   id: string;
   titulo: string;
   estado: EstadoCurso;
   revisionRechazada: boolean;
   cantidadLecciones: number;
+  idPortada: string | null; // F13
 };

 // POST /editor/cursos y PUT /editor/cursos/:idCurso
 export type CuerpoDatosCurso = {
   titulo: string;
   descripcion: string;
+  // F13, solo en el PUT: sin él la portada no cambia; null la quita
+  idPortada?: string | null;
 };
```

```diff
 export type CursoEnEditor = {
   id: string;
   titulo: string;
   descripcion: string;
   estado: EstadoCurso;
   revisionRechazada: boolean;
   motivoRechazo: string | null; // puede haber rechazo sin motivo
+  portada: Imagen | null; // F13
+  pesoImagenes: number; // F13: bytes de todas sus imágenes, hasta LIMITES_IMAGENES.pesoCursoMax
   lecciones: LeccionEnMapa[]; // por posición
 };
```

## Lo que no cambia

- `CALIFICA_ACTIVIDAD`: ningún tipo nuevo; una actividad de imagen cuenta igual que una de
  texto.
- `LIMITES_ACTIVIDADES` y `MENSAJES_EDITOR`: los límites y mensajes de imágenes van en
  `LIMITES_IMAGENES` y `MENSAJES_IMAGENES`, para no mezclarlos con los de texto.
- `DetalleLeccion`, `CuerpoGuardarLeccion` y `LeccionEnEditor`: llevan las imágenes dentro
  de `actividades`.
