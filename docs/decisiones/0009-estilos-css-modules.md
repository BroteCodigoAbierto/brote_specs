# 0009. Estilos web con CSS Modules y variables

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Decisión

Un `Componente.module.css` junto a cada componente, y los valores de diseño
(colores, espacios, radios, tipografía, modo oscuro) como variables CSS en
`src/estilos/tokens.css`.

## Alternativas consideradas

- **Tailwind** (con o sin shadcn/ui): muy rápido, pero el marcado queda
  cargado de clases.
- **Librería de componentes** (Mantine, MUI): menos CSS propio, pero el look es
  el de la librería.

## Consecuencias

- Componentes accesibles complejos (diálogos, menús) se construyen a mano o se
  justifica una dependencia en su plan.
- El modo oscuro es cambiar variables, como en el prototipo.
