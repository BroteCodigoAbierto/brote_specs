# Navegación

> **Esqueleto.** Las pantallas se agregan aquí al cerrar cada feature (tarea
> de cierre de su `tasks.md`). Lo que sigue es la propuesta inicial; cada
> spec la confirma o la cambia.

## Web (React Router)

```text
/                         Inicio / catálogo                      (F02)
/entrar                   Iniciar sesión                         (F01)
/registro                 Crear cuenta                           (F01)
/cursos/:idCurso          Detalle del curso y sus lecciones      (F02, F04)
/cursos/:idCurso/lecciones/:idLeccion
                          Reproductor de la lección              (F03)
/glosario                 Glosario                               (F09)
/mis-cursos               Cursos que creé                        (F05)
/editor/:idCurso          Mapa del curso (lecciones)             (F05)
/editor/:idCurso/lecciones/:idLeccion
                          Lienzo de la lección                   (F05)
```

## Móvil (expo-router)

```text
(auth)/entrar             Iniciar sesión                         (F01)
(auth)/registro           Crear cuenta                           (F01)
(tabs)/index              Catálogo                               (F02)
(tabs)/mis-cursos         Cursos en progreso y descargados       (F04, F10)
(tabs)/glosario           Glosario                               (F09)
curso/[idCurso]           Detalle del curso                      (F02)
leccion/[idCurso]/[idLeccion]
                          Reproductor de la lección              (F03)
```

## Qué viaja entre pantallas

| De | A | Dato |
|---|---|---|
| Catálogo | Detalle del curso | `idCurso` |
| Detalle del curso | Reproductor | `idCurso`, `idLeccion` |
