# Guía de validación: F06 Enviar un curso a revisión y publicarlo

Cómo levantar los repos y comprobar a mano cada criterio de aceptación de
[spec.md](./spec.md). La feature está terminada cuando todos están marcados (principio
VIII). Rutas y respuestas en [contracts/api.md](./contracts/api.md).

## 1. Preparar

Requisitos: los de F01 a F05 (Node 24, PostgreSQL, Expo Go para el SDK 58). Cada repo en
su rama `feature/F06-publicar-curso`. El móvil solo hace falta para los criterios
marcados `[web, móvil]`.

```bash
# brote_specs: copiar el contrato 0.7.0 y comprobar las copias
npm run contrato:copiar && npm run contrato:revisar

# brote_backend_express
npm install
npm run bd:migrar          # columnas, CHECK y trigger de curso
                           # si el usuario no puede crear bases: npx prisma migrate deploy
npm run bd:generar         # Prisma 7 no regenera el cliente al migrar
npm run bd:sembrar         # cuentas y cursos de prueba
npm run dev                # API en http://localhost:3000

# brote_web_react
npm run dev                # http://localhost:5173

# brote_mobile_expo
npx expo start             # abrir con Expo Go
```

### 1.1 Datos de prueba

`npm run bd:sembrar` deja (research.md, punto 12), todas con la contraseña `brote12345`:

| Cuenta | Correo | Para qué |
|---|---|---|
| Cuenta autor | `autor@brote.test` | Dueña de los cursos de abajo |
| Cuenta B | `creador2@brote.test` | Sin cursos: la que no debe ver nada ajeno |
| Alumno | `creador@brote.test` | Con progreso en "Git esencial" (atajo P1) |

Cursos de la cuenta autor que usan los criterios:

| Curso | Estado | Para qué |
|---|---|---|
| Git esencial | Publicado, 6 lecciones | Publicado y retirar del catálogo |
| Curso en revisión | En revisión, 1 lección con actividades | Retirar, aprobar y rechazar |
| Curso listo para enviar | Borrador completo | Enviar |
| Curso en borrador | Borrador, 1 lección vacía | Una lección vacía |
| ¿Cómo se dice hola? | Borrador, 2 lecciones vacías | Dos lecciones vacías |
| Sin lecciones todavía | Borrador, sin lecciones | Sin lecciones |

Muchos criterios cambian el estado de estos cursos. `npm run bd:sembrar` los regresa al
principio, pero borra el progreso: repite el atajo P1 después.

### 1.2 Atajos

```bash
bd() { psql -X -q postgresql://brote:brote@localhost:5432/brote; }
idCurso() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT id FROM curso WHERE titulo = '$1';"; }
idLeccion() { psql -X -q -t -A postgresql://brote:brote@localhost:5432/brote <<< "SELECT l.id FROM leccion l JOIN curso c ON c.id = l.id_curso WHERE c.titulo = '$1' AND l.posicion = $2;"; }

# Lo que hace un administrador (decisión 0014). rechazar recibe el motivo como SQL,
# para poder escribir saltos de línea; sin motivo, queda NULL.
aprobar()  { bd <<< "UPDATE curso SET publicado = true  WHERE titulo = '$1';"; }
retirar()  { bd <<< "UPDATE curso SET publicado = false WHERE titulo = '$1';"; }
rechazar() { bd <<< "UPDATE curso SET revision = 'rechazada', motivo_rechazo = ${2:-NULL} WHERE titulo = '$1' AND revision = 'pendiente';"; }

# El estado guardado de un curso
estadoCurso() { bd <<< "SELECT publicado, revision, motivo_rechazo FROM curso WHERE titulo = '$1';"; }
```

```bash
# P1. El alumno completa las dos primeras lecciones de "Git esencial"
bd <<'SQL'
INSERT INTO progreso (id_usuario, id_leccion, aciertos, preguntas, completada_en)
SELECT u.id, l.id, q.n, q.n, now() AT TIME ZONE 'UTC'
FROM leccion l
JOIN curso c ON c.id = l.id_curso
JOIN "user" u ON u.email = 'creador@brote.test'
CROSS JOIN LATERAL (
  SELECT count(*)::int AS n FROM jsonb_array_elements(l.actividades) a
  WHERE a->>'tipo' IN ('opcionMultiple', 'completarEspacios', 'preguntaAbierta')
) q
WHERE c.titulo = 'Git esencial' AND l.posicion <= 2
ON CONFLICT (id_usuario, id_leccion) DO NOTHING;
SQL
```

