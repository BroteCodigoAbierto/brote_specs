---
description: "Lista de tareas de F11 Actividades de relacionar"
---

# Tareas: F11 Actividades de relacionar

**Entrada**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md),
[contracts/api.md](./contracts/api.md), [contracts/contrato.md](./contracts/contrato.md),
[research.md](./research.md), [quickstart.md](./quickstart.md)
**Rama**: `feature/F11-actividades-relacionar`, creada desde `dev` en cada repo afectado

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase).
- Los límites, los mensajes y las consignas por defecto **siempre** salen del contrato
  (`LIMITES_ACTIVIDADES`, `MENSAJES_EDITOR`, `CONSIGNA_POR_DEFECTO`); ninguna tarea los
  escribe a mano.
- Toda pieza de interfaz usa los tokens y componentes de `docs/diseno.md`. Lo nuevo se
  agrega ahí primero (T003 y T004).
- Los textos de las actividades se muestran siempre como texto: nada de
  `dangerouslySetInnerHTML` (principio III).
- **Comunes a las cuatro actividades, en los dos clientes**:
  - Las reglas salen de `utilidades/relacionar.ts`. Un componente solo traduce un gesto a
    esas funciones: pulsar y soltar nunca llevan reglas propias (research.md, punto 1).
  - Se mezcla una sola vez, en el `useState` inicial, y cada elemento recuerda su índice
    original.
  - Toda acción, también seleccionar, llama a `alInteractuar`.
  - La barra es `BarraRespuesta`, como en la opción múltiple: "Comprobar" deshabilitado
    hasta que la respuesta está completa; después `correcto` con "¡Correcto!" o `incorrecto`
    con "Respuesta correcta:" y su detalle, y "Continuar" llama a `alTerminar` con
    `"acierto"` o `"fallo"`.
  - Después de comprobar, `deshabilitada` en todo: nada se pulsa ni se arrastra.
  - **Web**: `useArrastrarElemento`, con `alEmpezar` para quitar la selección; `propsRaiz` en
    la raíz de la actividad, `propsOrigen` en lo que se mueve y `propsDestino` en los
    destinos. `useFocoElementos`, con `raiz` en la raíz, `pedirFoco` solo al pulsar y `enfocar`
    en `BarraRespuesta`. Los sin colocar llevan `data-sin-colocar`, y todos, `data-elemento`.
    Un `<p className="oculto" aria-live="polite">` para los anuncios.
  - **Móvil**: `useArrastrarElemento`, con `alEmpezar` para quitar la selección; `arrastre` en
    `MarcoActividad`, `Arrastrable` en lo que se mueve y `DestinoArrastre` en los destinos.
    `onPress` se ignora mientras haya arrastre. Los anuncios van con
    `AccessibilityInfo.announceForAccessibility`.
- Textos fijos de la interfaz que no están en el contrato:
  - Nombres accesibles: `{texto}, seleccionado`, `{texto}, pareja {n}`, `{texto}, en
    {categoría}`, `{texto}, lugar {n}`, `{texto}, espacio {n}`, `Lugar {n}, vacío` y
    `Espacio {n}, vacío`. Al comprobar se agrega `, correcto` o `, incorrecto`.
  - Anuncios: `Pareja {n}: {izquierda} con {derecha}`, `{texto} en {categoría}`, `{texto} en
    el lugar {n}`, `{texto} en el espacio {n}` y `{texto} sin colocar`.
  - Formularios: "Consigna", "Agregar pareja", "Izquierda {n}", "Derecha {n}",
    "Categorías", "Agregar categoría", "Categoría {n}", "Elementos", "Agregar elemento",
    "Elemento {n}", "Elige una categoría", "Fichas", "Agregar ficha", "Ficha {n}",
    "Espacio {n}", "Quitar espacio" y "Agregar espacio".
  - Ayudas: las de la spec, en "Formulario de cada tipo".

---

## Fase 1: Preparación

- [X] T001 [specs] En `brote_specs`: desde `dev`, `git switch -c feature/F11-actividades-relacionar` y commitear `specs/features/F11-actividades-relacionar/` (spec, plan y artefactos). No incluir `specs/metodologia.txt`, que no es de esta feature
- [X] T002 [specs] En `contrato/contrato.ts`, aplicar [contracts/contrato.md](./contracts/contrato.md) tal cual: `EspacioRespuesta` (comentario), las cuatro variantes en `Actividad`, `CONSIGNA_POR_DEFECTO`, las claves nuevas de `LIMITES_ACTIVIDADES` y `MENSAJES_EDITOR`, y los cuatro `true` de `CALIFICA_ACTIVIDAD`. Subir `contrato/VERSION` de `0.7.0` a `0.8.0`
- [X] T003 [specs] En `docs/diseno.md`, sección 4, agregar de plan.md ("Lo que se agrega a docs/diseno.md"): a la tabla general, `ElementoRespuesta`, `LugarElemento` y `ZonaElementos`; a "Editor (solo web)", `CampoSelector` y `CampoConEspacios`. También `TextoConEspacios` y `CapaArrastre`, con la nota de que solo existen en el móvil. En la fila general de `BarraRespuesta`, la prop `enfocar` (solo en la web) y que el detalle se desplaza a partir de 11rem en la web y del 35 % del alto de la pantalla en el móvil
- [X] T004 [specs] En `docs/diseno.md`, sección 6, agregar de plan.md: **Emparejar**, **Clasificar**, **Ordenar**, **Banco de palabras** y **Arrastrar**. En "Teclado", a dónde va el foco al colocar, emparejar y devolver. En "Opciones", que emparejar y ordenar usan `ElementoRespuesta`
- [X] T005 [back] En `brote_backend_express`: `git switch dev && git pull --ff-only` y crear `feature/F11-actividades-relacionar` desde `dev`
- [X] T006 [P] [web] Igual que T005 en `brote_web_react`
- [X] T007 [P] [movil] Igual que T005 en `brote_mobile_expo`
- [X] T008 [specs] Copiar el contrato 0.8.0 a los tres repos: `npm run contrato:copiar` en brote_specs. Escribe `src/tipos/contrato.ts` en back, web y movil; cada copia se commitea en su repo. **A diferencia de F05, aquí `npm run tipos` deja de pasar** hasta tener las entradas de sus `Record`: en back con T012, en web con T029 y T038, y en movil con T054. Es lo que busca el principio IV

---

## Fase 2: Backend (brote_backend_express)

Todo lo de las reglas está en [data-model.md](./data-model.md) y en
[contracts/api.md](./contracts/api.md), "Qué rechaza cada tipo".

