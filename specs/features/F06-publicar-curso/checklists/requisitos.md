# Lista de calidad de la spec: F06 Enviar un curso a revisión y publicarlo

**Propósito**: comprobar que la spec está completa y bien escrita antes de pasar a planear.
**Creada**: 2026-11-03
**Feature**: [spec.md](../spec.md)

## Una spec está completa cuando (curso de SDD)

- [x] Tiene objetivo, actor y precondiciones.
- [x] Los datos de entrada indican tipo y si son obligatorios.
- [x] Incluye estados de la pantalla y casos de error.
- [x] Dice explícitamente qué queda fuera de alcance.
- [x] Cada criterio de aceptación puede marcarse como cumplido o no cumplido sin discusión.
- [x] No menciona librerías, tablas ni endpoints.

## Calidad del contenido

- [x] Sin detalles de implementación (lenguajes, frameworks, APIs).
- [x] Centrada en lo que necesita el usuario y en para qué.
- [x] Escrita para alguien que no programa.
- [x] Todas las secciones obligatorias están completas.

## Requisitos completos

- [x] No quedan marcas `[POR ACLARAR]`.
- [x] Los requisitos se pueden probar y no son ambiguos.
- [x] Los criterios de aceptación se pueden verificar a mano.
- [x] Los criterios de aceptación no dependen de la tecnología.
- [x] Todos los escenarios de aceptación están definidos.
- [x] Los casos límite están identificados.
- [x] El alcance está bien delimitado.
- [x] Las dependencias y los supuestos están identificados.

## Lista para planear

- [x] Cada validación y caso de error tiene un criterio de aceptación claro.
- [x] Los flujos cubren ver los estados, enviar, retirar de revisión, aprobar, rechazar
      y editar un curso publicado.
- [x] La feature cumple los resultados esperados de sus criterios de aceptación.
- [x] No se filtran detalles de implementación en la spec.

## Notas

- Aclaraciones resueltas con el usuario el 2026-11-03:
  1. Para editar un curso publicado, el autor lo retira del catálogo, lo edita como
     borrador y lo envía otra vez a revisión.
  2. El administrador puede dejar un motivo de rechazo, y el autor lo ve en el mapa
     hasta que envía el curso otra vez.
  3. Para enviar un curso hace falta al menos una lección, y que ninguna esté vacía.
- Sin preguntar, por su bajo impacto (están en "Supuestos"): el autor puede retirar su
  curso de revisión sin confirmar, y un curso en revisión no muestra su contenido en
  el mapa.
- La aclaración 1 cierra lo que la decisión 0014 dejó para esta spec, así que no hace
  falta una decisión nueva.
- La spec nombra "la base de datos" solo para decir dónde actúa el administrador, como
  F01 y la decisión 0014. No dice cómo se guarda nada.
- Riesgos que el plan debe resolver, vistos en el código y en las specs anteriores:
  - Guardar el estado: el research de F02 (punto 1) descartó un `estado` de tres valores
    porque obligaba a corregir la constitución, la arquitectura y la decisión 0014.
    Conservar `publicado` y agregar el dato de la revisión las respeta. Resuelto en el
    plan: un trigger limpia la revisión cuando cambia `publicado` (research.md, punto 2).
  - El mapa de un curso publicado hoy no carga: `traerCursoEnEditor` responde 403 y la
    web muestra `EstadoVacio`. F06 necesita su título y su estado, y además `CursoEnEditor`
    no trae `estado`.
  - El bloqueo de `servicios/editor.ts` solo rechaza `publicado`: también debe rechazar
    un curso en revisión, y enviar y retirar deben usarlo para que dos acciones a la vez
    no se pisen.
  - `TarjetaCursoAutor` lleva un curso publicado a su detalle. Ahora abre el mapa, y
    "Ver curso" sale de ahí, así que volver del detalle debe regresar al mapa.
  - `MENSAJES_EDITOR.cursoPublicado` y `cursoPublicadoAlGuardar` cambian de texto, y
    `cursoEliminado` dice "Tus cambios no se guardaron.", que no sirve al enviar. Cambia
    el contrato, así que sube `contrato/VERSION`.
  - Hace falta una forma repetible de aprobar, rechazar y retirar para validar a mano.
    Resuelto en el plan: funciones de shell en el `quickstart.md`, sin script nuevo.
  - El comentario de `scripts/datos-prueba.ts` sobre "Curso en revisión" deja de valer,
    y ese curso debe quedar en revisión.
- `docs/diseno.md` no tiene todavía: el estado "En revisión" y "Revisión no aprobada"
  (sección 5, "Estado de un curso"), la pantalla de un curso que no se edita (título,
  estado, mensaje y acciones), la marca de una lección vacía y la acción "Administrar"
  de `TarjetaCursoAutor`. El plan debe agregarlos ahí antes de usarlos.
- Los criterios marcados `[backend]` se prueban enviando peticiones al servidor sin pasar
  por un cliente; cómo hacerlo lo dice el `quickstart.md` del plan.
- El research de F02 pide repetir su criterio de borrador y revisión cuando exista el
  dato de la revisión: lo cubren los criterios de "Enviar a revisión".
- Al cerrar la feature: actualizar `specs/02-modelo-datos.md`, `specs/01-navegacion.md`
  y `docs/arquitectura.md`, y quitar de `contrato/contrato.ts` el comentario "F06 agrega
  'enRevision'". Los criterios de F05 que nombran los textos y enlaces reemplazados
  quedan como historia: los vigentes son los de esta spec.
