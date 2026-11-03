# Guía de validación: F04 Registrar y consultar el progreso

Cómo levantar los tres repos y comprobar a mano cada criterio de aceptación de
[spec.md](./spec.md). La feature está terminada cuando todos están marcados
(principio VIII). Rutas y respuestas en [contracts/api.md](./contracts/api.md).

## 1. Preparar

Requisitos: los de F01 a F03 (Node 24, PostgreSQL, Expo Go para el SDK 58).
Cada repo en su rama `feature/F04-registrar-progreso`.

```bash
# brote_specs: copiar el contrato 0.5.0 y comprobar las copias
npm run contrato:copiar && npm run contrato:revisar

# brote_backend_express
npm install
npm run bd:migrar          # tabla progreso
                           # si el usuario no puede crear bases: npx prisma migrate deploy
npm run bd:generar         # Prisma 7 no regenera el cliente al migrar
npm run bd:sembrar         # cuentas y cursos de prueba; borra el progreso de esos cursos
npm run dev                # API en http://localhost:3000

# brote_web_react
npm run dev                # http://localhost:5173

# brote_mobile_expo
npx expo start             # abrir con Expo Go
```

### 1.1 Datos de prueba

`npm run bd:sembrar` deja el estado de F03, sin progreso (research.md,
punto 11):

- **Cuenta A**: `autor@brote.test`. **Cuenta B**: `autor2@brote.test`.
  Contraseña de las dos: `brote12345`.
- Los cuatro cursos del prototipo publicados, con sus actividades de F03.

Lecciones que usan los criterios:

| Curso, lección | Preguntas | Para qué |
|---|---|---|
| Git esencial (6 lecciones), 1. ¿Qué es el control de versiones? | 2 (opción múltiple) | Registrar, de la cuenta y no del dispositivo |
| Git esencial, 2. Tu primer commit | 0 (solo teoría) | Lección sin resultado |
| Git esencial, 3. Viajar en el tiempo: historial y diffs | 2 | Salir a mitad; Continuar salta a la 2 |
| Programación en C sencilla (4 lecciones), 1. Primeros pasos | 3 (opción múltiple, espacio y abierta) | Repetir con resultados distintos |
| Japonés sencillo (4 lecciones), 1. Hiragana: las vocales | 1 | Orden de "Mis cursos" |
| Examen unidad 1 | — | Curso terminado (atajo P1) |

Cómo sacar cada resultado en "Primeros pasos": la opción múltiple se acierta
con `int x;`; el espacio, con `int`; la pregunta abierta, con "La tuve bien".
Para "Acertaste 1 de 3": `int x;`, `float` y "No la tuve".

### 1.2 Atajos

`bd`, `idCurso` e `idLeccion` son los de F03:

```bash
bd() { psql -X -q postgresql://brote:brote@localhost:5432/brote; }
idCurso() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT id FROM curso WHERE titulo = '$1';"; }
idLeccion() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT l.id FROM leccion l JOIN curso c ON c.id = l.id_curso WHERE c.titulo = '$1' AND l.posicion = $2;"; }
```

```bash
# P1. La cuenta A completa todas las lecciones de "Examen unidad 1", acertando todo
bd <<'SQL'
INSERT INTO progreso (id_usuario, id_leccion, aciertos, preguntas)
SELECT u.id, l.id, q.n, q.n
FROM leccion l
JOIN curso c ON c.id = l.id_curso
JOIN "user" u ON u.email = 'autor@brote.test'
CROSS JOIN LATERAL (
  SELECT count(*)::int AS n FROM jsonb_array_elements(l.actividades) a
  WHERE a->>'tipo' IN ('opcionMultiple', 'completarEspacios', 'preguntaAbierta')
) q
WHERE c.titulo = 'Examen unidad 1'
ON CONFLICT (id_usuario, id_leccion) DO NOTHING;
SQL

# P2. El progreso de una cuenta, por curso y lección
bd <<'SQL'
SELECT u.email, c.titulo, l.posicion, p.aciertos, p.preguntas, p.completada_en
FROM progreso p
JOIN "user" u ON u.id = p.id_usuario
JOIN leccion l ON l.id = p.id_leccion
JOIN curso c ON c.id = l.id_curso
ORDER BY u.email, p.completada_en DESC;
SQL

# P3. Retirar y volver a publicar "Git esencial"
bd <<< "UPDATE curso SET publicado = false WHERE titulo = 'Git esencial';"
bd <<< "UPDATE curso SET publicado = true  WHERE titulo = 'Git esencial';"
```

