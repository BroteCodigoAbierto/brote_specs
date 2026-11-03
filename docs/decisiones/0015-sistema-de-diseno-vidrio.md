# 0015. Sistema de diseño de vidrio, compartido por web y móvil

**Estado**: Aceptada · **Fecha**: 2026-11-02

## Contexto

Las pantallas de F01 y F02 funcionaban, pero cada componente se veía como una
maqueta: sin jerarquía, sin profundidad, sin iconos ni estados de interacción.
Si la base es así, las actividades interactivas de F03 en adelante, que son el
corazón de Brote, también lo serían. Se toma como referencia de calidad el
sistema "Glass" de HuellitasCare (superficies translúcidas, tipografía
cuidada, tokens compartidos entre plataformas), con paleta propia.

## Decisión

- Un sistema de diseño único, descrito en [`docs/diseno.md`](../diseno.md),
  que la web y el móvil implementan con los mismos nombres de tokens y de
  componentes. Es la fuente de verdad: lo nuevo se agrega ahí primero.
- **Estilo**: superficies de vidrio esmerilado sobre un fondo ambiental de
  degradados suaves. En iOS se usa Liquid Glass nativo (`expo-glass-effect`);
  en la web, `backdrop-filter`; en Android y con "reducir transparencia", una
  superficie opaca equivalente.
- **Paleta**: índigo (`#4F46E5`) para acciones, lima "brote" (`#65A30D`) solo
  para progreso y logros, coral (`#F97362`) como acento decorativo; modo claro
  y oscuro.
- **Tipografía**: Plus Jakarta Sans (Google Fonts en la web,
  `@expo-google-fonts/plus-jakarta-sans` en el móvil).
- **Iconos**: Lucide en los dos clientes (`lucide-react`, `lucide-react-native`
  con `react-native-svg`).
- Se mantiene la decisión [0009](0009-estilos-css-modules.md): en la web,
  CSS Modules con variables en `tokens.css`; en el móvil, `StyleSheet` con
  valores de `tema.ts`. No se agrega librería de componentes.

## Dependencias nuevas

| Repo | Paquete | Para qué | Alternativa descartada |
|---|---|---|---|
| web | `lucide-react` | Iconos | SVG dibujados a mano: más trabajo y distintos al móvil |
| móvil | `lucide-react-native`, `react-native-svg` | Iconos (los mismos de la web) | Ionicons de Expo: no existen igual en la web |
| móvil | `@expo-google-fonts/plus-jakarta-sans` | Tipografía | Fuente del sistema: distinta en cada plataforma |
| móvil | `expo-glass-effect` | Liquid Glass en iOS | `expo-blur`: no es el material nativo de iOS 26 |

## Alternativas consideradas

- **Seguir con estilos sueltos por pantalla**: rápido, pero cada feature
  inventa su propio aspecto y la calidad depende de quién la haga.
- **Librería de componentes** (Tamagui, NativeWind + shadcn): resuelve mucho,
  pero el aspecto sería el de la librería y contradice la 0009.
- **Copiar la paleta verde de HuellitasCare**: Brote es otro producto; se
  conserva la calidad, no la identidad.

## Consecuencias

- Toda pantalla nueva usa los componentes de `docs/diseno.md`; el plan de cada
  feature dice cuáles usa y cuáles agrega.
- Las actividades interactivas (F03+) siguen la sección 6 de `docs/diseno.md`.
- Cambiar un token implica cambiarlo en `tokens.css`, en `tema.ts` y en la
  guía.
