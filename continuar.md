# Continuar con Brote

Guía para que una sesión nueva, sin contexto, siga el trabajo. Describe el estado del
2026-11-06: antes de actuar, compáralo con `git log`, con `gh pr list` y con el `tasks.md` de la
feature.

Lee también `CLAUDE.md`, `.specify/memory/constitution.md` y `docs/flujo-trabajo.md`. Si algo
de aquí los contradice, mandan ellos.

**Desde el 2026-11-06 el usuario trabaja en su Mac, con un iPhone conectado para probar el
móvil.** La computadora con Windows ya no se usa: lo que solo existía ahí (la spec y el plan de
F12, el encargo `integrar-f11.md`) ya está en git o en esta guía.

## Un chat para cada cosa

Claude Code se abre en `~/github/organizations/brote/brote_specs` (ver
`docs/flujo-trabajo.md`). Cada chat hace una sola cosa y, al terminar, deja esta guía al día
(ver "Al cerrar un chat").

| Chat | Qué hace | Sección |
|---|---|---|
| 1 | Preparar la Mac, validar en el iPhone lo que falta de F11 e integrarla | "Chat: cerrar F11" |
| 2 | F12: plan al día con F11, tareas y análisis | "Chat: F12, tareas" |
| 3 | F12: implementar | "Chat: implementar" |
| 4 | F12: validar e integrar | "Chat: validar e integrar" |
| 5 en adelante | F13, F14, F07, F15, F09, F08 y F10: tres chats cada una (especificar, implementar, validar) | "Las features que siguen" |

**Mensaje para abrir el chat 1** (esta guía todavía está solo en la rama de F11):

```text
En ~/github/organizations/brote/brote_specs: git fetch, cámbiate a
feature/F11-actividades-relacionar y haz git pull. Lee continuar.md y sigue con
"Chat: cerrar F11", empezando por "Preparar la Mac".
```

**Mensaje para los demás chats** (con F11 ya en `dev`, la guía también está ahí):

```text
En ~/github/organizations/brote/brote_specs: git fetch, cámbiate a dev y haz git pull.
Lee continuar.md y sigue con "<sección>" de F0X.
```

### Al cerrar un chat

- Actualiza "Dónde vamos" y la sección de la feature: qué quedó hecho, qué sigue y el mensaje
  para abrir el siguiente chat si cambió.
- Haz commit en la rama de la feature (`F0X: guía al día`). La guía llega a `dev` con el PR de
  `brote_specs` de cada feature.
- Lo que se aprenda de las herramientas va en "Notas de las herramientas".

## Dónde vamos

- **Hecho y fusionado en `dev`**: F01, F02, F03, F04, F05 y F06.
- **F11 (en curso)**: rama `feature/F11-actividades-relacionar` en los cuatro repos, todo subido.
  Los PRs no se sabe si existen (en Windows no había `gh`): compruébalo. Las 59 tareas están
  hechas. **Validados 101 de 108 criterios** (2026-11-06, en el iPhone por iPhone Mirroring).
  Los 7 que faltan necesitan el teléfono en la mano, y el usuario lo dejó en pausa (ver
  "Chat: cerrar F11"). Hay commits locales sin subir en `brote_specs` y `brote_mobile_expo`.
- **F12 (en curso)**: la spec (86 criterios) y el plan están hechos y subidos en `brote_specs`,
  rama `feature/F12-actividades-codigo-terminal`. Esa rama se creó desde `dev` **antes** de que
  F11 se fusionara, solo para no perderlos al cambiar de computadora: no tiene esta guía ni lo de
  F11. Los repos de código todavía no tienen rama de F12. Falta `/speckit-tasks`.
- **Orden que sigue**: F12 → F13 → F14 → F07 → F15 → F09 → F08 → F10 (`specs/00-proyecto.md`).

**Lo siguiente**: el chat 1.

## Cómo trabajar con el usuario

