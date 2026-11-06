# Cambios al contrato: F12

**Versión**: `contrato/VERSION` pasa de `0.8.0` a `0.9.0` (menor: tipos y constantes
nuevos, y `LIMITES_ACTIVIDADES`, `CALIFICA_ACTIVIDAD` y `MENSAJES_EDITOR` ganan claves; nada
se quita).

Al copiarlo, los tres repos dejan de compilar hasta tener las entradas nuevas de sus
`Record`: `validadores` en el backend, `registroActividades` en los dos clientes y
`registroEditor` en la web. Es lo que busca el principio IV.

## Cambia: las actividades

En la sección "Lecciones y actividades (F03)", después de `ActividadBancoPalabras`:

```diff
+// Los lenguajes de un reto de código (F12). Solo se muestran como etiqueta: no hay
+// coloreado de sintaxis.
+export const LENGUAJES_CODIGO = [
+  "c",
+  "css",
+  "html",
+  "javascript",
+  "python",
+  "sql",
+  "bash",
+  "otro",
+] as const;
+
+export type LenguajeCodigo = (typeof LENGUAJES_CODIGO)[number];
+
+// Cómo se escribe cada uno. "otro" no se muestra al alumno.
+export const NOMBRE_LENGUAJE: Record<LenguajeCodigo, string> = {
+  c: "C",
+  css: "CSS",
+  html: "HTML",
+  javascript: "JavaScript",
+  python: "Python",
+  sql: "SQL",
+  bash: "Bash",
+  otro: "Otro",
+};
+
+export type ActividadRetoCodigo = {
+  tipo: "retoCodigo";
+  consigna: string;
+  lenguaje: LenguajeCodigo;
+  codigoInicial?: string; // con lo que empieza el campo; sin él, vacío
+  solucion: string; // se muestra al comprobar; el alumno se autoevalúa
+};
+
+export type ActividadTerminalSimulada = {
+  tipo: "terminalSimulada";
+  consigna: string;
+  carpeta?: string; // va antes del $
+  salidaPrevia?: string; // lo que la terminal ya muestra
+  comandos: string[]; // las formas aceptadas; la primera se muestra como respuesta correcta
+  salidaAcierto?: string; // se muestra si acierta
+  pista?: string; // se muestra si falla
+};
+
+export type CommitGrafo = {
+  nombre: string;
+  padres: number[]; // índices de commits anteriores: ninguno el primero, dos un merge
+};
+
+export type RamaGrafo = {
+  nombre: string;
+  commit: number; // índice en `commits`
+};
+
+// HEAD apunta a una rama o, suelto, a un commit.
+export type HeadGrafo = { rama: number } | { commit: number };
+
+export type ActividadGrafoCommits = {
+  tipo: "grafoCommits";
+  consigna: string;
+  commits: CommitGrafo[]; // del más antiguo al más nuevo; los clientes los acomodan
+  ramas: RamaGrafo[]; // en el orden del autor: una fila por rama, de arriba abajo
+  head?: HeadGrafo;
+  respuesta: number; // índice en `commits`
+  explicacion?: string; // se muestra al comprobar, acierte o no
+};
+
 export type Actividad =
   | ActividadTeoria
   | ActividadTarjeta
   | ActividadOpcionMultiple
   | ActividadCompletarEspacios
   | ActividadPreguntaAbierta
   | ActividadEmparejar
   | ActividadClasificar
   | ActividadOrdenar
-  | ActividadBancoPalabras;
+  | ActividadBancoPalabras
+  | ActividadRetoCodigo
+  | ActividadTerminalSimulada
+  | ActividadGrafoCommits;
```

`head` y `respuesta` son índices, como `correcta` en la opción múltiple y `categoria` en
clasificar (research.md, punto 1).

## Cambia: `LIMITES_ACTIVIDADES`

```diff
   fichasMin: 2,
   fichasMax: 20,
   fichaMax: 100,
+  // actividades de código y terminal (F12); la consigna usa consignaMax, el código
+  // inicial codigoMax y la solución solucionMax
+  respuestaCodigoMax: 2000, // lo que escribe el alumno
+  carpetaMax: 100,
+  salidaMax: 2000,
+  comandosMax: 10,
+  comandoMax: 200, // también lo que escribe el alumno
+  pistaMax: 500,
+  commitsMin: 2,
+  commitsMax: 10,
+  nombreCommitMax: 4, // cabe dentro del círculo
+  columnasGrafoMax: 6, // con áreas de 44 px, cabe en un teléfono de 360 px
+  ramasMax: 4,
+  nombreRamaMax: 20,
+  explicacionMax: 500,
 } as const;
```

## Cambia: `CALIFICA_ACTIVIDAD`

```diff
   ordenar: true,
   bancoPalabras: true,
+  retoCodigo: true,
+  terminalSimulada: true,
+  grafoCommits: true,
 };
```

## Cambia: `MENSAJES_EDITOR`

```diff
   fichasInsuficientes:
     "No alcanzan las fichas para llenar todos los espacios. Si una palabra va en dos, agrégala dos veces.",
+  // actividades de código y terminal (F12)
+  lenguajeFalta: "Elige un lenguaje.",
+  comandoRepetido: "Este comando está repetido.",
+  nombreCommitRepetido: "Este nombre ya lo tiene otro commit.",
+  padreFalta: "Elige un padre.",
+  segundoPadreIgual: "El segundo padre tiene que ser otro commit.",
+  demasiadasColumnas:
+    "El grafo puede tener hasta 6 commits seguidos de izquierda a derecha. Pon alguno en paralelo o quita alguno.",
+  ramaRepetida: "Esta rama está repetida.",
+  ramaHead: "Una rama no se puede llamar HEAD.",
+  commitFalta: "Elige un commit.",
+  respuestaFalta: "Elige la respuesta.",
   maxLecciones: "Un curso puede tener hasta 100 lecciones.",
```

Sin rutas nuevas, así que no hay tipos de cuerpos ni de respuestas nuevos.

## Lo que no va en el contrato

Son lógica o textos de un solo cliente, y el contrato solo lleva tipos y constantes:

- `normalizarComando` y `comandoAceptado`: copias en los tres repos (research.md, punto 6).
- `contarColumnas` (backend) y `acomodarGrafo` (los dos clientes): research.md, punto 2.
- `textoTecleado` (los dos clientes): research.md, punto 5.
- "Tab agrega dos espacios. Para salir del campo, pulsa Esc y luego Tab.": solo existe en la
  web, junto al campo.
