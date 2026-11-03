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
| `acento` | `#F97362` | `#FF8A7A` | Detalles cálidos: rachas, novedad, ilustración. Solo decorativo |
| `acentoSuave` | `#FFEDEA` | `rgba(255,138,122,0.14)` | Fondo de avisos cálidos |
| `error` | `#DC2650` | `#FF6B85` | Errores de campo y de envío, respuesta incorrecta |
| `errorSuave` | `#FDECEF` | `rgba(255,107,133,0.14)` | Fondo de campo con error y de avisos de error |
| `texto` | `#1E1B3A` | `#ECEBFA` | Texto principal |
| `textoSuave` | `#5B5878` | `#A9A6C9` | Texto secundario, etiquetas, metadatos |
| `textoTenue` | `#8784A3` | `#6E6B8F` | Solo marcadores de posición e iconos inactivos |
| `borde` | `#E4E2F3` | `rgba(255,255,255,0.10)` | Separadores, bordes de campos |
| `bordeFuerte` | `#CFCCE8` | `rgba(255,255,255,0.18)` | Borde de botón secundario, campo en hover |
| `fondo` | `#F6F5FD` | `#0F0E1F` | Color base debajo del fondo ambiental |
| `vidrio` | `rgba(255,255,255,0.72)` | `rgba(30,28,58,0.62)` | Superficie de vidrio normal |
| `vidrioSuave` | `rgba(238,240,255,0.66)` | `rgba(46,42,92,0.55)` | Vidrio teñido (campos, zonas secundarias) |
| `vidrioOpaco` | `#FCFCFF` | `#1B1A33` | Sustituto del vidrio sin transparencia |
| `vidrioBorde` | `rgba(255,255,255,0.90)` | `rgba(255,255,255,0.10)` | Borde luminoso del vidrio |

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
layout raíz antes de ocultar el splash. Código: `ui-monospace` / `Menlo`.

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
- Ancho de lectura en la web: `anchoContenido` 1040 px; formularios: 420 px.
- En el móvil, margen lateral de pantalla: espacio `6` (20 px).

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
| `FondoAmbiental` | — | Web: en `body`. Móvil: envuelve cada pantalla (vista con `experimental_backgroundImage`) |
| `Superficie` | `tono`, `elevada` | Ver sección 3 |
| `Boton` | `variante` (`primario`, `secundario`, `fantasma`, `peligro`, `enlace`), `tamano` (`normal`, `chico`), `icono`, `iconoFinal`, `enviando`, `anchoCompleto` | Píldora. `enviando`: deshabilita y muestra indicador sin cambiar de ancho |
| `CampoTexto` | `etiqueta`, `error`, `ayuda`, `icono` | Fondo `vidrioSuave`; foco: borde `primario` + halo de 3 px `primarioSuave`; error: borde y fondo de error, mensaje con icono debajo |
| `CampoContrasena` | igual que `CampoTexto` | Botón de ojo de 44 px dentro del campo |
| `Buscador` | `valor`, `buscando` | Icono de lupa, botón para limpiar, indicador a la derecha mientras busca |
| `Aviso` | `tono` (`info`, `exito`, `error`, `calido`), `titulo` | Banda con icono para mensajes generales de formulario y estados |
| `IndicadorCarga` | `etiqueta` | Anillo índigo; nunca un texto "Cargando…" solo |
| `EstadoVacio` | `icono`, `titulo`, `texto`, `accion` | Icono en círculo de vidrio, título y texto centrados |
| `ErrorCarga` | `mensaje`, `alReintentar` | `EstadoVacio` con icono de nube tachada y botón "Reintentar" |
| `Insignia` | `tono` (`neutro`, `primario`, `brote`, `acento`), `icono` | Píldora chica con icono para metadatos ("6 lecciones") |
| `PortadaCurso` | `idCurso`, `titulo`, `tamano` (`tarjeta`, `detalle`) | Degradado + inicial; brillo superior |
| `TarjetaCurso` | `curso` | `Superficie` con portada, título (2 líneas), autor, descripción (3 líneas) e `Insignia` de lecciones |
| `Encabezado` (web) | — | Barra de vidrio pegajosa: marca a la izquierda, `MenuCuenta` a la derecha |
| Barra de pestañas (móvil) | — | Pestañas sobre `Superficie` flotante, iconos Lucide, activa en `primario` |

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
  al menos 56 px de alto con borde de 2 px.
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
- **Terminal simulada y código**: panel oscuro fijo `#16142E` con texto
  `ui-monospace` 14/22 y cursor `brote`, también en modo claro.
- **Fin de lección**: pantalla de resultado con `display`, insignias de logro
  en `broteSuave` y una celebración breve (`lento`), sin sonido por defecto.
- **Teclado** (web): las opciones se eligen con 1–9 y Enter comprueba.

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
