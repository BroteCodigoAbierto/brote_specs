# Arquitectura de Brote

Este documento describe **cómo está armado el sistema completo**. Qué hace cada
feature está en `specs/`; por qué se eligió cada pieza está en
`docs/decisiones/`.

## Vista general

```text
                ┌──────────────────────┐        ┌──────────────────────┐
  Alumno /      │   brote_web_react    │        │  brote_mobile_expo   │   Alumno
  Autor   ────▶ │  SPA (Vite + React)  │        │ App (Expo + RN)      │ ◀────
                │  cursar + crear      │        │ cursar (con offline) │
                └──────────┬───────────┘        └──────────┬───────────┘
                           │      HTTPS + JSON (REST)      │
                           └───────────────┬───────────────┘
                                           ▼
                           ┌──────────────────────────────┐
                           │    brote_backend_express     │
                           │  API REST (Express 5 + TS)   │
                           │  Better Auth · validación ·  │
                           │  reglas de negocio · Prisma  │
                           └───────────────┬──────────────┘
                                           ▼
                           ┌──────────────────────────────┐
                           │          PostgreSQL          │
                           │ relacional + JSONB (lecciones)│
                           └──────────────────────────────┘

  brote_specs: specs, modelo de datos, contrato (tipos) ──copia──▶ los 3 repos
```

## Los cuatro repos

| Repo | Responsabilidad | Stack |
|---|---|---|
| `brote_specs` | Fuente de verdad: visión, specs, modelo de datos, navegación, contrato, decisiones | Markdown + Spec Kit |
| `brote_backend_express` | API REST, autenticación, reglas de negocio, validación, persistencia | Node 24, Express 5, TypeScript, Prisma, PostgreSQL, Better Auth |
| `brote_web_react` | Cursar y **crear/editar** cursos (editor) | Vite, React, TypeScript, React Router, CSS Modules |
| `brote_mobile_expo` | **Cursar**, incluso sin conexión | Expo, React Native, TypeScript, expo-router |

## Reparto de funciones

| Función | Web | Móvil |
|---|---|---|
| Crear cuenta, iniciar sesión | sí | sí |
| Explorar catálogo, cursar lecciones, progreso | sí | sí |
| Gamificación (puntos, insignias) y glosario | sí | sí |
| Crear y editar cursos, enviar a revisión | sí | no |
| Importar y exportar cursos en JSON | sí | no |
| Descargar cursos y cursar sin conexión | no | sí |

## Reglas de comunicación

- Los clientes solo hablan con la API; nunca con la base de datos.
- La API es REST con JSON. Las rutas, cuerpos y errores de cada endpoint se
  documentan en el `contracts/api.md` de la feature que lo crea.
- Los errores se responden con un formato único: `RespuestaError`
  (`{ error, campos? }`) del contrato, definido en F01.
- La autenticación la maneja Better Auth dentro del backend, detrás de rutas
  propias (`/cuentas`, `/sesiones`, `/usuarios/yo`); su handler no se expone.
  La web usa una cookie de sesión `httpOnly`; el móvil manda `X-Cliente:
  movil` y un token Bearer guardado en almacenamiento seguro (detalle en el
  plan de F01).

## Contenido de los cursos

El prototipo guardaba cada curso como una carpeta de archivos JSON. En Brote:

- **Curso, lección, usuario, progreso, puntos**: tablas relacionales.
- **Actividades de una lección**: una columna JSONB con la lista de
  actividades, porque hay muchos tipos con formas distintas. El backend valida
  cada actividad contra su tipo del contrato antes de guardarla.
- **Importar/exportar**: el formato JSON de un curso completo es parte del
  contrato, para poder moverlo entre instancias de Brote (y para migrar los
  cursos del prototipo, que están en `referencia/cursos-prototipo/`).

## Publicación de cursos

`borrador → en revisión → publicado`. El autor envía su curso a revisión desde la web,
y puede retirarlo de revisión o, ya publicado, retirarlo del catálogo: vuelve a ser
borrador y, para publicarlo otra vez, pasa de nuevo por revisión. Sus alumnos conservan
el progreso. No hay pantalla de moderación en el MVP: un administrador aprueba, rechaza
y retira directamente en la base de datos:

```sql
UPDATE curso SET publicado = true  WHERE id = '…';   -- aprobar
UPDATE curso SET publicado = false WHERE id = '…';   -- retirar
UPDATE curso SET revision = 'rechazada', motivo_rechazo = '…'
  WHERE id = '…' AND revision = 'pendiente';         -- rechazar; el motivo es opcional
```

Un trigger limpia la revisión cuando cambia `publicado`, y un `CHECK` rechaza lo que se
escriba mal. Son reglas en la base porque ese camino no pasa por el backend: es la
excepción al principio III del plan de F06.

## Contrato compartido

```text
brote_specs/contrato/*.ts  (copia oficial, con contrato/VERSION)
        │  npm run contrato:copiar
        ├──▶ brote_backend_express/src/tipos/contrato.ts
        ├──▶ brote_web_react/src/tipos/contrato.ts
        └──▶ brote_mobile_expo/src/tipos/contrato.ts
```

Las copias llevan un encabezado con la versión y la advertencia de no
editarlas. `npm run contrato:revisar` compara cada copia con la oficial.

## Desarrollo local

```text
podman compose up -d   (o docker compose)  → PostgreSQL en localhost:5432
brote_backend_express: npm run dev          → API en http://localhost:3000
brote_web_react:       npm run dev          → web en http://localhost:5173
brote_mobile_expo:     npx expo start       → app en Expo Go / emulador
```

El móvil en un teléfono físico no puede usar `localhost`: usa la IP de la
computadora en la red local (se configura en su `.env`).