- [X] T009 [back] En `src/validacion/actividades.ts`, agregar las internas `listaEntre(valor, campo, minimo, maximo)` (es lista y su largo está en el rango), `textosSinRepetir(textos, campo)` (compara recortados, respetando las mayúsculas, como `compararOpciones`) y `contarMarcas(texto)` (que también use `validarCompletarEspacios`). Agregar `validarEmparejar`: `soloCampos` con `tipo`, `consigna` y `parejas`; `textoOpcional` para `consigna` con `consignaMax`; `parejas` "Entre 3 y 8" (`parejasMin`, `parejasMax`); cada pareja, objeto solo con `izquierda` y `derecha`, los dos "No vacío, de hasta 200" (`parejaTextoMax`); y "No se repite en su columna", con `textosSinRepetir` en cada lado. Agregarlo a `validadores`
- [X] T010 [back] En `src/validacion/actividades.ts`, agregar `validarClasificar`: `soloCampos` con `tipo`, `consigna`, `categorias` y `elementos`; `consigna` como en T009; `categorias` "Entre 2 y 4", cada una "no vacía, de hasta 100" (`categoriaMax`) y sin repetir; `elementos` "Entre 2 y 12", cada uno objeto solo con `texto` ("No vacío, de hasta 100", `elementoClasificarMax`) y `categoria` (entero, "Índice en `categorias`"); textos sin repetir; y "Toda categoría tiene al menos un elemento". Agregarlo a `validadores`
- [X] T011 [back] En `src/validacion/actividades.ts`, agregar `validarOrdenar`: `soloCampos` con `tipo`, `consigna` y `elementos`; `textoObligatorio` para `consigna` con `consignaMax`; `elementos` "Entre 3 y 10", cada uno "no vacío, de hasta 200" (`elementoOrdenarMax`) y sin repetir. Agregarlo a `validadores`
- [X] T012 [back] En `src/validacion/actividades.ts`, agregar `hayFormaDeLlenar(espacios, fichas)` (research.md, punto 5) y `validarBancoPalabras`: `soloCampos` con `tipo`, `consigna`, `texto`, `fichas` y `espacios`; `consigna` como en T009; `texto` con `textoObligatorio` y `textoEspaciosMax`, "con 1 a 10 `___`" (`espaciosBancoMax`, usando `contarMarcas`); `fichas` "Entre 2 y 20", cada una "no vacía, de hasta 100" (`fichaMax`), **sin** comprobar repetidos; `espacios`, uno por cada `___`, cada uno objeto solo con `aceptadas`, una lista de 1 a `fichasMax` textos, y cada texto es el de una ficha. Compara siempre recortado, porque el recorte se hace después (T013). Al final, si `hayFormaDeLlenar` da `false`, lanzar `ErrorActividad`. Agregarlo a `validadores`; aquí `npm run tipos` vuelve a pasar
- [X] T013 [P] [back] En `src/validacion/editor.ts`, renombrar `recortarTitulos` a `recortarTextos` y agregarle el caso `bancoPalabras`: recorta `fichas` y cada `aceptadas`. Actualizar su comentario y su llamada en `validarActividadesDeLeccion`
- [X] T014 [P] [back] Regenerar `scripts/actividades-prototipo.ts` con un script desechable en la carpeta temporal (no se versiona), como T012 de F03: ahora se quedan los nueve tipos, en su orden, con la tabla de research.md, punto 11, además de la de F03. Si `categorize` no trae `prompt`, la actividad no lleva `consigna`. Los textos se copian sin cambios y `glossary` se descarta. Formatear con Prettier y actualizar el encabezado ("los nueve tipos de F03 y F11"; lo regenera la tarea T014 de F11). Comprobar el total: 120 actividades (26 `teoria`, 9 `tarjeta`, 28 `opcionMultiple`, 13 `completarEspacios`, 17 `preguntaAbierta`, 9 `emparejar`, 9 `clasificar`, 6 `ordenar` y 3 `bancoPalabras`)
- [X] T015 [back] En `scripts/datos-prueba.ts`, en `actividadesDePrueba`, agregar **al final** las lecciones 4 y 5 de quickstart.md, sección 1.1: "Relacionar con etiquetas", con una actividad de cada tipo con `HTML` en todos sus textos (consigna, los dos lados, categorías, elementos, texto y fichas, sin romper las reglas de repetidos); y "Fichas que se repiten", con `{ tipo: "bancoPalabras", texto: "Mis colores favoritos son ___ y ___.", fichas: ["rojo", "azul", "verde"], espacios: [{ aceptadas: ["rojo", "azul"] }, { aceptadas: ["rojo", "azul"] }] }` y `{ tipo: "bancoPalabras", texto: "___ doble(___ x)", fichas: ["int", "int", "char"], espacios: [{ aceptadas: ["int"] }, { aceptadas: ["int"] }] }`. La descripción del curso pasa a "Curso para comprobar a mano los tipos de actividad."
- [X] T016 [back] En `scripts/datos-prueba.ts`, agregar la lección 6 "Relacionar al límite": emparejar con 8 parejas, clasificar con 12 elementos y 4 categorías, ordenar con 10 elementos y banco con 10 espacios y 20 fichas, con textos cerca de sus límites (200, 100, 200 y 100 caracteres). Sin las palabras de los criterios de búsqueda de F02 (ver el comentario del archivo)

**Punto de control**: `npm run tipos` y `npm run lint` pasan, `npm run bd:sembrar` acepta las 27
actividades, y B1 a B8 de [quickstart.md](./quickstart.md), sección 2, responden lo que dicen.

---

## Fase 3: Web (brote_web_react)

### Base

- [X] T017 [P] [web] Crear `src/utilidades/relacionar.ts` (research.md, puntos 1, 5 y 6): `type Lado = "izquierda" | "derecha"`; `type Pareja = { izquierda: number; derecha: number; numero: number }`, con índices en `actividad.parejas`; `type Lugares = (number | null)[]`, el elemento de cada lugar; `unirPareja`, `deshacerPareja`, `primerLibre`, `colocarEnLugar`, `quitarDeLugar` y `mezclarSinResolver(total)`; `hayFormaDeLlenar` (como T012) y `solucionBanco(actividad, colocadas)`, que devuelve la ficha de cada espacio, con sus dos pasadas: en la primera, una ficha acertada no se puede mover; en la segunda, sí. `textoConFichas(actividad, solucion)`, con `partirEnEspacios`. Y los detalles de la barra: `detalleParejas`, `detalleClasificar` y `detalleOrdenar`, con las líneas de la spec separadas por `\n`
- [X] T018 [P] [web] En `src/componentes/BarraRespuesta/BarraRespuesta.tsx`, prop `enfocar`: al ponerse en `true`, pasa el foco al botón (ya habilitado). En `BarraRespuesta.module.css`, `.detalle` con `max-height: 11rem; overflow-y: auto`. En `src/actividades/ReproductorLeccion/ReproductorLeccion.module.css`, `.contenido` pasa de `16rem` a `20rem` abajo (research.md, punto 7)
- [X] T019 [P] [web] Crear `src/hooks/useArrastrarElemento.ts` (research.md, punto 2): `useArrastrarElemento<Item extends string | number, Destino extends string | number>({ alSoltar, alEmpezar })`, con `arrastrando`, `item`, `destino`, `propsOrigen(item)`, `propsDestino(destino)` y `propsRaiz`. Los tipos son primitivos para comparar con `===`. Cada instancia solo acepta lo que empezó ella. El aviso de que empezó va un cuadro después. `propsRaiz` acepta `dragover` sin destino. Con arrastre, un `dragover` en `document` llama a `window.scrollBy` a menos de 80 px del borde superior o de 140 px del inferior
- [X] T020 [P] [web] Crear `src/hooks/useFocoElementos.ts` (research.md, punto 10): devuelve `{ raiz, pedirFoco, enfocarComprobar }`. `pedirFoco(selector)` guarda a dónde va el foco y un efecto lo aplica ya pintado, con `querySelector` sobre `raiz`. `pedirFoco(null)` va directo a "Comprobar": `enfocarComprobar` pasa a `true`, para la prop `enfocar` de `BarraRespuesta`, y la siguiente acción lo apaga. La actividad lo pide así cuando la respuesta queda completa, aunque en el banco sobren fichas
- [X] T021 [P] [web] En `src/hooks/useReproductor.ts`, el comentario de `hizoAlgo` agrega "colocó o unió" (spec F11, "Terminar la lección")

