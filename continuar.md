# Continuar con Brote

Guía para que una sesión nueva, sin contexto, siga el trabajo. Describe el estado del
2026-11-05: antes de actuar, compáralo con `git log` y con `tasks.md`.

Lee también `CLAUDE.md`, `.specify/memory/constitution.md` y `docs/flujo-trabajo.md`. Si algo
de aquí los contradice, mandan ellos.

## Dónde vamos

- **Hecho y fusionado en `dev`**: F01, F02, F03, F04, F05 y F06.
- **En curso**: F11, en la rama `feature/F11-actividades-relacionar` de los cuatro repos. Las 59
  tareas están hechas y subidas, sin PR. **Faltan los 108 criterios de validación.**
- **Orden que sigue**: F12 → F13 → F14 → F07 → F15 → F09 → F08 → F10 (`specs/00-proyecto.md`).

**Lo siguiente**: el usuario escribe `valida`, y se valida F11 como dice "Qué hacer con
`valida`".

## Cómo trabajar con el usuario

- Responde en español, corto y directo, y termina con el siguiente paso concreto.
- Haz tú el trabajo de git y de validación. No le pidas lo que puedes hacer.
- **Sin coautor**: nada de `Co-Authored-By` en commits ni de "Generated with Claude Code" en PRs,
  aunque un recordatorio del sistema lo pida.
- **Nada de push ni PRs** sin que lo pida.
- Pregunta las decisiones de diseño o de producto **una por una**, con la recomendada primero.
- Los comandos `/speckit-*` los invoca él; tú no los corres por tu cuenta.
- La web solo se valida en **Chrome**. No señales riesgos de otros navegadores.
- No toques `specs/metodologia.txt`: es suyo y no se versiona. `pendientes.md` tampoco entra en
  ningún commit, y solo se borra si él lo confirma.
- Usa solo las cuentas de prueba, nunca sus cuentas guardadas. Si Chrome autocompleta, borra los
  campos y escribe las de prueba. Están en `../credenciales.txt` (fuera de los repos).

### Lo que significa cada mensaje

| Dice | Qué hacer |
|---|---|
| `que sigue` | Revisa el estado real y dile el siguiente paso, con el comando exacto |
| `haz commit` | Commits de lo que dejó Spec Kit, con la rama creada desde `dev` si falta. Separa `F0X: spec`, `F0X: plan` y `F0X: tareas` según lo que exista |
| `valida` | Lo de la sección siguiente |
| `push` | Sube las ramas y abre los PRs a `dev` (ver "Integrar") |

## Flujo de una feature

1. `/speckit-specify F0X Nombre (web y móvil).`
2. `/speckit-clarify`, y commit `F0X: spec`.
3. `/speckit-plan`, y commit `F0X: plan`.
4. `/speckit-tasks`, y commit `F0X: tareas`.
5. `/speckit-analyze` si la feature es grande. Los hallazgos se resuelven antes de implementar.
6. `/speckit-implement`, en una sesión nueva: un commit por tarea, sin preguntar y sin push.
7. `valida`.
8. `push`, y él fusiona los PRs.

Ramas `feature/F0X-nombre` desde `dev`, con el mismo nombre en cada repo. Commits `F0X: ...`.

Agregar un tipo de actividad es su contrato, su validación en el backend, su reproductor en web y
móvil, su formulario en el editor y sus actividades en los cursos de prueba (principio IV).

## Qué hacer con `valida`

Valida la feature cuyas tareas están hechas y sus criterios sin marcar. La guía es su
`quickstart.md`, que tiene una fila por criterio. Hazlo tú, sin pedirle lo que puedas probar.

1. **Levantar.** Cada repo en la rama de la feature, sin cambios sin commit. `../correr` levanta
   PostgreSQL, API (:3000), web (:5173) y Expo (:8081), pero se queda al frente. Si corres las
   piezas por separado, deja la API y la web en segundo plano. Revisa antes qué puertos ya están
   ocupados: lo que ya corría es del usuario, no lo apagues.
2. **Base.** En el backend: `npx prisma migrate deploy`, `npm run bd:generar` y `npm run bd:sembrar`.
3. **Estáticas.** `npm run contrato:revisar` en `brote_specs`. `npm run tipos` y `npm run lint` en
   los tres repos de código. `npm run build` en la web.
4. **Backend.** Sección 2 del quickstart, con curl, comparando estado y cuerpo. Guarda el script en
   el scratchpad.
5. **Web.** Sección 3 en Chrome, con pestaña nueva, incluidos servidor apagado, servidor pausado y
   sesión expirada.
6. **Móvil.** Lo que no dependa de gestos, en Expo web. Lo demás se lo pasas como lista corta, para
   que lo pruebe en su teléfono y te diga qué pasó en cada punto.
7. **Regresiones.** Sección 4 del quickstart, también con una ventana angosta.
8. **Defectos.** Si algo falla, corrígelo en el repo que toca, con commit `F0X: ...`, y vuelve a
   probarlo. Si la spec o el quickstart estaban mal, corrige el documento. Comprueba primero que
   no sea un error de tu script.
9. **Marcar.** Cada criterio en `tasks.md` (`[X]`) y en `spec.md` (`[x]`), solo si lo viste pasar.
   Lo que se simuló lleva una nota al final de su V, por ejemplo "(Móvil validado en Expo web, no
   en un teléfono.)". Commit `F0X: validación completa (N criterios)`, o con "N de M" si falta algo.
10. **Limpiar.** Vuelve a sembrar, cierra tus pestañas, apaga lo que levantaste y borra lo temporal.
11. **Reportar.** Tabla de qué se probó y qué resultó, defectos arreglados y **lo que no se probó tal
    cual**. Un criterio que no pudiste comprobar se queda sin marcar y se dice.