Para ver "Guardando tu progreso…" sin que pase volando: pausa el backend con
`kill -STOP <pid>` del `npm run dev` justo antes del último "Continuar", y
luego `kill -CONT <pid>`. Para expirar la sesión: `./expirar` desde
`brote_specs`. Lector de pantalla: VoiceOver (macOS / iOS), NVDA (Windows) o
TalkBack (Android).

## 2. Backend con curl

Corre estas primero: comprueban la autoridad del servidor sin ningún cliente.

```bash
API=http://localhost:3000
J='Content-Type: application/json'
GIT=$(idCurso 'Git esencial'); GIT1=$(idLeccion 'Git esencial' 1); GIT2=$(idLeccion 'Git esencial' 2)
C=$(idCurso 'Programación en C sencilla'); C1=$(idLeccion 'Programación en C sencilla' 1)
BOR=$(idCurso 'Curso en borrador'); BOR1=$(idLeccion 'Curso en borrador' 1)
PROG=$API/cursos/$GIT/lecciones/$GIT1/progreso

# B1. Sin sesión → 401, en las tres rutas
curl -s -w ' %{http_code}\n' -X PUT $PROG -H "$J" -d '{"aciertos":2,"preguntas":2}'
curl -s -w ' %{http_code}\n' $API/usuarios/yo/cursos-empezados
curl -s -w ' %{http_code}\n' $API/cursos/$GIT
# {"error":"Tu sesión terminó. Vuelve a entrar."} 401  (las tres)

# Entrar con las dos cuentas
curl -s -o /dev/null -c a.txt -X POST $API/sesiones -H "$J" -d '{"correo":"autor@brote.test","contrasena":"brote12345"}'
curl -s -o /dev/null -c b.txt -X POST $API/sesiones -H "$J" -d '{"correo":"autor2@brote.test","contrasena":"brote12345"}'

# B2. Registrar y repetir: 200, y la segunda vez reemplaza
curl -s -w ' %{http_code}\n' -b a.txt -X PUT $PROG -H "$J" -d '{"aciertos":1,"preguntas":2}'
curl -s -w ' %{http_code}\n' -b a.txt -X PUT $PROG -H "$J" -d '{"aciertos":2,"preguntas":2}'
# {"progreso":{"aciertos":1,"preguntas":2,"completadaEn":"…"}} 200
# {"progreso":{"aciertos":2,"preguntas":2,"completadaEn":"…(más tarde)"}} 200
curl -s -w ' %{http_code}\n' -b a.txt -X PUT $API/cursos/$GIT/lecciones/$GIT2/progreso -H "$J" -d '{"aciertos":0,"preguntas":0}'
# {"progreso":{"aciertos":0,"preguntas":0,…}} 200   (lección sin preguntas)
# P2: una fila por lección de la cuenta A, la 1 con 2 de 2

# B3. Curso sin publicar, lección inexistente y lección de otro curso → el mismo 404
curl -s -w ' %{http_code}\n' -b a.txt -X PUT $API/cursos/$BOR/lecciones/$BOR1/progreso -H "$J" -d '{"aciertos":0,"preguntas":0}'
curl -s -w ' %{http_code}\n' -b a.txt -X PUT $API/cursos/$GIT/lecciones/no-existe/progreso -H "$J" -d '{"aciertos":0,"preguntas":0}'
curl -s -w ' %{http_code}\n' -b a.txt -X PUT $API/cursos/$GIT/lecciones/$C1/progreso -H "$J" -d '{"aciertos":0,"preguntas":3}'
# las tres: {"error":"Esta lección no existe o ya no está disponible."} 404

# B4. Resultados que no cuadran → 400, y el progreso no cambia
for cuerpo in '{"aciertos":3,"preguntas":2}' '{"aciertos":1,"preguntas":5}' '{"aciertos":-1,"preguntas":2}' \
              '{"aciertos":1.5,"preguntas":2}' '{"aciertos":"2","preguntas":2}' '{"aciertos":2}' \
              '{"aciertos":2,"preguntas":2,"extra":1}' '[]'; do
  curl -s -w ' %{http_code}\n' -b a.txt -X PUT $PROG -H "$J" -d "$cuerpo"
done
# todas: {"error":"El resultado no corresponde a la lección."} 400
# P2: la lección 1 de la cuenta A sigue en 2 de 2, con la misma completada_en de B2

# B5. Cada cuenta ve solo lo suyo
curl -s -b a.txt $API/cursos/$GIT | python3 -c "
import json,sys; c=json.load(sys.stdin)['curso']; print([(l['posicion'], l['progreso'] and (l['progreso']['aciertos'], l['progreso']['preguntas'])) for l in c['lecciones']])"
# [(1, (2, 2)), (2, (0, 0)), (3, None), (4, None), (5, None), (6, None)]
curl -s -b b.txt $API/cursos/$GIT | python3 -c "
import json,sys; c=json.load(sys.stdin)['curso']; print([l['progreso'] for l in c['lecciones']])"
# [None, None, None, None, None, None]
curl -s -b b.txt $API/usuarios/yo/cursos-empezados
# {"cursos":[]}

# B6. Cursos empezados, del más reciente al más antiguo
curl -s -o /dev/null -b a.txt -X PUT $API/cursos/$C/lecciones/$C1/progreso -H "$J" -d '{"aciertos":3,"preguntas":3}'
curl -s -b a.txt $API/usuarios/yo/cursos-empezados | python3 -c "
import json,sys; print([(c['titulo'], c['leccionesCompletadas'], c['cantidadLecciones']) for c in json.load(sys.stdin)['cursos']])"
# [('Programación en C sencilla', 1, 4), ('Git esencial', 2, 6)]

# B7. Un curso retirado no aparece, y su progreso vuelve al publicarlo (P3)
bd <<< "UPDATE curso SET publicado = false WHERE titulo = 'Git esencial';"
curl -s -b a.txt $API/usuarios/yo/cursos-empezados   # solo "Programación en C sencilla"
bd <<< "UPDATE curso SET publicado = true WHERE titulo = 'Git esencial';"
curl -s -b a.txt $API/usuarios/yo/cursos-empezados   # otra vez los dos, Git con 2 de 6
```