### Componentes (docs/diseno.md, sección 4)

- [X] T022 [P] [web] Crear `src/componentes/ElementoRespuesta/ElementoRespuesta.tsx` y `ElementoRespuesta.module.css`: las props de `docs/diseno.md`, más el resto de los atributos de `<button>` (`draggable`, eventos de arrastre, `data-*`). `<button type="button">` con `aria-label={etiqueta}` y `aria-pressed` si está seleccionada. Reutiliza `EstadoOpcion` y los colores de `OpcionRespuesta`, con `CircleCheck` y `CircleX`, y la sacudida, sin ella con "reducir movimiento". El texto con `white-space: pre-wrap` (spec, "Sangría") y `overflow-wrap: anywhere`
- [X] T023 [P] [web] Crear `src/componentes/LugarElemento/LugarElemento.tsx` y `LugarElemento.module.css`: las props de `docs/diseno.md`. Con `enLinea`, un `<span>` que acepta el interlineado de `.texto`; si no, una fila con su número. Vacío: borde punteado y `role="group"` con `aria-label={etiqueta}`. `esperada`, como en `CampoEspacio`, con "Respuesta esperada: " oculto. Acepta el resto de los atributos de su contenedor, como T022, para `propsDestino`
- [X] T024 [P] [web] Crear `src/componentes/ZonaElementos/ZonaElementos.tsx` y `ZonaElementos.module.css`: las props de `docs/diseno.md`, sobre `Superficie` `suave`. Con `titulo`, el título es un `<button>` y la zona tiene `onClick` solo para su parte vacía (research.md, punto 8). Sigue visible aunque esté vacía. Acepta el resto de los atributos de su contenedor, como T022, para `propsDestino`

### Cursar (docs/diseno.md, sección 6)

- [X] T025 [P] [web] Crear `src/actividades/Emparejar/Emparejar.tsx` y `Emparejar.module.css`, según la spec ("Emparejar", "Pulsar en emparejar", "Soltar al arrastrar"): consigna en `h2` con `useEnfocarAlMontar`; dos columnas de `ElementoRespuesta` `tarjeta`, con la derecha en el orden de `mezclarSinResolver`. Estado: `parejas`, `seleccion` y `comprobada`. Los elementos son origen y destino: arrastrar solo une con la otra columna, y los destinos son textos como `"derecha-2"`. Los sin pareja llevan `data-sin-pareja="<lado>"`
- [X] T026 [P] [web] Crear `src/actividades/Clasificar/Clasificar.tsx` y `Clasificar.module.css`, según la spec ("Clasificar", "Pulsar en clasificar", "Soltar al arrastrar"): una `ZonaElementos` para los sin colocar y una con `titulo` por categoría, con `grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr))`. Elementos: `ElementoRespuesta` `compacta`, en el orden de `mezclar`. Estado: `categoriaDe`, `seleccion` y `comprobada`
- [X] T027 [P] [web] Crear `src/actividades/Ordenar/Ordenar.tsx` y `Ordenar.module.css`, según la spec ("Ordenar", "Pulsar en ordenar y banco", "Soltar al arrastrar"): `LugarElemento` numerados y una `ZonaElementos` con `ElementoRespuesta` `tarjeta`, en el orden de `mezclarSinResolver`. Un lugar es correcto si tiene el elemento de su mismo índice. El estado son `Lugares`
- [X] T028 [P] [web] Crear `src/actividades/BancoPalabras/BancoPalabras.tsx` y `BancoPalabras.module.css`, según la spec ("Banco de palabras", "Comparación", "Solución que se muestra"): el texto en una `Superficie` con `partirEnEspacios`, con un `LugarElemento` `enLinea` en cada espacio, y una `ZonaElementos` con las fichas, en el orden de `mezclar`. Al comprobar, `solucionBanco` da la `esperada` de cada espacio incorrecto y, con `textoConFichas`, el detalle
- [X] T029 [web] En `src/actividades/registro.ts`, importar los cuatro y agregarlos a `registroActividades`

### Editor (docs/diseno.md, sección 4, "Editor (solo web)")

- [X] T030 [P] [web] Crear `src/componentes/CampoSelector/CampoSelector.tsx` y `CampoSelector.module.css`: las props de `docs/diseno.md`, con el aspecto de `CampoTexto`. `<select>` nativo, con `aria-invalid` y `aria-describedby` si hay error. `textoVacio` es la primera opción, sin valor
- [X] T031 [P] [web] Crear `src/componentes/CampoConEspacios/CampoConEspacios.tsx`, con `CampoArea` y el botón "Agregar espacio" que hoy está en `FormularioCompletarEspacios`. En `src/actividades/CompletarEspacios/FormularioCompletarEspacios.tsx`, usarlo. Sin cambio de comportamiento
- [X] T032 [web] En `src/actividades/CompletarEspacios/grupos.ts`, volver genérica `ajustarGrupos(texto, grupos, { esVacio, crear })` (research.md, punto 9). Actualizar la llamada en `FormularioCompletarEspacios.tsx`. Sin cambio de comportamiento
- [X] T033 [P] [web] En `src/utilidades/editor.ts`, agregar `marcarRepetidos(filas, leerTexto, clave, mensaje, errores)`: compara recortado y respetando las mayúsculas, y marca desde la segunda aparición. En `src/actividades/formulario.module.css`, agregar `.filaDoble` y `.casillas`
- [X] T034 [P] [web] Crear `src/actividades/Emparejar/editorEmparejar.ts` y `FormularioEmparejar.tsx`, según la spec ("Formulario de cada tipo", "Al editar"): borrador `{ consigna, parejas: { id, izquierda, derecha }[] }`, con tres filas vacías. Errores `izquierda.<id>` y `derecha.<id>`, con `marcarRepetidos` en cada lado. `ListaEditable` con `parejasMin` y `parejasMax`. `resumen`: la consigna o la izquierda de la primera pareja. `aActividad` omite la consigna vacía
- [X] T035 [P] [web] Crear `src/actividades/Clasificar/editorClasificar.ts` y `FormularioClasificar.tsx`, según la spec: borrador `{ consigna, categorias: FilaTexto[], elementos: { id, texto, idCategoria: string | null }[] }`. Quitar una categoría pone `idCategoria: null` en sus elementos. Errores `categorias.<id>` (vacía, repetida o `categoriaSinElementos`), `elementos.<id>` y `categoria.<id>`. `CampoSelector` con `textoVacio="Elige una categoría"` y "Categoría {n}" en una sin nombre. `resumen`: la consigna o la primera categoría. `aActividad` convierte `idCategoria` en índice
- [X] T036 [P] [web] Crear `src/actividades/Ordenar/editorOrdenar.ts` y `FormularioOrdenar.tsx`, según la spec: borrador `{ consigna, elementos: FilaTexto[] }`, con tres filas vacías. La consigna es obligatoria. `BotonesOrden` en cada fila, con `etiqueta` "elemento {n}". `resumen`: la consigna. `aActividad` conserva los espacios al inicio de cada elemento
- [X] T037 [web] Crear `src/actividades/BancoPalabras/editorBancoPalabras.ts` y `FormularioBancoPalabras.tsx`, según la spec y research.md, punto 9: el borrador de ese punto, con dos fichas vacías; `CampoConEspacios`; `ListaEditable` de fichas; un grupo por `___` con `ajustarGrupos`, con casillas agrupadas por texto recortado, sin las fichas vacías. Marcar una casilla marca todas las fichas con ese texto. Errores `texto`, `fichas.<id>`, `grupo.<id>`, `grupos` y `fichas` (`fichasInsuficientes`, en un `Aviso`, solo si no hay otros errores, con `aria-invalid` en la primera ficha). `resumen`: la consigna o el texto. `aActividad` recorta y quita repetidos de `aceptadas`; `aBorrador` busca las fichas por su texto
- [X] T038 [web] En `src/actividades/registroEditor.ts`, agregar los cuatro con `registrar`. Con esto la paleta los activa sola y `npm run tipos` vuelve a pasar

