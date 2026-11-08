# Sistema de diseño de Brote

Este documento es la **fuente única** del aspecto y del comportamiento de la
interfaz de Brote. La web (`brote_web_react`) y el móvil (`brote_mobile_expo`)
lo implementan con los mismos valores; ninguna pantalla nueva se diseña desde
cero. Por qué se eligió así está en
[la decisión 0015](decisiones/0015-sistema-de-diseno-vidrio.md).

> **Para agentes**: antes de crear o cambiar una pantalla, lee este documento
> completo. Usa solo los tokens y componentes de aquí. Si una pantalla
> necesita algo que no existe, agrégalo **primero aquí** (token, componente o
> patrón), luego en los dos clientes, y después úsalo. Nunca escribas un color,
> una sombra o un tamaño de letra suelto en un componente.

## 1. Principios

1. **Vidrio sobre luz.** Las superficies son paneles translúcidos (vidrio
   esmerilado) sobre un fondo ambiental suave. El vidrio agrupa; el fondo
   respira. Nunca vidrio sobre vidrio más de dos niveles.
2. **Una acción principal por pantalla.** Un solo botón primario (índigo). El
   resto son secundarios, fantasmas o enlaces.
3. **El progreso es verde brote.** El lima se reserva para avance, aciertos y
   logros. No se usa para acciones ni para decorar.
4. **Calma y foco.** Mucho aire, poca tinta. Jerarquía con tamaño y peso, no
   con colores extra. Máximo dos colores fuertes visibles a la vez.
5. **Respuesta inmediata.** Todo lo que se toca responde: hover en web, presión
   (escala 0.98) en los dos, foco visible con teclado. Ninguna acción queda
   sin estado de "enviando".
6. **Accesible por defecto.** Texto con contraste ≥ 4.5:1 (3:1 en textos
   ≥ 18 px seminegritas), áreas táctiles ≥ 44 px, se respetan "reducir
   transparencia", "reducir movimiento" y el modo oscuro del sistema.

## 2. Tokens

Los nombres son los mismos en los dos clientes. Si cambias un valor, cámbialo
en los dos y en estas tablas.

| Tipo | Web (`src/estilos/tokens.css`) | Móvil (`src/constantes/tema.ts`) |
|---|---|---|
| Color | `var(--color-primario-suave)` | `useColores().primarioSuave` |
| Espacio | `var(--espacio-5)` | `espacio[5]` |
| Radio | `var(--radio-grande)` | `radio.grande` |
| Tipografía | `font: var(--texto-titulo1); letter-spacing: var(--espaciado-titulo1)` | `tipografia.titulo1` |
| Sombra | `var(--sombra-suave)` | `useSombras().suave` |
| Movimiento | `var(--duracion-rapida) var(--curva)` | `movimiento.rapido` |

### 2.1 Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `primario` | `#4F46E5` | `#8B85FF` | Botón principal, enlaces, foco, selección |
| `primarioHover` | `#4338CA` | `#A29DFF` | Hover / presión del primario |
| `primarioSuave` | `#EEF0FF` | `rgba(139,133,255,0.16)` | Fondo de chips, opción seleccionada, resaltes |
| `sobrePrimario` | `#FFFFFF` | `#12103A` | Texto e iconos sobre `primario` |
| `brote` | `#65A30D` | `#A3E635` | Barras de progreso, iconos de acierto (no texto pequeño en claro) |
| `broteFuerte` | `#4D7C0F` | `#A3E635` | Texto de acierto/logro; fondo de insignias con texto blanco |
| `broteSuave` | `#ECFCCB` | `rgba(163,230,53,0.14)` | Fondo de "correcto", tarjetas de logro |
| `sobreBrote` | `#FFFFFF` | `#1A2E05` | Texto sobre `broteFuerte` |
| `progresoFin` | `#84CC16` | `#84CC16` | Final del degradado de la barra de progreso (empieza en `brote`) |
| `acento` | `#F97362` | `#FF8A7A` | Detalles cálidos: rachas, novedad, ilustración. Solo decorativo |
| `acentoSuave` | `#FFEDEA` | `rgba(255,138,122,0.14)` | Fondo de avisos cálidos |
| `error` | `#DC2650` | `#FF6B85` | Errores de campo y de envío, respuesta incorrecta |
| `errorSuave` | `#FDECEF` | `rgba(255,107,133,0.14)` | Fondo de campo con error y de avisos de error |
| `texto` | `#1E1B3A` | `#ECEBFA` | Texto principal |
| `textoSuave` | `#5B5878` | `#A9A6C9` | Texto secundario, etiquetas, metadatos |
| `textoTenue` | `#8784A3` | `#6E6B8F` | Solo marcadores de posición, iconos inactivos y, en el grafo de commits (F12), las líneas y el borde de los commits (3.5:1 sobre el vidrio, en los dos modos) |
| `borde` | `#E4E2F3` | `rgba(255,255,255,0.10)` | Separadores, bordes de campos |
| `bordeFuerte` | `#CFCCE8` | `rgba(255,255,255,0.18)` | Borde de botón secundario, campo en hover |
| `fondo` | `#F6F5FD` | `#0F0E1F` | Color base debajo del fondo ambiental |
| `vidrio` | `rgba(255,255,255,0.72)` | `rgba(30,28,58,0.62)` | Superficie de vidrio normal |
| `vidrioSuave` | `rgba(238,240,255,0.66)` | `rgba(46,42,92,0.55)` | Vidrio teñido (campos, zonas secundarias) |
| `vidrioOpaco` | `#FCFCFF` | `#1B1A33` | Sustituto del vidrio sin transparencia |
| `vidrioBorde` | `rgba(255,255,255,0.90)` | `rgba(255,255,255,0.10)` | Borde luminoso del vidrio |
| `fondoVisor` | `rgba(10,9,26,0.94)` | `rgba(10,9,26,0.94)` | Fondo del visor de una imagen (F13), igual en los dos modos |

**Código** (F03): el panel de código es oscuro también en modo claro, así que
estos tokens valen lo mismo en los dos modos. Contraste comprobado contra su
fondo: texto 15.2:1, agregado 9.6:1, eliminado 7.5:1, encabezado 7.5:1, tenue
7.6:1 (5.8:1 sobre la etiqueta del lenguaje) y cursor 11.9:1.

| Token | Valor | Uso |
|---|---|---|
| `codigoFondo` | `#16142E` | Fondo de `BloqueCodigo`, `CampoCodigo` y `PanelTerminal` |
| `codigoTexto` | `#ECEBFA` | Texto normal del código |
| `codigoAgregado` | `#BEF264` | Texto de una línea de diff que empieza con `+` |
| `codigoAgregadoFondo` | `rgba(163,230,53,0.16)` | Fondo de esa línea |
| `codigoEliminado` | `#FDA4AF` | Texto de una línea de diff que empieza con `-` |
| `codigoEliminadoFondo` | `rgba(255,107,133,0.16)` | Fondo de esa línea |
| `codigoEncabezado` | `#A29DFF` | Línea de diff que empieza con `@@` |
| `codigoTenue` | `#A9A6C9` | La carpeta antes del `$`, la etiqueta del lenguaje y el código de solo lectura (F12). 7.6:1 |
| `codigoCursor` | `#A3E635` | El cursor del campo de código y de la terminal, y el `$` ("cursor brote", F12). 11.9:1 |
| `codigoEtiquetaFondo` | `rgba(255,255,255,0.10)` | Fondo de la etiqueta del lenguaje (F12) |

