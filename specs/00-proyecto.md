# Brote

> **Borrador para revisar.** Escrito a partir del prototipo y de las
> decisiones del 2026-10-14. Ajusta lo que no coincida con lo que quieres
> antes de especificar la primera feature.

## Nombre

Brote.

## Problema

Las plataformas para aprender con lecciones cortas e interactivas (como
Duolingo) son cerradas: solo enseñan lo que la empresa decide, con el formato
que la empresa decide. Quien sabe algo (un idioma, Git, un instrumento) y
quiere enseñarlo de forma interactiva no tiene dónde crear algo así sin
programarlo desde cero, y quien quiere aprender un tema de nicho no encuentra
cursos de ese estilo.

## Usuario objetivo

- **Alumno**: persona que quiere aprender un tema en sesiones cortas, desde la
  computadora o el teléfono, incluso sin conexión estable.
- **Autor**: persona que domina un tema y quiere enseñarlo con ejercicios
  interactivos, sin saber programar.

## Propuesta de solución

Una plataforma open source, con app web y app móvil, donde la comunidad crea
cursos interactivos (lecciones con actividades: opción múltiple, emparejar,
completar espacios, terminal simulada, escuchar y repetir, ...) y cualquiera
puede cursarlos. Los autores construyen sus cursos en un editor visual en la
web; los alumnos cursan en web o en el teléfono, y su progreso los sigue entre
dispositivos. Cada curso decide si usa gamificación.

## MVP

| ID | Feature | Web | Móvil |
|---|---|---|---|
| F01 | Crear cuenta e iniciar sesión | sí | sí |
| F02 | Explorar el catálogo de cursos publicados | sí | sí |
| F03 | Cursar una lección (reproductor de actividades) | sí | sí |
| F04 | Registrar y consultar el progreso | sí | sí |
| F05 | Crear y editar un curso (editor) | sí | no |
| F06 | Enviar un curso a revisión y publicarlo | sí | no |
| F07 | Importar y exportar un curso en JSON | sí | no |
| F08 | Gamificación: puntos e insignias por curso | sí | sí |
| F09 | Glosario | sí | sí |
| F10 | Cursar sin conexión | no | sí |

Orden sugerido: F01 → F02 → F03 → F04 → F05 → F06 → F07 → F09 → F08 → F10.
F03 y F05 probablemente convenga partirlas por grupos de tipos de actividad
(p. ej. F03 con los tipos básicos y una feature posterior por cada grupo
interactivo), cuando se especifiquen.

## Funcionalidades futuras

- Pantalla de moderación de cursos (hoy la aprobación es manual en la base).
- Valoraciones y comentarios de cursos.
- Recordatorios con notificaciones en el móvil.
- Rachas de días seguidos.
- Cursos no lineales (rutas condicionales entre lecciones).
- Subir imágenes y audio propios a los cursos.
- Coautores de un curso.