**Punto de control**: `npm run tipos` y `npm run lint` pasan. En Chrome, con el backend sembrado, la
parte web de cada tabla de [quickstart.md](./quickstart.md), sección 3, funciona. Conviene repetir
de F03 "Opción múltiple" y "Completar espacios" aquí mismo: T018, T031 y T032 tocan lo que ya
funcionaba.

---

## Fase 4: Móvil (brote_mobile_expo)

### Base

- [X] T039 [P] [movil] En `src/app/_layout.tsx`, envolver todo en `GestureHandlerRootView` con `style={{ flex: 1 }}` (research.md, punto 3). Sin esto, `GestureDetector` lanza un error
- [X] T040 [P] [movil] Crear `src/utilidades/relacionar.ts`, igual que el de la web (T017) pero sin `hayFormaDeLlenar`, y con imports sin extensión
- [X] T041 [P] [movil] Mover `partirEnLineas` de `src/actividades/CompletarEspacios.tsx` a `src/utilidades/actividades.ts`. Crear `src/componentes/TextoConEspacios.tsx`, con `texto` y `dibujarEspacio(indice)`, que dibuja las líneas. `CompletarEspacios.tsx` lo usa. Sin cambio de comportamiento
- [X] T042 [P] [movil] En `src/componentes/BarraRespuesta.tsx`, `detalle` va dentro de un `ScrollView` con `maxHeight` del 35 % de `useWindowDimensions().height` (research.md, punto 7). El título y el botón quedan fijos, y `accessibilityLiveRegion` sigue en `styles.mensaje`
- [X] T043 [P] [movil] En `src/hooks/useReproductor.ts`, el comentario de `hizoAlgo` agrega "colocó o unió"

### Componentes (docs/diseno.md, sección 4)

- [X] T044 [P] [movil] Crear `src/componentes/ElementoRespuesta.tsx`: las props de `docs/diseno.md`, sobre `Pressable`, con el aspecto y la sacudida de `OpcionRespuesta` (reanimated, `useReducedMotion`). `accessibilityRole="button"`, `accessibilityLabel={etiqueta}` y `accessibilityState` con `selected` y `disabled`
- [X] T045 [P] [movil] Crear `src/componentes/LugarElemento.tsx`: las props de `docs/diseno.md`. Vacío: borde punteado y `accessibilityLabel={etiqueta}`. `esperada`, como en `CampoEspacio`
- [X] T046 [P] [movil] Crear `src/componentes/ZonaElementos.tsx`: las props de `docs/diseno.md`, sobre `Superficie` `suave`. Con `titulo` y `alPulsar`, un `Pressable` con `accessible={false}` que envuelve a sus elementos y sigue atendiendo los toques: gana la de adentro. El título es otro `Pressable`, con `accessibilityRole="button"`, y es el que usa el lector de pantalla (research.md, punto 8)

### Arrastrar (docs/diseno.md, sección 6)

- [X] T047 [movil] Crear `src/actividades/arrastre/useArrastrarElemento.ts` (research.md, punto 3): `useArrastrarElemento<Item, Destino>({ alSoltar, alEmpezar })`, con `arrastrando`, `item`, `destino`, `registrarDestino`, `iniciar`, `mover` y `terminar`, y lo que usa `MarcoActividad`. Al iniciar, mide cada destino con `measureInWindow` y guarda el desplazamiento del `ScrollView`. Al mover, compara el dedo con esos rectángulos, corregidos por lo que se haya desplazado. A menos de 72 px del borde de la zona visible, un ciclo de `requestAnimationFrame` llama a `scrollTo` con 8 px por cuadro. Con `canceled`, no llama a `alSoltar`
- [X] T048 [movil] Crear `src/actividades/arrastre/Arrastrable.tsx` y `DestinoArrastre.tsx`. `Arrastrable`: `GestureDetector` con `usePanGesture({ activateAfterLongPress: ESPERA_ARRASTRE_MS, maxPointers: 1, runOnJS: true, enabled, onActivate, onUpdate, onFinalize })`, con `ESPERA_ARRASTRE_MS = 250`. Se apaga mientras haya otro arrastre y expone si hay que ignorar el `onPress` que llegue al soltar. `DestinoArrastre`: registra su vista al montarse y la quita al desmontarse. La API sale de `node_modules/react-native-gesture-handler/src/v3/`, no de la documentación de versiones anteriores
- [X] T049 [movil] Crear `src/actividades/arrastre/CapaArrastre.tsx`: la copia flotante, con `pointerEvents="none"`, `ElementoRespuesta` con `sombraElevada` y valores compartidos para moverse. Al soltar fuera no hay animación de regreso: la copia desaparece y el elemento ya está en su lugar. Resta la posición de la capa, medida con `measureInWindow`. En `src/actividades/MarcoActividad.tsx`, prop opcional `arrastre`: da el `ref` del `ScrollView`, `scrollEnabled={!arrastre?.arrastrando}`, `onScroll` con `scrollEventThrottle={16}` y dibuja `CapaArrastre` fuera del `ScrollView`. Sin `arrastre`, todo sigue igual

### El primer tipo, para probar el arrastre

- [X] T050 [movil] Crear `src/actividades/Emparejar.tsx`, con las mismas reglas que T025: `MarcoActividad`, dos columnas de `ElementoRespuesta` `tarjeta`, cada una en `Arrastrable` y `DestinoArrastre`, y anuncios con `AccessibilityInfo.announceForAccessibility`. En `src/actividades/registro.ts`, agregar `emparejar`. `npm run tipos` sigue sin pasar, pero Metro no lo necesita: `actividadesConocidas` se salta los otros tres
- [X] T051 [movil] En **un teléfono con Expo Go**, no en Expo web, comprobar con "Remotos: compartir tu trabajo" los cuatro supuestos de research.md, punto 3: que el destino resaltado es el que está bajo el dedo, que soltar no dispara también el pulso, que el arrastre desde un elemento de la izquierda no sale de la lección y que abrir la confirmación de salida lo cancela. Si uno falla, aplicar su salida de la tabla antes de seguir, y anotar en `research.md` lo que resultó. Hacerlo aquí evita repetir el arreglo en tres tipos más (Comprobado en un iPhone. El cuarto supuesto solo aplica en Android y no se probó: ver research.md, punto 3.)

### Los otros tres tipos (docs/diseno.md, sección 6)

- [X] T052 [movil] Crear `src/actividades/Clasificar.tsx`, con las mismas reglas que T026: la `ZonaElementos` de cada categoría en `DestinoArrastre`, una debajo de otra. Agregar `clasificar` a `src/actividades/registro.ts`
- [X] T053 [movil] Crear `src/actividades/Ordenar.tsx`, con las mismas reglas que T027. Agregar `ordenar` a `src/actividades/registro.ts`
- [X] T054 [movil] Crear `src/actividades/BancoPalabras.tsx`, con las mismas reglas que T028: el texto con `TextoConEspacios`, y un `LugarElemento` `enLinea` en `DestinoArrastre` por espacio. Agregar `bancoPalabras` a `src/actividades/registro.ts`; aquí `npm run tipos` vuelve a pasar

