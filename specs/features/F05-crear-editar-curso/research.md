# Investigación: F05 Crear y editar un curso

**Plan**: [plan.md](./plan.md)

Solo lo nuevo de esta feature. El stack, `fetch` propio con `usePeticion`, el
contrato por copia y la validación manual ya están decididos
(`docs/decisiones/`).

## 1. Las rutas del autor van aparte, bajo `/editor`

- **Decisión**: un grupo de rutas nuevo, `/editor/cursos/...`, para todo lo que
  hace el autor. La lista de sus cursos va en `GET /usuarios/yo/cursos`, que F04
  dejó libre para esto.
- **Por qué**: `GET /cursos/:idCurso` significa "un curso publicado, para
  cualquiera", y responde 404 a un borrador aunque lo pida su autor (F02). El
  autor necesita lo contrario para el mismo curso. Con un prefijo propio, cada
  grupo de rutas tiene una sola regla de acceso y no hay un `if` que las mezcle:
  F02 y F03 no se tocan.
- **Alternativa descartada**: agregar `PUT` y `DELETE` a `/cursos/:idCurso` y
  hacer que su `GET` responda distinto según quién pregunta. Mezcla dos reglas
  en una ruta y es la forma más fácil de filtrar un borrador por accidente.

## 2. Quién puede editar: una comprobación, con el curso bloqueado

- **Decisión**: toda escritura pasa por una función del servicio que abre una
  transacción, bloquea la fila del curso (`SELECT ... FOR UPDATE`) y comprueba
  ahí que el curso existe, que es de quien llama y que no está publicado.
- **Por qué**:
  - Una sola función es un solo lugar donde equivocarse (principio III).
  - El bloqueo cierra tres carreras de una vez. Dos "Nueva lección" a la vez
    calcularían la misma posición. Dos reordenamientos se pisarían. Y un
    administrador que publica mientras el autor guarda no deja una lección
    guardada en un curso ya publicado, que es justo lo que la spec prohíbe.
  - Un autor edita su curso solo: el bloqueo dura milisegundos y nadie espera.
- **Alternativa descartada**: comprobar antes de la transacción. Entre la
  comprobación y la escritura el curso podría publicarse.

## 3. Renumerar las lecciones sin chocar con el índice único

`leccion` tiene un índice único en `(id_curso, posicion)`, que PostgreSQL
comprueba fila por fila. Se probó con una tabla temporal en la base local:

| Operación | Resultado |
|---|---|
| Intercambiar dos posiciones en una sentencia | **Falla**: `duplicate key value violates unique constraint` |
| Bajar posiciones (`posicion - 1`) recorriendo por el índice | Pasa |
| Bajar posiciones recorriendo la tabla | **Falla**, con el mismo error |
| En dos pasos: negar las posiciones y luego fijar las finales | Pasa, con cualquier orden físico |

La segunda y la tercera fila son la misma sentencia: que pase depende del plan
que elija PostgreSQL. Por eso `posicion: { decrement: 1 }` al eliminar parecería
funcionar en las pruebas y fallaría después.

- **Decisión**: una sola función, `renumerarLecciones(tx, idsEnOrden)`, en dos
  pasos dentro de la transacción: `updateMany` con `posicion: { multiply: -1 }`
  y después fijar 1, 2, 3... Reordenar y eliminar la usan las dos. Con hasta 100
  lecciones son hasta 101 sentencias, en una acción que el autor hace pocas veces.
- **Alternativa descartada**: una restricción `DEFERRABLE`. Prisma no la modela:
  habría que mantenerla a mano en las migraciones y aparecería como diferencia
  con el esquema.

## 4. Versión más nueva: un entero, no la fecha

- **Decisión**: columna nueva `leccion.version`, entero, que sube 1 cada vez que
  se guarda la lección. El cliente manda la versión que abrió; si no es la
  actual y no viene `reemplazar: true`, el servidor responde 409 y no guarda.
- **Por qué**:
  - `leccion.actualizado_en` es `@updatedAt`: cambia con cualquier `update`,
    también al renumerar. Usarla daría avisos falsos después de reordenar, y la
    spec lo prohíbe ("reordenar las lecciones... no la hacen más nueva").
  - `renumerarLecciones` no toca `version`, así que la regla se cumple sola.
  - Un entero se compara exacto. Una fecha viaja como texto y depende de la
    precisión con que vuelva de la base.
