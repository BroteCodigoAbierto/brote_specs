# brote_specs

**Brote** es una plataforma open source de cursos interactivos creados por la
comunidad, al estilo de Duolingo: cualquiera puede crear un curso con
lecciones y actividades (opción múltiple, emparejar, terminal simulada,
escuchar y repetir, ...) y cualquiera puede cursarlo en la web o en el
teléfono.

Este repo es la **fuente de verdad del producto**. Aquí no hay código de la
app: hay specs, modelo de datos, navegación, contrato y decisiones. El código
vive en:

| Repo | Qué es |
|---|---|
| [brote_backend_express](https://github.com/BroteCodigoAbierto/brote_backend_express) | API REST (Express + TypeScript + Prisma + PostgreSQL) |
| [brote_web_react](https://github.com/BroteCodigoAbierto/brote_web_react) | Web: cursar y crear cursos (React + Vite) |
| [brote_mobile_expo](https://github.com/BroteCodigoAbierto/brote_mobile_expo) | Móvil: cursar, también sin conexión (Expo) |

Brote se desarrolla con **Spec-Driven Development** usando
[GitHub Spec Kit](https://github.com/github/spec-kit): ninguna feature se
programa sin una spec.

## Por dónde empezar

1. [`specs/00-proyecto.md`](specs/00-proyecto.md): qué problema resuelve Brote y qué entra al MVP.
2. [`.specify/memory/constitution.md`](.specify/memory/constitution.md): los principios que toda feature respeta.
3. [`docs/arquitectura.md`](docs/arquitectura.md): cómo encajan los cuatro repos.
4. [`docs/flujo-trabajo.md`](docs/flujo-trabajo.md): cómo se lleva una feature de idea a código.

## Estructura

```text
specs/
  00-proyecto.md          problema, usuarios, MVP (F01...F10), futuras
  01-navegacion.md        pantallas de web y móvil
  02-modelo-datos.md      entidades (crece con cada feature)
  features/F0X-.../       spec.md, plan.md, tasks.md, contracts/, quickstart.md
contrato/                 tipos compartidos (copia oficial) y su versión
docs/
  arquitectura.md         vista general del sistema
  estilo-codigo.md        convenciones de código
  flujo-trabajo.md        el ciclo spec → plan → tareas → código → validación
  prototipo.md            qué se aprendió del prototipo
  decisiones/             por qué se eligió cada pieza
academico/materias.md     qué pide cada materia y qué lo cubre (aparte)
referencia/               cursos del prototipo, como datos de prueba
presets/brote/            adaptación de Spec Kit al formato de Brote
.specify/                 Spec Kit (constitución, plantillas, scripts)
scripts/                  utilidades (copiar y revisar el contrato)
```

## Requisitos

- Node 24 o más reciente (para los scripts del contrato).
- [uv](https://docs.astral.sh/uv/) y Spec Kit v1.2.0 (ver `docs/flujo-trabajo.md`).
- Los cuatro repos clonados uno junto al otro.

## Licencia

MIT.
