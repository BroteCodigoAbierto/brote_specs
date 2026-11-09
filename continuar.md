# Continuar con Brote

Guía para que una sesión nueva, sin contexto, siga el trabajo. Describe el estado del
2026-11-08: antes de actuar, compáralo con `git log`, con `gh pr list` y con el `tasks.md` de la
feature.

Lee también `CLAUDE.md`, `.specify/memory/constitution.md` y `docs/flujo-trabajo.md`. Si algo
de aquí los contradice, mandan ellos.

**La versión al día de esta guía está en la rama `feature/F14-escuchar-repetir`** de
`brote_specs` (la última feature, que trae F11, F12 y F13). En `dev` y en las ramas anteriores hay
versiones viejas: no las sigas.

El usuario trabaja en su Mac, con un iPhone 12 mini para probar el móvil. Las sesiones se abren
en `~/github/organizations/brote/brote_specs` (los repos de código son hermanos; ver
`docs/flujo-trabajo.md`).

## Una sesión para cada cosa

- **Una sesión a la vez sobre las carpetas de los repos.** Todas comparten las mismas carpetas:
  si dos corren juntas, se cambian la rama una a la otra. Si necesitas otra rama mientras otra
  sesión trabaja, usa una copia aparte con `git worktree` (ver "Validar una feature anterior").
