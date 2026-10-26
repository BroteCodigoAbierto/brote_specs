# Guía de validación: F01 Crear cuenta e iniciar sesión

Cómo levantar los tres repos y comprobar a mano cada criterio de aceptación de
[spec.md](./spec.md). Una feature está terminada cuando todos están marcados
(principio VIII). Rutas y respuestas en [contracts/api.md](./contracts/api.md).

## 1. Preparar

Requisitos: Node 24, Podman (o Docker), Expo Go **para el SDK 58** en un
teléfono en la misma red que la computadora (el de la tienda solo abre un SDK;
si dice que el proyecto es de otra versión, actualízalo desde expo.dev/go). Cada repo en su rama `feature/F01-crear-cuenta`.

```bash
# brote_specs: copiar el contrato 0.2.0 y comprobar las copias
npm run contrato:copiar && npm run contrato:revisar

# brote_backend_express
npm install
cp .env.example .env               # y llena SECRETO_AUTH: openssl rand -base64 32
podman compose up -d               # PostgreSQL en :5432 (o tu PostgreSQL con el usuario y la base brote)
npm run bd:migrar                  # aplica la migración de F01 (tablas user, session, account, verification)
                                   # si el usuario no puede crear bases: npx prisma migrate deploy && npm run bd:generar
npm run dev                        # API en http://localhost:3000

# brote_web_react
npm install && cp .env.example .env && npm run dev     # http://localhost:5173

# brote_mobile_expo
npm install
cp .env.example .env               # EXPO_PUBLIC_URL_API=http://<IP-de-tu-computadora>:3000
npx expo start                     # abrir con Expo Go
```

Atajos que se usan abajo. `bd` lee el SQL de la entrada estándar, así que las
comillas simples del SQL no chocan con las de bash:

```bash
# con psql instalado (sirve con el contenedor o con un PostgreSQL propio)
bd() { psql -X -q postgresql://brote:brote@localhost:5432/brote; }
# o, sin psql, dentro del contenedor (desde brote_backend_express)
# bd() { podman compose exec -T postgres psql -X -q -U brote -d brote; }

bd <<< 'SELECT id, name, email, "createdAt" FROM "user";'
bd <<< 'SELECT "userId", "expiresAt", "userAgent" FROM session;'

# vaciar todo entre pruebas, si hace falta
bd <<< 'TRUNCATE "user" CASCADE;'
```

Las fechas de Prisma se guardan en UTC en columnas sin zona horaria: compáralas
con `now() AT TIME ZONE 'UTC'`, no con `now()`. Consultas con nombre que se
usan en las tablas de la sección 3:

```bash
# S1. Expirar todas las sesiones
bd <<'SQL'
UPDATE session SET "expiresAt" = (now() AT TIME ZONE 'UTC') - interval '1 minute';
SQL

# S2. Simular que la última renovación fue hace dos días
bd <<'SQL'
UPDATE session SET "expiresAt" = (now() AT TIME ZONE 'UTC') + interval '28 days';
SQL

# S3. Cuánto le falta a la sesión más reciente (~30 días al entrar)
bd <<'SQL'
SELECT "expiresAt" - (now() AT TIME ZONE 'UTC') AS falta FROM session ORDER BY "createdAt" DESC LIMIT 1;
SQL

# S4. Cuentas con un correo (cambia el correo)
bd <<'SQL'
SELECT count(*) FROM "user" WHERE email = 'ana@correo.com';
SQL
```

Datos de prueba:

| Qué | Valor |
|---|---|
| Nombre de 50 | `Nombre de prueba con cincuenta caracteres exactos!` |
| Nombre de 51 | `Nombre de prueba con cincuenta y un caracteres ok!!` |
| Contraseña de 7 / 8 | `abcdefg` / `abcdefgh` |
| Contraseña de 129 | salida de `python3 -c "print('a'*129)"` |

## 2. Backend con curl

Corre estas primero: comprueban la autoridad del servidor sin ningún cliente.

