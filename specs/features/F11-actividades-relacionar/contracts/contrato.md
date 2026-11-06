# Cambios al contrato: F11

**Versión**: `contrato/VERSION` pasa de `0.7.0` a `0.8.0` (menor: tipos y constantes
nuevos, y `LIMITES_ACTIVIDADES` y `MENSAJES_EDITOR` ganan claves; nada se quita).

Al copiarlo, los tres repos dejan de compilar hasta tener las entradas nuevas de sus
`Record`: `validadores` en el backend, `registroActividades` en los dos clientes y
`registroEditor` en la web. Es lo que busca el principio IV.

## Cambia: las actividades

En la sección "Lecciones y actividades (F03)":

```diff
 export type EspacioRespuesta = {
-  aceptadas: string[]; // la primera es la que se muestra como respuesta esperada
+  // en completar espacios, la primera es la que se muestra como respuesta esperada;
+  // en el banco de palabras, son textos de `fichas`
+  aceptadas: string[];
 };
```

```diff
 export type ActividadPreguntaAbierta = {
   tipo: "preguntaAbierta";
   pregunta: string;
   solucion: string;
 };

+export type ParejaEmparejar = {
+  izquierda: string;
+  derecha: string;
+};
+
+export type ActividadEmparejar = {
+  tipo: "emparejar";
+  consigna?: string; // sin ella, CONSIGNA_POR_DEFECTO
+  parejas: ParejaEmparejar[]; // la izquierda va en este orden; los clientes mezclan la derecha
+};
+
+export type ElementoClasificar = {
+  texto: string;
+  categoria: number; // índice en `categorias`
+};
+
+export type ActividadClasificar = {
+  tipo: "clasificar";
+  consigna?: string; // sin ella, CONSIGNA_POR_DEFECTO
+  categorias: string[]; // en el orden del autor
+  elementos: ElementoClasificar[]; // los clientes los mezclan
+};
+
+export type ActividadOrdenar = {
+  tipo: "ordenar";
+  consigna: string;
+  elementos: string[]; // en el orden correcto; los clientes los mezclan
+};
+
+export type ActividadBancoPalabras = {
+  tipo: "bancoPalabras";
+  consigna?: string; // sin ella, CONSIGNA_POR_DEFECTO
+  texto: string; // cada MARCA_ESPACIO es un espacio, en orden
+  fichas: string[]; // recortadas; se pueden repetir; los clientes las mezclan
+  espacios: EspacioRespuesta[]; // uno por cada MARCA_ESPACIO del texto
+};
+
 export type Actividad =
   | ActividadTeoria
   | ActividadTarjeta
   | ActividadOpcionMultiple
   | ActividadCompletarEspacios
-  | ActividadPreguntaAbierta;
+  | ActividadPreguntaAbierta
+  | ActividadEmparejar
+  | ActividadClasificar
+  | ActividadOrdenar
+  | ActividadBancoPalabras;
```

Los identificadores de `tipo` son los que ya usa la paleta de la web (research de F05,
punto 10): con ellos, cada entrada se activa sola al llegar a `registroEditor`.

## Se agrega: los textos por defecto

Después de `MARCA_ESPACIO`:

```ts
// Lo que ve el alumno en una actividad sin consigna (F11). Ordenar siempre trae la suya.
export const CONSIGNA_POR_DEFECTO = {
  emparejar: "Empareja los conceptos",
  clasificar: "Clasifica cada elemento",
  bancoPalabras: "Completa con las fichas del banco",
} as const;
```

## Cambia: `LIMITES_ACTIVIDADES`

```diff
   textoEspaciosMax: 2000,
   espaciosMax: 20,
   aceptadasMax: 10,
   solucionMax: 2000,
+  // actividades de relacionar (F11)
+  consignaMax: 500,
+  parejasMin: 3, // con 2, la regla de que nunca salen resueltas delataría la respuesta
+  parejasMax: 8,
+  parejaTextoMax: 200,
+  categoriasMin: 2,
+  categoriasMax: 4,
+  categoriaMax: 100,
+  elementosClasificarMin: 2,
+  elementosClasificarMax: 12,
+  elementoClasificarMax: 100,
+  elementosOrdenarMin: 3, // igual que parejasMin
+  elementosOrdenarMax: 10,
+  elementoOrdenarMax: 200,
+  espaciosBancoMax: 10,
+  fichasMin: 2,
+  fichasMax: 20,
+  fichaMax: 100,
 } as const;
```

`textoEspaciosMax` sirve también para el texto del banco de palabras.

## Cambia: `CALIFICA_ACTIVIDAD`

```diff
   opcionMultiple: true,
   completarEspacios: true,
   preguntaAbierta: true,
+  emparejar: true,
+  clasificar: true,
+  ordenar: true,
+  bancoPalabras: true,
 };
```

## Cambia: `MENSAJES_EDITOR`

```diff
   gruposDeMas: "Hay más grupos de respuestas que espacios en el texto. Quita los que sobran.",
+  // actividades de relacionar (F11)
+  textoRepetido: "Este texto está repetido.",
+  categoriaRepetida: "Esta categoría está repetida.",
+  elementoRepetido: "Este elemento está repetido.",
+  categoriaFalta: "Elige una categoría.",
+  categoriaSinElementos: "Esta categoría no tiene elementos.",
+  fichaFalta: "Marca al menos una ficha.",
+  demasiadosEspaciosBanco: "El texto puede tener hasta 10 espacios.",
+  fichasInsuficientes:
+    "No alcanzan las fichas para llenar todos los espacios. Si una palabra va en dos, agrégala dos veces.",
   maxLecciones: "Un curso puede tener hasta 100 lecciones.",
```

Sin rutas nuevas, así que no hay tipos de cuerpos ni de respuestas nuevos.