- **Cada feature nueva, completa en una sesión**: de la spec a la implementación ("Las features
  que siguen").
- **Validar va aparte**, una sesión de `valida` por feature: backend con curl, web en Chrome con
  la extensión de Claude, y el móvil en el iPhone con una sesión de **Claude Desktop con computer
  use** ("Probar en el iPhone").
- **Las decisiones de producto y de diseño son del usuario.** Se le preguntan una por una, con la
  recomendada primero; nadie más las contesta por él.

| Sesión | Qué hace | Mensaje |
|---|---|---|
| Siguiente feature | F07 completa (luego F15, F09, F08 y F10, una por sesión) | "Mensaje para una feature" |
| `valida` de F13 | Backend, web y móvil de F13 (0 de 90) | "Mensaje para validar" con F13 |
| `valida` de F14 | Backend, web y móvil de F14 (0 de 82) | "Mensaje para validar" con F14 |
| Teléfono en la mano | Lo que no se puede por iPhone Mirroring, de F11 a F14 | "Sesión con el teléfono en la mano" |
| Fusionar | Los PRs ya están abiertos; los fusiona él, en orden | "Integrar" |

**Mensaje para una feature** (cambia `F0X`):

```text
En ~/github/organizations/brote/brote_specs: git fetch y cámbiate a
feature/F14-escuchar-repetir (o a dev, si ya tiene F14). Lee continuar.md y haz F0X completa,
como dice "Las features que siguen": te autorizo a correr tú /speckit-specify,
/speckit-clarify, /speckit-plan, /speckit-tasks, /speckit-analyze y /speckit-implement, en
ese orden. Pregúntame las decisiones de producto una por una. Sin push.
```

**Mensaje para validar** (cambia `F0X`):

```text
En ~/github/organizations/brote/brote_specs: git fetch y cámbiate a
feature/F14-escuchar-repetir. Lee continuar.md y haz `valida` de F0X, en su propia rama (con
copias aparte si hace falta, como dice "Validar una feature anterior"). El móvil, con Claude
Desktop por iPhone Mirroring, como dice "Probar en el iPhone".
```

### Al cerrar un chat

- Actualiza "Dónde vamos" y la sección de la feature: qué quedó hecho y qué sigue.
- Haz commit en la rama de la feature (`F0X: guía al día`) y fusiona hacia adelante la cadena de
  ramas (F11 → F12 → F13 → F14 → la siguiente) en los repos que cambiaste, para que la última rama
  tenga todo y esta guía al día.
- Lo que se aprenda de las herramientas va en "Notas de las herramientas".

## Dónde vamos

- **Hecho y fusionado en `dev`**: F01, F02, F03, F04, F05 y F06.
- **Todo lo demás está subido, con PRs abiertos a `dev`** (2026-11-08), sin fusionar. Cada rama
  sale de la anterior, así que se fusionan en orden (ver "Integrar"):

| Feature | Tareas | Criterios | PRs (specs · back · web · móvil) |
|---|---|---|---|
| F04, arreglo: aciertos debajo del título en el móvil | — | Validado en el iPhone | specs #9 · — · — · móvil #9 |
| F11, actividades de relacionar | 59 de 59 | **103 de 108** | #10 · #8 · #9 · #10 |
| F12, código y terminal | 53 de 55 | **79 de 86** | #11 · #9 · #10 · #11 |
| F13, imágenes propias | 92 de 94 | **0 de 90** | #12 · #10 · #11 · #12 |
| F14, escuchar y repetir | 74 de 77 | **0 de 82** | #13 · #11 · #12 · #13 |

- **Contrato**: 0.11.0 en la rama de F14 (F11 lo dejó en 0.8.0, F12 en 0.9.0 y F13 en 0.10.0).
- **F04, arreglo** (rama `feature/F04-aciertos-bajo-el-titulo`, desde `dev`): en el detalle del
  curso del móvil, "N de M aciertos" va en una segunda línea, debajo del título, porque en 375 px
  el título se partía a media palabra ("Condicio / nales"). Lo eligió el usuario; está en
  `docs/diseno.md`. Se puede fusionar cuando sea: no choca con F11 a F14.
- **F11**: lo que falta, en "Sesión con el teléfono en la mano". El 2026-11-08 pasaron V51 y V65
  en el iPhone, con la app de la rama de F12 (que trae F11 completa).
- **F12**: validada el 2026-11-08: backend con curl, web en Chrome (teclado, portapapeles y clics
  reales) y móvil por iPhone Mirroring. Al validar se corrigió:
  - V08: en el móvil, la etiqueta del lenguaje de la "Solución de referencia" salía cortada (la
    tapaba el código). Commit `F12: la etiqueta del lenguaje de la solución ya no queda tapada por
    el código`.
  - V51 pedía que en "Ramas" la X saliera directo sin haber escrito, y no se podía: su primera
    terminal va después de una teoría, y pasar de la primera actividad ya pide confirmación (F03).
    Ahora se prueba en las lecciones 9 y 10 de "Actividades de prueba" (spec, `tasks.md` y
    quickstart).
  - Faltan T047 y T055, y 7 criterios: ver "Sesión con el teléfono en la mano".
- **F13**: implementada; falta `valida` completo (0 de 90) y T075 y el recorrido de T090 en el
  iPhone. Para validar: el quickstart prepara los archivos con `npm run imagenes:validacion`
  (sección 1.2, usa `sips`) y bloquea o retrasa las imágenes con `npm run proxy:validacion`
  (sección 1.4), los dos en el backend; la web y Expo van contra el proxy (`:3001`). Lo que se
  decidió al analizar: el servidor rechaza una foto con EXIF, XMP o IPTC, o un PNG o WebP animado
  (el editor ya los limpia); en el móvil, el botón de pausa de un GIF que se arrastra va al lado
  del gesto de `Arrastrable`, no dentro.
- **F14**: implementada (audios en PostgreSQL, decisión 0017; `expo-speech`, `expo-audio` y
  `expo-file-system` en el móvil; idioma del curso). Falta `valida` completo (0 de 82) y T066,
  T072 (en el iPhone) y T077 (revisar la spec contra lo construido, con lo que anote T066). Para
  validar: `npm run audios:validacion` (sección 1.2 del quickstart, usa `afconvert`) y
  `npm run proxy:validacion` (sección 1.4, ahora también con `__modo/danar` para audios).
- **Orden que sigue**: F07 → F15 → F09 → F08 → F10 (`specs/00-proyecto.md`). F07 sale de
  `feature/F14-escuchar-repetir` mientras F11 a F14 no estén en `dev`.

**Lo siguiente**: cualquiera de las sesiones de la tabla de arriba. Si él no dice cuál, propón la
siguiente feature (F07) o el `valida` de F13, y pregúntale.

## Sesión con el teléfono en la mano

Una sola sesión para todo lo que iPhone Mirroring no puede: el teclado del iPhone (Mirroring
escribe con el de la Mac), gestos de varios dedos o de deslizar, VoiceOver y un ancho de 360 px.
Él tiene el teléfono; tú le pasas una lista corta (qué hacer y qué debe ver) y marcas solo lo que
te diga que pasó. Cada criterio en su rama (ver "Validar una feature anterior").

| Feature | Qué | Notas |
|---|---|---|
| F11 | V53 (deslizar sin mantener pulsado), V54 (un segundo dedo no arrastra) | Lección 6 de "Actividades de prueba" |
| F11 | V58 (reducir movimiento) y V64 (lector de pantalla), web y móvil | En la Mac, VoiceOver con Chrome; en el iPhone, Ajustes → Accesibilidad |
| F11 | V57 (botón de atrás) | Solo Android y no tiene uno: se queda sin validar y así va en el PR (falta que lo confirme) |
| F11 / F03 | Salir de una lección con el gesto de atrás (deslizar desde el borde izquierdo) | Regresión de F03 |
| F12 | T047 y V18, V31, V32, V33 (el teclado del iPhone no corrige, no pone mayúsculas, deja `"`, `'`, `--` y `...` como se escriben) y V19 con el teclado abierto | Por Mirroring se vio que **iOS cambia dos espacios por un punto** en la terminal (`  git   init  ` → `git.  init`): T047 debe decir si pasa con el teclado del iPhone y, si pasa, preguntarle qué hacer. Anotar en `research.md`, punto 7 |
| F12 | T055 | Revisar la spec con lo que anote T047 (lo demás ya se revisó) |
| F12 | V42 (grafo al límite en 360 px) | En 375 pasó; hace falta un teléfono o emulador de 360 |
| F12 | V47 (lector de pantalla), web y móvil | Las etiquetas ya están en el DOM |
| F13 | T075 y el recorrido de T090 | Ver `tasks.md` de F13 |
| F14 | T066 y T072 | Ver `tasks.md` de F14 (voz con el interruptor de silencio, grabar, altavoz) |

Lo que sí se puede por Mirroring (casi todo lo demás del móvil) va en el `valida` de cada feature.

## Cómo trabajar con el usuario

- Responde en español, corto y directo, y termina con el siguiente paso concreto.
- Haz tú el trabajo de git y de validación. No le pidas lo que puedes hacer.
- **Coautor**: da igual. El 2026-11-06 él decidió dejar el `Co-Authored-By` de los commits de F12;
  no hace falta quitarlo ni ponerlo.
- **Nada de push ni PRs** sin que lo pida.
- Pregunta las decisiones de diseño o de producto **una por una**, con la recomendada primero.
- Los comandos `/speckit-*` los corres tú solo si el mensaje de apertura de la sesión lo autoriza
  (así se hacen las features desde F13: "Una sesión por feature"). Si no, los invoca él, y tú le
  das el texto listo para pegar.
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

Solo si la Mac está nueva (esta ya está preparada: repos, base en Docker Desktop, `gh` con
sesión, PyYAML para Spec Kit en `~/.local/share/speckit-python`). Revisa antes qué hay: puede que la Mac ya tenga los repos o una
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
   está activa, por ejemplo
   `{"feature_directory": "specs/features/F14-escuchar-repetir"}`; créalo si falta.
   `/speckit-specify` lo escribe solo en cada feature nueva. La CLI `specify` solo hace falta para
   reinstalar el preset (`docs/flujo-trabajo.md`).
8. **Lo que no viaja con git**: los `.env`, `specs/metodologia.txt` y `pendientes.md`. Si él los
   quiere en la Mac, los copia él.

## Probar en el iPhone

Claude Code en la terminal no tiene computer use: no puede ver ni tocar el iPhone. **Claude
Desktop sí** (Ajustes → This computer → Computer use, encendido), y por **iPhone Mirroring**
maneja el teléfono: un clic es un toque y el arrastre es con el botón sostenido. Así se validó el
móvil de F11 y F12 el 2026-11-06 y el 2026-11-08.

1. **Levanta tú** la API, la web y Expo de la rama que se valida (en el iPhone, la API va por la
   IP de la Mac: `EXPO_PUBLIC_URL_API=http://$(ipconfig getifaddr en0):3000`). Comprueba que Expo
   responde por la IP: `curl -H 'expo-platform: ios' -H 'Accept: application/expo+json'
   http://<ip>:8081/` da 200 (sin esos encabezados se queda esperando, y es normal).
2. **Escribe un encargo** en `~/Desktop/prompt-iphone-F0X.md`: qué no tocar (archivos, commits,
   servidores), cómo abrir el proyecto, la cuenta de prueba y una línea por criterio ("qué hacer →
   qué debe pasar"), con dónde está cada actividad. Pide que escriba los resultados en
   `~/Desktop/resultados-iphone-F0X.md` conforme avance (`V05 ok`, `V21 falla: …` o `V18 no se puede
   aquí`), y que al terminar le mande un mensaje a esta sesión con SendMessage (dale tu nombre de
   `ListAgents`).
3. **Pásale a él el mensaje para Claude Desktop**: abrir un chat de Claude Code con computer use y
   pegar `Lee ~/Desktop/prompt-iphone-F0X.md y síguelo.` El iPhone va bloqueado y cerca de la Mac.
4. **Lee los resultados** y marca lo que pasó, con la nota "(Móvil validado en un iPhone 12 mini por
   iPhone Mirroring (computer use).)". Si algo falla, corrígelo, reinicia Expo (con `CI=1` no
   recarga solo) y pídele por mensaje a esa sesión que lo vuelva a ver.