**Fondo ambiental** (`fondoAmbiental`): debajo de todo, nunca detrás de texto
sin vidrio.

- Claro: `radial-gradient(ellipse at 0% 0%, rgba(167,160,255,0.38), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(163,230,53,0.22), transparent 50%), radial-gradient(ellipse at 100% 0%, rgba(249,115,98,0.12), transparent 45%), linear-gradient(160deg, #F7F6FE, #F2F6F8)`
- Oscuro: `radial-gradient(ellipse at 0% 0%, rgba(79,70,229,0.35), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(101,163,13,0.14), transparent 50%), linear-gradient(160deg, #12112A, #0D0C1A)`

**Portadas de curso** (`portada1` a `portada8`): degradado diagonal del color al
mismo color 18 % más claro, con la inicial en blanco. Todas con contraste
≥ 4.5:1 con el blanco. Se elige por el `id` del curso
(`indiceColorPortada`), igual en web y móvil.

| `portada1` | `portada2` | `portada3` | `portada4` | `portada5` | `portada6` | `portada7` | `portada8` |
|---|---|---|---|---|---|---|---|
| `#4F46E5` índigo | `#7C3AED` violeta | `#4D7C0F` brote | `#C2410C` coral | `#1D4ED8` azul | `#0F766E` turquesa | `#BE185D` frambuesa | `#475569` pizarra |

### 2.2 Tipografía

**Plus Jakarta Sans** (400, 500, 600, 700, 800). Web: Google Fonts en
`index.html`. Móvil: `@expo-google-fonts/plus-jakarta-sans`, cargada en el
layout raíz antes de ocultar el splash. Código: `--fuente-codigo` en la web
(`ui-monospace`, `Menlo`, ...) y `fuentes.codigo` en el móvil (Menlo en iOS,
`monospace` en Android).

| Token | Tamaño / interlínea | Peso | Espaciado | Uso |
|---|---|---|---|---|
| `display` | 34 / 40 | 800 | -1.2 | Título de bienvenida, resultado de lección |
| `titulo1` | 28 / 34 | 700 | -0.9 | Título de pantalla |
| `titulo2` | 22 / 28 | 700 | -0.5 | Título de sección, de tarjeta grande |
| `titulo3` | 18 / 24 | 600 | -0.2 | Título de tarjeta, de lección |
| `cuerpo` | 16 / 24 | 400 | -0.1 | Texto normal, campos |
| `cuerpoChico` | 14 / 20 | 400 | 0 | Descripciones en tarjetas |
| `nota` | 13 / 18 | 500 | 0 | Metadatos, ayudas, errores de campo |
| `etiqueta` | 13 / 18 | 600 | 0 | Etiquetas de campo |
| `boton` | 15 / 20 | 600 | -0.1 | Texto de botones |
| `seccion` | 11 / 14 | 700 | 1.4, mayúsculas | Encabezados pequeños ("LECCIONES") |
| `codigo` | 14 / 22 | 400 | 0 | Código, en la fuente monoespaciada |

En la web los tamaños van en `rem` (16 px = 1 rem).

### 2.3 Espacio, radios y medidas

| Espacio | `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` |
|---|---|---|---|---|---|---|---|---|---|
| px | 2 | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 48 |

| Radio | `chico` | `medio` | `grande` | `enorme` | `pildora` |
|---|---|---|---|---|---|
| px | 12 | 18 | 26 | 34 | 999 |

- Botones y chips: `pildora`. Campos: `medio`. Tarjetas y paneles: `grande`.
  Hojas y paneles de pantalla completa: `enorme`.
- Área táctil mínima: **44 px**. Botón normal: 52 px de alto; chico: 44 px.
- Ancho de lectura en la web: `anchoContenido` 1040 px; formularios: 420 px;
  reproductor de lecciones: `anchoLeccion` 680 px.
- Editor (solo web): `anchoPaleta` 240 px y `anchoInspector` 440 px. Por debajo
  de 1024 px, el lienzo apila sus tres zonas.
- En el móvil, margen lateral de pantalla: espacio `6` (20 px).
- Imágenes (F13): `mosaicoOpcion` 144 px, el mínimo de un mosaico de opción (en la web,
  rejilla de `minmax(144px, 1fr)`; en el móvil, tantas columnas de al menos 144 px como
  quepan y nunca menos de dos: en un teléfono de 360 px, dos de 154); `mosaicoElemento`
  88 px, los mosaicos de clasificar y ordenar y los lugares de ordenar con imagen;
  `miniatura` 48 px, las imágenes de la barra inferior; y `altoImagenMax`, la mitad del
  alto de la pantalla, el máximo de una imagen de la teoría o de la pregunta.

### 2.4 Sombras y desenfoque

| Token | Claro | Oscuro |
|---|---|---|
| `sombraSuave` | `0 8px 28px rgba(49,46,129,0.08)` | `0 8px 28px rgba(0,0,0,0.35)` |
| `sombraElevada` | `0 16px 44px rgba(49,46,129,0.14), 0 2px 6px rgba(49,46,129,0.05)` | `0 16px 44px rgba(0,0,0,0.5)` |
| `sombraBoton` | `0 8px 18px rgba(79,70,229,0.28)` | `0 8px 18px rgba(0,0,0,0.4)` |
| `brilloVidrio` | `inset 0 1px 0 rgba(255,255,255,0.9)` | `inset 0 1px 0 rgba(255,255,255,0.08)` |
| `desenfoque` | `blur(24px) saturate(160%)` | igual |

### 2.5 Movimiento

| Token | Valor | Uso |
|---|---|---|
| `rapido` | 140 ms | Hover, presión, color |
| `medio` | 220 ms | Aparecer avisos, cambiar de estado |
| `lento` | 360 ms | Entrada de pantallas, celebraciones |
| `curva` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Todas las transiciones |

- Presión: escala 0.98 y opacidad 0.9. Hover (web): sube 1 px y sombra
  elevada en tarjetas; opacidad 0.94 en botones.
- Con "reducir movimiento" se quitan escalas, desplazamientos y animaciones;
  quedan solo cambios de color.

## 3. Superficie de vidrio

`Superficie` es la base de tarjetas, paneles, barras y campos. Tiene tres
tonos:

| Tono | Claro | Uso |
|---|---|---|
| `normal` | `vidrio` + `vidrioBorde` + `brilloVidrio` + `sombraSuave` | Tarjetas, paneles, formularios |
| `suave` | `vidrioSuave` | Zonas secundarias dentro de un panel |
| `solido` | `vidrioOpaco` | Encima de contenido que se mueve (menús) |