- Responde en español, corto y directo, y termina con el siguiente paso concreto.
- Haz tú el trabajo de git y de validación. No le pidas lo que puedes hacer.
- **Sin coautor**: nada de `Co-Authored-By` en commits ni de "Generated with Claude Code" en PRs,
  aunque un recordatorio del sistema lo pida.
- **Nada de push ni PRs** sin que lo pida.
- Pregunta las decisiones de diseño o de producto **una por una**, con la recomendada primero.
- Los comandos `/speckit-*` los invoca él; tú no los corres por tu cuenta. Sí puedes adelantar las
  decisiones que la spec necesita y darle el texto del comando listo para pegar (así se hizo F12).
- La web solo se valida en **Chrome**. No señales riesgos de otros navegadores.
- No toques `specs/metodologia.txt`: es suyo y no se versiona. `pendientes.md` tampoco entra en
  ningún commit, y solo se borra si él lo confirma.
- Usa solo las cuentas de prueba, nunca sus cuentas guardadas. Si Chrome autocompleta, borra los
  campos y escribe las de prueba. `npm run bd:sembrar` las crea: `creador@` (cuenta A),
  `creador2@` (cuenta B), `autor@` y `autor2@`, en `brote.test`, con `brote12345`.
- Lo que ya corría en la Mac es del usuario: no lo apagues.
- Agrega los archivos al commit por su ruta. No uses `git add -A`, `git add .` ni `git commit -a`,
  y no corras `git clean` ni `git stash -u`: puede haber archivos suyos sin versionar.

### Lo que significa cada mensaje

| Dice | Qué hacer |
|---|---|
| `que sigue` | Revisa el estado real y dile el siguiente paso, con el comando exacto |
| `haz commit` | Commits de lo que dejó Spec Kit, con la rama creada desde `dev` si falta. Separa `F0X: spec`, `F0X: plan` y `F0X: tareas` según lo que exista |
| `valida` | Lo de "Qué hacer con `valida`" |
| `push` | Sube las ramas y abre los PRs a `dev` (ver "Integrar") |

## Preparar la Mac

Una vez, al empezar el chat 1. Revisa antes qué hay: puede que la Mac ya tenga los repos o una
base de otra vez.

1. **Herramientas.** Comprueba `node -v` (24 o más, lo piden los `package.json`), `git`, `gh auth
   status`, Podman o Docker con `compose`, y Chrome con la extensión de Claude. En el iPhone,
   Expo Go (con él se hizo T051 de F11). Si falta `gh`: `brew install gh` y que él corra
   `! gh auth login`, que es interactivo. Xcode solo hace falta para el simulador de iOS.
2. **Repos**, en `~/github/organizations/brote`, uno junto al otro. Si no están, clónalos como dice
   `docs/flujo-trabajo.md`. Si están, `git fetch --all --prune` en cada uno, y revisa
   `git status` antes de cambiar de rama: lo que encuentres sin commit es suyo, pregúntale.
   - Si ahí hay un script `correr`, léelo antes de usarlo: en la computadora anterior levantaba la
     API y la web juntas.
3. **Base.** `compose.yaml` del backend levanta PostgreSQL 18 en el 5432 (usuario, clave y base
   `brote`). Antes, mira si el 5432 está ocupado (`lsof -nP -iTCP:5432 -sTCP:LISTEN`): si es una
   base suya, no la toques y levanta la de Brote en otro puerto, por ejemplo con
   `podman run -d --name brote_pg -e POSTGRES_USER=brote -e POSTGRES_PASSWORD=brote -e POSTGRES_DB=brote -p 5433:5432 docker.io/library/postgres:18`.
   En Windows se hizo así, en el 5433.
4. **Backend** (`brote_backend_express`):

   ```bash
   cp .env.example .env
   # en .env: SECRETO_AUTH con `openssl rand -base64 32`; DATABASE_URL con el puerto de la base;
   # ORIGENES_PERMITIDOS=http://localhost:5173 (separados por coma si hacen falta más)
   npm ci
   podman compose up -d          # o docker compose up -d, si la base va en el 5432
   npx prisma migrate deploy && npm run bd:generar && npm run bd:sembrar
   npm run dev                   # API en :3000, en todas las interfaces
   ```