Al terminar la sección: `npm run bd:sembrar` para volver al estado inicial.

## 3. Criterios de la spec

Empieza cada grupo en el estado inicial (`npm run bd:sembrar`) con la cuenta
A, salvo que diga otra cosa. Dentro de un grupo, los criterios van en orden
y cada uno sigue donde quedó el anterior.

### Registrar

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Guardando y guardado | Abre Git esencial, 1 y recórrela acertando las dos preguntas. Antes del último "Continuar", pausa el backend; pulsa "Continuar"; reanuda el backend | "¡Lección completada!" y "Acertaste 2 de 2". Con el backend pausado: "Guardando tu progreso…" con indicador, "Volver al curso" deshabilitado con indicador y la X deshabilitada. Al reanudar: "Progreso guardado" y "Volver al curso" habilitado |
| [web, móvil] Volver al detalle | Pulsa "Volver al curso" | Sin recargar a mano: "1 de 6 lecciones", la barra con una sexta parte llena, la lección 1 con la marca de completada y "2 de 2 aciertos", y el botón "Continuar: 2. Tu primer commit" |
| [web, móvil] Lección sin preguntas | Termina Git esencial, 2 y vuelve al curso | La lección 2 marcada, sin "aciertos". "2 de 6 lecciones" |
| [web, móvil] Salir a mitad | Abre Git esencial, 3; pasa de la primera actividad; X y "Salir" | El detalle sigue en "2 de 6 lecciones" y la lección 3 sin marca. P2: no hay fila de la lección 3 |
| [web] Recargar a mitad | Abre Git esencial, 3; avanza dos actividades; recarga la página; vuelve al detalle | La lección 3 sigue sin marca |
| [móvil] Cerrar la app a mitad | Abre Git esencial, 3; avanza dos actividades; cierra la app desde el selector de apps; ábrela y ve al detalle | La lección 3 sigue sin marca |