Cómo se logra en cada plataforma:

- **Web**: `background: var(--color-vidrio)` + `backdrop-filter: var(--desenfoque)`.
  Con `@media (prefers-reduced-transparency: reduce)` o sin soporte de
  `backdrop-filter`, usa `--color-vidrio-opaco`.
- **iOS**: `GlassView` de `expo-glass-effect` (Liquid Glass nativo) cuando
  `isLiquidGlassAvailable()` y la persona no activó "Reducir transparencia".
- **Android y resto**: vista opaca con `vidrioOpaco`, mismo borde y sombra.

Las pantallas nunca deciden esto: usan `Superficie` y el componente resuelve.

## 4. Componentes

Existen con el mismo nombre y las mismas props en los dos clientes (web en
`src/componentes/<Nombre>/`, móvil en `src/componentes/<Nombre>.tsx`).

| Componente | Props clave | Notas |
|---|---|---|
| `Texto` (móvil) | `variante` (nombre de la tabla 2.2), `color` (nombre de color) | Todo texto del móvil; aplica Plus Jakarta Sans. En la web lo resuelven las variables `--texto-*` |
| `FondoAmbiental` | — | Web: en `body`. Móvil: envuelve cada pantalla (vista con `experimental_backgroundImage`) |
| `Superficie` | `tono`, `elevada` | Ver sección 3 |
| `Boton` | `variante` (`primario`, `secundario`, `fantasma`, `peligro`, `enlace`), `tamano` (`normal`, `chico`), `icono`, `iconoFinal`, `enviando`, `anchoCompleto` | Píldora. `enviando`: deshabilita y muestra indicador sin cambiar de ancho. Un texto que no cabe se corta con "…" en una línea (F04) |
| `CampoTexto` | `etiqueta`, `error`, `ayuda`, `icono` | Fondo `vidrioSuave`; foco: borde `primario` + halo de 3 px `primarioSuave`; error: borde y fondo de error, mensaje con icono debajo |
| `CampoContrasena` | igual que `CampoTexto` | Botón de ojo de 44 px dentro del campo |
| `Buscador` | `valor`, `buscando` | Icono de lupa, botón para limpiar, indicador a la derecha mientras busca |
| `Aviso` | `tono` (`info`, `exito`, `error`, `calido`), `titulo` | Banda con icono para mensajes generales de formulario y estados |
| `IndicadorCarga` | `etiqueta` | Anillo índigo; nunca un texto "Cargando…" solo |
| `EstadoVacio` | `icono`, `titulo`, `texto`, `accion` | Icono en círculo de vidrio, título y texto centrados |
| `ErrorCarga` | `mensaje`, `alReintentar` | `EstadoVacio` con icono de nube tachada y botón "Reintentar" |
| `Insignia` | `tono` (`neutro`, `primario`, `brote`, `acento`), `icono` | Píldora chica con icono para metadatos ("6 lecciones") |
| `PortadaCurso` | `idCurso`, `titulo`, `tamano` (`tarjeta`, `detalle`) | Degradado + inicial; brillo superior. `idPortada` (F13): con una imagen, `ImagenCurso` `cubrir` que llena la portada; mientras carga, el color de la generada sin la inicial; si no carga, la generada completa |
| `TarjetaCurso` | `curso`, `avance` | `Superficie` con portada, título (2 líneas), autor, descripción (3 líneas) e `Insignia` de lecciones. Web: portada arriba (16:9) en rejilla; móvil: portada cuadrada a la izquierda. Con `avance` (`{ completadas, total }`, F04), en lugar de la descripción y la insignia muestra `AvanceCurso`: es la tarjeta de "Mis cursos" y "Sigue aprendiendo" |
| `Marca` | `tamano` (`normal`, `grande`) | Ver "Marca" abajo |
| Encabezado (web, en `Layout`) | — | Píldora de vidrio pegajosa: `Marca` a la izquierda, `MenuCuenta` (avatar, nombre y menú) a la derecha. Entre los dos (F04), el enlace "Mi panel" con `LayoutDashboard`: tiene el aspecto del `Boton` `fantasma` chico (es un enlace, con estilos propios y los mismos tokens); la página activa lo pone en `primario`. En pantallas angostas queda solo el icono, con su nombre accesible |
| Barra de pestañas (móvil) | — | Fondo `Superficie` sólida con esquinas superiores `grande`, iconos Lucide (`Compass` Explorar, `BookMarked` Mis cursos, `UserRound` Cuenta), activa en `primario` |
| Volver (detalle) | — | `Boton` `enlace` chico con `ArrowLeft` y "Cursos"; regresa a la pantalla anterior con su estado |
| `BarraProgreso` | `actual`, `total`, `etiqueta`, `textoValor` | Barra de la lección (sección 6) y del avance de un curso. Web: `role="progressbar"` con `aria-label={etiqueta}` y `aria-valuetext={textoValor}`; móvil: `accessibilityRole="progressbar"` con las mismas etiquetas. Las dos props son opcionales (F04): sin ellas, "Progreso de la lección" y "Actividad {n} de {total}" (o "Lección completada") |
| `AvanceCurso` | `completadas`, `total` | Avance de un curso (F04): "{c} de {t} lecciones" (con `t = 1`, "lección") en `cuerpoChico` seminegrita y debajo `BarraProgreso` con `etiqueta` "Avance del curso" y `textoValor` "{c} de {t} lecciones completadas". Con el curso terminado, además una `Insignia` `brote` con `CircleCheck` "Curso terminado" |
| `BarraRespuesta` | `estado` (`neutro`, `correcto`, `incorrecto`), `titulo`, `detalle`, `textoBoton`, `deshabilitado`, `alPulsar` | Barra inferior fija de cada actividad, con el `Boton` primario a ancho completo. `correcto`: fondo `broteSuave`, título en `broteFuerte` con `CircleCheck`; `incorrecto`: fondo `errorSuave`, título en `error` con `CircleX`. Anuncia el cambio (`aria-live` / `accessibilityLiveRegion`) y, al dejar de ser `neutro`, pasa el foco al botón. El `detalle` se desplaza a partir de 11rem en la web y del 35 % del alto de la pantalla en el móvil; el título y el botón quedan fijos (F11). `enfocar` (F11, solo en la web, porque en el móvil no hay teclado): al ponerse en `true`, pasa el foco al botón. `codigo` (F12): un comando o el nombre de un commit, entre el título y el detalle, en `codigo` y sin panel (la barra ya tiene su color), respetando sus espacios y partiendo las líneas largas; va en la misma zona que el `detalle` y se desplaza con él. En el móvil, el anuncio lo lee entre el título y el detalle. `lineas` (F13): una lista de líneas cuyas partes son un texto o una imagen; cada imagen es una `MiniaturaImagen` seguida de su texto alternativo, en una fila. Va en la zona que se desplaza, como el `detalle`, y el anuncio lee el texto alternativo (o "Imagen") |
| `OpcionRespuesta` | `estado` (`normal`, `seleccionada`, `correcta`, `incorrecta`), `texto` o `simbolo`, `numero` (solo web), `deshabilitada`, `alElegir` | Opción de la sección 6 (radio). Con `simbolo`, mosaico cuadrado con el símbolo en `display`. `imagen` (F13): mosaico cuadrado (al menos `mosaicoOpcion`) con `MosaicoImagen` y los bordes y colores de siempre; el número (web) es una insignia de 22 px arriba a la izquierda y el icono de correcta o incorrecta, otra arriba a la derecha. Con un GIF, el `BotonPausa` es hermano del botón, no va dentro |
| `BloqueCodigo` | `codigo`, `lenguaje`, `diff` | Panel `codigoFondo`, radio `medio`, `codigo` 14/22. Una fila por línea; las de diff (`+`, `-`, `@@`) con sus colores. Se desplaza hacia los lados en vez de cortar líneas. `lenguaje` (F12): la etiqueta del lenguaje de `CampoCodigo`, arriba a la derecha (sin ella con `otro`). `diff` (F12, por defecto `true`): con `false`, todas las líneas se ven normales, sin colores de diff |
| `CampoCodigo` | `valor`, `alCambiar`, `lenguaje`, `soloLectura`, `etiqueta` (nombre accesible) | Campo de código del reto (F12). Panel `codigoFondo`, radio `medio`, con la etiqueta del lenguaje arriba a la derecha: píldora `codigoEtiquetaFondo` con el nombre en `nota` `codigoTenue` (sin ella con `otro`). El texto en `codigo` 14/22, `codigoTexto`, con el cursor `codigoCursor`; en solo lectura, `codigoTenue`. Sin corrector, autocorrección ni mayúsculas automáticas, y todo cambio pasa por `textoTecleado`, así que las comillas, `--` y `...` quedan como se escribieron. Nombre accesible: `etiqueta` y el lenguaje (si no es `otro`). **Web**: un `textarea` sin ajuste de línea (las líneas largas se desplazan hacia los lados), de al menos 6 filas y que crece con el código, con Tab, Mayús+Tab y Esc (sección 6, "Teclado"); debajo, "Tab agrega dos espacios. Para salir del campo, pulsa Esc y luego Tab." en `nota` `textoSuave`, enlazado como descripción del campo, que desaparece en solo lectura. Foco: anillo `primario` en el panel. **Móvil**: de 6 a 12 líneas y, con más, se desplaza por dentro |
| `PanelTerminal` | `salidaPrevia`, `carpeta`, `comando`, `alCambiar`, `alEnviar`, `soloLectura`, `salida` | Terminal simulada (F12). Panel `codigoFondo`, radio `medio`, `codigo` 14/22. Arriba, la salida previa en `codigoTexto`; luego la línea del comando: la carpeta en `codigoTenue`, `$` en `codigoCursor` y el comando, con el cursor `codigoCursor`, que pasa a la línea siguiente si no cabe; y debajo, `salida`. La salida previa y `salida` respetan sus saltos de línea, sangría y tabulaciones, y parten las líneas largas. Pulsar en cualquier parte del panel enfoca la línea (en el móvil, abre el teclado). Enter (la tecla de enviar en el móvil) llama a `alEnviar` solo con algo escrito. Nombre accesible: "Comando", con la carpeta como descripción. Foco: anillo `primario` en el panel |
| `DiagramaCommits` | `actividad`, `elegido`, `comprobado`, `alElegir` | Grafo de commits (F12), dentro de una `Superficie`, de izquierda a derecha con el acomodo de `acomodarGrafo`. Líneas de 2 px en `textoTenue`: rectas en la misma fila y con una curva al cambiar de fila. Cada commit es un botón de 44 px con un círculo de 40 y el nombre en `codigo`: normal, fondo `vidrioOpaco` y borde de 2 px `textoTenue`; elegido, borde `primario` y fondo `primarioSuave`; correcto e incorrecto, como las opciones (sección 6), con `CircleCheck` o `CircleX` de 16 px en la esquina. Las etiquetas van encima de su commit: cada rama, una píldora `primarioSuave` con el nombre en `codigo` `primario` ("HEAD → {rama}" si HEAD apunta a ella); HEAD suelto, una píldora `primario` "HEAD" en `sobrePrimario`. Si dos etiquetas de una fila se enciman, una sube un nivel. Cabe en el ancho disponible sin estirarse de más (separación entre columnas de 48 a 96 px); con letra grande, si no cabe, se desplaza hacia los lados. El nombre accesible de cada commit dice su nombre, sus padres, sus ramas y HEAD y su estado ("Commit c2, padre c1, elegido") |
| `TarjetaVolteable` | `frente`, `reverso`, `volteada`, `alVoltear` | Dos caras de `Superficie` elevada (mínimo 200 px), texto `titulo2` centrado; gira sobre el eje vertical en `lento` |
| `CampoEspacio` | `valor`, `alCambiar`, `estado` (`normal`, `correcto`, `incorrecto`), `esperada`, `etiqueta`, `deshabilitado` | Campo en línea con el texto, de radio `chico`; bordes y fondos como las opciones. `esperada` va a su lado en `nota` `broteFuerte` |
| `Dialogo` (web) | `abierto`, `titulo`, `texto`, `textoConfirmar`, `textoCancelar`, `alConfirmar`, `alCancelar` | `<dialog>` modal: `Superficie` sólida, radio `enorme`, título `titulo2`, botones `secundario` (cancelar, con el foco) y `peligro` (confirmar). Esc cancela. En el móvil, la misma confirmación es `Alert.alert` nativo, con cancelar como `cancel` y confirmar como `destructive` |
| `ResultadoLeccion` | `titulo`, `aciertos`, `preguntas`, `alVolver`, `guardado`, `alReintentar` | Fin de lección (sección 6). `guardado` (F04) es el estado del progreso, en una zona entre los aciertos y el botón que anuncia sus cambios (`aria-live="polite"` / `accessibilityLiveRegion="polite"`): `"guardando"` ("Guardando tu progreso…" en `nota` `textoSuave` con un indicador chico, y "Volver al curso" con `enviando`); `"guardado"` (`CircleCheck` y "Progreso guardado" en `nota` `broteFuerte`); `"error"` y `"sinConexion"` (`Aviso` `error` con su texto y `Boton` `secundario` chico "Reintentar" → `alReintentar`); `"noDisponible"` (`Aviso` `error` sin "Reintentar") |
| `ElementoRespuesta` | `texto`, `estado` (como `OpcionRespuesta`), `forma` (`tarjeta`, `compacta`), `marca`, `atenuada`, `resaltada`, `deshabilitada`, `etiqueta`, `alPulsar` | Elemento que se mueve o se une (F11). Los colores de `OpcionRespuesta`, con icono al comprobar. `tarjeta`: 56 px de alto, radio `medio`. `compacta`: 44 px, radio `medio` y no `pildora`, porque el texto puede ocupar varias líneas. `marca`: número en un círculo `primarioSuave`. En el móvil, con `marca`, el icono de correcto o incorrecto va chico (14 px) como insignia en la esquina superior derecha del círculo, sobre un círculo `vidrioOpaco`, y no al borde: en las columnas de emparejar no le quita ancho al texto. `atenuada`: opacidad 0.4. `resaltada`: borde `primario` y fondo `primarioSuave`, sin sombra. Respeta la sangría. En la web acepta `propsOrigen` y `propsDestino`; en el móvil se envuelve en `Arrastrable` y `DestinoArrastre`. `imagen` y `forma` `mosaico` (F13): cuadrado de `mosaicoElemento`, o del ancho de su columna en emparejar, con `MosaicoImagen`; la `marca` arriba a la izquierda y el icono arriba a la derecha. Con un GIF, el `BotonPausa` es hermano del elemento y no empieza el arrastre |
| `LugarElemento` | `numero`, `enLinea`, `estado` (`normal`, `correcto`, `incorrecto`), `esperada`, `resaltado`, `etiqueta`, `children` | Donde se coloca un `ElementoRespuesta` (F11). Vacío: borde punteado de 2 px en `bordeFuerte`. `numero`: lugar de ordenar, a la izquierda. `enLinea`: espacio del banco, dentro del texto. `esperada` va al lado en `nota` `broteFuerte`, como en `CampoEspacio`. En la web acepta `propsDestino`; en el móvil se envuelve en `DestinoArrastre`. `mosaico` (F13): vacío, mide `mosaicoElemento`, con su borde punteado |
| `ZonaElementos` | `titulo`, `resaltada`, `etiqueta`, `alPulsar`, `children` | `Superficie` `suave` que agrupa elementos: los sin colocar, el banco o una categoría (F11). Sigue visible aunque esté vacía. Con `titulo`, es una categoría: el título es el botón y toda la zona se puede pulsar. En la web acepta `propsDestino`; en el móvil se envuelve en `DestinoArrastre` |
| `TextoConEspacios` (móvil) | `texto`, `dibujarEspacio` | Dibuja las líneas de un texto con espacios, porque en el móvil no se puede poner una vista dentro de un `Text`. Lo usan completar espacios y banco de palabras (F11). En la web no hace falta: los espacios van dentro del texto |
| `CapaArrastre` (móvil) | `arrastre` | La copia flotante que sigue al dedo, con `pointerEvents="none"` y `sombraElevada`. La dibuja `MarcoActividad` fuera de su `ScrollView` (F11). En la web, esa copia la dibuja el navegador |
| `ImagenCurso` | `imagen`, `ajuste` (`contener`, `cubrir`), `quieta`, `pausada`, `etiqueta` | La base de toda imagen de un curso (F13): la trae con la sesión y reserva su lugar con la proporción de `ancho` y `alto`. Cargando: fondo `vidrioSuave`. No cargó: `ImageOff` de 24 px en `textoTenue` y la `etiqueta` (el texto alternativo) o "No se pudo cargar la imagen" en `nota` `textoSuave`, centrados. Un GIF anima salvo con `quieta` o `pausada`. Se vuelve a pedir sola (web: al cambiar de actividad; móvil: al volver la conexión) |
| `BotonPausa` | `pausada`, `alPulsar` | El de un GIF (F13): círculo de 44 px `vidrioOpaco` con `sombraSuave` e icono `Pause` o `Play` de 20 px en `texto`, en la esquina inferior izquierda, a espacio 3 del borde. Nombre: "Pausar animación" o "Reanudar animación". Nunca va dentro de otro botón |
| `ImagenAmpliable` | `imagen` | La imagen de la teoría y de la pregunta (F13): un botón con `ImagenCurso` `contener`, radio `medio`, tan ancho como la actividad o como la imagen (lo menor), sin pasar de `altoImagenMax`, centrado. Abre `VisorImagen`. Nombre: el texto alternativo o "Imagen", y que se puede ampliar. Con un GIF, su `BotonPausa`; con "reducir movimiento", empieza en pausa |
| `VisorImagen` | `imagen`, `abierto`, `alCerrar` | La imagen a pantalla completa (F13), sobre `fondoVisor`, `contener` con margen espacio 5, y "Cerrar" (`X`) arriba a la derecha con el aspecto de `BotonPausa`. Un GIF lleva su `BotonPausa`, en el estado que tenía. Se anuncia como "Imagen ampliada". Web: `<dialog>` modal; Esc y pulsar el fondo lo cierran y el foco vuelve a la imagen. Móvil: `Modal` con pellizcar (de 1 a 4 veces) y arrastrar; el botón de volver de Android lo cierra |
| `MosaicoImagen` | `imagen`, `quieta` | Cuadro con fondo `vidrioSuave` y `ImagenCurso` `contener` con relleno espacio 2 (F13). Llena el cuadro que le dé quien lo usa: lo que sobra se ve con su fondo, también detrás de un PNG transparente |
| `MiniaturaImagen` | `imagen` | `miniatura` (48 px), radio `chico`, fondo `vidrioOpaco`, `ImagenCurso` `contener` `quieta` (F13). Decorativa: el texto alternativo va a su lado |