Para ver un estado de carga sin que pase volando: pausa el backend con `kill -STOP <pid>`
del `npm run dev`, y luego `kill -CONT <pid>`. Para expirar la sesión: `./expirar` desde
`brote_specs`. "Apagar el backend" es detener su `npm run dev`.

## 2. Backend

Corre estas primero: comprueban la autoridad del servidor sin ningún cliente. Empieza con
`npm run bd:sembrar`.

```bash
API=http://localhost:3000
J='Content-Type: application/json'
entrar() { curl -s -o /dev/null -c "$2" -X POST $API/sesiones -H "$J" -d "{\"correo\":\"$1\",\"contrasena\":\"brote12345\"}"; }
entrar autor@brote.test autor.txt
entrar creador2@brote.test b.txt
LISTO=$(idCurso 'Curso listo para enviar'); REV=$(idCurso 'Curso en revisión'); GIT=$(idCurso 'Git esencial')
VACIA=$(idCurso 'Curso en borrador'); DOS=$(idCurso '¿Cómo se dice hola?'); SIN=$(idCurso 'Sin lecciones todavía')
REV1=$(idLeccion 'Curso en revisión' 1)
pedir() { curl -s -w ' %{http_code}\n' -b autor.txt "$@"; }

# B1. Sin sesión → 401
curl -s -w ' %{http_code}\n' -X POST $API/editor/cursos/$LISTO/revision
curl -s -w ' %{http_code}\n' -X DELETE $API/editor/cursos/$REV/revision
curl -s -w ' %{http_code}\n' -X DELETE $API/editor/cursos/$GIT/publicacion
# las tres: {"error":"Tu sesión terminó. Vuelve a entrar."} 401

# B2. Un curso ajeno responde igual que uno que no existe
curl -s -w ' %{http_code}\n' -b b.txt -X POST $API/editor/cursos/$LISTO/revision
curl -s -w ' %{http_code}\n' -b b.txt -X POST $API/editor/cursos/inventado/revision
curl -s -w ' %{http_code}\n' -b b.txt -X DELETE $API/editor/cursos/$REV/revision
curl -s -w ' %{http_code}\n' -b b.txt -X DELETE $API/editor/cursos/$GIT/publicacion
# las cuatro: {"error":"Este curso ya no existe."} 404

# B3. Contenido mínimo
pedir -X POST $API/editor/cursos/$SIN/revision
# {"error":"No se envió: el curso no tiene lecciones."} 400
pedir -X POST $API/editor/cursos/$VACIA/revision
# {"error":"No se envió: hay 1 lección sin actividades."} 400
pedir -X POST $API/editor/cursos/$DOS/revision
# {"error":"No se envió: hay 2 lecciones sin actividades."} 400
estadoCurso 'Curso en borrador'
# f | (vacío) | (vacío)

# B4. Estado de partida: nada cambia
pedir -X POST $API/editor/cursos/$REV/revision
pedir -X POST $API/editor/cursos/$GIT/revision
pedir -X DELETE $API/editor/cursos/$LISTO/revision
pedir -X DELETE $API/editor/cursos/$LISTO/publicacion
# las cuatro: {"error":"El estado de este curso cambió en otro lugar."} 409

# B5. Un curso en revisión no se escribe
pedir -X PUT $API/editor/cursos/$REV -H "$J" -d '{"titulo":"X","descripcion":"Y"}'
pedir -X POST $API/editor/cursos/$REV/lecciones -H "$J" -d '{"titulo":"Nueva"}'
pedir -X PUT $API/editor/cursos/$REV/lecciones-orden -H "$J" -d "{\"idsLecciones\":[\"$REV1\"]}"
pedir -X PUT $API/editor/cursos/$REV/lecciones/$REV1 -H "$J" -d '{"titulo":"X","version":1,"actividades":[]}'
pedir -X DELETE $API/editor/cursos/$REV/lecciones/$REV1
pedir -X DELETE $API/editor/cursos/$REV
# las seis: {"error":"Este curso está en revisión y no se puede editar. Tus cambios no se guardaron."} 403
pedir $API/editor/cursos/$REV/lecciones/$REV1
# {"error":"Este curso está en revisión y no se puede editar."} 403
pedir $API/editor/cursos/$REV
# {"curso":{…,"estado":"enRevision","revisionRechazada":false,"motivoRechazo":null,…}} 200

# B6. Enviar, aprobar y retirar: el trigger limpia la revisión
pedir -X POST $API/editor/cursos/$LISTO/revision
# {"curso":{…,"estado":"enRevision",…}} 200
aprobar 'Curso listo para enviar'; estadoCurso 'Curso listo para enviar'
# t | (vacío) | (vacío)
retirar 'Curso listo para enviar'; estadoCurso 'Curso listo para enviar'
# f | (vacío) | (vacío)   ← no vuelve a revisión
pedir $API/editor/cursos/$LISTO
# {"curso":{…,"estado":"borrador",…}} 200

# B7. La base rechaza lo que se escribe mal a mano
bd <<< "UPDATE curso SET revision = 'rechazado' WHERE titulo = 'Curso en revisión';"
bd <<< "UPDATE curso SET revision = 'rechazada' WHERE titulo = 'Git esencial';"
bd <<< "UPDATE curso SET motivo_rechazo = 'x' WHERE titulo = 'Curso en borrador';"
# las tres: ERROR: … violates check constraint "curso_revision_valida"
```

