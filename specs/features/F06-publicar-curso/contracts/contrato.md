# Cambios al contrato: F06

**Versión**: `contrato/VERSION` pasa de `0.6.0` a `0.7.0` (menor: `EstadoCurso` gana un
valor, dos tipos ganan campos y `MENSAJES_EDITOR` gana claves y cambia dos textos; nada
se quita).

Todo está en la sección "Editor de cursos (F05)" de `contrato/contrato.ts`.

## Cambia: `EstadoCurso`

```diff
-// F06 agrega "enRevision".
-export type EstadoCurso = "borrador" | "publicado";
+export type EstadoCurso = "borrador" | "enRevision" | "publicado";
```

## Cambia: `CursoDelAutor`

```diff
 export type CursoDelAutor = {
   id: string;
   titulo: string;
   estado: EstadoCurso;
+  revisionRechazada: boolean; // la última revisión se rechazó; se va al enviarlo otra vez
   cantidadLecciones: number;
 };
```

## Cambia: `CursoEnEditor`

```diff
 export type CursoEnEditor = {
   id: string;
   titulo: string;
   descripcion: string;
+  estado: EstadoCurso;
+  revisionRechazada: boolean;
+  motivoRechazo: string | null; // puede haber rechazo sin motivo
   lecciones: LeccionEnMapa[]; // por posición
 };
```

## Cambia: `MENSAJES_EDITOR`

```diff
-  // al abrir (403); al abrir, un 404 usa los mensajes de F02 y F03
-  cursoPublicado: "Este curso ya está publicado y por ahora no se puede editar.",
+  // al abrir una lección (403); al abrir, un 404 usa los mensajes de F02 y F03
+  cursoPublicado: "Este curso está publicado y no se puede editar.",
+  cursoEnRevision: "Este curso está en revisión y no se puede editar.",
   // al escribir (403 y 404)
   cursoPublicadoAlGuardar:
-    "Este curso ya está publicado y por ahora no se puede editar. Tus cambios no se guardaron.",
+    "Este curso está publicado y no se puede editar. Tus cambios no se guardaron.",
+  cursoEnRevisionAlGuardar:
+    "Este curso está en revisión y no se puede editar. Tus cambios no se guardaron.",
   cursoEliminado: "Este curso ya no existe. Tus cambios no se guardaron.",
   leccionEliminada: "Esta lección ya no existe. Tus cambios no se guardaron.",
   // 409
   versionMasNueva: "Se guardó una versión más nueva de esta lección.",
   ordenDesactualizado: "El orden no coincide con las lecciones del curso.",
+  // enviar y retirar (F06): 404, 409 y 400
+  cursoNoExiste: "Este curso ya no existe.",
+  estadoCambiado: "El estado de este curso cambió en otro lugar.",
+  sinLecciones: "No se envió: el curso no tiene lecciones.",
+  unaLeccionVacia: "No se envió: hay 1 lección sin actividades.",
+  leccionesVacias: "No se envió: hay {n} lecciones sin actividades.", // {n} es 2 o más
 } as const;
```

## Sin cambios

`RespuestaCursoEnEditor` y `RespuestaCursosDelAutor`: las tres rutas nuevas responden
`RespuestaCursoEnEditor`, y no llevan cuerpo. `revision` no viaja: es un dato interno, y
los clientes solo necesitan `estado` y `revisionRechazada`.

## Copias

`npm run contrato:copiar` a los tres repos. El móvil no usa nada de esto: solo recibe la
copia, para que `npm run contrato:revisar` pase.