- **Alternativa descartada**: una columna `contenido_guardado_en`. Sirve igual,
  pero compara fechas sin ganar nada.
- **Los datos del curso** no llevan versión: la spec acepta que quede lo último
  guardado (Supuestos).

## 5. Orden de "Cursos que creé"

- **Decisión**: se ordena por `curso.actualizado_en`, de la más reciente a la más
  antigua y, si empatan, por `id`. Toda escritura que cambia una lección actualiza
  también esa fecha, en la misma transacción.
- **Por qué**: `@updatedAt` solo cambia si se escribe la fila del curso, y guardar
  una lección escribe la de la lección. Hay que tocar el curso a propósito, o el
  criterio "al guardar un cambio en el de abajo... ese curso queda primero"
  fallaría.
- **Alternativa descartada**: calcular `MAX(leccion.actualizado_en)` al listar.
  No vería una lección eliminada.

## 6. Qué estado responde cada caso

| Caso | Estado | Por qué |
|---|---|---|
| Sin sesión | 401 | Como en F01 |
| Datos inválidos | 400, con `campos` | Como en F01 |
| El curso es de quien llama y está publicado | 403 | La spec le muestra un estado propio. Solo lo recibe su autor, así que no revela nada |
| Curso o lección que no existe, o curso ajeno | 404 | Mismo cuerpo en todos los casos, para no revelar cursos ajenos |
| Se guardó una versión más nueva | 409 | Es un conflicto que el cliente puede resolver reintentando con `reemplazar` |
| El orden no coincide con las lecciones del curso | 409 | Otra pestaña agregó o quitó una lección |

- **Dos mensajes por caso**: al abrir, la spec dice "Este curso no existe o ya no
  está disponible."; al guardar, "Este curso ya no existe. Tus cambios no se
  guardaron.". El servidor sabe cuál toca, porque las rutas `GET` usan uno y las
  que escriben el otro. El cliente muestra el `error` del 403 y del 404 tal cual,
  sin decidir nada.
- **Orden de las comprobaciones**: sesión, forma del cuerpo, curso, lección y
  versión. Validar el cuerpo primero no revela nada, porque no depende del curso.

## 7. La validación se escribe dos veces, con las mismas constantes

- **Decisión**: el backend amplía `validacion/actividades.ts`. La web valida en el
  formulario de cada tipo, para marcar "Incompleta" y mostrar los errores por
  campo. Los dos leen los límites y los mensajes del contrato.