**Punto de control**: `npm run tipos` y `npm run lint` pasan. Con el backend sembrado y Expo Go en un
teléfono, la parte móvil de cada tabla de [quickstart.md](./quickstart.md), sección 3, funciona.

---

## Fase 5: Cierre

- [X] T055 [specs] Integrar [data-model.md](./data-model.md) a `specs/02-modelo-datos.md`, como dice su sección "Al cerrar": las filas de los cuatro tipos y sus reglas, que las preguntas son siete y que quedan cuatro tipos. En "Entidades previstas", la fila de los demás tipos deja fuera a F11
- [X] T056 [specs] Integrar "Cambios a la navegación" de [plan.md](./plan.md) a `specs/01-navegacion.md`: en "Salir de una lección", que salir también pide confirmación si el alumno colocó o unió algo
- [X] T057 [specs] En `specs/features/F05-crear-editar-curso/research.md`, punto 13, una nota de que F11 justificó arrastrar con el dedo en el móvil, con gesture handler, y que la web sigue con ratón
- [X] T058 [specs] `npm run contrato:revisar`: las tres copias coinciden con la oficial
- [X] T059 [specs] Revisar que `specs/features/F11-actividades-relacionar/spec.md` coincide con lo que se construyó; si algo cambió, actualizarla, junto con lo que T051 haya anotado en `research.md`

---

## Fase 6: Validación manual

Cada criterio se comprueba con [quickstart.md](./quickstart.md), sección 3, y se marca también en
`spec.md`. Antes de los PR, las repeticiones de F03 y F05 de la sección 4.

**El móvil se valida en un teléfono con Expo Go.** En F05 y F06 algunos criterios se validaron en
Expo web, pero aquí no sirve: mantener pulsado, deslizar, el segundo dedo, el borde y el segundo
plano son gestos reales. Si algún criterio de móvil no se puede probar en un teléfono, se anota en
su línea, como en F05.