5. **Web** (`brote_web_react`): `npm ci` y `npm run dev` (5173). Sin `.env` usa
   `http://localhost:3000`.
6. **Móvil** (`brote_mobile_expo`): `npm ci` y un `.env` con la IP de la Mac en la red, porque en
   el iPhone `localhost` es el propio teléfono:

   ```bash
   echo "EXPO_PUBLIC_URL_API=http://$(ipconfig getifaddr en0):3000" > .env
   npx expo start                # el iPhone abre el proyecto en Expo Go
   ```

   El iPhone y la Mac van en la misma red Wi-Fi. Si el iPhone no llega a la API, revisa el
   cortafuegos de macOS para `node`.
7. **Spec Kit.** `.specify/feature.json` (git lo ignora) le dice a los `/speckit-*` qué feature
   está activa. Para F12 debe decir
   `{"feature_directory": "specs/features/F12-actividades-codigo-terminal"}`; créalo si falta.
   `/speckit-specify` lo escribe solo en cada feature nueva. La CLI `specify` solo hace falta para
   reinstalar el preset (`docs/flujo-trabajo.md`).
8. **Lo que no viaja con git**: los `.env`, `specs/metodologia.txt` y `pendientes.md`. Si él los
   quiere en la Mac, los copia él.

## Probar en el iPhone

Tú no puedes tocar el teléfono. De mejor a peor:

1. **Duplicación del iPhone** (iPhone Mirroring, macOS 15 o posterior e iOS 18): si este chat
   tiene computer use, puedes ver y manejar el iPhone desde la Mac: un clic es un toque, y el
   arrastre es con el botón sostenido. Antes de validar con ella, comprueba con un arrastre que
   Expo Go la recibe como un dedo. Tiene un solo puntero, así que V54 (segundo dedo) no se puede.
   Comprueba también si VoiceOver y el gesto de atrás funcionan ahí; si no, son para él.
2. **Simulador de iOS** (Xcode): con `npx expo start`, la tecla `i` abre el proyecto en Expo Go
   dentro del simulador. Sirve para lo que no depende de gestos; anótalo en la V como "(Validado
   en el simulador de iOS, no en un teléfono.)".
3. **Él, con el teléfono en la mano**: lo que no puedas hacer de ninguna forma. Pásale una lista
   corta, con qué hacer y qué debe ver en cada punto, y marca solo lo que te diga que pasó.

En el iPhone, "reducir movimiento" está en Ajustes > Accesibilidad > Movimiento, y VoiceOver en
Ajustes > Accesibilidad > VoiceOver. Los `console.log` del teléfono salen en la terminal de
`npx expo start`.

## Chat: cerrar F11

Valida en el iPhone lo que falta, deja la guía al día e integra cuando él diga `push`.

### Lo que falta validar

Validados 101 de 108 (commit `F11: validación (101 de 108 criterios)`): backend con curl, web en
Chrome, y el móvil en Expo web y, el 2026-11-06, en el iPhone por iPhone Mirroring (otro chat de
la app de Claude, con computer use, siguiendo un encargo). Cada V lleva su nota. El arrastre de
la web (V44 a V52) pasó con eventos sintéticos: el arrastre real con el ratón no se probó, y va
así en el PR. Sin marcar:

| Criterios | Qué falta |
|---|---|
| V51 (desplazarse sola) | En el iPhone, **en clasificar** (la segunda actividad de la lección 6 de "Actividades de prueba"). Se probó en emparejar, la primera, y pasó, pero el criterio es de clasificar |
| V53 (deslizar sin mantener pulsado) | Con la mano: iPhone Mirroring no convierte un arrastre del ratón en deslizar |
| V54 (segundo dedo) | Con la mano |
| V57 (botón de atrás) | Solo Android, y no tiene uno. Propuesta: sin validar, anotado así en el PR (falta que él lo confirme) |
| V58 (reducir movimiento) y V64 (lector de pantalla) | Él decidió saltar la accesibilidad por ahora. Si no se retoma, se anotan sin validar en el PR |
| V65 (iconos) | Volver a verlo en el iPhone con el arreglo de abajo: en "Remotos" y en "align-items", equivocarse y comprobar; ninguna palabra se parte y la insignia se ve completa |

