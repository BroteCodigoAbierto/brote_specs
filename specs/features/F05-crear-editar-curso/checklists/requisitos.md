# Lista de calidad de la spec: F05 Crear y editar un curso

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
- [x] Los flujos cubren ver los cursos propios, crear, editar los datos, armar
      las lecciones, eliminar, armar una lección, los cinco formularios, la
      vista previa, guardar y salir sin guardar.
- [x] La feature cumple los resultados esperados de sus criterios de aceptación.
- [x] No se filtran detalles de implementación en la spec.

## Notas

- Aclaraciones resueltas con el usuario el 2026-11-03:
  1. Un curso publicado no se edita hasta F06: sale como "Publicado", con "Ver
     curso", y el servidor rechaza los cambios.
  2. Se guarda con el botón "Guardar lección": todo junto y solo con todas las
     actividades completas.
  3. Los cursos del autor son una sección "Cursos que creé" dentro de "Mi
     panel". `/mis-cursos` desaparece de la navegación prevista, y "Mis cursos"
     queda solo como la pestaña del móvil.
  4. "Probar lección" recorre la lección completa en el reproductor, con lo que
     hay en pantalla, sin registrar progreso.
  5. Si se guardó una versión más nueva de la lección, el guardado se detiene y
     pregunta si reemplazarla o cancelar.
  6. El idioma del curso sale de F05 y lo define F07.
  7. El autor puede eliminar cualquier curso suyo sin publicar, aunque el progreso
     de sus alumnos se borre con él.
- Sin preguntar, por su bajo impacto (están en "Datos de entrada" y "Supuestos"):
  los números de los límites y que no hay máximo de cursos por autor.
- La decisión 0014 deja para F06 qué pasa al editar un curso publicado. F05 no la
  cambia: define solo el comportamiento mientras tanto.
- Los límites de longitud se comprobaron contra los cuatro cursos del prototipo
  (valores más altos: teoría 897, reverso 408, solución 490, pregunta 289, opción
  113, descripción 251, 9 actividades por lección y 11 lecciones por curso). En
  esos cursos ninguna opción se repite ni se mezclan textos con símbolos, así que
  las reglas nuevas no los invalidan.
- Un mensaje queda sin criterio propio a propósito: "Revisa los datos marcados."
  (el servidor rechaza lo que el cliente dejó pasar). El cliente valida lo mismo,
  así que a mano no se llega ahí; el rechazo en sí lo cubren los criterios
  `[backend]`.
- Riesgos que el plan debe resolver, vistos en el código de la web de F03. Las
  actividades se hicieron para ocupar la pantalla, y la vista previa las pone
  junto a un formulario:
  - `useEnfocarAlMontar` les pasa el foco al montarse: si la vista previa se monta
    otra vez con cada tecla, el autor pierde el foco mientras escribe.
  - `OpcionMultiple` escucha las teclas 1 a 9 en todo el documento.
    - `BarraRespuesta` usa `position: fixed`: en la vista previa taparía la página.
- Riesgos de las aclaraciones 4 y 5:
  - `Leccion.actualizadoEn` usa `@updatedAt`, que también cambia al reordenar. Tal
    cual daría avisos falsos de versión más nueva, que la spec prohíbe.
  - `ReproductorLeccion` y `useReproductor` no dependen de la red y sirven para
    "Probar lección", pero `ResultadoLeccion` necesita una forma sin `guardado` y
    con "Volver al editor".
  - En modo de prueba, el botón de volver del navegador regresa al lienzo: no debe
    disparar "¿Salir sin guardar?".
- `docs/diseno.md` no tiene todavía: la paleta, la tarjeta de actividad del lienzo,
  el inspector, la vista previa, el mapa del curso con su lista reordenable, la sección "Cursos que creé" (`TarjetaCurso` con estado), el campo de varias
  líneas, el aviso de cambios sin guardar ni el aviso del modo de prueba. El plan debe
  agregarlos ahí antes de usarlos.
- Las copias locales que recuperan lo no guardado tras expirar la sesión, y cómo se
  ligan a la cuenta, las define el plan.
- La paleta conoce 13 tipos, pero el registro de la web solo tiene 5. El plan debe
  resolverlo de forma que agregar un tipo siga siendo lo que dice el principio IV.
- Revisión de `/speckit-analyze` (2026-11-03): se agregaron cuatro criterios (guardar
  los datos con la lista bloqueada, "Agregar" repetido, lector de pantalla y sesión
  expirada en las acciones del mapa) y se amplió uno (seleccionar un bloque con el
  teclado). Los nueve hallazgos de severidad baja quedan sin aplicar.
- Los criterios marcados `[backend]` se prueban enviando peticiones al servidor sin
  pasar por un cliente; cómo hacerlo lo dice el `quickstart.md` del plan.
- Al cerrar la feature: agregar los límites a `specs/02-modelo-datos.md`, pasar ahí
  el idioma de F05 a F07, y en `specs/01-navegacion.md` quitar `/mis-cursos`,
  confirmar las pantallas del editor y actualizar la línea de "Mi panel".