- [X] V01 [backend] Los cuatro cursos de prueba tienen, entre todos, 9 actividades de emparejar, 9 de clasificar, 6 de ordenar y 3 de banco de palabras.
- [X] V02 [web, móvil] "Números del 1 al 5" (Japonés sencillo, 3) muestra, en este orden: emparejar, opción múltiple, tarjeta y ordenar. (Móvil validado en Expo web, no en un teléfono.)
- [X] V03 [web, móvil] "Tu primer commit" (Git esencial, 2) muestra su teoría y luego clasificar, con "Clasifica cada comando según lo que afecta.". (Móvil validado en Expo web, no en un teléfono.)
- [X] V04 [web, móvil] En "Remotos: compartir tu trabajo" (Git esencial, 5) veo "Empareja los conceptos", a la izquierda `git clone <url>`, `git push`, `git pull` y `git fetch`, en ese orden y con `<url>` tal cual, y a la derecha sus cuatro descripciones. "Comprobar" está deshabilitado. (Móvil validado en Expo web, no en un teléfono.)
- [X] V05 [web, móvil] Al abrir varias veces esa lección, la columna derecha no sale siempre en el mismo orden, y nunca con cada comando frente a su descripción. (Móvil validado en Expo web, no en un teléfono.)
- [X] V06 [web, móvil] Al pulsar `git push` queda seleccionado; al pulsar "Sube tus commits locales al remoto", los dos llevan el mismo número. Empezando por la columna derecha pasa lo mismo. (Móvil validado en Expo web, no en un teléfono.)
- [X] V07 [web, móvil] Con `git push` seleccionado, al pulsar `git pull` la selección pasa a `git pull`; al pulsarlo otra vez ya no hay nada seleccionado. (Móvil validado en Expo web, no en un teléfono.)
- [X] V08 [web, móvil] Al pulsar un elemento que ya tiene pareja, los dos pierden su número. (Móvil validado en Expo web, no en un teléfono.)
- [X] V09 [web, móvil] Con `git push` unido a una descripción, al seleccionar `git pull` y pulsar esa misma descripción, forman pareja y `git push` se queda sin pareja. (Móvil validado en Expo web, no en un teléfono.)
- [X] V10 [web, móvil] "Comprobar" se habilita al formar la cuarta pareja y se deshabilita si deshago una. (Móvil validado en Expo web, no en un teléfono.)
- [X] V11 [web, móvil] Con las cuatro parejas bien, al comprobar todas quedan marcadas como correctas y la barra dice "¡Correcto!". Ya no puedo cambiar nada y el botón dice "Continuar". (Móvil validado en Expo web, no en un teléfono.)
- [X] V12 [web, móvil] Con `git pull` y `git fetch` cruzadas, al comprobar esas dos parejas quedan incorrectas y las otras dos correctas, y la barra muestra "Respuesta correcta:" con dos líneas: `git pull → Descarga y combina los commits nuevos del remoto` y `git fetch → Descarga los commits nuevos sin combinarlos todavía`. (Móvil validado en Expo web, no en un teléfono.)
- [X] V13 [móvil] En "align-items: el eje cruzado" (Examen unidad 1, 7), las dos columnas van lado a lado y las descripciones se leen completas, sin "…". (Móvil validado en Expo web, no en un teléfono.)
- [X] V14 [web, móvil] En "Primeros pasos" (Programación en C sencilla, 1) veo "Clasifica cada elemento", los seis elementos sin colocar y las categorías "Tipo de dato" y "Palabra clave", en ese orden. "Comprobar" está deshabilitado. (Móvil validado en Expo web, no en un teléfono.)
- [X] V15 [web, móvil] Al abrir varias veces esa lección, los elementos no salen siempre en el mismo orden. (Móvil validado en Expo web, no en un teléfono.)
- [X] V16 [web, móvil] Al pulsar `if` queda seleccionado; al pulsar "Palabra clave", queda en esa categoría. Sin elemento seleccionado, pulsar una categoría no hace nada. (Móvil validado en Expo web, no en un teléfono.)
- [X] V17 [web, móvil] Sin nada seleccionado, al pulsar `if` ya colocado vuelve a los elementos sin colocar. (Móvil validado en Expo web, no en un teléfono.)
- [X] V18 [web, móvil] Con `while` seleccionado, al pulsar encima de `if` ya colocado en "Palabra clave", `while` queda en esa categoría e `if` sigue ahí. (Móvil validado en Expo web, no en un teléfono.)
- [X] V19 [web, móvil] "Comprobar" se habilita al colocar el último elemento y se deshabilita si devuelvo uno. (Móvil validado en Expo web, no en un teléfono.)
- [X] V20 [web, móvil] Con todos bien, al comprobar quedan marcados como correctos y la barra dice "¡Correcto!". (Móvil validado en Expo web, no en un teléfono.)
- [X] V21 [web, móvil] Con `if` en "Tipo de dato" y los demás bien, al comprobar `if` queda incorrecto, los demás correctos, y la barra muestra "Respuesta correcta:" con `if → Palabra clave`. (Móvil validado en Expo web, no en un teléfono.)
- [X] V22 [web, móvil] En "Estructura semántica de HTML" (Examen unidad 1, 4), las categorías "Va dentro de <head>" y "Va dentro de <body>" y los elementos `<title>` y `<article>` se ven tal cual. (Móvil validado en Expo web, no en un teléfono.)
- [X] V23 [web] En una ventana ancha las categorías van lado a lado; en una angosta y en la vista previa, una debajo de otra. (La ventana angosta se simuló con un iframe de 400 px: la ventana de Chrome no baja de 657 px.)
- [X] V24 [móvil] Las categorías van una debajo de otra. (Móvil validado en Expo web, no en un teléfono.)
- [X] V25 [web, móvil] En "Condicionales y operadores" (Programación en C sencilla, 2) veo la consigna, tres lugares numerados y vacíos y los tres elementos sin colocar, con `printf("Hola");` con su sangría. "Comprobar" está deshabilitado. (Móvil validado en Expo web, no en un teléfono.)
- [X] V26 [web, móvil] Al abrir varias veces esa lección, los elementos no salen siempre en el mismo orden, y nunca en el orden correcto. (Móvil validado en Expo web, no en un teléfono.)
- [X] V27 [web, móvil] Al pulsar un elemento va al lugar 1, y al pulsar otro, al lugar 2. Pulsar un lugar vacío no hace nada. (Móvil validado en Expo web, no en un teléfono.)
- [X] V28 [web, móvil] Con tres elementos colocados, al pulsar el del lugar 1 vuelve a los elementos sin colocar, los otros dos no se mueven y "Comprobar" se deshabilita. El siguiente que pulso va al lugar 1. (Móvil validado en Expo web, no en un teléfono.)
- [X] V29 [web, móvil] En el orden correcto, al comprobar los tres lugares quedan correctos y la barra dice "¡Correcto!". (Móvil validado en Expo web, no en un teléfono.)
- [X] V30 [web, móvil] Con los lugares 2 y 3 cambiados, al comprobar el lugar 1 queda correcto, los otros dos incorrectos, y la barra muestra "Respuesta correcta:" con el orden completo, en líneas numeradas. (Móvil validado en Expo web, no en un teléfono.)
- [X] V31 [móvil] En "Patrones comunes con Flexbox" (Examen unidad 1, 11), con el orden equivocado, los elementos se leen completos y puedo leer toda la barra sin perder de vista "Continuar". (Móvil validado en Expo web, no en un teléfono; ahí la respuesta cupo entera sin desplazarse.)
- [X] V32 [web] En "Actividades de prueba", en el ordenar de 10 elementos, con el orden equivocado, puedo leer toda la respuesta desplazando el texto de la barra, y "Continuar" sigue a la vista.
- [X] V33 [web, móvil] En "Funciones" (Programación en C sencilla, 3) veo "Completa con las fichas del banco", `___ suma(int a, int b) {` con un espacio y las fichas `int`, `void` y `char`. "Comprobar" está deshabilitado. (Móvil validado en Expo web, no en un teléfono.)
- [X] V34 [web, móvil] Al abrir varias veces esa lección, las fichas no salen siempre en el mismo orden. (Móvil validado en Expo web, no en un teléfono.)
- [X] V35 [web, móvil] Al pulsar `void`, sale del banco y queda en el espacio, y "Comprobar" se habilita. Al pulsarla en el espacio, vuelve al banco y "Comprobar" se deshabilita. (Móvil validado en Expo web, no en un teléfono.)
- [X] V36 [web, móvil] Con el espacio lleno, pulsar otra ficha no hace nada. (Móvil validado en Expo web, no en un teléfono.)
- [X] V37 [web, móvil] Con `int`, al comprobar el espacio queda correcto y la barra dice "¡Correcto!". (Móvil validado en Expo web, no en un teléfono.)
- [X] V38 [web, móvil] Con `void`, al comprobar el espacio queda incorrecto, aparece `int` junto a él y la barra muestra "Respuesta correcta:" con `int suma(int a, int b) {`. (Móvil validado en Expo web, no en un teléfono.)
- [X] V39 [web, móvil] En "Saludos" (Japonés sencillo, 2), el texto `こんにちは、___ ですか？` se ve con su espacio, y `元気` lo completa correctamente. (Móvil validado en Expo web, no en un teléfono.)
- [X] V40 [web, móvil] En "Actividades de prueba", en "Mis colores favoritos son ___ y ___." (donde los dos espacios aceptan "rojo" y "azul"), tanto "rojo y azul" como "azul y rojo" dan "¡Correcto!". (Móvil validado en Expo web, no en un teléfono.)
- [X] V41 [web, móvil] En esa actividad, después de colocar `rojo` ya no hay otra ficha `rojo` en el banco. (Móvil validado en Expo web, no en un teléfono.)
- [X] V42 [web, móvil] En esa actividad, con `verde` en el primer espacio y `rojo` en el segundo, el primero queda incorrecto con `azul` junto a él, el segundo correcto, y la barra muestra "Mis colores favoritos son azul y rojo.". (Móvil validado en Expo web, no en un teléfono.)
- [X] V43 [web, móvil] En "Actividades de prueba", en `___ doble(___ x)`, el banco tiene dos fichas `int`, y con una en cada espacio da "¡Correcto!". (Móvil validado en Expo web, no en un teléfono.)
- [X] V44 [web, móvil] En emparejar, al arrastrar `git push` hasta su descripción forman pareja, igual que pulsándolos. Al soltarlo sobre otro elemento de su misma columna, nada cambia. (Web validada con eventos de arrastre sintéticos, no con el ratón. Móvil validado en un iPhone por iPhone Mirroring, con el puntero como dedo.)
- [X] V45 [web, móvil] En clasificar, arrastro un elemento a una categoría, de ahí a la otra y de vuelta a los elementos sin colocar. Con todos colocados, la zona de los sin colocar sigue visible y se puede soltar ahí. (Web validada con eventos de arrastre sintéticos, no con el ratón. Móvil validado en un iPhone por iPhone Mirroring, con el puntero como dedo.)
- [X] V46 [web, móvil] En ordenar, con todos los lugares libres, arrastro un elemento al lugar 3 y queda ahí. Al pulsar otro, va al lugar 1. (Web validada con eventos de arrastre sintéticos, no con el ratón. Móvil validado en un iPhone por iPhone Mirroring, con el puntero como dedo.)
- [X] V47 [web, móvil] En ordenar, al soltar el elemento del lugar 1 sobre el lugar 2, se intercambian. Al soltar un elemento sin colocar sobre un lugar ocupado, el que estaba ahí vuelve a los elementos sin colocar. (Web validada con eventos de arrastre sintéticos, no con el ratón. Móvil validado en un iPhone por iPhone Mirroring, con el puntero como dedo.)
- [X] V48 [web, móvil] En "Mis colores favoritos son ___ y ___.", arrastro una ficha al segundo espacio con el primero libre, y de ahí de vuelta al banco. (Web validada con eventos de arrastre sintéticos, no con el ratón. Móvil validado en un iPhone por iPhone Mirroring, con el puntero como dedo.)
- [X] V49 [web, móvil] Mientras arrastro, el elemento sigue al puntero o al dedo, su lugar de origen se ve atenuado y el destino debajo se resalta. Al soltarlo fuera de cualquier destino vuelve a donde estaba y nada cambia. (Web validada con eventos de arrastre sintéticos, no con el ratón. Móvil validado en un iPhone por iPhone Mirroring, con el puntero como dedo.)
- [X] V50 [web, móvil] Con un elemento seleccionado, al empezar a arrastrar otro la selección se quita. (Web validada con eventos de arrastre sintéticos, no con el ratón. Móvil validado en un iPhone por iPhone Mirroring, con el puntero como dedo.)
- [X] V51 [web, móvil] En "Actividades de prueba", en el clasificar de 12 elementos y 4 categorías, con la última categoría fuera de la vista, al acercar un elemento al borde de la pantalla esta se desplaza sola y puedo soltarlo en esa categoría. (Web validada con eventos de arrastre sintéticos, no con el ratón. Móvil validado el 2026-11-08 en un iPhone 12 mini por iPhone Mirroring, con la app de la rama de F12, que trae F11 completa.)
- [X] V52 [web, móvil] Después de "Comprobar", nada se puede arrastrar ni pulsar. (Web validada con eventos de arrastre sintéticos, no con el ratón. Móvil validado en un iPhone por iPhone Mirroring, con el puntero como dedo.)
- [ ] V53 [móvil] Al deslizar el dedo sobre un elemento sin mantenerlo pulsado, la pantalla se desplaza y el elemento no se mueve.
- [ ] V54 [móvil] Mientras arrastro, un segundo dedo no arrastra otro elemento.
- [X] V55 [móvil] Arrastrar un elemento desde el borde de la pantalla no sale de la lección. (Validado en un iPhone por iPhone Mirroring, con el puntero como dedo.)
- [X] V56 [móvil] Si la app pasa a segundo plano mientras arrastro, al volver el elemento está donde estaba. (Validado en un iPhone por iPhone Mirroring: segundo plano con Cmd+1 y de vuelta con Cmd+2.)
- [ ] V57 [móvil] Con algo ya colocado, al pulsar el botón de atrás del teléfono mientras arrastro otro elemento, el arrastre se cancela y veo "¿Salir de la lección?".
- [ ] V58 [web, móvil] Con "reducir movimiento" activado, al soltar fuera el elemento vuelve sin animación, y lo incorrecto no se sacude.
- [X] V59 [web] Resuelvo los cuatro tipos solo con Tab, Enter y la barra espaciadora, hasta "Continuar".
- [X] V60 [web] En clasificar, ordenar y banco, después de colocar un elemento el foco queda en el siguiente sin colocar y, cuando la respuesta queda completa, en "Comprobar".
- [X] V61 [web] En emparejar, después de formar una pareja el foco queda en el siguiente sin pareja de la columna donde empecé, y después de la última, en "Comprobar".
- [X] V62 [web] En clasificar, ordenar y banco, al devolver un elemento colocado el foco queda en ese elemento.
- [X] V63 [web] En estos tipos, las teclas 1 a 9 no hacen nada.
- [ ] V64 [web, móvil] Con un lector de pantalla, cada elemento anuncia su estado ("Seleccionado", "Pareja {n}", "En {categoría}", "Lugar {n}" o "Espacio {n}"), y se anuncia cada cambio al hacerlo.
- [X] V65 [web, móvil] Lo correcto y lo incorrecto llevan icono además de color. (Móvil validado el 2026-11-08 en un iPhone 12 mini por iPhone Mirroring, con la insignia en la esquina del número, con la app de la rama de F12, que trae F11 completa.)
- [X] V66 [web, móvil] En "Números del 1 al 5" (Japonés sencillo, 3), acertando emparejar y la opción múltiple, y fallando ordenar, al terminar veo "Acertaste 2 de 3": la tarjeta no cuenta. (Móvil validado en Expo web, no en un teléfono.)
- [X] V67 [web, móvil] En esa lección, con dos parejas cruzadas y lo demás bien, emparejar cuenta como fallada. (Móvil validado en Expo web, no en un teléfono.)
- [X] V68 [web, móvil] Al volver al curso, esa lección muestra "2 de 3 aciertos". (Móvil validado en Expo web, no en un teléfono.)
- [X] V69 [web, móvil] En "Números del 1 al 5", sin haber hecho nada, la X lleva directo al detalle del curso. Después de elegir un elemento, pide confirmación, y "Seguir aquí" me deja con lo que había elegido. (Móvil validado en un iPhone por iPhone Mirroring.)
- [X] V70 [web, móvil] Con parejas formadas, confirmar la salida y abrir otra vez la lección empieza sin respuestas. (Móvil validado en un iPhone por iPhone Mirroring.)
- [X] V71 [web] En la paleta, Emparejar, Clasificar, Ordenar y Banco de palabras se pueden agregar y no dicen "Próximamente". Reto de código, Terminal simulada, Grafo de commits y Escuchar y repetir siguen deshabilitados, con "Próximamente".
- [X] V72 [web] Al arrastrar o pulsar cada uno de los cuatro, queda en la secuencia con la marca "Incompleta", seleccionado y con el foco en su primer campo. (Dos se agregaron arrastrando con eventos sintéticos de la API del navegador, no con el ratón.)
- [X] V73 [web] El bloque de emparejar muestra la consigna y, sin ella, el texto izquierdo de la primera pareja. El de clasificar, la consigna o la primera categoría. El de ordenar, la consigna. El de banco de palabras, la consigna o el texto. Sin nada de eso, "Sin contenido".
- [X] V74 [web] Emparejar empieza con tres parejas vacías. Con 3, "Quitar" está deshabilitado; con 8, también "Agregar pareja".
- [X] V75 [web] Con dos textos iguales en una columna (también " git " y "git"), al guardar el repetido muestra "Este texto está repetido.". Un mismo texto en las dos columnas sí se acepta, y "git" y "Git" también.
- [X] V76 [web] Clasificar empieza con dos categorías y dos elementos vacíos. Un elemento sin categoría muestra, al guardar, "Elige una categoría.", y una categoría sin elementos, "Esta categoría no tiene elementos.".
- [X] V77 [web] El selector de cada elemento muestra los nombres de las categorías, y "Categoría {n}" en una sin nombre. Al cambiarle el nombre a una categoría, el selector lo muestra.
- [X] V78 [web] Al quitar una categoría, sus elementos se quedan sin categoría.
- [X] V79 [web] Dos categorías iguales muestran "Esta categoría está repetida.", y dos elementos iguales, "Este elemento está repetido.". Clasificar deja tener de 2 a 4 categorías y de 2 a 12 elementos.
- [X] V80 [web] Ordenar empieza con tres elementos vacíos y la ayuda "Escríbelos en el orden correcto. El alumno los verá mezclados.". "Subir" y "Bajar" cambian el orden correcto. Sin consigna, al guardar veo "Este campo es obligatorio.".
- [X] V81 [web] Ordenar deja tener de 3 a 10 elementos, y dos iguales muestran "Este elemento está repetido.".
- [X] V82 [web] En banco de palabras, "Agregar espacio" escribe `___` donde está el cursor y aparece el grupo "Espacio 1" con las palabras del banco como casillas. Escribir otro `___` a mano agrega "Espacio 2".
- [X] V83 [web] Una palabra repetida en las fichas aparece una sola vez en las casillas. Las fichas "Rojo" y "rojo" salen como dos casillas.
- [X] V84 [web] Un espacio sin marcas muestra, al guardar, "Marca al menos una ficha.". Un texto sin `___` muestra "Agrega al menos un espacio con ___.", y con 11, "El texto puede tener hasta 10 espacios.".
- [X] V85 [web] Con dos espacios que solo aceptan `int` y una sola ficha `int`, al guardar veo "No alcanzan las fichas para llenar todos los espacios. Si una palabra va en dos, agrégala dos veces."; al agregar otra ficha `int`, se guarda.
- [X] V86 [web] Al corregir el texto de una ficha marcada, sigue marcada. Al quitarla, su palabra desaparece de los grupos.
- [X] V87 [web] Con dos espacios con marcas, al borrar un `___` del texto los dos grupos siguen ahí, con "Hay más grupos de respuestas que espacios en el texto. Quita los que sobran." y "Quitar espacio". Si el grupo que sobra no tenía marcas, desaparece solo.
- [X] V88 [web] Banco de palabras deja tener de 2 a 20 fichas.
- [X] V89 [web] Cada campo no deja escribir más del límite de "Datos de entrada". (Se probó escribiendo con el teclado, no pegando.)
- [X] V90 [web] Las ayudas de la consigna dicen qué verá el alumno si se deja vacía, en los tres tipos en los que es opcional.
- [X] V91 [web] Una actividad completa de cada tipo se ve en la vista previa como en el reproductor, y se responde pulsando y arrastrando. (El arrastre, con eventos sintéticos de la API del navegador, no con el ratón.)
- [X] V92 [web] Arrastrar un elemento dentro de la vista previa no mueve ningún bloque ni agrega actividades. Arrastrar un bloque o un tipo de la paleta encima de la vista previa no cambia la actividad. (Con eventos sintéticos de la API del navegador, no con el ratón.)
- [X] V93 [web] Al cambiar la actividad en el inspector, la vista previa vuelve a empezar y el foco se queda en el campo. "Reiniciar" la devuelve al principio.
- [X] V94 [web] Una actividad incompleta de estos tipos muestra "Completa esta actividad para ver su vista previa.".
- [X] V95 [web] "Probar lección" recorre una lección con los cuatro tipos, y al terminar veo "Acertaste {aciertos} de 4".
- [X] V96 [web] Una lección con los cuatro tipos se guarda y, al recargar, sigue igual, con sus datos y en su orden. Un elemento de ordenar con sangría conserva su sangría.
- [X] V97 [web] Una ficha escrita con espacios al inicio y al final se guarda sin ellos. Una consigna vacía no se guarda: el alumno ve el texto por defecto.
- [X] V98 [web, móvil] Armo una lección con los cuatro tipos, un administrador publica el curso, y un alumno la cursa de principio a fin: en la web y en el móvil se ve igual que en la vista previa y su resultado cuenta las cuatro preguntas. (Móvil validado en Expo web, no en un teléfono.)
- [X] V99 [backend] Guardar, sin pasar por un cliente, emparejar con 2 o con 9 parejas, o con un texto repetido en una columna, se rechaza y la lección queda como estaba.
- [X] V100 [backend] Guardar clasificar con 1 o con 5 categorías, con 13 elementos, con un elemento repetido, con un elemento sin categoría o con una que no existe, o con una categoría sin elementos, se rechaza y la lección queda como estaba.
- [X] V101 [backend] Guardar ordenar sin consigna, con 2 o con 11 elementos, o con un elemento repetido, se rechaza y la lección queda como estaba.
- [X] V102 [backend] Guardar banco de palabras con 11 espacios, con 21 fichas, con un número de grupos distinto al de `___`, con un espacio sin fichas que valgan, con una palabra que vale y no está en el banco, o sin forma de llenar todos los espacios con cada ficha una sola vez, se rechaza y la lección queda como estaba.
- [X] V103 [backend] Guardar un texto más largo que su límite en cualquiera de los cuatro tipos, o un campo que el tipo no tiene, se rechaza y la lección queda como estaba.
- [X] V104 [backend] Guardar una actividad de un tipo que todavía no existe (por ejemplo, reto de código) se rechaza y la lección queda como estaba.
- [X] V105 [web, móvil] En "Actividades de prueba", la lección con `<b>hola</b>` y `<script>` en los textos de una actividad de cada uno de los cuatro tipos los muestra tal cual, también en la barra inferior, sin negritas y sin ejecutar nada. (Móvil validado en Expo web, no en un teléfono.)
- [X] V106 [web] Con esos textos, el formulario, el bloque y la vista previa los muestran tal cual.
- [X] V107 [web, móvil] En "Resolviendo conflictos" (Git esencial, 6), el elemento "Ver los marcadores <<<<<<< ======= >>>>>>>" se ve tal cual. (Móvil validado en Expo web, no en un teléfono.)
- [X] V108 [web, móvil] Las actividades de "Actividades de prueba" con los límites más altos (8 parejas, 12 elementos y 4 categorías, 10 elementos para ordenar y 20 fichas) se pueden responder de principio a fin, con los textos completos. (Móvil validado en Expo web, no en un teléfono.)

