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
/cursos/:idCurso          Detalle del curso, sus lecciones y el  (F02, F04)
                          avance del alumno, con Empezar /
                          Continuar
/panel                    "Mi panel": página personal, con       (F04, F05)
                          "Sigue aprendiendo" y "Cursos que creé"
/editor/nuevo             Nuevo curso                            (F05)
/editor/:idCurso          Mapa del curso: datos y lecciones;     (F05, F06)
                          en revisión o publicado, sus acciones
*                         Página no encontrada (con sesión)      (F01)
/cursos/:idCurso/lecciones/:idLeccion
                          Reproductor de la lección, a pantalla  (F03)
                          completa, fuera del marco común
/editor/:idCurso/lecciones/:idLeccion
                          Lienzo de la lección, a pantalla       (F05)
                          completa, fuera del marco común
/glosario                 Glosario                               (F09) (prevista)
```

- `/entrar` y `/registro` se muestran sin el marco común. Todas las demás
  rutas exigen sesión y van dentro del marco, cuyo encabezado tiene la marca
  (enlace a `/`), el enlace **"Mi panel"** (a `/panel`, F04; en pantallas
  angostas solo su icono) y el **menú de la cuenta**: un botón con el nombre
  que abre el correo y "Cerrar sesión".
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
- El botón Empezar / Continuar del detalle (F04) abre la primera lección sin
  completar igual que la lista: salir de ella vuelve al detalle. El detalle
  se monta de nuevo al volver, así que muestra el avance actualizado.
- De "Mi panel" a un detalle, "Cursos" (volver) regresa a "Mi panel". El
  panel se vuelve a cargar cada vez que se entra.
- En "Cursos que creé" (F05, F06), todas las tarjetas abren el mapa: "Editar" en un
  borrador y "Administrar" en uno en revisión o publicado. "Nuevo curso" lleva a
  `/editor/nuevo`; al crearlo, el mapa reemplaza esa entrada del historial.
- Del mapa, "Mi panel" vuelve a `/panel`, y cada lección abre su lienzo. Del
  lienzo, "Volver al curso" lleva al mapa.
- "Probar lección" (F05) agrega una entrada de historial en la misma dirección,
  con `state.probando`: volver regresa al lienzo como estaba, sin preguntar.
  Recargar en modo de prueba vuelve al lienzo.
- Un curso en revisión o publicado no se edita (F06): el mapa muestra su título, su
  estado y sus acciones, sin datos ni lecciones, y cambia de estado sin recargar. El
  lienzo muestra el mensaje y "Volver al curso", que abre el mapa.
- "Ver curso", en el mapa de un curso publicado, abre su detalle; volver regresa al
  mapa.

## Móvil (expo-router)

```text
(auth)/entrar             Iniciar sesión                         (F01)
(auth)/registro           Crear cuenta                           (F01)
(tabs)/index              Pestaña "Explorar": catálogo de        (F02)
                          cursos publicados
(tabs)/mis-cursos         Pestaña "Mis cursos": cursos empezados (F04)
                          con su avance; los descargados llegan
                          con F10
(tabs)/cuenta             Pestaña "Cuenta": nombre, correo y     (F01)
                          "Cerrar sesión"
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
- Las pestañas van en este orden: "Explorar", "Mis cursos" y "Cuenta" (F04).
  Pulsar un curso de "Mis cursos" abre `curso/[idCurso]` encima de las
  pestañas, como desde "Explorar"; volver regresa a "Mis cursos".
- El detalle y "Mis cursos" quedan montados debajo de otras pantallas: al
  volver a ellos se recargan sin indicador para mostrar el avance nuevo (F04).
  Si esa recarga falla, los datos se quedan con el aviso de error encima.

## Salir de una lección (F03)

En los dos clientes, si el alumno ya hizo algo (pasó de la primera
actividad, o eligió, escribió, volteó, colocó o unió algo; también escribir código o
un comando, o elegir un commit, F12), salir antes de terminar pide
confirmación: "¿Salir de la lección?", "Perderás tu avance en esta lección.",
"Seguir aquí" y "Salir". La piden la X, el botón de volver del navegador
(web) y el botón o gesto de atrás del teléfono (móvil). Recargar la página o
cerrar la app no la piden.

El visor de una imagen (F13) se abre sobre la lección, sin ruta propia. Con él
abierto, el botón de volver de Android lo cierra a él y no a la lección. Abrirlo,
cerrarlo o pausar un GIF no cuenta como haber hecho algo.

En escuchar y repetir (F14), escuchar la frase y grabarse no cuentan como haber hecho
algo; comprobar, sí. En el móvil, "Abrir ajustes" (con el permiso del micrófono negado)
sale a los ajustes del teléfono y, al volver a Brote, la lección sigue como estaba, sin
pedir confirmación.

## Salir con cambios sin guardar (F05)

En el lienzo y en los datos del curso, con cambios sin guardar, salir pide
confirmación: "¿Salir sin guardar?", "Perderás los cambios que no guardaste.",
"Seguir aquí" y "Salir". La piden "Volver al curso", "Mi panel", abrir una lección
desde el mapa y el botón de volver del navegador, si el destino está dentro de
Brote. Recargar, cerrar la pestaña o salir de Brote muestran el aviso del navegador.
Cerrar sesión no pregunta nada.

Si la sesión expira al guardar, o en una acción del mapa, lo capturado se guarda en
una copia local. Al entrar con la misma cuenta se regresa a esa pantalla con esos
cambios; si entra otra cuenta, se descarta.

## Qué viaja entre pantallas

| De | A | Dato |
|---|---|---|
| Cualquier ruta protegida (web) | `/entrar` | `state.desde`: la ubicación que se intentaba abrir, con su `?q=`, para regresar después de entrar (F01) |
| Catálogo | Detalle del curso | `idCurso`: en la dirección en la web; como parámetro de ruta en el móvil (F02) |
| Detalle del curso | Reproductor | `idCurso`, `idLeccion`: en la dirección en la web; como parámetros de ruta en el móvil (F03). Desde la lista o desde Empezar / Continuar (F04); en la web, con `state.desdeCurso` para que salir vuelva al detalle |
| Mis cursos (móvil) / Mi panel (web) | Detalle del curso | `idCurso`, igual que desde el catálogo (F04) |
| Mi panel | Mapa del curso | `idCurso`, en la dirección (F05) |
| Mapa del curso | Lienzo de la lección | `idCurso`, `idLeccion`, en la dirección (F05) |
| Mapa del curso | Detalle del curso | `idCurso`, en la dirección (F06) |
| Lienzo de la lección | Probar lección | Nada: las actividades siguen en memoria. `state.probando` en el historial (F05) |