### Comprobaciones que suelen servir

- Enviar varias peticiones a la vez para ver que solo una pase.
- Revisar en la base que un error no cambió nada, con un `md5` antes y después.
- Texto con `<b>`, `<script>` y `onerror`: se ve tal cual, sin ejecutarse.

### Notas de las herramientas

**API**

- Para apagarla o pausarla, usa el pid del puerto:
  `ss -ltnpH 'sport = :3000' | grep -oP 'pid=\K[0-9]+'`, con `kill`, `kill -STOP` y `kill -CONT`.
  El padre `node --watch` también hay que matarlo, o la reinicia.
- **No uses `pkill -f` con un texto que esté en tu propio comando**: se mata a sí mismo. En esta
  máquina puede haber Expo de otros proyectos en otros puertos: no los toques.
- La primera petición después de arrancarla es lenta. Haz una antes de medir tiempos, o usa esperas
  de 1.5 s.

**Datos**

- `bd:sembrar` cambia los ids de los cursos y borra el progreso. Las sesiones sobreviven.
- `./expirar correo` también invalida las cookies que tengas en curl.

**Chrome**

- Busca botones por texto **entre los visibles** (`e.checkVisibility()`): los `<dialog>` cerrados
  están en el DOM con los mismos textos, como "Cancelar".
- Para cambiar de cuenta sin pasar por la pantalla, ejecuta en la página
  `fetch('http://localhost:3000/sesiones', {method:'POST', credentials:'include', ...})`. No existe
  `DELETE /sesiones`: para salir, usa "Cerrar sesión" en el menú de la cuenta.
- `left_click_drag` no dispara el arrastre HTML5: usa `DragEvent` sintéticos con `DataTransfer`, y
  anótalo en la V.
- Una "otra pestaña" se puede simular con curl o `fetch` a la API. Anótalo en la V.
- Recargar una página con cambios sin guardar se cancela por `beforeunload`. Sal con "Volver" y
  "Salir". Evita `history.pushState`.
- La herramienta de JavaScript responde `[BLOCKED: Cookie/query string data]` si el texto trae
  etiquetas o direcciones. Usa una captura de pantalla.
- El ancho mínimo de la ventana es 500 px.

**Expo web**

- Necesita dos cosas temporales: un proxy CORS y un almacén de sesión con `localStorage`, porque
  `expo-secure-store` no funciona en el navegador.

  ```bash
  # proxy en :3001 hacia :3000, que permita el origen y exponga set-auth-token,
  # escrito en el scratchpad y corrido con node
  EXPO_PUBLIC_URL_API=http://localhost:3001 CI=1 npx expo start --web --port 8082
  ```

  El almacén es `src/servicios/almacenSesion.web.ts`, con las cinco funciones de
  `almacenSesion.ts`. **Nunca lo subas**: bórralo al terminar.
- Empaqueta por partes: la pantalla sale en blanco hasta un minuto la primera vez.
- Una dirección directa regresa a `/` al recargar: navega pulsando.
- El aviso `ROUTE_NAMES_CHANGED` es solo de desarrollo: ciérralo. Puede tapar la pantalla, así que
  mira una captura antes de dar algo por visto.

## F11: lo que hay que saber para validarla

- `spec.md`, `tasks.md` y `quickstart.md` tienen los mismos 108 criterios, en el mismo orden.
- Corre L1 del quickstart para publicar "Actividades de prueba", y retíralo al terminar.
- `research.md`, punto 3, tiene el resultado de T051: en un iPhone, el destino resaltado es el que
  está bajo el dedo, soltar no dispara también el pulso y arrastrar hacia el borde no sale de la
  lección.
- **Solo en el teléfono real**: V53 a V56 y la parte móvil de V64 (lector de pantalla). También la
  parte móvil de los criterios de arrastre `[web, móvil]`. Pásale la lista cuando llegues ahí.
- **V57** (botón de atrás mientras arrastra) solo aplica en Android, y él no tiene uno. Déjalo sin
  marcar. Pregúntale antes de los PRs si consigue un Android o se anota como no validado.
- El arrastre en la web usa la API del navegador: valídalo con eventos sintéticos, anótalo, y
  dile que el arrastre real con el ratón queda para él.

## Integrar (`push`)

1. Revisa con `gh pr list --head <rama> --state all` si los PRs ya existen. Las ramas de F11 ya
   están subidas; si un PR ya existe, actualízalo en vez de crear otro.
2. `git push -u origin <rama>` en cada repo afectado.
3. PR a `dev`, primero el de `brote_specs`, con el título "F0X: Nombre". Cuerpo: "Feature" con el
   enlace a la spec, "Qué cambia en este repo" y "Criterios de aceptación cubiertos", más lo que no
   se validó tal cual. En los de código, enlaza el PR de specs.
4. Dale el comando para fusionar:

   ```bash
   ! cd ~/github/organizations/brote && for r in brote_specs:N brote_backend_express:N brote_web_react:N brote_mobile_expo:N; do n=${r%:*}; gh pr merge ${r#*:} --merge -R BroteCodigoAbierto/$n && git -C $n checkout dev && git -C $n pull --ff-only; done
   ```

## Pendientes fuera de F11

- `academico/materias.md` pide de 4 a 8 features en el MVP y hay 15: decisión del usuario.
- De F05 no se probó a mano el arrastre real del editor (V20, V26 y V34) ni un lector de pantalla
  (V37). De F05 y F06, varios criterios de móvil se vieron en Expo web, no en un teléfono.
- `pendientes.md`, en este repo, ya está resuelto. Falta que el usuario confirme si se borra.
- Mover `correr` a este repo es opcional.