### De la cuenta, no del dispositivo

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] De un cliente al otro | En la web, termina Git esencial, 1 acertando las dos. En el móvil, con la cuenta A, abre Git esencial. Luego, en el móvil, termina Japonés sencillo, 1 y abre Japonés sencillo en la web | En el móvil: la lección 1 completada con "2 de 2 aciertos". En la web: Japonés sencillo con la lección 1 completada y su resultado |
| [web, móvil] Otra cuenta | En cada cliente: cierra sesión, entra con la cuenta B y abre Git esencial. Cierra sesión y entra con la cuenta A | Con B: ninguna lección marcada y "0 de 6 lecciones". Con A: su progreso sigue igual |
| [backend] Sin sesión y ajeno | Sección 2, B1 y B5 | Sin sesión: 401. La cuenta B no ve nada de la A |

### Repetir

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Gana el último | En Programación en C sencilla, termina "Primeros pasos" con "Acertaste 1 de 3" y vuelve al curso. Repítela con "Acertaste 3 de 3" y vuelve. Repítela con "Acertaste 2 de 3" y vuelve | Después de cada vuelta: "1 de 3 aciertos", "3 de 3 aciertos" y "2 de 3 aciertos". El avance: "1 de 4 lecciones" desde el primer intento, sin cambiar después |
| [web, móvil] Repetir empieza de cero | Abre "Primeros pasos" otra vez. Responde la opción múltiple, X y "Salir" | Empieza en la primera actividad, sin respuestas. Al salir, sigue "2 de 3 aciertos" |

### Detalle del curso

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Empezar | Abre Japonés sencillo (sin progreso); pulsa el botón | "0 de 4 lecciones", la barra vacía y "Empezar: 1. Hiragana: las vocales", que abre esa lección |
| [web, móvil] Continuar salta huecos | En Git esencial termina la 1 y la 3 (no la 2) | "Continuar: 2. Tu primer commit"; al pulsarlo se abre esa lección |
| [web, móvil] Curso terminado | Corre P1. Abre Examen unidad 1; pulsa una de sus lecciones | "{total} de {total} lecciones", la barra llena, "Curso terminado", ningún botón Empezar ni Continuar, todas marcadas. La lección se abre desde la lista |
| [web, móvil] Sin "0 de" falso | Con progreso en Git esencial, pausa el backend y abre el detalle; reanuda | Mientras carga, solo el indicador; después aparece directo el avance real, sin pasar por "0 de 6" |
| [web, móvil] Lector de pantalla | Con el lector activo, recorre el detalle de Git esencial con la lección 1 completada | La barra se anuncia como "1 de 6 lecciones completadas"; la lección 1, como "1. ¿Qué es el control de versiones?, completada, 2 de 2 aciertos" |

### Mis cursos (móvil)

| Criterio | Pasos | Esperado |
|---|---|---|
| [móvil] Pestañas | Mira la barra de pestañas | "Explorar", "Mis cursos" y "Cuenta", en ese orden |
| [móvil] Vacío | Con la cuenta B, abre "Mis cursos"; pulsa "Explorar cursos" | "Todavía no empiezas ningún curso.", "Cuando completes tu primera lección, aquí verás tu avance." y "Explorar cursos", que lleva a la pestaña "Explorar" |
| [móvil] Orden y avance | Con la cuenta A, termina Git esencial, 1 y luego Japonés sencillo, 1. Abre "Mis cursos" | Primero "Japonés sencillo" ("1 de 4 lecciones" y su barra), después "Git esencial" ("1 de 6 lecciones"). No aparecen los otros cursos |
| [móvil] Sube al primer lugar | Desde "Mis cursos", abre Git esencial y termina la 2; vuelve a "Mis cursos" con el botón de volver | "Git esencial" primero, con "2 de 6 lecciones", sin deslizar para recargar |
| [móvil] Abrir y volver | Pulsa "Japonés sencillo"; vuelve | Su detalle encima de las pestañas; volver regresa a "Mis cursos" |
| [móvil] Curso terminado | Corre P1 y vuelve a la pestaña "Mis cursos" | "Examen unidad 1" primero, con "Curso terminado" |
| [móvil] Deslizar para recargar | Con "Mis cursos" abierta en el móvil, termina en la web una lección de Programación en C sencilla. En el móvil, desliza hacia abajo | Aparece "Programación en C sencilla" arriba, con "1 de 4 lecciones" |