```bash
API=http://localhost:3000
J='Content-Type: application/json'

# B1. Todo vacío → 400 con los tres campos
curl -s -X POST $API/cuentas -H "$J" -d '{"nombre":"   ","correo":"","contrasena":""}'
# {"error":"Revisa los datos marcados.","campos":{"nombre":"Escribe tu nombre.","correo":"Escribe tu correo.","contrasena":"Escribe una contraseña."}}

# B2. Correo inválido y contraseña de 7 → 400
curl -s -X POST $API/cuentas -H "$J" -d '{"nombre":"Ana","correo":"ana@correo","contrasena":"abcdefg"}'
# campos.correo = "Escribe un correo válido.", campos.contrasena = "La contraseña debe tener al menos 8 caracteres."
bd <<< 'SELECT count(*) FROM "user";'      # sigue en 0

# B3. Crear cuenta → 201 + Set-Cookie (web)
curl -i -X POST $API/cuentas -H "$J" -d '{"nombre":"  Ana López ","correo":" Ana@Correo.com","contrasena":"abcdefgh"}'
bd <<< 'SELECT name, email FROM "user";'   # "Ana López" | "ana@correo.com" (sin espacios, minúsculas)
bd <<< 'SELECT "providerId", password FROM account;'   # credential | hash (no "abcdefgh")

# B4. Mismo correo con otra forma → 409
curl -s -X POST $API/cuentas -H "$J" -d '{"nombre":"Otra","correo":" ANA@correo.com ","contrasena":"abcdefgh"}'
# {"error":"Ya existe una cuenta con ese correo.","campos":{"correo":"Ya existe una cuenta con ese correo."}}

# B5. Entrar: correo inexistente y contraseña mala → mismo 401 y mismo cuerpo
curl -s -w ' %{http_code}\n' -X POST $API/sesiones -H "$J" -d '{"correo":"nadie@correo.com","contrasena":"abcdefgh"}'
curl -s -w ' %{http_code}\n' -X POST $API/sesiones -H "$J" -d '{"correo":"ana@correo.com","contrasena":"otraclave"}'
# los dos: {"error":"Correo o contraseña incorrectos."} 401

# B6. Entrar como móvil → set-auth-token y sin Set-Cookie
curl -i -X POST $API/sesiones -H "$J" -H 'X-Cliente: movil' -d '{"correo":"ana@correo.com","contrasena":"abcdefgh"}'
TOKEN=<valor de set-auth-token>
curl -s $API/usuarios/yo -H 'X-Cliente: movil' -H "Authorization: Bearer $TOKEN"   # 200 {"usuario":{...}}

# B7. Sin sesión → 401
curl -s -w ' %{http_code}\n' $API/usuarios/yo          # {"error":"Tu sesión terminó. Vuelve a entrar."} 401

# B8. Cerrar sesión del móvil → 204; el token ya no sirve
curl -s -w '%{http_code}\n' -X DELETE $API/sesiones/actual -H 'X-Cliente: movil' -H "Authorization: Bearer $TOKEN"   # 204
curl -s -w ' %{http_code}\n' $API/usuarios/yo -H 'X-Cliente: movil' -H "Authorization: Bearer $TOKEN"              # 401

# B9. Duración: al entrar, expiresAt ≈ ahora + 30 días → corre S3: ~30 days
```

## 3. Criterios de la spec

Para la web usa una ventana privada para empezar sin sesión. En el móvil,
para empezar sin sesión, cierra sesión o borra los datos de Expo Go.

### Acceso sin sesión

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Sin sesión, cualquier dirección lleva a "Entrar" | Abre `/`, `/glosario` y `/cualquier-cosa` | Las tres muestran "Entrar" (URL `/entrar`) |
| [móvil] Sin sesión solo hay "Entrar" y "Crear cuenta" | Abre la app sin sesión; intenta volver atrás | Ves "Entrar"; no hay pestañas ni otra pantalla |
| [web, móvil] Ir y volver entre "Entrar" y "Crear cuenta" | Pulsa el enlace a "Crear cuenta" y luego el de "Entrar" | Cambia de pantalla en ambos sentidos |

### Crear cuenta

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Datos válidos → inicio con sesión | Llena `Ana`, un correo nuevo y `abcdefgh`; pulsa "Crear cuenta" | Llegas al inicio con "Hola, Ana"; `bd <<< 'SELECT email FROM "user";'` lo muestra |
| [web, móvil] Todo vacío | Pulsa "Crear cuenta" sin escribir | Los tres mensajes, cada uno bajo su campo |
| [web, móvil] Nombre de solo espacios | Nombre `   `, lo demás válido | "Escribe tu nombre." |
| [web, móvil] Nombre de 50 y de 51 | Nombre de 50 con dos espacios antes y después → crear; en otra cuenta, el de 51 | El de 50 se crea y `bd <<< 'SELECT name FROM "user";'` lo muestra sin espacios; el de 51 muestra "El nombre puede tener hasta 50 caracteres." |
| [web, móvil] Nombre repetido | Crea dos cuentas con nombre `Ana` y correos distintos | Las dos se crean |
| [web, móvil] Correos inválidos | Correo `ana@correo`; luego `ana correo@x.com` | "Escribe un correo válido." en ambos |
| [web, móvil] Correo repetido | Con `ana@correo.com` ya creada, usa ` ANA@Correo.com ` | "Ya existe una cuenta con ese correo." bajo el correo; nombre, correo y contraseña siguen escritos |
| [web, móvil] Contraseña 7 / 8 / 129 | Prueba cada una con nombre y correo válidos (correo nuevo para la de 8) | 7: "...al menos 8 caracteres."; 8: se crea; 129: "...hasta 128 caracteres." |
| [web, móvil] Mostrar / ocultar | Escribe `abcdefgh`, pulsa "Mostrar" y luego "Ocultar" | Se ve el texto y vuelve a ocultarse; lo escrito no cambia; no hay "repetir contraseña" |
| [web, móvil] Corregir quita el error | Provoca "Escribe tu nombre." y escribe una letra | El mensaje desaparece |
| [backend] El servidor valida | Sección 2, B1 a B4 | Mismos mensajes que el cliente; no se crea la cuenta |