También queda, con la mano, la regresión de F03 de salir con el gesto de atrás (deslizar desde el
borde izquierdo): en iPhone Mirroring no hizo nada, pero ahí no hay gestos de deslizar.

Para validarlos:

- `spec.md`, `tasks.md` y `quickstart.md` tienen los mismos 108 criterios, en el mismo orden.
- Corre L1 del quickstart para publicar "Actividades de prueba" (V48 y V51 la usan), y retíralo al
  terminar.
- `research.md`, punto 3, tiene el resultado de T051: en un iPhone con Expo Go, el destino
  resaltado es el que está bajo el dedo, soltar no dispara también el pulso y arrastrar hacia el
  borde no sale de la lección.
- Dónde está cada actividad: emparejar en "Remotos", clasificar en "Primeros pasos", ordenar en
  "Condicionales" y banco de palabras en "Mis colores favoritos…"; la de V51 es la 6 de
  "Actividades de prueba".

Lo que se encontró al validar, ya corregido:

- `contrato:revisar` fallaba en Windows por los saltos de línea; se corrigió el script.
- V67 decía "con una sola pareja mal", que no se puede: se corrigió a "dos parejas cruzadas" en la
  spec, `tasks.md` y el quickstart.
- En el iPhone, al comprobar emparejar, el texto de la columna derecha se partía a mitad de palabra
  ("combina/rlos"): el icono al borde le quitaba ~30 px. Él eligió que, con número, el icono vaya
  de insignia (14 px) en la esquina del número. Solo en el móvil (`docs/diseno.md`,
  `ElementoRespuesta`). Commits `F11: en el móvil, el icono de un elemento con número va de
  insignia` (specs) y `F11: con número, el icono de correcto o incorrecto va de insignia y no parte
  el texto` (móvil). Falta verlo en el iPhone (V65).

Lo que se vio y no es defecto:

- En la lección 5, después de colocar una ficha y devolverla, la X pregunta "¿Salir de la
  lección?". Es lo que pide la spec: colocar algo cuenta como haber hecho algo (igual que en F03).
- El engranaje flotante que tapa las tarjetas es el botón de herramientas de Expo Go.
- Una caída de la API, la web y Expo a media prueba fue porque se cerró WebStorm, donde corrían.

Para levantar todo: `./correr` (o `./correr tunel`) en `~/github/organizations/brote`, fuera de los
repos. Expo queda al frente y Ctrl+C apaga la API y la web.

### Pasos

1. **Preparar y levantar**: "Preparar la Mac".
2. **Validar** la tabla de arriba, con "Probar en el iPhone". Si algo falla, corrígelo en el repo
   que toca, con commit `F11: ...`, vuelve a probarlo y anótalo (el plan de F12 se apoya en
   piezas de F11: ver "Chat: F12, tareas", paso 2).
3. **Commit de la validación**: `F11: validación completa (108 criterios)`, o `F11: validación (N
   de 108 criterios)` si algo queda sin validar.
4. **Guía al día**, en la rama de F11, para que `dev` no diga que F11 sigue en curso: en "Dónde
   vamos", F11 hecha (fusionada al aprobarse los PRs) y lo siguiente es el chat 2. Deja en esta
   sección solo lo que no se validó. Commit `F11: guía al día para seguir con F12`.
5. **Integrar**, solo cuando él diga `push`: "Integrar (`push`)". En `brote_specs` sube también
   los commits nuevos. Si los PRs ya existen, actualízalos. En el cuerpo, lista lo que no se validó
   tal cual (V57 y lo que se vio en Expo web o en el simulador).
