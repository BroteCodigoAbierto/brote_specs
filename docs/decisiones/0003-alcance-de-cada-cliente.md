# 0003. La web cursa y crea; el móvil cursa

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Contexto

Brote tiene dos clientes. El editor de cursos (paleta, inspector, vista
previa) es una experiencia de pantalla grande.

## Decisión

- **Web**: cuentas, explorar, cursar, progreso, gamificación, glosario,
  crear y editar cursos, enviar a revisión, importar y exportar JSON.
- **Móvil**: cuentas, explorar, cursar, progreso, gamificación, glosario y
  cursar sin conexión.

## Alternativas consideradas

- **Los dos hacen todo**: el editor en pantalla táctil necesitaría un diseño
  propio y duplicaría el trabajo más grande del proyecto.
- **Web solo para autores**: obliga a tener el teléfono para aprender.

## Consecuencias

- Los componentes que muestran actividades existen en los dos clientes; el
  editor solo en web.
- El móvil aprovecha lo propio del teléfono: sin conexión, audio y micrófono.
