---
description: "Lista de tareas de F08 Insignias por curso completado"
---

# Tareas: F08 Insignias por curso completado

**Entrada**: spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md
**Rama**: `feature/F08-insignias-curso`, creada desde `dev` en cada repo afectado

## Formato: `[ID] [P?] [repo] Descripción`

- **[P]**: se puede hacer en paralelo (otros archivos, sin dependencias pendientes).
- **[repo]**: `specs`, `back`, `web` o `movil`.
- Cada tarea dice el archivo exacto que toca, relativo a la raíz de su repo.
- Sin tareas de pruebas automáticas: la validación es manual (ver la última fase).

## Fase 1: Preparación

- [X] T001 [specs] Agregar `InsigniaCurso` y `RespuestaInsignias`, `insigniaNueva: InsigniaCurso | null` en `RespuestaProgresoLeccion`, `daInsignia?: boolean` en `CuerpoDatosCurso` ("sin él no cambia; el POST sin él crea el curso sin insignia") y `daInsignia: boolean` en `CursoEnEditor`, como dice `contracts/contrato.md`, en `contrato/contrato.ts`; subir `contrato/VERSION` a 0.12.0
- [X] T002 [specs] Agregar `InsigniaCurso` (props `insignia`, `tamano` `lista` | `grande`) a la sección 4 de `docs/diseno.md`, y la prop `insignia` de `ResultadoLeccion`, como dice "Interfaz" en `plan.md`
- [X] T003 [back] Crear la rama `feature/F08-insignias-curso` desde `dev`
- [X] T004 [P] [web] Crear la rama `feature/F08-insignias-curso` desde `dev`
- [X] T005 [P] [movil] Crear la rama `feature/F08-insignias-curso` desde `dev`
- [X] T006 [specs] Copiar el contrato a los repos: `npm run contrato:copiar` en brote_specs (escribe `src/tipos/contrato.ts` de back, web y móvil; un commit por repo)

---

## Fase 2: Backend (brote_backend_express)

- [X] T007 [back] En `prisma/schema.prisma`: `Curso.daInsignia Boolean @default(false) @map("da_insignia")` y el modelo `Insignia` (`idUsuario`, `idCurso`, `ganadaEn @default(now()) @map("ganada_en")`, `@@id([idUsuario, idCurso])`, `@@index([idCurso])`, las dos relaciones con `onDelete: Cascade`, `@@map("insignia")`); migración `npx prisma migrate dev --name f08_insignias`
- [X] T008 [back] `daInsigniaDe(cuerpo)` en `src/validacion/editor.ts`: si viene y no es booleano, error `MENSAJES_EDITOR.datosInvalidos` en el campo `daInsignia`; `validarDatosCurso` lo devuelve solo si vino
- [X] T009 [back] `crearCurso` y `actualizarCurso` guardan `daInsignia` ("Por defecto `false`"; sin él no cambia) y el `CursoEnEditor` lo incluye, en `src/servicios/editor.ts`
- [X] T010 [back] En `src/servicios/progreso.ts`: `darInsigniaSiCompleto(idUsuario, idCurso)` (si el curso tiene `daInsignia`, cuenta sus lecciones y las filas de `progreso` del alumno en ellas; si son iguales y hay al menos una, `insignia.createMany` con `skipDuplicates`; devuelve la `InsigniaCurso` si creó la fila, si no `null`) y `registrarProgreso` devuelve `{ progreso, insigniaNueva }`
- [X] T011 [back] `src/rutas/cursos.ts`: el `PUT /cursos/:idCurso/lecciones/:idLeccion/progreso` responde `RespuestaProgresoLeccion` con `insigniaNueva`
- [X] T012 [back] `traerInsignias(idUsuario)` en `src/servicios/progreso.ts` (de `ganadaEn` más reciente a más antigua, desempate por `idCurso`, sin filtrar por `publicado`) y `GET /yo/insignias` en `src/rutas/usuarios.ts` con `RespuestaInsignias`
- [X] T013 [back] Datos de prueba: `daInsignia?` en `CursoPrueba` y el curso nuevo publicado "Insignia rápida" (2 lecciones de teoría, con insignia) y "Japonés sencillo" con insignia, en `scripts/datos-prueba.ts`; `scripts/sembrar-cursos.ts` guarda `daInsignia`

**Punto de control**: con curl, la última lección de "Insignia rápida" responde `insigniaNueva`, repetirla responde `null`, y `GET /usuarios/yo/insignias` la lista (quickstart 1.2).

---

## Fase 3: Web (brote_web_react)

- [X] T014 [web] `guardarProgreso` devuelve `RespuestaProgresoLeccion` y nueva `traerInsignias()` en `src/servicios/progreso.ts`
- [X] T015 [web] Componente `InsigniaCurso` en `src/componentes/InsigniaCurso/InsigniaCurso.tsx` y `.module.css` (sigue `docs/diseno.md`, sección 4)
- [X] T016 [web] `useGuardarProgreso` expone `insignia` (de `insigniaNueva`) en `src/hooks/useGuardarProgreso.ts`
- [X] T017 [web] `ResultadoLeccion` con prop `insignia`: `InsigniaCurso` `grande` y "¡Ganaste la insignia de {título}!" en la zona que se anuncia, en `src/componentes/ResultadoLeccion/ResultadoLeccion.tsx` y `.module.css`; `src/paginas/Leccion/Leccion.tsx` se la pasa (sigue `docs/diseno.md`, sección 4)
- [X] T018 [web] Sección "Mis insignias" en `src/paginas/Panel/Panel.tsx` y `Panel.module.css`: cargando (`IndicadorCarga`), lista de `InsigniaCurso` `lista`, vacío (`EstadoVacio` con `Medal`, "Todavía no tienes insignias", "Completa un curso que dé insignia para ganar la primera.") y error (`ErrorCarga` "No se pudieron cargar tus insignias."), sin afectar a las otras secciones (sigue `docs/diseno.md`, secciones 4 y 5)
- [X] T019 [web] `CampoCasilla` "Dar una insignia a quien complete el curso" en `src/paginas/MapaCurso/DatosCurso.tsx`, tratada como el idioma (se manda solo si cambió, deshabilitada si el curso no es borrador o mientras se guarda) y en la copia de lo no guardado (el tipo `CapturadoCurso` de `DatosCurso.tsx`; `src/utilidades/copiaEditor.ts` guarda cualquier dato y no cambió). En un curso en revisión o publicado, `CursoNoEditable.tsx` muestra el valor como texto, igual que el idioma