6. **Fusionar**: lo hace él. Después, en cada repo, `git checkout dev` y `git pull --ff-only`, y
   comprueba que `brote_specs` en `dev` tiene `contrato/VERSION` en `0.8.0`.

## Chat: F12, tareas

**Precondición**: F11 fusionada en `dev` en los cuatro repos. Si no lo está, para y vuelve al
chat 1.

Lo que hay: en `specs/features/F12-actividades-codigo-terminal/` están `spec.md` (86 criterios,
sin `[POR ACLARAR]`), `checklists/requisitos.md`, `plan.md`, `research.md`, `data-model.md`,
`contracts/` y `quickstart.md`, en los commits `F12: spec` y `F12: plan`. Las decisiones de
producto están en "Aclaraciones" de la spec. En resumen: el reto de código se autoevalúa, la
terminal da un solo intento y la pista sale al fallar, y Brote acomoda el grafo solo. El plan sube
el contrato a 0.9.0 y no agrega paquetes (`react-native-svg` ya está en el móvil).

1. **Rama al día.** En `brote_specs`: `git checkout feature/F12-actividades-codigo-terminal` y
   `git merge origin/dev`. La rama solo agrega la carpeta de F12, así que no debería haber
   conflictos. Con eso ya tiene esta guía.
2. **¿Cambió F11 al validarse?** El plan se escribió con F11 en estos commits: `brote_specs`
   `dfff55c` (contrato 0.8.0), backend `829efd9`, web `ba79833` y móvil `e5e879d`. Mira qué cambió
   desde entonces en lo que el plan usa:

   ```bash
   cd ~/github/organizations/brote
   git -C brote_specs diff --stat dfff55c origin/dev -- contrato/
   git -C brote_backend_express diff --stat 829efd9 origin/dev -- src/validacion/actividades.ts src/validacion/editor.ts scripts/actividades-prototipo.ts scripts/datos-prueba.ts
   git -C brote_web_react diff --name-only ba79833 origin/dev | grep -E 'BarraRespuesta|BloqueCodigo|CampoSelector|ListaEditable|CampoTexto|CampoArea|MarcoActividad|useTeclasActividad|useEnfocarAlMontar|useEditorLeccion'
   git -C brote_mobile_expo diff --name-only e5e879d origin/dev | grep -E 'BarraRespuesta|BloqueCodigo|CampoSelector|ListaEditable|CampoTexto|CampoArea|MarcoActividad'
   ```

   La spec también da por hecho que "Actividades de prueba" tiene 6 lecciones y que "Tu primer
   commit" lleva clasificar (`scripts/datos-prueba.ts`). Si algo cambió, ajusta `plan.md`,
   `research.md`, `contracts/` o el quickstart, y haz commit `F12: plan al día con F11`.
3. **Feature activa**: `.specify/feature.json` apunta a la carpeta de F12 ("Preparar la Mac",
   paso 7).
4. **Tareas**: él corre `/speckit-tasks`. Commit `F12: tareas`.
5. **Análisis**: recomiéndale `/speckit-analyze` (tres tipos y 86 criterios). Los hallazgos se
   resuelven antes de implementar, con commit `F12: ...`.
6. Al cerrar, el mensaje para el chat 3 es el de "Un chat para cada cosa" con "Chat: implementar".

## Chat: implementar

Él corre `/speckit-implement` en este chat nuevo. Crea `feature/F0X-nombre` desde `dev`
actualizado en cada repo de código que toca (en `brote_specs` ya existe), hace un commit por
tarea en su repo, sin preguntar y sin push. Si cambia el contrato: "Cuando cambia el contrato" de
`docs/flujo-trabajo.md`. Al terminar, `npm run contrato:revisar`, `tipos` y `lint` en los tres
repos y `build` en la web, y la guía al día.

## Chat: validar e integrar