- **Por qué**: el README del contrato lo prohíbe ("nada de lógica ni
  dependencias") y la decisión 0005 descartó un paquete compartido. F01 ya hace
  lo mismo con `validacion/cuenta.ts`. Las reglas sí son una sola fuente en
  cuanto a valores: si cambia un límite, cambia en los dos.
- **El servidor no da errores por campo**: responde `campos: {
  "actividades.2": "..." }` con la primera actividad que falla. Sus errores solo
  aparecen si el cliente dejó pasar algo, y la spec solo pide seleccionar esa
  actividad. `validarActividades` hoy lanza un `Error` con el texto "actividad 3
  (...)"; pasa a lanzar un error con `indice`, para no tener que leer ese número
  de un texto. El script de datos de prueba sigue mostrando el mismo mensaje.
- **Normalizar**: el servidor recorta el título del curso, el de la lección y el
  de la teoría. No toca los demás textos. No quita los campos opcionales vacíos:
  los rechaza, como hoy, y de quitarlos se encarga el cliente al armar la
  actividad.

## 8. El borrador no es la actividad

- **Decisión**: mientras se edita, cada actividad es un **borrador**, un tipo solo
  de la web, distinto del `Actividad` del contrato. Cada tipo define cómo pasar
  de uno a otro.
- **Por qué**: una actividad a medias no cabe en el contrato. `correcta` es un
  índice obligatorio, pero en un borrador puede no haber ninguna. Y quitar una
  opción movería los índices y la correcta acabaría señalando otra. En el
  borrador las opciones llevan un identificador local y `correcta` apunta a él
  (o es `null`), así que quitar una opción no confunde nada.
- **Qué define cada tipo** (`EditorActividad<T>`):

  | Campo | Para qué |
  |---|---|
  | `crearBorrador()` | La actividad recién agregada |
  | `aBorrador(actividad)` | Al abrir la lección |
  | `aActividad(borrador)` | Al guardar, probar y previsualizar. Quita lo opcional vacío |
  | `validar(borrador)` | Errores por campo; sin errores, está completa |
  | `resumen(borrador)` | El inicio del texto en el bloque |
  | `Formulario` | El formulario del inspector |

- **Registro**: `actividades/registroEditor.ts`, con el mismo tipo que
  `registro.ts`: `{ [T in TipoActividad]: EditorActividad<T> }`. Si un tipo nuevo
  no tiene su entrada, no compila (principio IV).
- **Dónde vive**: cada tipo guarda su editor junto a su componente, para que agregar
  un tipo sea tocar una carpeta. Son dos archivos, `actividades/Teoria/editorTeoria.ts`
  y `FormularioTeoria.tsx`: un `.tsx` que exporta algo más que componentes da un
  aviso de `react-refresh`, y el repo hoy no tiene ninguno. Lo que no depende del tipo va en `src/editor/`.

## 9. Formularios por tipo, sin esquema declarativo

- **Decisión**: un componente de formulario por tipo, armado con campos
  compartidos.
- **Por qué**: `docs/prototipo.md` hereda la idea de un esquema declarativo, pero
  ahí mismo avisa que los campos complejos caían a JSON crudo, y que en Brote van
  "formularios propios por tipo". De los cinco tipos, dos (opción múltiple y
  completar espacios) son justo los complejos: la opción correcta, y los grupos
  atados a los `___` del texto. Un esquema que los exprese sería un lenguaje nuevo
  para dos formularios, y F11 y F12 traerán más formas distintas.
- **Alternativa descartada**: el esquema declarativo del prototipo. Conviene si
  llegan muchos tipos parecidos, y se puede extraer entonces.

## 10. La paleta conoce 13 tipos; el contrato, 5

- **Decisión**: `src/editor/paleta.ts` declara los cuatro grupos con la etiqueta,
  el icono y el identificador de cada tipo, también de los que no existen todavía
  (`emparejar`, `clasificar`, `ordenar`, `bancoPalabras`, `retoCodigo`,
  `terminalSimulada`, `grafoCommits`, `escucharRepetir`). Un tipo se puede agregar
  si tiene entrada en `registroEditor`; si no, sale "Próximamente".
- **Por qué**: el principio IV pide que agregar un tipo no cambie otro código.
  Así, cuando F11 agrega `emparejar` al registro, su entrada de la paleta se
  activa sola. Basta con que usen el mismo identificador.
- **Alternativa descartada**: poner los ocho tipos en el contrato ahora. Rompería
  todos los `Record<TipoActividad, ...>` que obligan a implementarlos.

## 11. La vista previa: las actividades en un recuadro

Las actividades de F03 se hicieron para ocupar la pantalla. En el código hay
cuatro cosas que se rompen junto a un formulario:

| Dónde | Qué hace | Qué pasaría en la vista previa |
|---|---|---|
| `useEnfocarAlMontar` (teoría, tarjeta, opción múltiple y pregunta abierta) | Pasa el foco a la consigna al montarse | El autor perdería el foco con cada letra |
| `autoFocus` en el primer `CampoEspacio` de `CompletarEspacios` | Lo mismo, por otro camino | Lo mismo |
| `addEventListener("keydown")` en `document` (`OpcionMultiple` y `BarraRespuesta`) | Teclas 1 a 9 y Enter | Elegirían opciones y comprobarían fuera de la vista previa |
| `position: fixed` en `BarraRespuesta` | Barra pegada abajo de la ventana | Taparía la página |

- **Decisión**: un contexto, `AmbitoActividad`, que vale `null` en el reproductor
  y lleva el contenedor en la vista previa. Lo leen esos cuatro lugares. Las
  teclas pasan a un hook, `useTeclasActividad`, que en un ámbito ignora los
  eventos de afuera. Con `null`, todo sigue exactamente como en F03.
- **Por qué**: los componentes de cada actividad casi no cambian, y un tipo nuevo
  queda bien sin hacer nada, siempre que use esos mismos hooks. La vista previa
  sigue usando el mismo componente que ve el alumno (principio IV).
- **Alternativa descartada**: pasar una prop `enVistaPrevia` a cada componente.
  Hay que acordarse en cada tipo, y olvidarlo solo se nota escribiendo en el
  editor.
- **Actualizarse**: la vista previa se monta otra vez con una `key` que cambia con
  el contenido, y una espera de 300 ms (`useValorDemorado`) evita que las opciones
  se mezclen de nuevo con cada letra. Sigue viéndose "al momento". El bloque de la
  secuencia se actualiza sin espera.
- **"Reiniciar" y "Continuar"**: suben un contador que entra en la misma `key`.
  Después, el foco pasa a "Reiniciar", porque el componente que lo tenía se
  desmontó.

## 12. "Probar lección": una entrada de historial, sin salir de la página

- **Decisión**: el modo de prueba se dibuja en la misma página del lienzo. Al
  abrirlo se hace `navegar(ubicacion.pathname, { state: { probando: true } })` y
  al salir, `navegar(-1)`.
- **Por qué**:
  - El estado del editor vive en el hook de la página: seguir en la misma página
    es lo que deja el lienzo "como estaba".
  - La entrada de historial hace que el botón de volver del navegador regrese al
    lienzo. Como la dirección no cambia, el bloqueo de salida no salta (compara
    `pathname`, igual que en F03).
  - Corre con las actividades en memoria: no pide nada al servidor ni usa
    `useGuardarProgreso`. `ReproductorLeccion` y `useReproductor` ya no dependen
    de la red (F03), y F03 sigue sin abrir lecciones sin publicar.
- **Recargar en modo de prueba**: el navegador conserva `state`, pero la memoria se
  pierde. Al montarse, si llega `state.probando` sin haber abierto la prueba en
  esta visita, se reemplaza la entrada y se ve el lienzo.
- **Lo que cambia**: `ReproductorLeccion` recibe `aviso`, y `ResultadoLeccion`
  recibe `textoVolver` (ya acepta no recibir `guardado`).
- **Alternativa descartada**: una ruta propia, como `.../probar`. Desmontaría el
  editor, y habría que pasar todo por `state` o por un contexto.

## 13. Arrastrar con la API del navegador

- **Decisión**: arrastrar y soltar nativo de HTML5 (`draggable`, `onDragStart`,
  `onDragOver`, `onDrop`), con un hook propio `useArrastrar`, sin paquetes.
- **Por qué** (principio VI): la spec solo pide arrastrar con el ratón, porque en
  pantallas angostas y con teclado todo se hace con "Subir" y "Bajar". Eso cubre
  lo que la API nativa no da: el tacto y el teclado. Son tres usos muy parecidos
  (paleta a secuencia, dentro de la secuencia, y lecciones del mapa).
- **Una instancia por pantalla**: en el lienzo el arrastre empieza en la paleta y
  termina en la secuencia, así que el hook se crea en la página y se pasa a las dos.
- **Alternativa descartada**: `@dnd-kit`. Da animaciones, tacto y teclado, pero son
  varios paquetes para resolver lo que los botones ya resuelven. Si después se
  quiere arrastrar con el dedo, se justifica en esa feature.
- **Después (F11)**: F11 justificó arrastrar con el dedo, pero en el móvil y con gesture
  handler, que ya estaba instalado. La web sigue con ratón y la API del navegador, en un
  hook aparte, `useArrastrarElemento` (research de F11, puntos 2 y 3).

## 14. Salir sin guardar

- **Decisión**: hook `useSalirSinGuardar(cambios)`, con `useBlocker` (como F03) y
  un `beforeunload` solo mientras hay cambios. Lo usan el lienzo y los datos del
  curso, y entrega el `Dialogo` listo.
- **Salir a propósito**: al eliminar el curso con datos sin guardar hay que
  saltarse la pregunta. El hook expone `salirSinPreguntar()`.
- **Sesión expirada**: `RutaProtegida` cambia `Outlet` por `Navigate`, así que la
  página con el bloqueo se desmonta antes de navegar y el bloqueo no se interpone.
  Se comprueba con su criterio.

## 15. Recuperar lo no guardado después de que expira la sesión

La constitución (principio V) pide no perder lo capturado, y hoy un 401 lleva a
"Entrar" y desmonta el editor.

- **Decisión**: una sola copia en `localStorage`, en la clave `editor.copia`, con
  `{ idUsuario, ruta, datos }`. Se escribe solo al recibir un 401 al guardar o en una acción del mapa. Se lee
  y se borra al abrir esa misma `ruta` con ese mismo usuario, una vez cargada la
  pantalla.
- **Por qué**:
  - `pedir()` avisa de la sesión perdida y lanza el error. El `catch` de quien
    guardaba corre igual aunque la pantalla ya se esté desmontando, y conserva lo
    que iba a enviar, así que no hace falta copiar nada antes de cada guardado.
  - En la lección, la copia incluye la `version` que se abrió, así que el aviso de
    versión más nueva sigue valiendo (spec, "Versión más nueva").
  - **Otra cuenta**: `SesionProvider` borra la copia en cuanto hay un usuario
    distinto al de la copia, aunque nunca abra el editor (spec, "se descarta").
    - **En el mapa**, agregar, reordenar o eliminar también pueden recibir el 401, y
    el formulario del curso está en la misma pantalla. `ContenidoMapa` guarda lo
    capturado en una ref, así que cualquier acción escribe la copia con los datos sin
    guardar y el título de "Nueva lección".
  - Sin `localStorage` (modo privado), no se guarda nada: se pierde, como hoy.
- **Alternativa descartada**: copiar siempre mientras se edita, para sobrevivir
  también a un cierre del navegador. Es una feature distinta, con su pantalla de
  "recuperar cambios", y la spec no la pide.

## 16. "Cursos que creé" en "Mi panel"

- **Decisión**: un componente de sección más en `paginas/Panel/`, con su propio
  `usePeticion`, y una tarjeta nueva, `TarjetaCursoAutor`.
- **Por qué**: cada sección ya tiene sus estados, así que si una falla la otra
  sigue (spec). `TarjetaCurso` lleva siempre a `/cursos/:id` y muestra al autor; la
  tarjeta del autor no muestra autor y lleva a otro lado según el estado. Son pocas
  cosas en común: una variante más de `TarjetaCurso` la volvería una suma de `if`.
- **Enlaces**: como `TarjetaCurso`, toda la tarjeta es el enlace; "Editar" o "Ver
  curso" es el texto visible de la acción.

## 17. El mapa del curso

- **Cantidad de actividades**: se cuenta en la base con `jsonb_array_length`, en un
  `$queryRaw` como el del catálogo de F02. Con Prisma habría que traer las
  actividades de hasta 100 lecciones para contarlas.
- **Lista**: se guarda en estado local al cargar, para reordenar sin esperar. Al
  reordenar se ve el orden nuevo al instante; si falla, vuelve al anterior. Con 409
  se vuelve a pedir, porque la lista estaba vieja.
- **Formulario de los datos**: `useFormulario` de F01 gana una opción `leerError`,
  porque la spec pide aquí mensajes propios, no el de "No se pudo conectar".

## 18. Mover con botones sin perder el foco

- **Decisión**: "Subir" y "Bajar" usan `aria-disabled` en lugar de `disabled`, y
  después de mover se devuelve el foco al mismo botón.
- **Por qué**: la spec pide que el foco siga en el botón. Un botón `disabled` pierde
  el foco, y eso pasaría al llegar a la primera posición. Además, mover un elemento
  en el DOM puede quitarle el foco, así que se devuelve a mano. Se ven igual que
  deshabilitados, y al pulsarlos no pasa nada.
- **Anuncio**: una región `role="status"` oculta dice "Movida a la posición {n}".

## 19. Datos de prueba

- **Decisión**: `npm run bd:sembrar` agrega:
  - **Cuenta A** `creador@brote.test` y **cuenta B** `creador2@brote.test`, sin
    cursos. Hacen falta dos cuentas nuevas porque `autor2@brote.test` tiene "Huerto
    en casa".
  - La **cuenta autor** es `autor@brote.test`, dueña de los cuatro cursos del
    prototipo y de "Curso en borrador".
  - Dos borradores suyos: "Curso con cien lecciones" y "Lección con el máximo", con
    una lección de 50 tarjetas.
  - "Texto <b>hola</b> <script>" (F02) gana una lección con esas etiquetas en su
    título y las cinco actividades de "Textos con etiquetas" (F03). Es el único
    curso que las junta todas, como pide el criterio de "Contenido".
- **Por qué**: sembrar ya borra los cursos de las cuentas `@brote.test`, así que los
  que la cuenta A cree al validar desaparecen al volver a sembrar.
- **Cuidado**: sembrar pasa por `validarActividades`, que ahora tiene límites. Los
  cursos del prototipo caben (checklist de la spec), y si algo no cupiera, el script
  falla antes de tocar la base.
