# Cambios al contrato: F02

**Versión**: `contrato/VERSION` pasa de `0.2.0` a `0.3.0` (menor: tipos y
constantes nuevos, nada se quita ni cambia).

Se agrega al final de `contrato/contrato.ts`:

```ts
// ---------------------------------------------------------------------------
// Catálogo de cursos (F02)
// ---------------------------------------------------------------------------

export type AutorCurso = {
  id: string;
  nombre: string; // nombre para mostrar actual del usuario
};

// Lo que muestra la tarjeta de un curso en el catálogo.
export type ResumenCurso = {
  id: string;
  titulo: string;
  descripcion: string;
  autor: AutorCurso;
  cantidadLecciones: number;
};

export type ResumenLeccion = {
  id: string;
  titulo: string;
  posicion: number; // 1, 2, 3, ... en el orden del curso
};

// El detalle agrega la lista de lecciones, ordenadas por posición.
export type DetalleCurso = ResumenCurso & {
  lecciones: ResumenLeccion[];
};

export type RespuestaCatalogo = {
  cursos: ResumenCurso[];
  // se manda tal cual en ?despues= para pedir los siguientes; null si ya no hay más
  siguiente: string | null;
};

export type RespuestaCurso = {
  curso: DetalleCurso;
};

// Longitud de la búsqueda en caracteres Unicode: Array.from(texto).length
export const LIMITES_CATALOGO = {
  busquedaMax: 100,
  cursosPorCarga: 10,
} as const;

export const MENSAJES_CATALOGO = {
  busquedaLarga: "La búsqueda puede tener hasta 100 caracteres.",
  cargaInvalida: "No se pudieron cargar más cursos. Vuelve a buscar.",
  // mismo mensaje si el curso no existe o no está publicado
  cursoNoDisponible: "Este curso no existe o ya no está disponible.",
} as const;
```

## Por qué así

- `ResumenCurso` no lleva `publicado` ni fechas: el cliente solo recibe
  cursos publicados, y el orden ya viene del servidor.
- `autor` es un objeto con `id` aunque F02 solo muestra el nombre. Agregarlo
  después cambiaría el tipo de un campo existente, lo que sería un cambio
  mayor del contrato.
- `siguiente` es opaco para los clientes: no lo interpretan ni lo construyen
  (research.md, punto 4).
- `LIMITES_CATALOGO.busquedaMax` lo usan el servidor (validación) y los
  clientes (`maxLength`). `cursosPorCarga` documenta el tamaño fijo; solo lo
  usa el servidor.
- Los textos que solo muestran los clientes ("Todavía no hay cursos
  publicados.", "Ver más", ...) no van al contrato, igual que en F01.
  `cursoNoDisponible` sí va, porque es el cuerpo del 404 y además el texto que
  muestran los dos clientes.
- `cargaInvalida` es el error de un `?despues=` que no se puede leer. Un
  cliente no debería recibirlo nunca, porque siempre devuelve el cursor que
  le dio el servidor.

## Después de editar

```bash
npm run contrato:copiar && npm run contrato:revisar   # desde brote_specs
```

Las copias van en la rama `feature/F02-explorar-catalogo` de cada repo.