### Editor (solo web)

El editor de cursos solo existe en la web (decisión 0003), así que estos
componentes, sus props y las medidas `anchoPaleta` y `anchoInspector` no tienen
par en el móvil. Es la única excepción a "el mismo nombre y las mismas props en
los dos clientes".

| Componente | Props clave | Notas |
|---|---|---|
| `CampoTexto` (cambia) | `maxLongitud`, `deshabilitado`, `invalido`, `codigo` | `invalido` (F11): marca el campo como inválido sin mensaje propio, cuando el error se muestra en otro lado. `codigo` (F12): en `--fuente-codigo` y sin corrector, como `CampoArea`. Solo en la web |
| `CampoArea` | `id`, `etiqueta`, `valor`, `alCambiar`, `error`, `ayuda`, `maxLongitud`, `filas`, `codigo`, `deshabilitado` | `CampoTexto` de varias líneas, con el mismo aspecto. Con `codigo`, en `--fuente-codigo`. Expone su `ref`, para escribir donde está el cursor |
| `CampoSelector` | `id`, `etiqueta`, `valor`, `opciones`, `textoVacio`, `alCambiar`, `error`, `ayuda`, `invalido`, `deshabilitado` | `<select>` nativo con el aspecto de `CampoTexto` (F11). `ayuda` e `invalido` (F12), como en `CampoTexto`: la ayuda va debajo, y `invalido` lo marca sin mensaje propio (el error de columnas del grafo va en un `Aviso`) |
| `CampoConEspacios` | `id`, `valor`, `alCambiar`, `ayuda`, `error`, `maxLongitud`, `deshabilitado` | El campo de texto en letra de código con "Agregar espacio". Lo usan completar espacios y banco de palabras (F11) |
| `ListaEditable` | `filas`, `dibujarFila`, `alAgregar`, `alQuitar`, `textoAgregar`, `minimo`, `maximo`, `deshabilitada` | Filas con "Quitar" y un `Boton` `secundario` chico con `Plus` para agregar. La usan los puntos clave, las opciones y las respuestas aceptadas |
| `BotonesOrden` | `alSubir`, `alBajar`, `esPrimero`, `esUltimo`, `etiqueta` | "Subir" (`ChevronUp`) y "Bajar" (`ChevronDown`), de 44 px. En los extremos usan `aria-disabled`, no `disabled`, para no perder el foco |
| `TarjetaCursoAutor` | `curso` | `Superficie` con portada, título, `InsigniaEstadoCurso`, `Insignia` "Revisión no aprobada" si la hay, `Insignia` de lecciones y el texto de la acción: "Editar" en borrador y "Administrar" en los demás. Toda la tarjeta es un enlace al mapa |
| `InsigniaEstadoCurso` | `estado` | La `Insignia` de "Estado de un curso" (sección 5). La usan `TarjetaCursoAutor`, los datos del mapa y la pantalla de un curso que no se edita |
| `Aviso` (cambia) | `titulo`, `icono` | `titulo` en seminegrita sobre el texto. `icono` reemplaza al del tono. El texto respeta los saltos de línea. Solo en la web |
| `PaletaActividades` | `alAgregar`, `deshabilitada`, `arrastre` | Grupos en `seccion`, tipos como botones con icono. Sin registro: texto en `textoSuave`, icono en `textoTenue` e `Insignia` `neutro` "Próximamente" |
| `BloqueActividad` | `numero`, `etiqueta`, `icono`, `resumen`, `incompleta`, `seleccionado`, `alSeleccionar`, `alEliminar`, orden | `Superficie` con asa `GripVertical` y un `<button>` con número, tipo y resumen en una línea, hermano de los botones de orden y de "Eliminar". Seleccionado: borde `primario` y fondo `primarioSuave`. Incompleta: `Insignia` `acento` con `CircleAlert` |
| `VistaPrevia` | `actividad`, `idBloque`, `mensaje` | `Superficie` `suave` con "VISTA PREVIA" en `seccion` y "Reiniciar" (`RotateCcw`). Monta la actividad en `AmbitoActividad` |
| `Dialogo` (cambia) | `enviando` | Pone `enviando` en el botón de confirmar. Solo en la web |
| `ResultadoLeccion` (cambia) | `textoVolver` | Por defecto, "Volver al curso". Solo en la web |
| `BarraRespuesta` (cambia) | — | Dentro de un `AmbitoActividad` va en línea, no fija. Solo en la web |
| `CampoImagen` | `id`, `etiqueta`, `valor`, `alCambiar`, `alElegirArchivo`, `error`, `soloFotos`, `conTextoAlternativo`, `deshabilitado` | El campo de una imagen (F13). Vacío: `Boton` `secundario` chico "Elegir imagen" con `ImagePlus` y la nota de formatos en `nota` `textoSuave`. Subiendo: un `IndicadorCarga` chico y "Subiendo imagen…". Con imagen: `ImagenCurso` de 96 px, "{ancho} × {alto} px · {peso}" en `nota`, "Cambiar" y "Quitar" (`fantasma` chico) y, con `conTextoAlternativo`, un `CampoTexto` "Texto alternativo" con su ayuda. El error, debajo, como en `CampoTexto`. El `<input type="file">` acepta `image/*` y está oculto |
| `VistaPortada` | `idCurso`, `titulo`, `portada` | La portada en el mapa (F13): dos `PortadaCurso` lado a lado, en tarjeta (16:9) y en detalle (cuadrada) |
| `PesoImagenes` | `peso`, `maximo`, `texto` | "{texto}: {x} de {máximo} MB" en `nota` `textoSuave` (F13); si pasa del máximo, en `error` con `CircleAlert` |

