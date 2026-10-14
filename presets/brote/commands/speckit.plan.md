## Reglas de Brote (tienen prioridad sobre las instrucciones del núcleo de abajo)

**Idioma**: todos los documentos (plan.md, research.md, data-model.md, contracts/, quickstart.md) van en español con acentos. Los identificadores de código que propongas van en español, sin acentos ni ñ (ver `docs/estilo-codigo.md`).

**Brote son cuatro repos hermanos**. Este repo (`brote_specs`) solo tiene documentación. El código vive en las carpetas hermanas, relativas a la raíz de este repo:

| Clave | Ruta | Qué es |
|---|---|---|
| back | `../brote_backend_express` | API REST: Express 5 + TypeScript + Prisma + PostgreSQL + Better Auth |
| web | `../brote_web_react` | SPA: Vite + React + TypeScript + React Router, CSS Modules |
| movil | `../brote_mobile_expo` | App: Expo + React Native + TypeScript + expo-router |

Antes de planear, lee `docs/arquitectura.md`, `docs/estilo-codigo.md`, `specs/02-modelo-datos.md`, `contrato/` y la estructura actual de cada repo afectado. La sección "Project Structure" del núcleo se sustituye por la sección "Por repo" de la plantilla de Brote: usa rutas reales de esos repos, sin opciones genéricas.

**Decisiones ya tomadas** (no las vuelvas a investigar en research.md; están en `docs/decisiones/`): stack de arriba, datos de la API con `fetch` propio + hooks (sin TanStack Query ni SWR), estado global con Context + useReducer, contrato compartido como tipos copiados desde `contrato/`, validación manual (sin pruebas automáticas). research.md solo cubre lo que esta feature tenga de nuevo.

**Artefactos**:
- `data-model.md`: entidades y campos de esta feature, con tipos, obligatoriedad y relaciones. Usa los nombres que ya existen en `specs/02-modelo-datos.md`.
- `contracts/api.md`: por endpoint: método, ruta, quién puede llamarlo, cuerpo, respuestas (con códigos) y errores. Si cambian tipos compartidos, `contracts/contrato.md` con el diff propuesto para `contrato/`.
- `quickstart.md`: es la **guía de validación manual**: cómo levantar los repos afectados y, por cada criterio de aceptación de spec.md, los pasos para comprobarlo (con curl para la API y pasos en pantalla para web/móvil).

**Dependencias**: cada paquete nuevo va en la tabla "Dependencias nuevas" con su alternativa descartada (principio VI). Si una dependencia contradice una decisión de `docs/decisiones/`, detente y pregúntale al usuario.

**Al terminar**: no crees ramas ni toques código. Recuerda que sigue `/speckit-tasks`.

---

