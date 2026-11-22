# 0019. El catálogo no muestra los cursos completados

**Estado**: Aceptada · **Fecha**: 2026-11-21

## Contexto

"Explorar" (el catálogo de F02) es para encontrar qué cursar. Un curso que ya
completaste no aporta ahí: ya está en "Mis cursos" (móvil) y en "Sigue aprendiendo"
(web), con su avance. Este cambio se hizo fuera del flujo de Spec Kit, sin spec ni plan.

## Decisión

- El catálogo, con o sin búsqueda, deja fuera los cursos de los que quien pregunta
  completó todas las lecciones. Un curso empezado pero sin terminar sigue apareciendo.
- Se filtra en el backend (`GET /cursos`), así que vale para la web y el móvil. El
  contrato no cambia.
- En el móvil, "Explorar" se recarga en silencio al volver a la pestaña, para que un
  curso recién completado salga sin deslizar hacia abajo. Si el catálogo queda vacío,
  dice "No hay cursos por explorar." y que los completados siguen en "Mis cursos".
- La web conserva el catálogo mientras se navega (F02): el curso completado deja de
  salir en la siguiente búsqueda o al recargar.

## Alternativas consideradas

- **Mostrarlos con una marca de "Completado"**: el catálogo se llena de cursos que ya
  no son para ti.
- **Filtrar en cada cliente**: la paginación de 10 en 10 traería páginas con huecos.

## Consecuencias

- Quien completa todos los cursos ve el catálogo vacío hasta que se publiquen más.
- El detalle de un curso completado se sigue abriendo desde "Mis cursos" o con su
  dirección.