---

## Fase 4: Móvil (brote_mobile_expo)

- [X] T020 [movil] `guardarProgreso` devuelve `RespuestaProgresoLeccion` y nueva `traerInsignias()` en `src/servicios/progreso.ts`
- [X] T021 [movil] Componente `InsigniaCurso` en `src/componentes/InsigniaCurso.tsx` (sigue `docs/diseno.md`, sección 4)
- [X] T022 [movil] `useGuardarProgreso` expone `insignia` en `src/hooks/useGuardarProgreso.ts`; `ResultadoLeccion` con prop `insignia` en `src/componentes/ResultadoLeccion.tsx`; `src/app/leccion/[idCurso]/[idLeccion].tsx` se la pasa
- [X] T023 [movil] Sección "Mis insignias" en `src/app/(tabs)/cuenta.tsx`: cargando, lista, vacío, error y sin conexión, con `useRecargarAlVolver` (sigue `docs/diseno.md`, secciones 4 y 5)
- [X] T024 [movil] Publicar la liga de Expo Go: `EXPO_PUBLIC_URL_API=https://brote-api.vercel.app npx eas-cli update --branch produccion --environment production` y actualizar la liga en `README.md`

---

## Fase 5: Cierre

- [X] T025 [specs] Integrar `data-model.md` a `specs/02-modelo-datos.md` (Curso.`daInsignia`, entidad Insignia; quitar "Puntos / Insignia" de "Entidades previstas")
- [X] T026 [specs] Integrar "Mis insignias" (Mi panel y Cuenta) a `specs/01-navegacion.md`
- [X] T027 [specs] `npm run contrato:revisar`: todas las copias coinciden con la oficial
- [X] T028 [specs] Revisar que `spec.md` coincide con lo que se construyó; si algo cambió, actualizarla

---

## Fase 6: Validación manual

- [ ] V01 [web] En el mapa de un curso en borrador aparece la opción "Dar una insignia a quien complete el curso", desactivada en un curso nuevo y en uno que ya existía.
- [ ] V02 [web] Al activar la opción y pulsar "Guardar cambios" sale "Cambios guardados", y la opción sigue activada al recargar la página.
- [ ] V03 [web] En un curso en revisión o publicado la opción se ve con su valor y no se puede cambiar.
- [ ] V04 [web] Si guardar falla (con la API apagada), sale el aviso de error y la opción conserva lo que eligió el autor.
- [ ] V05 [web, móvil] Dado un curso publicado con insignia, cuando el alumno termina la última lección que le faltaba, entonces la pantalla final muestra la insignia y "¡Ganaste la insignia de *<curso>*!".
- [ ] V06 [web, móvil] Al repetir una lección de un curso cuya insignia ya tiene, la pantalla final no muestra el aviso.
- [ ] V07 [web, móvil] Al terminar todas las lecciones de un curso sin insignia, la pantalla final no muestra ningún aviso y "Mis insignias" no cambia.
- [ ] V08 [web, móvil] Al terminar una lección que no es la última que faltaba, no aparece el aviso.
- [ ] V09 [web] "Mi panel" tiene la sección "Mis insignias" con las insignias del alumno, de la más reciente a la más antigua, cada una con la portada en un círculo con medalla, el título y la fecha.
- [ ] V10 [móvil] La pestaña "Cuenta" tiene la sección "Mis insignias" con lo mismo.
- [ ] V11 [web, móvil] Una cuenta sin insignias ve el estado vacío: "Todavía no tienes insignias. Completa un curso que dé insignia para ganar la primera."
- [ ] V12 [web, móvil] Una insignia ganada en la web aparece en el móvil, y al revés.
- [ ] V13 [web, móvil] Si el autor agrega una lección al curso o desactiva la opción, la insignia que el alumno ya ganó sigue en "Mis insignias".
- [ ] V14 [web, móvil] Si falla el registro de la última lección, no aparece el aviso; al pulsar "Reintentar" y salir bien, aparece.
- [ ] V15 [web, móvil] Con la API apagada, "Mis insignias" muestra el error con "Reintentar" y el resto de la pantalla sigue usable; al volver la API, "Reintentar" la carga.
- [ ] V16 [web, móvil] Si la portada del curso no carga, la insignia muestra la portada generada.

---

## Dependencias

- La fase 1 va antes que todo (T001 → T006; T002 antes de T015 y T021).
- El backend va antes que web y móvil (T010 → T014 y T020).
- Web y móvil pueden ir en paralelo. Esta noche: backend y web; el móvil después (decisión del
  usuario, por la hora de entrega).
- T024 después de fusionar el móvil a `main`.
- Cierre y validación al final.