| Criterio | Comprobación |
|---|---|
| [backend] Sin sesión y curso de otra cuenta | B1 y B2 |
| [backend] Curso sin lecciones o con una vacía | B3 |
| [backend] Estado de partida | B4 |
| [backend] Curso en revisión no cambia | B5 |

## 3. Web y móvil

Empieza con `npm run bd:sembrar` y el atajo P1. Las secciones van en un orden pensado
para no volver a sembrar seguido; cuando un paso lo pide, siembra otra vez.

### Cursos que creé

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Estados en las tarjetas | Entra con la cuenta autor; abre "Mi panel" | "Curso en borrador": "Borrador" y "Editar". "Curso en revisión": "En revisión" y "Administrar". "Git esencial": "Publicado" y "Administrar" |
| [web] Las tarjetas abren el mapa | Pulsa cada una de esas tres | La dirección es `/editor/{id}` en las tres |
| [web] Enviar sube el curso | Anota el lugar de "Curso listo para enviar". Envíalo. Vuelve a "Mi panel" | Queda primero |

### Enviar a revisión

Si ya enviaste "Curso listo para enviar", retíralo de revisión antes de seguir.

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Pregunta y Cancelar | En el mapa de "Curso listo para enviar", pulsa "Enviar a revisión". Pulsa "Cancelar" | "¿Enviar a revisión?" con "Mientras esté en revisión no podrás editarlo. Un administrador lo revisará antes de publicarlo.". Sigue en borrador |
| [web] Sin lecciones | En "Sin lecciones todavía", pulsa "Enviar a revisión" | No pregunta nada. "No se envió: el curso no tiene lecciones." y sigue en borrador |
| [web] Lecciones vacías | En "¿Cómo se dice hola?", pulsa "Enviar a revisión". Repite en "Curso en borrador" | No pregunta nada. "No se envió: hay 2 lecciones sin actividades." y las dos marcadas con icono. Después, "No se envió: hay 1 lección sin actividades." |
| [web] Vaciada en otra pestaña | Crea en "Curso listo para enviar" una segunda lección con una tarjeta. Pulsa "Enviar a revisión" y deja la pregunta abierta. En otra pestaña, abre esa lección, elimina la tarjeta y guarda. Vuelve y confirma | "No se envió: hay 1 lección sin actividades.", la lección marcada y el curso en borrador. Después, elimina esa lección |
| [web] Cambios sin guardar | Cambia el título sin guardar. Guarda | "Enviar a revisión" deshabilitado, con "Guarda los cambios para poder enviarlo.". Al guardar, se habilita |
| [web] Enviado | Pulsa "Enviar a revisión" y confirma. Recarga. Cierra sesión y vuelve a entrar | "Curso enviado a revisión.", y el mapa dice "Este curso está en revisión y no se puede editar.", sin datos, sin lecciones y sin "Eliminar curso". Sigue así al recargar y al volver a entrar |
| [web] Mientras se envía | Retíralo de revisión. Pulsa "Enviar a revisión". Con la pregunta abierta, pausa el backend y confirma. Pulsa otra vez. Reanuda | "Enviar" con un indicador; pulsarlo no hace nada. Al reanudar, se envía una vez |
| [web] Servidor apagado | Retíralo. Con la pregunta abierta, apaga el backend y confirma. Enciéndelo y envíalo | "No se pudo enviar el curso a revisión." y sigue en borrador. Después, se envía |
| [web, móvil] Oculto en el catálogo | Con la cuenta autor, busca "Curso en revisión" en la web y en el móvil | No aparece |
| [web] Detalle oculto | Abre `/cursos/{id de Curso en revisión}` con la cuenta autor | "Este curso no existe o ya no está disponible." |