---

## Dependencias

- **Fase 1** va antes que todo. T001 primero, para que todo quede en la rama. T002 → T008 y T005–T007 → T008 (cada copia se commitea en la rama de F11 de su repo). T003 → T004, las dos antes de cualquier tarea de interfaz.
- **Backend** (fase 2):
  - T009 → T010 → T011 → T012 (mismo archivo);
  - T013 en paralelo; T014 cuando se quiera;
  - T015 → T016 (mismo archivo); T015 necesita T012.
- **Web** (fase 3), cuando el backend pasa su punto de control:
  - T017 a T021 en paralelo; T018 antes que T025 a T028;
  - T022 a T024 en paralelo; T025 a T028 necesitan T017, T019, T020 y T022 a T024;
  - T029 necesita T025 a T028;
  - T030, T031 y T033 en paralelo; T031 → T032 (mismo archivo);
  - T034 a T036 necesitan T033, y T035 también T030; T037 necesita T017, T031, T032 y T033;
  - T038 necesita T034 a T037.
- **Móvil** (fase 4), en paralelo con la web cuando el backend pasa su punto de control:
  - T039 a T046 en paralelo; T040 necesita T017 si se copia de ahí;
  - T047 → T048 → T049; T047 necesita T039;
  - T050 necesita T040, T044 y T049; T051 necesita T050 y T042;
  - T052 a T054 necesitan T051, y van una tras otra porque editan `registro.ts`; T053 y T054 usan T045, T054 también T041, y T052, T053 y T054 también T046.
