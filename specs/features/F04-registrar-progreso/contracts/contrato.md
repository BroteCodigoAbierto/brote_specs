# Cambios al contrato: F04

**Versión**: `contrato/VERSION` pasa de `0.4.0` a `0.5.0` (menor: tipos y
constantes nuevos, y `DetalleCurso.lecciones` gana un campo; nada se quita).

## Cambia: `DetalleCurso`

Cada lección del detalle trae el progreso de quien pregunta (research.md,
punto 5). En la sección "Catálogo de cursos (F02)":

```diff
 // El detalle agrega la lista de lecciones, ordenadas por posición.
+// Desde F04, cada lección trae el progreso de quien pregunta.
 export type DetalleCurso = ResumenCurso & {
-  lecciones: ResumenLeccion[];
+  lecciones: LeccionDelCurso[];
 };
```

`ResumenLeccion` no cambia: `DetalleLeccion` (F03) lo sigue usando tal cual.

## Se agrega al final de `contrato/contrato.ts`

```ts
// ---------------------------------------------------------------------------
// Progreso (F04)
// ---------------------------------------------------------------------------

// Qué tipos de actividad son preguntas: cuentan en "Acertaste {a} de {p}" y
// en el progreso. Al ser un Record, agregar un tipo a `Actividad` obliga a
// decidir aquí si se califica (principio IV).
export const CALIFICA_ACTIVIDAD: Record<TipoActividad, boolean> = {
  teoria: false,
  tarjeta: false,
  opcionMultiple: true,
  completarEspacios: true,
  preguntaAbierta: true,
};

// La última vez que el alumno completó una lección.
export type ProgresoLeccion = {
  aciertos: number;
  preguntas: number; // 0 si la lección no tiene preguntas
  completadaEn: string; // ISO 8601
};

// Una lección en el detalle del curso, con el progreso de quien pregunta
// (null si no la ha completado).
export type LeccionDelCurso = ResumenLeccion & {
  progreso: ProgresoLeccion | null;
};

// PUT /cursos/:idCurso/lecciones/:idLeccion/progreso
export type CuerpoProgresoLeccion = {
  aciertos: number;
  preguntas: number;
};

export type RespuestaProgresoLeccion = {
  progreso: ProgresoLeccion;
};

// Un curso con al menos una lección completada por quien pregunta.
export type CursoEmpezado = ResumenCurso & {
  leccionesCompletadas: number; // de cantidadLecciones
  ultimoAvanceEn: string; // ISO 8601: la última lección completada, ordena la lista
};

export type RespuestaCursosEmpezados = {
  cursos: CursoEmpezado[]; // del avance más reciente al más antiguo
};

export const MENSAJES_PROGRESO = {
  // el cuerpo no es un resultado válido, o no corresponde a la lección
  resultadoInvalido: "El resultado no corresponde a la lección.",
} as const;
```

El 404 de `PUT .../progreso` reutiliza `MENSAJES_LECCION.leccionNoDisponible`
(F03): una lección que no se puede abrir tampoco se puede registrar.

## Lo que no va en el contrato

Los textos que solo muestran los clientes ("Guardando tu progreso…",
"Progreso guardado", "No se pudo guardar tu progreso.", "Sin conexión. Tu
progreso no se guardó.", "Esta lección ya no está disponible. Tu progreso no
se guardó.", "{c} de {t} lecciones", "Curso terminado", ...) viven en cada
cliente, como los de F03. El servidor no los manda.

## Qué cambia en cada repo al copiarlo

- **backend**: `aDetalleCurso` tiene que llenar `progreso` en cada lección
  (no compila sin él).
- **web y móvil**: compilan sin cambios, porque `LeccionDelCurso` extiende
  `ResumenLeccion`; el progreso se empieza a usar en el detalle.