### Retirar de revisión

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Retirar | En el mapa de "Curso listo para enviar" (en revisión), pulsa "Retirar de revisión" | Sin preguntar, "El curso volvió a borrador.", y el mapa se puede editar |
| [web] Servidor apagado | Envíalo. Con su mapa abierto, apaga el backend y pulsa "Retirar de revisión". Enciéndelo | "No se pudo retirar el curso de revisión." y sigue en revisión |

### Aprobar

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Se ve publicado | `aprobar 'Curso en revisión'`. Recarga "Mi panel" y abre su mapa | "Publicado". El mapa dice "Este curso está publicado y no se puede editar.", con "Ver curso" y "Retirar del catálogo" |
| [web, móvil] Se cursa | Con el alumno, búscalo en el catálogo. Cursa su lección de principio a fin, en la web y en el móvil | Aparece. La lección se completa y el progreso queda guardado |
| [web] Ver curso | Con la cuenta autor, en su mapa pulsa "Ver curso". Vuelve | Abre el detalle, y volver regresa al mapa |

### Rechazar

Siembra otra vez (`npm run bd:sembrar` y P1).

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Con motivo | `rechazar 'Curso en revisión' "E'Falta teoría.\nRevisa la lección 1.'"`. Abre "Mi panel" y su mapa | "Borrador" con "Revisión no aprobada". El mapa muestra "La revisión no se aprobó.", el motivo en dos líneas y "Corrígelo y envíalo otra vez." |
| [web] Sin motivo | Envíalo otra vez. `rechazar 'Curso en revisión'`. Recarga | Lo mismo, sin motivo |
| [web] Motivo con etiquetas | Envíalo otra vez. `rechazar 'Curso en revisión' "'<b>hola</b> <script>alert(1)</script>'"`. Recarga | Se ve tal cual, sin negritas y sin ejecutar nada |
| [web] Corregir y reenviar | Cambia el título y guarda. Envíalo. Abre "Mi panel" | Se edita como un borrador. Al enviarlo, el aviso y "Revisión no aprobada" ya no están |

### Retirar del catálogo

