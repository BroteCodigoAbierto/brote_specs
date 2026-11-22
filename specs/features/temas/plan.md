# Implementación

- Contexto de apariencia con useReducer en cada cliente; sin cambios de contrato ni API.
- Web: atributos data-paleta/data-tema, tokens CSS y localStorage; restaurar antes
  de montar React. Cuenta es /cuenta, accesible desde el menú del usuario.
- Móvil: contexto resuelve modo del sistema, hooks existentes consumen la paleta;
  SecureStore existente guarda pref.tema. Esperar la lectura antes de montar navegación.
- SelectorTema reutiliza Superficie y tokens. No hay dependencias nuevas.
- La rama Codex-Temas nace de la rama actual por petición expresa del usuario.

## Validación
Tipos y lint en ambos clientes; compilación de producción web; comprobación de
contraste de las paletas y paridad de tokens. Validación visual/manual según spec.md.