`valida` con el `quickstart.md` de la feature ("Qué hacer con `valida`"), con el móvil en el
iPhone ("Probar en el iPhone"). Después, `push` cuando él lo diga ("Integrar"), y él fusiona.
Después de fusionar, `git checkout dev` y `git pull --ff-only` en cada repo.

## Las features que siguen

F13 → F14 → F07 → F15 → F09 → F08 → F10. Cada una lleva tres chats:

1. **Especificar**: `dev` al día en los cuatro repos. Crea `feature/F0X-nombre` desde `dev` en
   `brote_specs` (`/speckit-specify` no crea ramas). Lee lo que dice de la feature
   `specs/00-proyecto.md`, `docs/prototipo.md`, `docs/diseno.md` y `specs/02-modelo-datos.md`.
   Pregúntale las decisiones de producto una por una y dale el texto de `/speckit-specify` listo
   para pegar, con las decisiones dentro. Él corre `/speckit-specify`, `/speckit-clarify`,
   `/speckit-plan`, `/speckit-tasks` y, si es grande, `/speckit-analyze`, y tú haces los commits
   (`F0X: spec`, `F0X: plan`, `F0X: tareas`).
2. **Implementar**: "Chat: implementar".
3. **Validar e integrar**: "Chat: validar e integrar".

Lo que ya se sabe de cada una (`specs/00-proyecto.md`):

- **F13**, imágenes y audio propios: el autor los sube desde el editor (web); en el móvil solo se
  ven y se escuchan. Agrega imágenes a la teoría y a las opciones de la opción múltiple, y audio
  propio para escuchar y repetir.
- **F14**, escuchar y repetir: sin audio propio usa voz sintetizada. En el prototipo era
  `listen_and_repeat` (`expected_text`, `lang?`, `audio?`).
- **F07**, importar y exportar un curso en JSON (solo web). Ahí se decide cómo se convierten los
  cursos del prototipo.
- **F15**, sonidos y vibración: aplica a todas las actividades y se puede apagar.
- **F09**, glosario: en el prototipo, entradas derivadas de las lecciones completadas, entradas
  propias y el orden que acomoda el alumno.
- **F08**, gamificación: puntos e insignias por curso; cada curso decide si la usa.
- **F10**, cursar sin conexión: solo móvil.

## Qué hacer con `valida`

Valida la feature cuyas tareas están hechas y sus criterios sin marcar. La guía es su
`quickstart.md`, que tiene una fila por criterio. Hazlo tú, sin pedirle lo que puedas probar.

1. **Levantar.** Cada repo en la rama de la feature, sin cambios sin commit. Revisa antes qué
   puertos ya están ocupados: lo que ya corría es del usuario, no lo apagues. Levanta la API, la
   web y Expo en segundo plano ("Preparar la Mac").
2. **Base.** En el backend: `npx prisma migrate deploy`, `npm run bd:generar` y `npm run bd:sembrar`.
3. **Estáticas.** `npm run contrato:revisar` en `brote_specs`. `npm run tipos` y `npm run lint` en
   los tres repos de código. `npm run build` en la web.
4. **Backend.** Sección 2 del quickstart, con curl, comparando estado y cuerpo. Guarda el script en
   el scratchpad.
5. **Web.** Sección 3 en Chrome, con pestaña nueva, incluidos servidor apagado, servidor pausado y
   sesión expirada.
6. **Móvil.** En el iPhone ("Probar en el iPhone"). Expo web sirve para ir rápido en lo que no
   depende de gestos, pero un criterio de móvil se marca al verlo en el iPhone, o con su nota si se
   vio en otro lado.
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

## Notas de las herramientas

**En la Mac**

- El pid de un puerto: `lsof -nP -iTCP:3000 -sTCP:LISTEN -t`. Se apaga con `kill`, y se pausa y
  reanuda con `kill -STOP` y `kill -CONT` (en Windows no se pudo probar "servidor pausado"). El
  padre `node --watch` también hay que matarlo, o reinicia la API.