### Entrar

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Correo con mayúsculas y espacios | En "Entrar": ` ANA@Correo.COM ` y su contraseña | Llegas al inicio |
| [web, móvil] Mismo mensaje en los dos fallos | Correo inexistente; luego correo existente con otra contraseña | "Correo o contraseña incorrectos." idéntico, arriba del formulario |
| [web] Regresar a la dirección pedida | Sin sesión abre `/glosario`; entra | Quedas en `/glosario` (muestra "Página no encontrada": esa página llega con F09) |
| [móvil] Después de entrar → inicio | Entra | Pestaña "Inicio" |
| [web, móvil] Con sesión, "Entrar"/"Crear cuenta" → inicio | Web: escribe `/entrar` y `/registro` en la barra. Móvil: no hay botón que lleve ahí; abre `exp://<IP>:8081/--/entrar` desde el navegador del teléfono | Terminas en el inicio |

### Estados

| Criterio | Pasos | Esperado |
|---|---|---|
| [web, móvil] Un solo envío | Web: en DevTools → Red, limita a "3G lento"; pulsa "Crear cuenta" cinco veces y Enter. Móvil: con el backend en pausa (`kill -STOP <pid>` del `npm run dev`), toca varias veces y luego `kill -CONT <pid>` | El botón se ve deshabilitado mientras envía; S4 con ese correo da 1 |
| [web, móvil] Servidor apagado al enviar | Detén el backend (Ctrl+C); llena el formulario y envía | "No se pudo conectar con Brote. Inténtalo de nuevo en un momento."; los campos, contraseña incluida, siguen llenos |
| [móvil] Sin conexión al enviar | Modo avión; envía | "Sin conexión. Revisa tu conexión e inténtalo de nuevo."; los campos siguen llenos |
| [web, móvil] Sin parpadeo de "Entrar" | Con sesión, recarga la web (en "Red" con "3G lento") / cierra y abre la app | Indicador de carga (o splash) y luego el inicio; "Entrar" nunca aparece |
| [web] Servidor apagado al abrir | Con el backend detenido, recarga | Mensaje de conexión y "Reintentar"; enciende el backend, pulsa "Reintentar": ves el inicio (o "Entrar" si no había sesión) |
| [móvil] Sin conexión al abrir con sesión | Con sesión, modo avión, cierra la app por completo y ábrela | Entras al inicio con tu nombre |

### Sesión

| Criterio | Pasos | Esperado |
|---|---|---|
| [web] Sobrevive a cerrar el navegador | Entra (ventana normal), cierra todas las ventanas, abre de nuevo `localhost:5173` | Sigues con sesión |
| [móvil] Sobrevive a cerrar la app | Entra, cierra la app desde el selector de apps, ábrela | Sigues con sesión |
| [web, móvil] Dos dispositivos a la vez | Entra con la misma cuenta en web y móvil | `bd <<< 'SELECT "userAgent" FROM session;'` muestra dos sesiones; las dos apps funcionan |
| [web] Menú con el nombre | Con sesión, mira la barra superior y púlsala | Tu nombre; el menú tiene "Cerrar sesión" |
| [móvil] Pestaña "Cuenta" | Abre la pestaña "Cuenta" | Nombre, correo y "Cerrar sesión" |
| [web, móvil] Cerrar sesión solo aquí | Con sesión en ambos, cierra sesión en la web; recarga y usa "Atrás". Luego abre la app | Web: "Entrar" y sin sesión tras recargar o ir atrás. Móvil: sigue con sesión. Repite al revés |
| [web, móvil] Sesión expirada → aviso | Con sesión en ambos, corre S1. Web: recarga. Móvil: cierra y abre la app | "Entrar" con "Tu sesión terminó. Vuelve a entrar." |
| [web] Regresar tras expirar | Estando en `/glosario`, expira la sesión como arriba y recarga; entra | Vuelves a `/glosario` |

Comprobación extra de la renovación de 30 días (no es criterio, pero lo
respalda): corre S2 para simular que la última renovación fue hace dos días,
recarga la web y corre S3: `falta` vuelve a ser de ~30 días.

## 4. Antes del PR

- `npm run tipos` y `npm run lint` en los tres repos de código.
- `npm run contrato:revisar` en `brote_specs`.
- Marca los criterios en `spec.md` y enlista los que cubre cada PR.