### Mi panel (web)

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Enlace y página | Mira el encabezado en el catálogo, en un detalle y en una página inexistente; pulsa "Mi panel" | El enlace está en las tres. Lleva a `/panel`: "Mi panel" y la sección "Sigue aprendiendo" |
| [web] Vacío | Con la cuenta B, abre "Mi panel"; pulsa "Explorar cursos" | "Todavía no empiezas ningún curso." y "Explorar cursos", que lleva al catálogo |
| [web] Igual que el móvil | Con la cuenta A y el progreso del grupo anterior, compara "Mi panel" con "Mis cursos" del móvil. Pulsa un curso; luego "Cursos" | Mismos cursos, orden y avance. El curso lleva a su detalle, y "Cursos" regresa a "Mi panel" |

### Errores y estados

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Error al guardar y Reintentar | Abre Git esencial, 1; antes del último "Continuar", apaga el backend; pulsa "Continuar". Enciéndelo y pulsa "Reintentar" | "No se pudo guardar tu progreso." con "Reintentar", y el resultado sigue en pantalla. Después: "Progreso guardado"; en el detalle, la lección marcada |
| [web, móvil] Irse sin guardar | Repite con Git esencial, 2 (sin progreso), pero con el backend apagado pulsa "Volver al curso"; enciende el backend y recarga el detalle (en el móvil, desliza hacia abajo) | Se puede salir; la lección 2 no está marcada |
| [móvil] Sin conexión al guardar | Antes del último "Continuar" de una lección, activa el modo avión; pulsa "Continuar". Quita el modo avión y pulsa "Reintentar" | "Sin conexión. Tu progreso no se guardó." con "Reintentar"; después, "Progreso guardado" |
| [web, móvil] Curso retirado a mitad | Abre Git esencial, 3; en medio, corre la primera línea de P3; termina la lección. Ve a "Mis cursos" / "Mi panel". Corre la segunda línea de P3 y recarga | "Esta lección ya no está disponible. Tu progreso no se guardó." sin "Reintentar". Git esencial no aparece en la lista; al volver a publicarlo, reaparece con lo que tenía |
| [web, móvil] Lista con el servidor apagado | Apaga el backend; abre "Mis cursos" (móvil) o "Mi panel" (web). Enciéndelo y pulsa "Reintentar" | "No se pudo conectar con Brote. Inténtalo de nuevo en un momento." y "Reintentar"; después, la lista |
| [móvil] Lista sin conexión | Modo avión; abre "Mis cursos" (si ya estaba cargada, desliza hacia abajo) | "Sin conexión. Revisa tu conexión e inténtalo de nuevo." con "Reintentar" (con cursos en pantalla, se quedan y el mensaje aparece encima) |
| [móvil] Recarga fallida al volver | Desde el estado inicial, termina Git esencial, 1 hasta ver "Progreso guardado"; activa el modo avión y pulsa "Volver al curso". Quita el modo avión y pulsa "Reintentar" | El detalle sigue en pantalla, con el avance de antes, y encima "Sin conexión. Revisa tu conexión e inténtalo de nuevo." con "Reintentar". Después: "1 de 6 lecciones" y la lección 1 marcada |
| [web, móvil] Sesión expirada | Corre `./expirar`; abre "Mis cursos" o "Mi panel" | "Entrar" con "Tu sesión terminó. Vuelve a entrar." |
| [web, móvil] Sesión expirada al guardar | Abre una lección sin completar (por ejemplo, Japonés sencillo, 1); antes del último "Continuar", corre `./expirar`; pulsa "Continuar". Entra otra vez y abre el curso | "Entrar" con "Tu sesión terminó. Vuelve a entrar.". Después, la lección sin marca; P2 no tiene fila de esa lección |
| [backend] Autoridad al registrar | Sección 2, B3 y B4 | Curso en borrador, lección inexistente y de otro curso: el mismo 404. Resultados incoherentes: 400 y P2 no cambia |

## 4. Antes del PR

- `npm run tipos` y `npm run lint` en los tres repos de código.
- `npm run contrato:revisar` en `brote_specs`.
- `npm run bd:sembrar` deja la base como al principio, sin progreso en los
  cursos de prueba.
- Repite de F03 "Volver y empezar de nuevo" y "Con algo hecho" (salir): la
  pantalla final y la confirmación de salida siguen funcionando.
- Repite de F02 "Volver con lo cargado": volver de un detalle al catálogo
  sigue conservando la búsqueda y la posición.
- Marca los criterios en `spec.md` y enlista en cada PR los que cubre.