- **Cierre y validación** al final. Los criterios `[backend]` se pueden validar en cuanto termina la fase 2.

## Paralelo, por ejemplo

```text
Preparación: T003→T004 (diseño) ‖ T002→T008 (contrato) ‖ T005 ‖ T006 ‖ T007
Backend:     T009→T010→T011→T012→T015→T016 ‖ T013 ‖ T014
Web, base:   T017 ‖ T018 ‖ T019 ‖ T020 ‖ T021 ‖ T022 ‖ T023 ‖ T024
Web, cursar: T025 ‖ T026 ‖ T027 ‖ T028, y luego T029
Web, editor: T030 ‖ T031→T032 ‖ T033, luego T034 ‖ T035 ‖ T036 ‖ T037, y luego T038
Móvil, base: T039 ‖ T040 ‖ T041 ‖ T042 ‖ T043 ‖ T044 ‖ T045 ‖ T046
```

## Estrategia

1. Rama, contrato y diseño en `brote_specs` (T001 a T004), porque todo lo demás los usa.
2. Backend completo y probado con curl (punto de control de la fase 2): ya cubre los siete
   criterios `[backend]` y confirma que las 27 actividades cumplen las reglas.
3. **El móvil puede ir antes que la web.** Lo más incierto de la feature es el arrastre con el
   dedo: T039 a T051 lo despejan con un solo tipo, y conviene saberlo antes de hacer los otros
   tres en dos clientes. T017 hace falta antes, porque T040 lo copia.
4. En la web, primero lo que puede romper lo de F03 (T018) y después cursar y editar. Después de
   T032, comprobar completar espacios en el editor, porque esa tarea cambió cómo funciona por dentro.
5. Cierre de documentos y validación manual completa (V01 a V108) antes de los PR a `dev` de cada
   repo, con la spec enlazada y los criterios cubiertos.