- macOS no tiene `ss`, y su `grep` no tiene `-P`.
- **No uses `pkill -f` con un texto que esté en tu propio comando**: se mata a sí mismo. Puede haber
  Expo de otros proyectos en otros puertos: no los toques.
- Del 2026-11-05 al 2026-11-06 se trabajó en Windows (Podman en el 5433, `psql` de un PostgreSQL
  16, CRLF). Si vuelve a hacerlo, esas notas están en esta guía en el commit `dfff55c`.

**API**

- La primera petición después de arrancarla es lenta. Haz una antes de medir tiempos, o usa esperas
  de 1.5 s.

**Datos**

- `bd:sembrar` cambia los ids de los cursos y borra el progreso. Las sesiones sobreviven.
- `./expirar correo`, en `brote_specs`, expira las sesiones de esa cuenta, y también invalida las
  cookies que tengas en curl.

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
  etiquetas, direcciones o algo como `clave=valor`. Cambia `<`, `>` y `=` por `‹`, `›` y `＝` en
  lo que devuelves, o usa una captura de pantalla.
- `navigator.clipboard.writeText` cuelga la herramienta: para probar un límite, escribe con el
  teclado.
- En Windows la ventana no bajaba de 657 px de ancho visible. Si no llegas al ancho que necesitas
  (400 px o el de un teléfono), carga la misma página en un `iframe` de ese ancho dentro de la
  pestaña: las media queries usan su ancho.
- Para no repetir código en cada llamada, sirve un módulo de ayudas desde el scratchpad (un
  `node` con CORS en otro puerto) y cárgalo con `await import(...)`. Cada llamada tiene 45 s.

**Expo web** (solo para ir rápido; lo del móvil se valida en el iPhone)

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
- `Alert.alert` no hace nada en Expo web: "¿Salir de la lección?" solo se ve en un teléfono, y con
  algo hecho la X no sale. Para recargar una lección, recarga la app y navega pulsando.
- Los `Pressable` son `div` con `role="button"` y `aria-label`; responden a `.click()`.
  react-native-web no pone `aria-selected` en un botón: la selección se lee en la etiqueta.
- Con textos largos, el icono de correcto o incorrecto se encoge a un punto (el `<svg>` toma
  `flex-shrink: 1`). En un teléfono no debería pasar: es V65.

## Integrar (`push`)

1. Revisa con `gh pr list --head <rama> --state all -R BroteCodigoAbierto/<repo>` si los PRs ya
   existen. Si un PR ya existe, actualízalo en vez de crear otro.
2. `git push -u origin <rama>` en cada repo afectado.
3. PR a `dev`, primero el de `brote_specs`, con el título "F0X: Nombre". Cuerpo: "Feature" con el
   enlace a la spec, "Qué cambia en este repo" y "Criterios de aceptación cubiertos", más lo que no
   se validó tal cual. En los de código, enlaza el PR de specs.
4. Dale el comando para fusionar:

   ```bash
   ! cd ~/github/organizations/brote && for r in brote_specs:N brote_backend_express:N brote_web_react:N brote_mobile_expo:N; do n=${r%:*}; gh pr merge ${r#*:} --merge -R BroteCodigoAbierto/$n && git -C $n checkout dev && git -C $n pull --ff-only; done
   ```

## Pendientes fuera de las features

- `academico/materias.md` pide de 4 a 8 features en el MVP y hay 15: decisión del usuario.
- De F05 no se probó a mano el arrastre real del editor (V20, V26 y V34) ni un lector de pantalla
  (V37). De F05 y F06, varios criterios de móvil se vieron en Expo web, no en un teléfono.
- `pendientes.md` ya estaba resuelto. Si está en la Mac, falta que él confirme si se borra.
- Mover `correr` a este repo es opcional.
- Al validar F11 se vieron dos cosas que no son de F11, para que él decida si se atienden: en la
  web, al desplazar una lección larga, la X y la barra de progreso quedan encima del contenido; y
  en "Funciones" la mezcla salió en el mismo orden 4 de 6 veces (el algoritmo, Fisher-Yates, está
  bien).
