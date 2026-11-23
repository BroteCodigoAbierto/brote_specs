# Contrato: F08 Insignias por curso completado

Cambios a `contrato/contrato.ts`. `contrato/VERSION`: 0.11.0 → 0.12.0. Después,
`npm run contrato:copiar` y `npm run contrato:revisar`.

```ts
// ---------------------------------------------------------------------------
// Insignias (F08)
// ---------------------------------------------------------------------------

// Que el usuario completó un curso que daba insignia. Se dibuja con la portada del curso.
export type InsigniaCurso = {
  idCurso: string;
  titulo: string;
  idPortada: string | null; // la del curso; si no carga, la portada generada
  ganadaEn: string; // ISO 8601
};

// GET /usuarios/yo/insignias
export type RespuestaInsignias = {
  insignias: InsigniaCurso[]; // de la más reciente a la más antigua
};
```

```diff
 export type RespuestaProgresoLeccion = {
   progreso: ProgresoLeccion;
+  // F08: la insignia que ganó con esta lección; null si no ganó ninguna nueva
+  insigniaNueva: InsigniaCurso | null;
 };

 export type CuerpoDatosCurso = {
   titulo: string;
   descripcion: string;
   idPortada?: string | null;
   idioma?: IdiomaCurso;
+  // F08: sin él no cambia; el POST sin él crea el curso sin insignia
+  daInsignia?: boolean;
 };

 export type CursoEnEditor = {
   …
   idioma: IdiomaCurso; // F14
+  daInsignia: boolean; // F08
   estado: EstadoCurso;
   …
 };
```