**Iconos**: [Lucide](https://lucide.dev), `lucide-react` en la web y
`lucide-react-native` en el móvil. Trazo 2, tamaño 20 (16 en insignias, 24 en
pestañas). Los iconos acompañan texto; un icono solo lleva
`aria-label` / `accessibilityLabel`.

**Marca**: un brote de dos hojas (icono `Sprout` de Lucide) en un círculo con
degradado índigo → violeta, seguido de "Brote" en `titulo3` peso 800.

## 5. Patrones de pantalla

- **Estructura**: `FondoAmbiental` → contenido. En la web, `Encabezado` arriba y
  el contenido centrado a `anchoContenido`. En el móvil, área segura y margen
  espacio `6`.
- **Título de pantalla**: `titulo1`, con una línea de `textoSuave` debajo si
  hace falta explicar algo.
- **Formularios (Entrar, Crear cuenta)**: tarjeta `Superficie` centrada de
  420 px en la web; en el móvil, la marca arriba y la tarjeta ocupando el
  ancho. Campos con espacio `5` entre sí, botón principal a ancho completo, enlace
  secundario debajo.
- **Listas de tarjetas**: rejilla en la web (`repeat(auto-fill, minmax(300px, 1fr))`,
  separación espacio `6`); lista vertical en el móvil (espacio `5`).
- **Estados**: cada pantalla que pide datos tiene los cuatro: cargando
  (`IndicadorCarga` centrado), vacío (`EstadoVacio`), error (`ErrorCarga`) y
  con datos. Al recargar con datos en pantalla, los datos se quedan y se
  atenúan (opacidad 0.55); nunca se reemplazan por el indicador.
  - **Recarga al volver** (móvil, F04): al volver a una pantalla que quedó
    montada (el detalle del curso, "Mis cursos"), se pide otra vez sin
    indicador ni atenuación. Si falla, los datos se quedan y aparece encima
    el `Aviso` de error (o de sin conexión) con "Reintentar", igual que
    cuando falla deslizar hacia abajo.
- **Detalle del curso con progreso** (F04): si el curso tiene lecciones,
  debajo de la descripción y antes de "Lecciones" va una `Superficie` con
  `AvanceCurso` y, si queda alguna lección sin completar, el `Boton`
  primario "Empezar: 1. {título}" / "Continuar: {n}. {título}" con
  `iconoFinal` `ArrowRight` (en el móvil, a ancho completo). Abre la primera
  lección sin completar en el orden del curso. Con el curso terminado no hay
  botón.
- **Lección completada en la lista** (F04): el círculo del número pasa a
  `broteSuave` con el número en `broteFuerte`, y antes de la flecha van un
  `CircleCheck` `broteFuerte` y, si la lección tiene preguntas, "{a} de {p}
  aciertos" en `nota` `textoSuave`. El color no es la única pista: el icono
  y el nombre accesible, "{n}. {título}, completada" y, si hay, ", {a} de
  {p} aciertos".
- **Página personal** ("Mi panel", web, F04): título `titulo1` y una sección
  por bloque, con su título en `seccion` ("Sigue aprendiendo") y sus propios
  estados (cargando, vacío, error, con datos). Las tarjetas van en la
  rejilla de "Listas de tarjetas". Cada feature que agregue un bloque suma
  su sección. "Cursos que creé" (F05) lleva "Nuevo curso" (`Boton` primario
  chico con `Plus`) a la derecha de su título.
- **Estado de un curso** (F05, F06): "Borrador" con `Insignia` `neutro` y
  `PencilLine`; "En revisión" con `Insignia` `acento` y `Hourglass`; "Publicado"
  con `Insignia` `primario` y `Globe`. Aparte del estado, "Revisión no aprobada"
  con `Insignia` `acento` y `MessageSquareWarning`. El lima no se usa aquí: no es
  un avance del alumno.
- **Mapa del curso** (web, F05): arriba, `Boton` `enlace` chico "Mi panel" con
  `ArrowLeft`. Una `Superficie` con los datos del curso y otra con las
  lecciones. "Guardar cambios" es el `Boton` primario de la pantalla; "Nueva
  lección" y "Agregar", `secundario`; el "Eliminar" de cada lección, `fantasma`
  chico. "Eliminar curso" al final, como `Boton` `peligro`. A su lado, "Enviar a
  revisión" (F06), `Boton` primario con `Send`; debajo, con cambios sin guardar, la
  nota en `nota` `textoSuave`. Una lección vacía marcada cambia "Sin actividades" por
  una `Insignia` `acento` con `CircleAlert`. El rechazo es un `Aviso` `calido` con
  `MessageSquareWarning`, arriba de los datos.
- **Curso que no se edita** (web, F06): el mapa de un curso en revisión o publicado.
  Arriba, `Boton` `enlace` chico "Mi panel" con `ArrowLeft`. Una `Superficie` con
  `PortadaCurso`, el título en `titulo1`, `InsigniaEstadoCurso`, el mensaje en
  `titulo3`, el texto en `textoSuave` y los botones en fila: "Retirar de revisión"
  (`secundario`, `Undo2`), "Ver curso" (primario, `Eye`) y "Retirar del catálogo"
  (`secundario`, `EyeOff`).
- **Lienzo de la lección** (web, F05): fuera del marco común. Barra superior
  `Superficie` pegajosa con "Volver al curso", el título, "Cambios sin guardar"
  o "Lección guardada" en `nota`, "Probar lección" (`secundario`, `Play`) y
  "Guardar lección" (primario). Debajo, una rejilla de `anchoPaleta`, el resto y
  `anchoInspector`.
- **Errores de campo** debajo del campo, en `nota` color `error`, con icono.
  **Errores generales** en un `Aviso` arriba del botón principal.

## 6. Actividades interactivas (F03 en adelante)

El reproductor de lecciones es la parte más importante de Brote. Estas reglas
son la base para todas las actividades; cada spec de actividad las concreta.

- **Pantalla de lección**: barra superior con botón de cerrar (X) y una
  **barra de progreso** gruesa (10 px, radio `pildora`, relleno `brote` con
  degradado a `#84CC16`) que avanza con animación `medio`.
- **Consigna** en `titulo2`; el contenido de la actividad en `Superficie`.
- **Opciones** (opción múltiple, emparejar, ordenar): tarjetas de vidrio de
  al menos 56 px de alto con borde de 2 px. La opción múltiple usa
  `OpcionRespuesta`; emparejar y ordenar, `ElementoRespuesta`.
  - Normal: borde `borde`. Hover: borde `bordeFuerte`.
  - Seleccionada: borde `primario`, fondo `primarioSuave`, sombra elevada.
  - Correcta: borde `broteFuerte`, fondo `broteSuave`, icono de palomita.
  - Incorrecta: borde `error`, fondo `errorSuave`, icono de X y una sacudida
    horizontal de 6 px (sin ella con "reducir movimiento").
- **Comprobar**: botón primario a ancho completo, fijo abajo sobre una
  `Superficie` (barra inferior), deshabilitado hasta que haya respuesta.
- **Retroalimentación**: al comprobar, la barra inferior cambia a `broteSuave`
  ("¡Correcto!" en `broteFuerte` con icono) o `errorSuave` (la respuesta
  correcta en texto), y el botón pasa a "Continuar".
- **Terminal simulada y código**: panel oscuro fijo `codigoFondo` (`#16142E`)
  con texto `codigo` 14/22 (`ui-monospace`) y el cursor brote, `codigoCursor`,
  también en modo claro.
- **Fin de lección**: pantalla de resultado con `display`, insignias de logro
  en `broteSuave` y una celebración breve (`lento`), sin sonido por defecto.
  En F03 (`ResultadoLeccion`): icono `PartyPopper` en un círculo `broteSuave`
  que crece con un rebote, "¡Lección completada!" en `display`, el título de
  la lección en `titulo3`, una `Insignia` `brote` "Acertaste {a} de {p}" (si
  la lección tiene preguntas) y "Volver al curso" como botón primario.
- **Teoría**: título en `titulo2`, párrafos en `cuerpo`, `BloqueCodigo` y los
  puntos clave como lista con un `Check` `brote` por punto.
- **Tarjeta de memoria**: `TarjetaVolteable` y, debajo, "Toca la tarjeta para
  voltearla" en `nota` `textoSuave` con `RotateCw`, que desaparece al primer
  giro. "Continuar" se habilita al voltearla por primera vez.
- **Completar espacios**: el texto en una `Superficie`, respetando saltos de
  línea y sangría, con un `CampoEspacio` en cada espacio. Al comprobar, junto
  a cada espacio incorrecto aparece la respuesta esperada, y la barra inferior
  muestra el texto completo con las respuestas.
- **Pregunta abierta**: campo de varias líneas con el aspecto de
  `CampoTexto`. Al comprobar queda de solo lectura y aparece una `Superficie`
  `suave` con "SOLUCIÓN DE REFERENCIA" en `seccion` y la solución; luego
  "¿La tuviste bien?" con "La tuve bien" y "No la tuve" (`Boton`
  `secundario`). La barra inferior dice "¡Correcto!" o "A repasar".
- **Emparejar** (F11): dos columnas iguales de `ElementoRespuesta` `tarjeta`, lado a
  lado también en el móvil. La pareja se ve por su `marca`.
- **Clasificar** (F11): `ZonaElementos` con los elementos sin colocar y, debajo, una
  por categoría. Las categorías se acomodan solas: lado a lado si caben al menos
  14rem, una debajo de otra si no.
- **Ordenar** (F11): los `LugarElemento` numerados en columna y, debajo, una
  `ZonaElementos` con los `ElementoRespuesta` `tarjeta`.
- **Banco de palabras** (F11): el texto en una `Superficie`, con un `LugarElemento`
  `enLinea` en cada espacio y, debajo, una `ZonaElementos` con las fichas.
- **Reto de código** (F12): la consigna y `CampoCodigo`. Al comprobar, el campo queda
  de solo lectura y aparece una `Superficie` `suave` con "SOLUCIÓN DE REFERENCIA" en
  `seccion` y `BloqueCodigo` con `lenguaje` y `diff={false}`; luego la autoevaluación,
  como la pregunta abierta. La barra inferior dice "¡Correcto!" o "A repasar".
- **Terminal simulada** (F12): la consigna y `PanelTerminal`. Al comprobar, el comando
  queda fijo en su línea. Al acertar, la salida va en el panel, debajo del comando, y la
  barra dice "¡Correcto!"; al fallar, la barra lleva "Respuesta correcta:", el comando
  esperado en `codigo` y la pista en `detalle`.
- **Grafo de commits** (F12): la consigna y `DiagramaCommits`. Los commits se eligen como
  opciones; al comprobar se marcan como ellas. La barra inferior lleva el nombre del
  commit correcto en `codigo` (si falló) y la explicación en `detalle`.
- **Imágenes** (F13):
  - **Teoría**: cada `[imagen]` del texto es una `ImagenAmpliable`, sola entre párrafos;
    una marca a la mitad de un párrafo lo parte en dos.
  - **Opción múltiple**: la imagen de la pregunta, `ImagenAmpliable`, entre la pregunta y
    el código. Las opciones de imagen, en una rejilla de mosaicos de `mosaicoOpcion`.
  - **Relacionar**: emparejar con mosaicos del ancho de su columna, que siguen lado a lado;
    clasificar y ordenar con mosaicos de `mosaicoElemento`, en filas que se acomodan solas.
  - **Imagen que no carga**: el estado "no cargó" de `ImagenCurso`; la actividad se
    responde igual. **GIF**: se mueve solo, con `BotonPausa`; con "reducir movimiento",
    quieto en su primer cuadro. Pausar no cuenta como haber hecho algo.
  - **Al fallar**: las imágenes de la respuesta correcta, como `MiniaturaImagen` en las
    `lineas` de `BarraRespuesta`.
  - **Visor**: tocar una imagen de la teoría o de la pregunta abre `VisorImagen`; los
    mosaicos no se amplían, porque tocarlos los elige. Abrirlo no cuenta como haber hecho
    algo.
- **Arrastrar** (F11): la copia que sigue al dedo lleva `sombraElevada`. El origen va
  `atenuada` y el destino, `resaltada`. Al soltar fuera no hay animación de regreso,
  con o sin "reducir movimiento": la copia desaparece y el elemento ya está en su
  lugar.
- **Salir de la lección**: la X es un `Boton` `fantasma` chico con la etiqueta
  "Salir de la lección". Si el alumno ya hizo algo, salir (con la X, el botón
  de volver o el gesto de atrás) pide confirmación con `Dialogo` en la web y
  `Alert.alert` en el móvil: "¿Salir de la lección?", "Perderás tu avance en
  esta lección.", "Seguir aquí" y "Salir".
- **Teclado** (web): las opciones se eligen con 1–9 (según su lugar en
  pantalla) y Enter pulsa el botón de la barra inferior, salvo con el foco en
  un `<textarea>`, un botón o un enlace. En completar espacios, Tab pasa al
  siguiente espacio y Enter comprueba. Al comprobar, el foco pasa a
  "Continuar"; al pasar de actividad, al título de la nueva. En las actividades de
  relacionar (F11), las teclas 1 a 9 no hacen nada, y todo se hace con Tab, Enter y
  la barra espaciadora. Después de colocar algo, el foco pasa al siguiente elemento
  sin colocar; después de formar una pareja, al siguiente sin pareja de la columna
  donde se empezó; con la respuesta completa, a "Comprobar"; y al devolver un
  elemento, a ese elemento.
  En las actividades de código y terminal (F12), las teclas 1 a 9 tampoco hacen nada:
  - `CampoCodigo`: Tab mete dos espacios donde está el cursor (con varias líneas
    seleccionadas, al inicio de cada una) y Mayús+Tab quita hasta dos del inicio de
    cada línea; los dos se deshacen con Ctrl+Z (Cmd+Z). Después de Esc, el siguiente
    Tab sale del campo hacia adelante y Mayús+Tab hacia atrás; cualquier otra tecla,
    salvo las modificadoras (Mayús, Control, Alt y Cmd), o salir del campo, devuelven
    Tab a meter espacios. Enter salta de línea. De solo lectura, Tab sale del campo.
  - Terminal: Enter, con el foco en la línea del comando, comprueba.
  - Grafo: Tab recorre los commits por columnas, de izquierda a derecha y, en cada
    una, de arriba abajo; Enter o la barra espaciadora eligen el commit con el foco.
  - Al comprobar la terminal o el grafo, el foco pasa a "Continuar"; en el reto, como
    en la pregunta abierta, a la autoevaluación y, al autoevaluarse, a "Continuar".
  Con imágenes (F13), Tab llega a cada `ImagenAmpliable` y a cada `BotonPausa`, y Enter o
  la barra espaciadora los pulsan; en la opción múltiple, las teclas 1 a 9 siguen eligiendo
  los mosaicos según su lugar en pantalla.
- **Vista previa** (web, F05): la actividad real en un recuadro, dentro de
  `AmbitoActividad`. No toma el foco al actualizarse, sus teclas solo actúan con
  el foco dentro y su barra de respuesta va en línea.
- **Modo de prueba** (web, F05): el reproductor con un `Aviso` `info` "Modo de
  prueba: esto no cuenta como progreso." debajo del encabezado. Al terminar,
  `ResultadoLeccion` sin `guardado` y con "Volver al editor".
- **Iconos de los tipos** (F05): Teoría `BookOpen`, Tarjeta `Layers`, Opción
  múltiple `ListChecks`, Completar espacios `TextCursorInput`, Pregunta abierta
  `MessageSquareText`, Emparejar `Link2`, Clasificar `Columns3`, Ordenar
  `ArrowDownUp`, Banco de palabras `WholeWord`, Reto de código `Code`, Terminal
  simulada `SquareTerminal`, Grafo de commits `GitGraph`, Escuchar y repetir
  `Mic`. Imágenes (F13): `ImageOff` (no cargó), `Pause` y `Play` (GIF), `X` (cerrar el
  visor) e `ImagePlus` (elegir imagen).

## 7. Accesibilidad (checklist de cada pantalla)

- [ ] Contraste de texto según la sección 1; nunca texto en `brote` o `acento`
      sobre blanco.
- [ ] Todo lo interactivo tiene foco visible (anillo de 2 px `primario` con
      separación de 3 px) y nombre accesible.
- [ ] Áreas táctiles de al menos 44 px.
- [ ] Funciona con "reducir transparencia" y "reducir movimiento".
- [ ] Se ve bien en modo oscuro y con texto al 200 % (web) o tamaño de letra
      grande (móvil).
- [ ] Los mensajes de error y de estado se anuncian (`role="alert"` /
      `aria-live` en la web, `accessibilityLiveRegion` en el móvil).

## 8. Cómo se extiende

1. Algo nuevo que se repite (un color, un componente, un patrón) se agrega
   primero en este documento.
2. Luego en `tokens.css` y `tema.ts`, con el mismo nombre.
3. Luego el componente en los dos clientes, con las mismas props.
4. El plan de cada feature (`/speckit-plan`) dice qué componentes usa y cuáles
   crea; las tareas de interfaz citan la sección de este documento que siguen.
