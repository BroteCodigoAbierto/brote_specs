# Cambios al contrato: F05

**Versión**: `contrato/VERSION` pasa de `0.5.0` a `0.6.0` (menor: tipos y
constantes nuevos, y `LIMITES_ACTIVIDADES` gana claves; nada se quita).

## Cambia: `LIMITES_ACTIVIDADES`

En la sección "Lecciones y actividades (F03)":

```diff
 // Longitudes en caracteres Unicode: Array.from(texto).length
 export const LIMITES_ACTIVIDADES = {
   opcionesMin: 2,
   opcionesMax: 9, // en la web se eligen con las teclas 1 a 9
   respuestaEspacioMax: 100,
   respuestaAbiertaMax: 2000,
+  // lo que escribe el autor (F05)
+  tituloMax: 100,
+  textoMax: 5000,
+  codigoMax: 2000,
+  puntosClaveMax: 10,
+  puntoClaveMax: 200,
+  frenteMax: 200,
+  reversoMax: 1000,
+  preguntaMax: 500,
+  opcionTextoMax: 200,
+  opcionSimboloMax: 4,
+  textoEspaciosMax: 2000,
+  espaciosMax: 20,
+  aceptadasMax: 10,
+  solucionMax: 2000,
 } as const;
```

`respuestaEspacioMax` sirve también para las respuestas aceptadas: lo que el alumno
escribe en un espacio y lo que el autor acepta tienen el mismo largo.

## Se agrega al final de `contrato/contrato.ts`

```ts
// ---------------------------------------------------------------------------
// Editor de cursos (F05)
// ---------------------------------------------------------------------------

// F06 agrega "enRevision".
export type EstadoCurso = "borrador" | "publicado";

// Un curso en "Cursos que creé".
export type CursoDelAutor = {
  id: string;
  titulo: string;
  estado: EstadoCurso;
  cantidadLecciones: number;
};

export type RespuestaCursosDelAutor = {
  cursos: CursoDelAutor[]; // del que cambió más recientemente al más antiguo
};

// POST /editor/cursos y PUT /editor/cursos/:idCurso
export type CuerpoDatosCurso = {
  titulo: string;
  descripcion: string;
};

// Una lección en el mapa del curso.
export type LeccionEnMapa = ResumenLeccion & {
  cantidadActividades: number;
};

export type CursoEnEditor = {
  id: string;
  titulo: string;
  descripcion: string;
  lecciones: LeccionEnMapa[]; // por posición
};

export type RespuestaCursoEnEditor = {
  curso: CursoEnEditor;
};

// POST /editor/cursos/:idCurso/lecciones
export type CuerpoNuevaLeccion = {
  titulo: string;
};

export type RespuestaLeccionEnMapa = {
  leccion: LeccionEnMapa;
};

// PUT /editor/cursos/:idCurso/lecciones-orden
export type CuerpoOrdenLecciones = {
  idsLecciones: string[]; // todas las del curso, en el orden nuevo
};

// La lección que se edita. `version` sube cada vez que se guarda.
export type LeccionEnEditor = DetalleLeccion & {
  version: number;
};

export type RespuestaLeccionEnEditor = {
  leccion: LeccionEnEditor;
};

// PUT /editor/cursos/:idCurso/lecciones/:idLeccion
export type CuerpoGuardarLeccion = {
  titulo: string;
  actividades: Actividad[];
  version: number; // la que el autor abrió
  reemplazar?: boolean; // true: guarda aunque haya una versión más nueva
};

// Longitudes en caracteres Unicode: Array.from(texto).length
export const LIMITES_CURSO = {
  tituloMax: 100,
  descripcionMax: 1000,
  leccionesMax: 100,
} as const;

export const LIMITES_LECCION = {
  tituloMax: 100,
  actividadesMax: 50,
} as const;

export const MENSAJES_EDITOR = {
  datosInvalidos: "Revisa los datos marcados.",
  campoObligatorio: "Este campo es obligatorio.",
  // solo lo ve quien salta al cliente: los campos no dejan escribir de más
  textoLargo: "Este texto es más largo de lo permitido.",
  opcionRepetida: "Esta opción está repetida.",
  opcionCorrectaFalta: "Elige la opción correcta.",
  simboloLargo: "Un símbolo puede tener hasta 4 caracteres.",
  sinEspacios: "Agrega al menos un espacio con ___.",
  demasiadosEspacios: "El texto puede tener hasta 20 espacios.",
  gruposDeMas: "Hay más grupos de respuestas que espacios en el texto. Quita los que sobran.",
  maxLecciones: "Un curso puede tener hasta 100 lecciones.",
  maxActividades: "Una lección puede tener hasta 50 actividades.",
  // al abrir (403); al abrir, un 404 usa los mensajes de F02 y F03
  cursoPublicado: "Este curso ya está publicado y por ahora no se puede editar.",
  // al escribir (403 y 404)
  cursoPublicadoAlGuardar:
    "Este curso ya está publicado y por ahora no se puede editar. Tus cambios no se guardaron.",
  cursoEliminado: "Este curso ya no existe. Tus cambios no se guardaron.",
  leccionEliminada: "Esta lección ya no existe. Tus cambios no se guardaron.",
  // 409
  versionMasNueva: "Se guardó una versión más nueva de esta lección.",
  ordenDesactualizado: "El orden no coincide con las lecciones del curso.",
} as const;
```

Se quedan en la web, porque el servidor no los usa: los textos de los diálogos, los
avisos ("Lección guardada", "Cambios sin guardar", "Modo de prueba: esto no cuenta
como progreso.") y los errores de red de cada acción ("No se pudo guardar la
lección. Tus cambios siguen aquí.").

Los tipos del borrador (research.md, punto 8) tampoco entran: nunca viajan.

## Los tres repos reciben la copia

`npm run contrato:copiar` escribe en `brote_mobile_expo` aunque el móvil no use nada
de esto: `contrato:revisar` compara las tres copias.
