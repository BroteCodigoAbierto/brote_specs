# Navegación

> **Crece con cada feature.** Las pantallas se confirman aquí al cerrar cada
> feature (tarea de cierre de su `tasks.md`). Las marcadas como *(prevista)*
> son la propuesta inicial; la spec de su feature la confirma o la cambia.

## Sesión (F01)

Brote no se usa sin cuenta. En los dos clientes:

- Sin sesión solo existen "Entrar" y "Crear cuenta". Cualquier otra pantalla
  (en la web, también cualquier dirección escrita a mano, exista o no) lleva a
  "Entrar".
- Con sesión, "Entrar" y "Crear cuenta" llevan al inicio.
- Al abrir, mientras se comprueba la sesión, se ve un indicador de carga (en
  el móvil, la pantalla de arranque); "Entrar" no aparece ni un instante.
- Cuando la sesión vence o se cierra, se vuelve a "Entrar" (si venció, con el
  aviso "Tu sesión terminó. Vuelve a entrar.").

## Web (React Router)

```text
/entrar                   Iniciar sesión                         (F01)
/registro                 Crear cuenta                           (F01)
/                         Catálogo de cursos publicados; la      (F02)
                          búsqueda va en ?q= (p. ej. /?q=git)
/cursos/:idCurso          Detalle del curso y sus lecciones      (F02; F04 le agrega el progreso)
*                         Página no encontrada (con sesión)      (F01)
/cursos/:idCurso/lecciones/:idLeccion
                          Reproductor de la lección, a pantalla  (F03)
                          completa, fuera del marco común
/glosario                 Glosario                               (F09) (prevista)
/mis-cursos               Cursos que creé                        (F05) (prevista)
/editor/:idCurso          Mapa del curso (lecciones)             (F05) (prevista)
/editor/:idCurso/lecciones/:idLeccion
                          Lienzo de la lección                   (F05) (prevista)
```

- `/entrar` y `/registro` se muestran sin el marco común. Todas las demás
  rutas exigen sesión y van dentro del marco, cuyo encabezado tiene la marca
  (enlace a `/`) y el **menú de la cuenta**: un botón con el nombre que abre
  el correo y "Cerrar sesión".
- Después de entrar se llega a la dirección que se intentaba abrir (o a `/`);
  después de crear la cuenta, siempre a `/`. Después de cerrar sesión, a
  `/entrar`.
- Escribir en el buscador del catálogo cambia `?q=` sin agregar entradas al
  historial. Volver del detalle al catálogo conserva la búsqueda, los cursos
  cargados y la posición; recargar el catálogo empieza desde los primeros 10.
- El reproductor de la lección no lleva el marco común (sin encabezado de la
  marca), pero el catálogo sigue cargado mientras tanto: su estado vive en un
  nivel que comparten el marco y la lección (`ZonaConSesion`).
- Salir de la lección (la X o "Volver al curso") lleva a la pantalla anterior,
  el detalle del curso; si la dirección se abrió directo, la reemplaza por el
  detalle, para que "atrás" no regrese a la lección. Recargar la lección
  empieza desde la primera actividad.

## Móvil (expo-router)

```text
(auth)/entrar             Iniciar sesión                         (F01)
(auth)/registro           Crear cuenta                           (F01)
(tabs)/index              Pestaña "Explorar": catálogo de        (F02)
                          cursos publicados
(tabs)/cuenta             Pestaña "Cuenta": nombre, correo y     (F01)
                          "Cerrar sesión"
(tabs)/mis-cursos         Cursos en progreso y descargados       (F04, F10) (prevista)
(tabs)/glosario           Glosario                               (F09) (prevista)
curso/[idCurso]           Detalle del curso, en el Stack raíz,   (F02)
                          encima de las pestañas
leccion/[idCurso]/[idLeccion]
                          Reproductor de la lección, en el Stack (F03)
                          raíz, encima del detalle y sin pestañas
```

- Sin sesión solo existe el grupo `(auth)`; con sesión, `(tabs)` y las
  pantallas del `Stack` raíz que van encima de las pestañas, como
  `curso/[idCurso]`. El cambio lo hace `Stack.Protected`: al entrar o crear
  la cuenta se llega a "Explorar"; al cerrar sesión o vencer, a "Entrar", sin
  historial para volver atrás.
- `curso/[idCurso]` tiene encabezado con el botón de volver. Como "Explorar"
  sigue montada debajo, al volver la búsqueda, los cursos cargados y la
  posición están como se dejaron.
- De "Crear cuenta", el enlace "Entrar" vuelve a la pantalla anterior en vez
  de apilar otra.
- `leccion/[idCurso]/[idLeccion]` no tiene encabezado: dibuja su propia X.
  Salir vuelve al detalle del curso que quedó debajo.

## Salir de una lección (F03)

En los dos clientes, si el alumno ya hizo algo (pasó de la primera
actividad, o eligió, escribió o volteó algo), salir antes de terminar pide
confirmación: "¿Salir de la lección?", "Perderás tu avance en esta lección.",
"Seguir aquí" y "Salir". La piden la X, el botón de volver del navegador
(web) y el botón o gesto de atrás del teléfono (móvil). Recargar la página o
cerrar la app no la piden.

## Qué viaja entre pantallas

| De | A | Dato |
|---|---|---|
| Cualquier ruta protegida (web) | `/entrar` | `state.desde`: la ubicación que se intentaba abrir, con su `?q=`, para regresar después de entrar (F01) |
| Catálogo | Detalle del curso | `idCurso`: en la dirección en la web; como parámetro de ruta en el móvil (F02) |
| Detalle del curso | Reproductor | `idCurso`, `idLeccion`: en la dirección en la web; como parámetros de ruta en el móvil (F03) |