Lo que se aprendió:

- Expo Go no tiene "Enter URL manually": la sesión abre `exp://<ip>:8081` desde Safari del iPhone,
  que ofrece abrirlo en Expo Go.
- Expo Go pide que su cuenta sea la misma que la de Expo CLI en la Mac ("these accounts need to
  match"). Cambiarla es iniciar sesión: lo hace él.
- iPhone Mirroring necesita el iPhone bloqueado; si él lo usa, se corta.
- Escribir en el iPhone necesita control de pantalla completa en Claude Desktop, y se aprueba en
  su ventana: si nadie aprueba, caduca.
- No se puede por Mirroring: el teclado del iPhone (escribe el de la Mac), un segundo dedo,
  deslizar para desplazarse (el arrastre del ratón no lo es), el gesto de atrás y anchos distintos
  al del teléfono (el 12 mini mide 375). Eso va a "Sesión con el teléfono en la mano".
- Sí se puede: tocar, arrastrar con pulsación larga, mandar la app a segundo plano (Cmd+1 para ir a
  inicio, Cmd+2 para volver), pegar desde la Mac (iOS pide permiso), modo claro y oscuro (Ajustes →
  Pantalla y brillo) y reducir movimiento.
- El botón flotante de Expo Go (engranaje) tapa a veces el borde derecho: no es de Brote.

Sin Claude Desktop, quedan el simulador de iOS (con Xcode, que esta Mac no tiene) o él con el
teléfono en la mano, con una lista corta.

### Validar una feature anterior

Las ramas van en cadena y la Mac suele estar en la última. Para validar otra sin moverla (y sin
pisar a otra sesión), haz copias aparte en el scratchpad:

```bash
git -C ~/github/organizations/brote/<repo> worktree add <scratchpad>/<repo> <rama>   # los cuatro repos
# npm ci en cada copia de código; .env propio en el backend con otro PUERTO (3100),
# ORIGENES_PERMITIDOS con el puerto de la web (5273) y una base propia:
docker exec brote_backend_express-postgres-1 psql -U brote -d brote -c "CREATE DATABASE brote_f0x"
# DATABASE_URL=...localhost:5432/brote_f0x; migrate deploy, bd:generar y bd:sembrar en la copia
npx vite --port 5273 --strictPort     # web, con VITE_URL_API=http://localhost:3100
CI=1 npx expo start --lan --port 8181  # móvil, con EXPO_PUBLIC_URL_API=http://<ip>:3100
```

Los commits que hagas en una copia quedan en su rama. Al terminar: apaga todo,
`git worktree remove --force` cada copia (revisa antes que no tenga cambios sin commit), borra la
base con `DROP DATABASE`, y fusiona la rama hacia adelante en la cadena.

## F11: lo que se vio al validar

Lo que falta validar está en "Sesión con el teléfono en la mano". Datos útiles: `spec.md`,
`tasks.md` y `quickstart.md` tienen los mismos 108 criterios en el mismo orden; L1 del quickstart
publica "Actividades de prueba"; emparejar está en "Remotos", clasificar en "Primeros pasos",
ordenar en "Condicionales" y banco de palabras en "Mis colores favoritos…".

Lo que se encontró al validar, ya corregido:

- `contrato:revisar` fallaba en Windows por los saltos de línea; se corrigió el script.
- V67 decía "con una sola pareja mal", que no se puede: se corrigió a "dos parejas cruzadas" en la
  spec, `tasks.md` y el quickstart.
- En el iPhone, al comprobar emparejar, el texto de la columna derecha se partía a mitad de palabra
  ("combina/rlos"): el icono al borde le quitaba ~30 px. Él eligió que, con número, el icono vaya
  de insignia (14 px) en la esquina del número. Solo en el móvil (`docs/diseno.md`,
  `ElementoRespuesta`). Commits `F11: en el móvil, el icono de un elemento con número va de
  insignia` (specs) y `F11: con número, el icono de correcto o incorrecto va de insignia y no parte
  el texto` (móvil). Pasó en el iPhone el 2026-11-08 (V65).

Lo que se vio y no es defecto:

- En la lección 5, después de colocar una ficha y devolverla, la X pregunta "¿Salir de la
  lección?". Es lo que pide la spec: colocar algo cuenta como haber hecho algo (igual que en F03).
- El engranaje flotante que tapa las tarjetas es el botón de herramientas de Expo Go.
- Una caída de la API, la web y Expo a media prueba fue porque se cerró WebStorm, donde corrían.

## Chat: implementar

`/speckit-implement`, en la misma sesión de la feature (o él, si la sesión no lo tiene
autorizado). Crea `feature/F0X-nombre` en cada repo de código que toca, desde la base que dice
"Las features que siguen", paso 1 (en `brote_specs` ya existe), hace un commit por tarea en su
repo, sin preguntar y sin push.

Si cambia el contrato: "Cuando cambia el contrato" de
`docs/flujo-trabajo.md`. Al terminar, `npm run contrato:revisar`, `tipos` y `lint` en los tres
repos y `build` en la web, y la guía al día.

## Chat: validar e integrar

`valida` con el `quickstart.md` de la feature ("Qué hacer con `valida`"), con el móvil por Claude
Desktop ("Probar en el iPhone"). Lo que no se pueda por Mirroring, a "Sesión con el teléfono en la
mano". Si los PRs ya existen, `git push` los actualiza ("Integrar").

## Las features que siguen

F07 → F15 → F09 → F08 → F10. Cada una, en **una sola sesión**, de la spec a la
implementación:

1. **Ramas.** Mientras F11 a F14 no estén en `dev`, cada feature sale de la rama de la anterior,
   en los cuatro repos (F07 de `feature/F14-escuchar-repetir`, F15 de la de F07, y así).
   Cuando las anteriores se fusionen, cada rama hace `git merge origin/dev`. Con todo en `dev`, sale
   de `dev`. `/speckit-specify` no crea ramas: créala tú, en `brote_specs`, antes de correrlo, y
   apunta `.specify/feature.json` a la carpeta nueva si no lo hace solo.
2. **Decisiones.** Lee lo que dicen de la feature `specs/00-proyecto.md`, `docs/prototipo.md`,
   `docs/diseno.md` y `specs/02-modelo-datos.md`. Pregúntale las decisiones de producto una por
   una, con la recomendada primero, y mételas en el texto de `/speckit-specify`.
3. **Spec Kit**, en orden, corridos por ti (el mensaje de apertura lo autoriza):
   `/speckit-specify`, `/speckit-clarify` (las preguntas se las haces a él), `/speckit-plan`,
   `/speckit-tasks` y `/speckit-analyze`. Commits `F0X: spec`, `F0X: plan` y `F0X: tareas`; los
   hallazgos del análisis se resuelven antes de implementar (lo que sea decisión, se le pregunta).
4. **Implementar**: `/speckit-implement`, como en "Chat: implementar".
5. **Cerrar**: guía al día con lo que quedó y lo que falta validar, y el mensaje de la siguiente
   sesión. Sin push.

Lo que ya se sabe de cada una (`specs/00-proyecto.md`):

- **F13** y **F14**: implementadas (ver "Dónde vamos").
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

- `./correr` (o `./correr tunel`), en `~/github/organizations/brote` (fuera de los repos, no
  se versiona): levanta la base, la API y la web en segundo plano y Expo al frente; Ctrl+C apaga
  lo que levantó. Lo que ya corre en su puerto lo usa tal cual.

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
- `resize_window` puede no cambiar el ancho visible (en esta Mac se quedó en 1536 px): usa el
  `iframe`, con la misma ruta, y teclea dentro de él con clics de verdad.
- Para el tema claro u oscuro sin tocar el sistema: `document.documentElement.dataset.tema =
  'claro'` (o `'oscuro'`; `tokens.css` lo respeta).
- Arrastre sintético en el editor: los hooks guardan lo arrastrado en el estado de React, así que
  espera ~150 ms entre `dragstart`, `dragover` y `drop`, o no pasa nada.
- Pegar de verdad: `printf 'git init\n' | pbcopy` y Cmd+V con la herramienta de teclado.
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

## Integrar

Los PRs de F04 (arreglo), F11, F12, F13 y F14 se abrieron el 2026-11-08 (ver la tabla de "Dónde
vamos"). Cada cuerpo dice qué cambia, cuántos criterios pasaron y qué falta. **Los fusiona él.**

- **Orden**: F04 cuando sea; F11, luego F12, luego F13, luego F14. Cada rama trae a las anteriores,
  así que el PR de F12 muestra también los commits de F11 hasta que F11 esté en `dev`.
- **Cuándo**: F11 y F12 están casi validadas (lo que falta es del teléfono en la mano y va en el
  PR); F13 y F14 todavía no tienen `valida`.
- **Si hay commits nuevos** en una rama, `git push` y el PR se actualiza solo. Actualiza también su
  cuerpo si cambió lo validado (`gh pr edit N --body-file ...`).
- **Después de fusionar** una feature, en cada repo: `git checkout dev && git pull --ff-only`, y en
  las ramas que siguen, `git merge origin/dev`.

Para fusionar una feature en los cuatro repos (cambia los números):

```bash
! cd ~/github/organizations/brote && for r in brote_specs:10 brote_backend_express:8 brote_web_react:9 brote_mobile_expo:10; do n=${r%:*}; gh pr merge ${r#*:} --merge -R BroteCodigoAbierto/$n && git -C $n checkout dev && git -C $n pull --ff-only; done
```

Una feature nueva (F07 en adelante) abre sus PRs igual: `gh pr list --head <rama> --state all`
para no repetir, `git push -u origin <rama>` y `gh pr create --base dev`, primero el de
`brote_specs`, con el título "F0X: Nombre" y en el cuerpo "Feature" (enlace a la spec), "Qué
cambia en este repo", "Criterios de aceptación cubiertos" (con lo que no se validó tal cual) y,
en los de código, el enlace al PR de specs.

## Pendientes fuera de las features

- `academico/materias.md` pide de 4 a 8 features en el MVP y hay 15: decisión del usuario.
- De F05 no se probó a mano el arrastre real del editor (V20, V26 y V34) ni un lector de pantalla
  (V37). De F05 y F06, varios criterios de móvil se vieron en Expo web, no en un teléfono.
- `pendientes.md` ya estaba resuelto. Si está en la Mac, falta que él confirme si se borra.
- Mover `correr` a este repo es opcional.
- Visto al validar F12 en el iPhone: el título de una lección completada se partía a media palabra
  en el detalle del curso. Arreglado en el PR de F04 (ver "Dónde vamos").
- Al validar F11 se vieron dos cosas que no son de F11, para que él decida si se atienden: en la
  web, al desplazar una lección larga, la X y la barra de progreso quedan encima del contenido; y
  en "Funciones" la mezcla salió en el mismo orden 4 de 6 veces (el algoritmo, Fisher-Yates, está
  bien).
