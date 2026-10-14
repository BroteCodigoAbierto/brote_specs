# Constitución de Brote

Principios que toda feature de Brote respeta, en los cuatro repos. Cada
`plan.md` se revisa contra esta lista antes de escribir código. Si un plan
necesita romper un principio, lo justifica en su sección "Excepciones".

Las razones detrás de cada decisión técnica concreta (por qué Prisma, por qué
Better Auth, etc.) viven en `docs/decisiones/`. Aquí solo están las reglas.

## Principios

### I. La spec manda

- Ninguna feature importante se implementa sin una spec en `specs/features/`.
- La spec dice **qué** (comportamiento, datos, errores, criterios); el plan
  dice **cómo**. La spec no menciona librerías, tablas ni endpoints.
- Si el comportamiento cambia durante la implementación, la spec se actualiza
  en el mismo PR que el código. Una spec que no coincide con el código es un
  bug.
- Ramas y commits llevan el ID de la feature: `feature/F03-crear-curso`,
  `F03: deshabilitar Guardar sin título`.

*Por qué*: así cualquiera puede ir de una línea de código a la spec que la
justifica y de vuelta.

### II. Un producto, cuatro repos

- `brote_specs` es la fuente de verdad del producto: visión, specs, modelo de
  datos, navegación y contrato.
- `brote_backend_express`, `brote_web_react` y `brote_mobile_expo` implementan;
  ninguno define comportamiento que no esté en una spec.
- Los tipos compartidos (curso, lección, actividades, respuestas de la API)
  tienen una sola copia oficial en `contrato/`. Los repos tienen una copia
  generada en `src/tipos/contrato.ts` que nunca se edita a mano; se actualiza
  con `npm run contrato:copiar` y se verifica con `npm run contrato:revisar`.

*Por qué*: los repos están separados, pero una feature como "cursar una
lección" atraviesa los tres. Sin una fuente única, se desincronizan.

### III. El backend es la autoridad

- Toda regla de negocio y toda validación vive en el backend. Los clientes
  validan para dar buena experiencia, pero el backend vuelve a validar todo lo
  que recibe: formularios, lecciones guardadas, cursos importados en JSON.
- El backend decide quién puede hacer qué (autor de un curso, alumno inscrito,
  visitante). Un cliente nunca esconde un botón como única protección.
- El contenido creado por usuarios (textos de cursos, lecciones, glosario)
  nunca se inserta como HTML sin sanear, ni en web ni en móvil.
- Los cursos solo son públicos cuando `publicado = true`; lo que esté en
  borrador o en revisión solo lo ve su autor.

*Por qué*: los cursos los crea la comunidad, así que todo contenido es entrada
no confiable. El prototipo insertaba el contenido con `innerHTML`.

### IV. Actividades extensibles

- Cada tipo de actividad (opción múltiple, emparejar, terminal simulada, ...)
  se define una vez en `contrato/` como una variante identificada por su campo
  `tipo`.
- Agregar un tipo de actividad es exactamente: su tipo en el contrato, su
  validación en el backend, su componente en la web (para cursar y su
  formulario en el editor) y su componente en el móvil. Ningún otro código
  debe cambiar: el reproductor de lecciones busca el componente en un registro
  `tipo → componente`.
- La vista previa del editor usa el mismo componente que ve el alumno.

*Por qué*: es lo que mejor funcionó en el prototipo y es lo que más va a
crecer.

### V. Estados explícitos

- Toda pantalla que carga datos contempla: cargando, con datos, vacío y error.
  En móvil, además, sin conexión.
- Toda acción que guarda contempla: listo, guardando (sin poder repetir la
  acción) y error (sin perder lo capturado).
- Estos estados se escriben en la spec ("Estados de la pantalla") y se validan
  como criterios de aceptación.

*Por qué*: una app que solo funciona en la demostración ideal no sirve.

### VI. Dependencias justificadas

- Cada paquete nuevo aparece en la tabla "Dependencias nuevas" del plan, con
  para qué es y qué alternativa más simple se descartó.
- Antes de agregar una librería, se revisa si React, Express, Expo o la
  plataforma ya lo resuelven.
- Decisiones ya tomadas (ver `docs/decisiones/`): datos de la API con `fetch`
  propio + hooks, estado global con Context + useReducer, estilos web con CSS
  Modules. Cambiarlas requiere una nueva decisión escrita.

*Por qué*: cada dependencia es código que no controlamos y que hay que
actualizar en tres repos.

### VII. Estilo propio

- TypeScript estricto en los tres repos.
- Identificadores en español, sin acentos ni ñ (`traerCursos`, `leccionActual`,
  `anio`). Textos de UI, comentarios, documentación y commits en español con
  acentos.
- El detalle está en `docs/estilo-codigo.md`, y Prettier y ESLint resuelven el
  formato para que no se discuta.

*Por qué*: el proyecto tiene que leerse como escrito por la misma persona.

### VIII. Terminado = validado

- Una feature está terminada cuando todos sus criterios de aceptación están
  marcados como cumplidos, probados a mano en la plataforma que indica cada uno
  siguiendo su `quickstart.md`.
- No hay pruebas automáticas obligatorias. Si una feature agrega alguna, se
  justifica en su plan.
- El PR de cada repo enlaza la spec y lista los criterios que cubre.

*Por qué*: los criterios de aceptación son la definición de "funciona".

## Flujo de trabajo

1. `/speckit-specify`: spec de la feature en `specs/features/F0X-.../spec.md`.
2. `/speckit-clarify` (opcional): resolver ambigüedades.
3. `/speckit-plan`: plan técnico por repo, modelo de datos, API y guía de
   validación.
4. `/speckit-tasks`: tareas por repo.
5. `/speckit-analyze` (opcional): revisar consistencia entre spec, plan y
   tareas.
6. `/speckit-implement`: código en las ramas `feature/F0X-...` de cada repo.
7. Validación manual de los criterios, PR a `dev` en cada repo, y a `main` en
   cada entrega.

El detalle está en `docs/flujo-trabajo.md`.

## Gobierno

- Esta constitución está por encima de cualquier plan o tarea. Si un plan la
  contradice sin justificarlo en "Excepciones", el plan está mal.
- Se modifica con `/speckit-constitution` o a mano, en un PR propio de
  `brote_specs`, actualizando la versión de abajo (mayor: se quita o cambia el
  sentido de un principio; menor: se agrega un principio o regla; parche:
  redacción).
- Los requisitos de las materias de la universidad **no** viven aquí; están en
  `academico/materias.md` y no cambian la arquitectura.

**Versión**: 1.0.0 | **Ratificada**: 2026-10-14 | **Última modificación**: 2026-10-14