Siembra otra vez (`npm run bd:sembrar` y P1).

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Pregunta y Cancelar | En el mapa de "Git esencial", pulsa "Retirar del catálogo". Pulsa "Cancelar" | "¿Retirar este curso del catálogo?" con "Los alumnos dejarán de verlo y no podrán cursarlo, pero conservarán su progreso. Para publicarlo otra vez tendrás que enviarlo a revisión.". Sigue publicado |
| [web] Servidor apagado | Pulsa "Retirar del catálogo". Con la pregunta abierta, apaga el backend y confirma. Enciéndelo | "No se pudo retirar el curso del catálogo." y sigue publicado |
| [web, móvil] Lección interrumpida | Con el alumno, abre una lección de "Git esencial" en la web y en el móvil. Con la cuenta autor, retíralo del catálogo. Termina las dos lecciones | Las dos veces, "Esta lección ya no está disponible. Tu progreso no se guardó." |
| [web] Retirado | Revisa el mapa después de retirarlo | "El curso se retiró del catálogo y volvió a borrador.", y se puede editar |
| [web, móvil] Fuera del catálogo | Con el alumno, búscalo en la web y en el móvil. Abre su dirección en la web. En el móvil, sal de la lección interrumpida al detalle, que se recarga | No aparece en el catálogo. Los dos detalles muestran "Este curso no existe o ya no está disponible." |
| [web, móvil] Fuera de lo empezado | Con el alumno, abre "Mi panel" y "Mis cursos" | "Git esencial" no está en "Sigue aprendiendo" ni en "Mis cursos" |
| [web, móvil] Vuelve con el progreso | Con la cuenta autor, agrega una lección con una tarjeta y envíalo. `aprobar 'Git esencial'`. Con el alumno, abre su detalle en la web y en el móvil | "2 de 7 lecciones", con las dos primeras completadas |

### Lienzo y cambios en otro lugar

Siembra otra vez (`npm run bd:sembrar`).

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Dirección del lienzo | Abre `/editor/{id}/lecciones/{id}` de "Curso en revisión" y de "Git esencial". Pulsa "Volver al curso" | "Este curso está en revisión y no se puede editar." y "Este curso está publicado y no se puede editar.". Abre el mapa |
| [web] Enviado en otra pestaña | Abre el lienzo de "Curso listo para enviar" y cambia algo. En otra pestaña, envía el curso. Guarda en la primera | "Este curso está en revisión y no se puede editar. Tus cambios no se guardaron." y lo escrito sigue ahí |
| [web] Publicado con el lienzo abierto | Sin salir, `aprobar 'Curso listo para enviar'`. Guarda | "Este curso está publicado y no se puede editar. Tus cambios no se guardaron." y lo escrito sigue ahí |
| [web] Aprobado con el mapa abierto | Abre el mapa de "Curso en revisión". `aprobar 'Curso en revisión'`. Pulsa "Retirar de revisión" | "El estado de este curso cambió en otro lugar." y el mapa muestra el curso publicado |
| [web] Dos pestañas | En "¿Cómo se dice hola?", agrega una tarjeta a cada lección. Abre su mapa en dos pestañas. Envíalo en la primera. Pulsa "Enviar a revisión" en la segunda | "El estado de este curso cambió en otro lugar." y el mapa muestra el curso en revisión |
| [web] Eliminado | Abre el mapa de "Curso en borrador" en dos pestañas. Elimínalo en la primera. Pulsa "Enviar a revisión" en la segunda | "Este curso ya no existe." |
| [web] Sesión al enviar | Siembra otra vez. En "Curso listo para enviar", pulsa "Nueva lección" y escribe un título. Pulsa "Enviar a revisión". Corre `./expirar` y confirma. Entra con la misma cuenta | "Entrar" con "Tu sesión terminó. Vuelve a entrar.". Al entrar, el mapa con el título escrito, y el curso en borrador |
| [web] Sesión al retirar | En "Curso en revisión", corre `./expirar` y pulsa "Retirar de revisión"; entra. En "Git esencial", abre la pregunta, corre `./expirar` y confirma; entra | "Entrar" con el aviso. Al entrar, el mapa, y el curso sigue como estaba |

### Permisos

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Cuenta B | Con la cuenta B, abre `/editor/{id de Curso en revisión}` | "Este curso no existe o ya no está disponible." e "Ir a Mi panel" |

## 4. Antes del PR

- `npm run tipos` y `npm run lint` en los tres repos de código.
- `npm run contrato:revisar` en `brote_specs`.
- `npm run bd:sembrar` deja la base como al principio.
- Repite de F02 el criterio "Borrador y revisión no aparecen": ahora "Curso en revisión"
  sí está en revisión (research de F02, punto 1).
- Repite de F05 "Datos del curso", "Guardar" y "Permisos" con un borrador: el mapa y el
  servicio cambiaron por dentro. Los textos de un curso publicado son los de F06.
- Marca los criterios en `spec.md` y enlista en cada PR los que cubre.
